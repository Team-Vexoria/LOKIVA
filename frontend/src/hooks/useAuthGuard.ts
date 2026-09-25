import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';

export function useAuthGuard() {
  const { user, isAuthenticated, isLoading, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login?redirect=/profile', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return { user, isAuthenticated, isLoading, updateProfile, logout };
}

export default useAuthGuard;
