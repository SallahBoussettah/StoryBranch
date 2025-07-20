import { create } from 'zustand';
import type { User } from '../types/user';

export interface UserProfile extends User {
  bio?: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    emailUpdates: boolean;
  };
  statistics?: {
    storiesRead: number;
    storiesCreated: number;
    choicesMade: number;
    endingsDiscovered: number;
  };
}

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      // Get token directly from the auth store
      const authStore = await import('./authStore');
      const { token, isAuthenticated } = authStore.useAuthStore.getState();
      
      console.log('Auth state:', { token: token ? 'exists' : 'missing', isAuthenticated });
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      // The backend returns data in a nested structure: { status, data: { user } }
      console.log('Profile response:', data);
      
      set({
        profile: data.data?.user || null,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  },

  updateProfile: async (profileData: Partial<UserProfile>) => {
    set({ isLoading: true, error: null });
    try {
      // Get token directly from the auth store
      const authStore = await import('./authStore');
      const { token, isAuthenticated } = authStore.useAuthStore.getState();
      
      console.log('Auth state for update:', { token: token ? 'exists' : 'missing', isAuthenticated });
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // The backend returns data in a nested structure: { status, data: { user } }
      console.log('Profile update response:', data);
      
      set({
        profile: data.data?.user || null,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));