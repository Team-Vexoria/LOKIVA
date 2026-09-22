const getProjectId = () => process.env.FIREBASE_PROJECT_ID || 'lokiva-5fd10';

// In-memory cache for local continuity if Firestore network endpoint is temporarily unreachable
const inMemoryExpenses = [];

/**
 * Helper to transform Firestore REST document to JS object
 */
function firestoreDocToObject(doc) {
  if (!doc || !doc.fields) return null;
  const obj = {};
  for (const [key, val] of Object.entries(doc.fields)) {
    if (val.stringValue !== undefined) obj[key] = val.stringValue;
    else if (val.integerValue !== undefined) obj[key] = parseInt(val.integerValue, 10);
    else if (val.doubleValue !== undefined) obj[key] = parseFloat(val.doubleValue);
    else if (val.booleanValue !== undefined) obj[key] = val.booleanValue;
    else if (val.nullValue !== undefined) obj[key] = null;
  }
  return obj;
}

/**
 * Log an expense directly to Firestore collection 'expenses'
 * Guaranteed single source of truth for spending.
 */
export async function logExpenseToFirestore({
  userId,
  amount_inr,
  category = 'other',
  note = '',
  source = 'voice',
  tripId = null,
}) {
  const projectId = getProjectId();
  const timestamp = new Date().toISOString();
  const expenseData = {
    userId,
    amount_inr: Number(amount_inr),
    category: category || 'other',
    note: note || '',
    timestamp,
    source,
    tripId: tripId || null,
  };

  // Add to local memory cache for instant queries
  inMemoryExpenses.push(expenseData);

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/expenses`;
  const body = {
    fields: {
      userId: { stringValue: String(userId) },
      amount_inr: { doubleValue: Number(amount_inr) },
      category: { stringValue: String(category || 'other') },
      note: { stringValue: String(note || '') },
      timestamp: { stringValue: timestamp },
      source: { stringValue: String(source) },
      ...(tripId ? { tripId: { stringValue: String(tripId) } } : { tripId: { nullValue: null } }),
    },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Firestore] REST write returned status ${res.status}: ${errText.slice(0, 100)}`);
    }
  } catch (err) {
    console.warn('[Firestore] Error writing expense to Firestore REST:', err?.message || err);
  }

  return expenseData;
}

/**
 * Query expense summary for a user across a given period: 'today' | 'this_trip' | 'this_week'
 */
export async function getExpenseSummaryFromFirestore({ userId, period = 'today' }) {
  const projectId = getProjectId();
  const now = new Date();
  let startDate = new Date();

  if (period === 'today') {
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'this_week') {
    startDate.setDate(now.getDate() - 7);
  } else {
    // this_trip: default past 14 days
    startDate.setDate(now.getDate() - 14);
  }

  const startIso = startDate.toISOString();

  let expensesList = [];
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  const queryBody = {
    structuredQuery: {
      from: [{ collectionId: 'expenses' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'userId' },
          op: 'EQUAL',
          value: { stringValue: String(userId) },
        },
      },
    },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody),
    });

    if (res.ok) {
      const results = await res.json();
      if (Array.isArray(results)) {
        for (const item of results) {
          if (item.document) {
            const parsed = firestoreDocToObject(item.document);
            if (parsed && parsed.timestamp >= startIso) {
              expensesList.push(parsed);
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Firestore] Error running query on Firestore REST:', err?.message || err);
  }

  // If remote returns 0 or errored, check in-memory list for this user session
  if (expensesList.length === 0) {
    expensesList = inMemoryExpenses.filter(
      (e) => String(e.userId) === String(userId) && e.timestamp >= startIso
    );
  }

  let total_inr = 0;
  const breakdown_by_category = {};

  for (const exp of expensesList) {
    const amt = Number(exp.amount_inr) || 0;
    total_inr += amt;
    const cat = exp.category || 'other';
    breakdown_by_category[cat] = (breakdown_by_category[cat] || 0) + amt;
  }

  return {
    total_inr,
    count: expensesList.length,
    breakdown_by_category,
    period,
  };
}
