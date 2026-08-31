import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, TravelerProfile } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, role?: 'traveler' | 'provider' | 'admin') => Promise<void>;
  register: (email: string, name: string, password?: string, role?: 'traveler' | 'provider' | 'admin') => Promise<void>;
  demoLogin: (role: 'traveler' | 'provider' | 'admin') => Promise<void>;
  loginWithGoogle: (role?: 'traveler' | 'provider' | 'admin') => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<TravelerProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('lokiva_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize or fetch current user
  useEffect(() => {
    async function fetchMe() {
      const storedToken = localStorage.getItem('lokiva_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setToken(storedToken);
        } else {
          localStorage.removeItem('lokiva_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to authenticate session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMe();
  }, []);

  const login = async (email: string, password: string = 'password123', role?: 'traveler' | 'provider' | 'admin') => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Login failed' }));
        throw new Error(err.detail || 'Login failed');
      }

      const data = await res.json();
      localStorage.setItem('lokiva_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    fullName: string,
    password: string = 'password123',
    role: 'traveler' | 'provider' | 'admin' = 'traveler'
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: fullName, password, role }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
        throw new Error(err.detail || 'Registration failed');
      }

      const data = await res.json();
      localStorage.setItem('lokiva_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: 'traveler' | 'provider' | 'admin' = 'traveler') => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/demo-login/${role}`, {
        method: 'POST',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Demo login failed' }));
        throw new Error(err.detail || 'Demo login failed');
      }

      const data = await res.json();
      localStorage.setItem('lokiva_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (role: 'traveler' | 'provider' | 'admin' = 'traveler') => {
    setIsLoading(true);
    try {
      // Simulate or call firebase-login fallback endpoint with a mock Google session for seamless demo
      const res = await fetch(`${API_BASE}/auth/firebase-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `${role}.demo@lokiva.com`,
          full_name: role === 'admin' ? 'LOKIVA Admin' : role === 'provider' ? 'Cultural Artisan Host' : 'Sharma Family',
          role,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Google login failed' }));
        throw new Error(err.detail || 'Google login failed');
      }

      const data = await res.json();
      localStorage.setItem('lokiva_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('lokiva_token');
    setToken(null);
    setUser(null);
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
