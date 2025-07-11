import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  signIn, 
  signUp, 
  signOut, 
  getSession,
  onAuthStateChange,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  signInWithGoogle,
  isProfileComplete
} from '../services/api/authService';

// Development mode flag
const DEV_MODE = import.meta.env.VITE_DEVELOPMENT === 'true';

// Storage keys
const STORAGE_KEYS = {
  USER: 'farm_agent_user',
  SESSION: 'farm_agent_session',
  PROFILE_STATUS: 'farm_agent_profile_status',
  LAST_CHECK: 'farm_agent_last_check'
};

// Session check interval (5 minutes)
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

// Mock user for development mode
const MOCK_USER = {
  id: 'dev-user-123',
  email: 'dev@example.com',
  first_name: 'Dev',
  last_name: 'User',
  role: 'farmer',
  phone_number: '+1234567890',
  avatar_url: null,
  created_at: new Date().toISOString()
};

// Utility functions for storage
const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from storage (${key}):`, error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to storage (${key}):`, error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from storage (${key}):`, error);
    }
  },
  
  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};

// Check if cached session is still valid
const isSessionValid = (session) => {
  if (!session || !session.expires_at) return false;
  
  const expiresAt = new Date(session.expires_at);
  const now = new Date();
  
  // Consider session valid if it expires more than 5 minutes from now
  return expiresAt > new Date(now.getTime() + 5 * 60 * 1000);
};

// Check if we need to validate session with server
const shouldCheckWithServer = () => {
  const lastCheck = storage.get(STORAGE_KEYS.LAST_CHECK);
  if (!lastCheck) return true;
  
  const now = Date.now();
  return (now - lastCheck) > SESSION_CHECK_INTERVAL;
};

// Create context
const AuthContext = createContext();

// Create separate named function for the hook
function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { useAuth };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState({ 
    isComplete: true, 
    isChecking: false 
  });

  const handleSignOut = useCallback(() => {
    setUser(null);
    setProfileStatus({ isComplete: true, isChecking: false });
    storage.clear();
  }, []);

  const fetchUserData = useCallback(async (userId) => {
    try {
      // Get user profile from Supabase
      const { data: profile, error } = await getUserProfile(userId);
      
      if (error || !profile) {
        throw error || new Error('User profile not found');
      }
      
      setUser(profile);
      // Cache the user profile
      storage.set(STORAGE_KEYS.USER, profile);
      
      // Check if profile is complete
      const { isComplete } = await isProfileComplete(userId);
      const profileStatusData = { isComplete, isChecking: false };
      setProfileStatus(profileStatusData);
      // Cache profile status
      storage.set(STORAGE_KEYS.PROFILE_STATUS, profileStatusData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      handleSignOut();
    }
  }, [handleSignOut]);

  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await getSession();
      
      if (error || !data.session) {
        setLoading(false);
        setProfileStatus({ isComplete: true, isChecking: false });
        return;
      }
      
      // Cache the session
      storage.set(STORAGE_KEYS.SESSION, data.session);
      storage.set(STORAGE_KEYS.LAST_CHECK, Date.now());
      
      await fetchUserData(data.session.user.id);
      setLoading(false);
    } catch (error) {
      console.error('Authentication error:', error);
      setLoading(false);
      setProfileStatus({ isComplete: true, isChecking: false });
      storage.clear();
    }
  }, [fetchUserData]);

  const validateSessionInBackground = useCallback(async () => {
    try {
      const { data, error } = await getSession();
      storage.set(STORAGE_KEYS.LAST_CHECK, Date.now());
      
      if (error || !data.session) {
        console.log('🔄 Background validation: Session invalid, signing out');
        handleSignOut();
        return;
      }
      
      // Update cached session if we got a new one
      storage.set(STORAGE_KEYS.SESSION, data.session);
    } catch (error) {
      console.error('Background session validation error:', error);
      // Don't sign out on network errors, just log the error
    }
  }, [handleSignOut]);

  // Initialize user from storage or development mode
  useEffect(() => {
    const initializeAuth = async () => {
      // In development mode, skip authentication checks
      if (DEV_MODE) {
        console.log('🔧 Development mode: Authentication bypassed');
        setUser(MOCK_USER);
        setLoading(false);
        return;
      }

      // Try to load user from cache first
      const cachedUser = storage.get(STORAGE_KEYS.USER);
      const cachedSession = storage.get(STORAGE_KEYS.SESSION);
      const cachedProfileStatus = storage.get(STORAGE_KEYS.PROFILE_STATUS);

      if (cachedUser && cachedSession) {
        // Check if cached session is still valid
        if (isSessionValid(cachedSession)) {
          console.log('📱 Using cached authentication');
          setUser(cachedUser);
          if (cachedProfileStatus) {
            setProfileStatus(cachedProfileStatus);
          }
          setLoading(false);

          // Optionally validate with server in background if it's been a while
          if (shouldCheckWithServer()) {
            validateSessionInBackground();
          }
          return;
        } else {
          console.log('🔄 Cached session expired, clearing cache');
          storage.clear();
        }
      }

      // No valid cache, check with server
      await checkAuthStatus();
    };

    initializeAuth();

    // Set up auth state change listener for real-time updates
    let unsubscribe;
    if (!DEV_MODE) {
      unsubscribe = onAuthStateChange((event, session) => {
        console.log('🔄 Auth state changed:', event);
        if (event === 'SIGNED_IN' && session) {
          // Cache the new session
          storage.set(STORAGE_KEYS.SESSION, session);
          storage.set(STORAGE_KEYS.LAST_CHECK, Date.now());
          fetchUserData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          handleSignOut();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Update cached session with new tokens
          storage.set(STORAGE_KEYS.SESSION, session);
          storage.set(STORAGE_KEYS.LAST_CHECK, Date.now());
        }
      });
    }

    // Cleanup subscription
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [checkAuthStatus, fetchUserData, validateSessionInBackground, handleSignOut]);

  const login = async (credentials) => {
    // In development mode, return mock user
    if (DEV_MODE) {
      console.log('🔧 Development mode: Mock login successful');
      setUser(MOCK_USER);
      storage.set(STORAGE_KEYS.USER, MOCK_USER);
      return MOCK_USER;
    }

    try {
      const { data, error } = await signIn(credentials.email, credentials.password);
      
      if (error) throw error;
      
      if (data?.user && data?.session) {
        // Cache the session immediately
        storage.set(STORAGE_KEYS.SESSION, data.session);
        storage.set(STORAGE_KEYS.LAST_CHECK, Date.now());
        
        await fetchUserData(data.user.id);
        return data.user;
      }
      
      throw new Error('Login failed. User data not found.');
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  };

  const loginWithGoogle = async () => {
    // In development mode, return mock user
    if (DEV_MODE) {
      console.log('🔧 Development mode: Mock Google login successful');
      setUser(MOCK_USER);
      storage.set(STORAGE_KEYS.USER, MOCK_USER);
      return { data: { user: MOCK_USER }, error: null };
    }

    try {
      const { data, error } = await signInWithGoogle();
      
      if (error) throw error;
      
      // The actual user data will be handled by the auth state change listener
      return { data, error: null };
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error(error.message || 'Google login failed. Please try again.');
    }
  };

  const register = async (userData) => {
    // In development mode, return mock user
    if (DEV_MODE) {
      console.log('🔧 Development mode: Mock registration successful');
      setUser(MOCK_USER);
      storage.set(STORAGE_KEYS.USER, MOCK_USER);
      return MOCK_USER;
    }

    try {
      // Extract user auth data and profile data
      const { email, password, ...profileData } = userData;
      
      const { data, error } = await signUp(email, password, profileData);
      
      if (error) throw error;
      
      if (data?.user) {
        // In Supabase, user might need email verification first
        // So we might not set the user here depending on your setup
        return data.user;
      }
      
      throw new Error('Registration failed. User data not found.');
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  };

  const logout = async () => {
    // In development mode, reset to null and clear cache
    if (DEV_MODE) {
      console.log('🔧 Development mode: Mock logout');
      setUser(null);
      storage.clear();
      return;
    }

    try {
      await signOut();
      handleSignOut();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
      handleSignOut();
    }
  };

  const updateProfile = async (updatedData) => {
    // In development mode, update mock user
    if (DEV_MODE) {
      console.log('🔧 Development mode: Mock profile update');
      const updatedUser = { ...MOCK_USER, ...updatedData };
      setUser(updatedUser);
      storage.set(STORAGE_KEYS.USER, updatedUser);
      return updatedUser;
    }

    try {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await updateUserProfile(user.id, updatedData);
      
      if (error) throw error;
      
      const updatedUser = {...user, ...data[0]};
      setUser(updatedUser);
      // Update cached user
      storage.set(STORAGE_KEYS.USER, updatedUser);
      
      // Check if profile is now complete
      if (!profileStatus.isComplete) {
        const { isComplete } = await isProfileComplete(user.id);
        const profileStatusData = { isComplete, isChecking: false };
        setProfileStatus(profileStatusData);
        storage.set(STORAGE_KEYS.PROFILE_STATUS, profileStatusData);
      }
      
      return data[0];
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error(error.message || 'Profile update failed. Please try again.');
    }
  };
  
  const deleteAccount = async (password) => {
    // In development mode, just log the action
    if (DEV_MODE) {
      console.log('🔧 Development mode: Mock account deletion');
      handleSignOut();
      return { success: true };
    }

    try {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Re-authenticate the user before deletion (optional but recommended)
      if (password) {
        const { error: authError } = await signIn(user.email, password);
        if (authError) throw new Error('Password verification failed. Please try again.');
      }
      
      // Delete the user account
      const { success, error, isConnectionError } = await deleteUserAccount(user.id);
      
      if (!success) {
        // Handle connection errors specially
        if (isConnectionError) {
          throw new Error(
            error.message || 
            'Cannot connect to the server. Please check your internet connection and try again later.'
          );
        }
        throw error;
      }
      
      // Clear user data from state and storage
      handleSignOut();
      return { success: true };
    } catch (error) {
      console.error('Account deletion error:', error);
      // Pass through the specific error message
      throw error instanceof Error ? error : new Error('Account deletion failed. Please try again.');
    }
  };

  const value = {
    user,
    loading,
    profileStatus,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    deleteAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 