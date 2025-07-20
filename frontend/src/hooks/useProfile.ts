import { useEffect } from 'react';
import { useProfileStore } from '../store/profileStore';
import { useAuth } from './useAuth';

export const useProfile = () => {
  const { 
    profile, 
    isLoading, 
    error, 
    fetchProfile, 
    updateProfile, 
    clearError 
  } = useProfileStore();
  
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !profile && !isLoading) {
      fetchProfile();
    }
  }, [isAuthenticated, profile, isLoading, fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    clearError
  };
};