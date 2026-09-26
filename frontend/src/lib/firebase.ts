import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';

// Explicit static Vite environment variables for reliable bundler replacement
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_API_KEY : ''),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_AUTH_DOMAIN : ''),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_PROJECT_ID : ''),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_STORAGE_BUCKET : ''),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_MESSAGING_SENDER_ID : ''),
  appId: import.meta.env.VITE_FIREBASE_APP_ID || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_APP_ID : ''),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_MEASUREMENT_ID : ''),
};

export const isFirebaseConfigured = (): boolean => {
  const key = firebaseConfig.apiKey;
  const project = firebaseConfig.projectId;
  return Boolean(
    key &&
    key.trim() !== '' &&
    key !== 'AIzaSy...' &&
    key !== 'PASTE_KEY_HERE' &&
    key !== 'YOUR_API_KEY' &&
    key.length > 10 &&
    project &&
    project.trim() !== ''
  );
};

let app: any = null;
let auth: any = null;
let googleProvider: any = null;

if (typeof window !== 'undefined') {
  if (isFirebaseConfigured()) {
    try {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
      // Force account selector on every sign in so user can pick their authentic Google account
      googleProvider.setCustomParameters({ prompt: 'select_account' });
    } catch (error) {
      console.error('[Firebase] Initialization error:', error);
    }
  } else {
    console.info(
      '[LOKIVA] Firebase credentials not found or incomplete. Place VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in frontend/.env.local.'
    );
  }
}

export { auth, googleProvider, firebaseConfig };

export async function signInWithGoogle() {
  if (!auth || !googleProvider) {
    if (!isFirebaseConfigured()) {
      throw new Error(
        'Firebase is not configured. Please add your VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID to frontend/.env.local and restart Vite.'
      );
    }
    // Try re-initializing if auth was null
    try {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
    } catch (initErr: any) {
      throw new Error(`Firebase Auth initialization failed: ${initErr?.message || initErr}`);
    }
  }

  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return { user: result.user, idToken };
}

export async function loginWithFirebaseEmail(email: string, pass: string) {
  if (!auth) {
    if (!isFirebaseConfigured()) {
      throw new Error(
        'Firebase is not configured. Please add your VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID to frontend/.env.local and restart Vite.'
      );
    }
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
  }

  const result = await signInWithEmailAndPassword(auth, email, pass);
  const idToken = await result.user.getIdToken();
  return { user: result.user, idToken };
}

export async function registerWithFirebaseEmail(email: string, fullName: string, pass: string) {
  if (!auth) {
    if (!isFirebaseConfigured()) {
      throw new Error(
        'Firebase is not configured. Please add your VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID to frontend/.env.local and restart Vite.'
      );
    }
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
  }

  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (fullName) {
    await updateProfile(result.user, { displayName: fullName });
  }
  const idToken = await result.user.getIdToken();
  return { user: result.user, idToken };
}

export async function logoutFirebase() {
  if (auth) {
    await signOut(auth);
  }
}
