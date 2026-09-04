import jwt from 'jsonwebtoken';

/**
 * Verifies Firebase ID tokens without the firebase-admin SDK.
 *
 * Firebase ID tokens are RS256 JWTs signed by Google. They are verified against
 * Google's public x509 certificates, so this needs no service-account key --
 * only the project ID, to validate the `aud` and `iss` claims.
 *
 * Reference: Firebase Auth docs, "Verify ID tokens using a third-party JWT library".
 */
const CERT_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || '';

let certCache = { certs: null, expiresAt: 0 };

export const isFirebaseAdminConfigured = () => Boolean(PROJECT_ID);

async function getGoogleCerts() {
  if (certCache.certs && Date.now() < certCache.expiresAt) return certCache.certs;

  const res = await fetch(CERT_URL);
  if (!res.ok) throw new Error(`Could not fetch Google signing certificates (${res.status})`);
  const certs = await res.json();

  // Honor Google's cache lifetime; fall back to one hour.
  const maxAge = /max-age=(\d+)/.exec(res.headers.get('cache-control') || '');
  const ttlMs = (maxAge ? Number(maxAge[1]) : 3600) * 1000;
  certCache = { certs, expiresAt: Date.now() + ttlMs };

  return certs;
}

/**
 * Returns the verified claims of a Firebase ID token, or throws.
 * Never trust anything but the return value of this function for identity.
 */
export async function verifyFirebaseToken(idToken) {
  if (!PROJECT_ID) {
    throw new Error('FIREBASE_PROJECT_ID is not set on the server; cannot verify Firebase tokens.');
  }

  const decoded = jwt.decode(idToken, { complete: true });
  const kid = decoded?.header?.kid;
  if (!kid || decoded?.header?.alg !== 'RS256') {
    throw new Error('Malformed Firebase ID token');
  }

  const certs = await getGoogleCerts();
  const cert = certs[kid];
  if (!cert) throw new Error('Firebase ID token was signed with an unknown key');

  // Validates signature, expiry, audience and issuer in one step.
  const claims = jwt.verify(idToken, cert, {
    algorithms: ['RS256'],
    audience: PROJECT_ID,
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
  });

  if (!claims.sub) throw new Error('Firebase ID token has no subject');

  return {
    uid: claims.sub,
    email: claims.email || null,
    emailVerified: Boolean(claims.email_verified),
    name: claims.name || null,
    picture: claims.picture || null,
  };
}
