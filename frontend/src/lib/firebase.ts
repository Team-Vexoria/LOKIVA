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

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey !== 'AIzaSy...' && firebaseConfig.projectId);
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
      googleProvider.setCustomParameters({ prompt: 'select_account' });
    } catch (error) {
      console.warn('Firebase initialization error:', error);
    }
  } else {
    // Vite only exposes VITE_-prefixed vars. A NEXT_PUBLIC_-prefixed .env.local
    // leaves this silently empty, so say so loudly instead.
    console.warn(
      '[LOKIVA] Firebase is not configured. Set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in frontend/.env.local (VITE_ prefix is required — NEXT_PUBLIC_ is ignored by Vite), then restart the dev server.'
    );
  }
}

export { auth, googleProvider };

export async function signInWithGoogle() {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Authentication is not configured. Please add your credentials.');
  }
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return { user: result.user, idToken };
}

export async function loginWithFirebaseEmail(email: string, pass: string) {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured.');
  }
  const result = await signInWithEmailAndPassword(auth, email, pass);
  const idToken = await result.user.getIdToken();
  return { user: result.user, idToken };
}

export async function registerWithFirebaseEmail(email: string, fullName: string, pass: string) {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured.');
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
