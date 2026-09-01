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

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (process.env as any) || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID || env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID || env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey !== 'AIzaSy...' && firebaseConfig.projectId);
};

let app: any = null;
let auth: any = null;
let googleProvider: any = null;

if (typeof window !== 'undefined' && isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.warn('Firebase initialization error:', error);
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
