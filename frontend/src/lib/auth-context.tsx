import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { User, TravelerProfile } from '../types';
import { API_BASE } from './api';
import {
  auth,
  isFirebaseConfigured,
  signInWithGoogle,
  loginWithFirebaseEmail,
  registerWithFirebaseEmail,
  logoutFirebase,
} from './firebase';

type Role = 'traveler' | 'provider' | 'admin';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, role?: Role) => Promise<void>;
  register: (email: string, name: string, password?: string, role?: Role) => Promise<void>;
  demoLogin: (role: Role) => Promise<void>;
  loginWithGoogle: (role?: Role) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<TravelerProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Firebase error codes that mean "this account isn't in Firebase" — we then
 *  fall back to the backend's own credential login so seeded demo accounts
 *  (which exist only in SQLite) keep working. */
const FIREBASE_UNKNOWN_ACCOUNT = new Set([
  'auth/user-not-found',
  'auth/invalid-credential',
  'auth/invalid-login-credentials',
  'auth/wrong-password',
  'auth/operation-not-allowed',
]);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('lokiva_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const applySession = (data: { access_token: string; user: User }) => {
    localStorage.setItem('lokiva_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  /** Trade a verified Firebase ID token for a backend session JWT. The server
   *  derives identity from the token itself — we never send an email. */
  const exchangeFirebaseToken = async (idToken: string, role: Role = 'traveler') => {
    const res = await fetch(`${API_BASE}/auth/firebase-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: idToken, role }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Sign-in failed' }));
      throw new Error(err.detail || 'Sign-in failed');
    }

    const data = await res.json();
    applySession(data);
    return data;
  };

  // Restore an existing session: stored backend JWT first, then Firebase.
  useEffect(() => {
    let cancelled = false;
    let handled = false;
    let unsubscribe: (() => void) | undefined;

    const finish = () => {
      if (!cancelled) setIsLoading(false);
    };

    async function restoreSession() {
      const storedToken = localStorage.getItem('lokiva_token');

      if (storedToken) {
        try {
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          if (res.ok) {
            const userData = await res.json();
            if (cancelled) return;
            setUser(userData);
            setToken(storedToken);
            finish();
            return;
          }

          // Rejected or expired — discard and try Firebase below.
          localStorage.removeItem('lokiva_token');
          if (!cancelled) {
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          // Server unreachable. Keep the token so a later reload can retry.
          console.error('Failed to authenticate session:', err);
          finish();
          return;
        }
      }

      // No usable backend token. If Firebase still holds a session, exchange it.
      if (!auth) {
        finish();
        return;
      }

      unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
        if (cancelled || handled) return;
        handled = true;
        unsubscribe?.();

        if (!firebaseUser) {
          finish();
          return;
        }

        try {
          const idToken = await firebaseUser.getIdToken();
          if (!cancelled) await exchangeFirebaseToken(idToken);
        } catch (err) {
          console.error('Failed to restore Firebase session:', err);
        } finally {
          finish();
        }
      });
    }

    restoreSession();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  /** Backend-only credential login, used directly when Firebase is not
   *  configured and as a fallback for accounts that exist only in SQLite. */
  const loginWithBackend = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }

    applySession(await res.json());
  };

  const login = async (email: string, password: string = 'password123', role: Role = 'traveler') => {
    setIsLoading(true);
    try {
      if (!isFirebaseConfigured()) {
        await loginWithBackend(email, password);
        return;
      }

      try {
        const { idToken } = await loginWithFirebaseEmail(email, password);
        await exchangeFirebaseToken(idToken, role);
      } catch (err: any) {
        if (!FIREBASE_UNKNOWN_ACCOUNT.has(err?.code)) throw err;
        // Not a Firebase account — try the local database instead.
        await loginWithBackend(email, password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    fullName: string,
    password: string = 'password123',
    role: Role = 'traveler'
  ) => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured()) {
        const { idToken } = await registerWithFirebaseEmail(email, fullName, password);
        await exchangeFirebaseToken(idToken, role);
        return;
      }

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: fullName, password, role }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
        throw new Error(err.detail || 'Registration failed');
      }

      applySession(await res.json());
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: Role = 'traveler') => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/demo-login/${role}`, {
        method: 'POST',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Demo login failed' }));
        throw new Error(err.detail || 'Demo login failed');
      }

      applySession(await res.json());
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (role: Role = 'traveler') => {
    setIsLoading(true);
    try {
      const { idToken } = await signInWithGoogle();
      await exchangeFirebaseToken(idToken, role);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('lokiva_token');
    setToken(null);
    setUser(null);
    try {
      await logoutFirebase();
    } catch (err) {
      console.error('Firebase sign-out failed:', err);
    }
  };

  const updateProfile = async (data: Partial<TravelerProfile>) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      profile: {
        ...(user.profile || {
          traveler_type: 'Family with Kids',
          group_size: 4,
          budget: 1500,
          available_hours: 4,
          interests: ['culture', 'food'],
          accessibility_prefs: { low_walking: true },
          location_name: 'Jaipur',
          hotel_lat: 26.9124,
          hotel_lng: 75.7873,
        }),
        ...data,
      },
    };
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin,
        loginWithGoogle,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
