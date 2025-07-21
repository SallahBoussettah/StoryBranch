import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading, 
    error, 
    login, 
    register, 
    logout, 
    forgotPassword, 
    resetPassword, 
    clearError 
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    clearError
  };
};

export const useRequireAuth = (redirectTo = '/login') => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
};

export const useRequireNoAuth = (redirectTo = '/') => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
};

export const useRequireRole = (requiredRoles: string[], redirectTo = '/') => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Case-insensitive role check
      const roleMatches = requiredRoles.some(role => 
        role.toUpperCase() === user.role.toUpperCase()
      );
      
      if (!roleMatches) {
        navigate(redirectTo);
      }
    } else if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [user, isAuthenticated, isLoading, navigate, redirectTo, requiredRoles]);

  return { user, isAuthenticated, isLoading };
};