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
  LAST_CHECK: 'farm_agent_last_check',
  GOOGLE_METADATA: 'farm_agent_google_metadata',
  REMEMBER_ME: 'farm_agent_remember_me'
};

// Session check interval (30 minutes - increased from 5 minutes)
const SESSION_CHECK_INTERVAL = 30 * 60 * 1000;

// Extended session validity buffer (allow sessions to be used even closer to expiry)
const SESSION_VALIDITY_BUFFER = 2 * 60 * 1000; // 2 minutes instead of 5

// Maximum time to keep user logged in without server validation (24 hours)
const MAX_OFFLINE_TIME = 24 * 60 * 60 * 1000;

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
  
  // Consider session valid if it expires more than 2 minutes from now (reduced buffer)
  return expiresAt > new Date(now.getTime() + SESSION_VALIDITY_BUFFER);
};

// Check if session is expired (for more lenient checks)
const isSessionExpired = (session) => {
  if (!session || !session.expires_at) return true;
  
  const expiresAt = new Date(session.expires_at);
  const now = new Date();
  
  // Session is expired if it's already past the expiry time
  return expiresAt <= now;
};

// Check if we should allow offline access
const shouldAllowOfflineAccess = () => {
  const lastCheck = storage.get(STORAGE_KEYS.LAST_CHECK);
  if (!lastCheck) return false;
  
  const now = Date.now();
  const timeSinceLastCheck = now - lastCheck;
  
  // If user wants to be remembered, allow longer offline access
  if (shouldRememberUser()) {
    return timeSinceLastCheck < MAX_OFFLINE_TIME;
  }
  
  // Otherwise, use a shorter offline window
  return timeSinceLastCheck < (6 * 60 * 60 * 1000); // 6 hours
};

// Check if we need to validate session with server
const shouldCheckWithServer = () => {
  const lastCheck = storage.get(STORAGE_KEYS.LAST_CHECK);
  if (!lastCheck) return true;
  
  const now = Date.now();
  return (now - lastCheck) > SESSION_CHECK_INTERVAL;
};

// Check if user wants to be remembered for extended periods
const shouldRememberUser = () => {
  return storage.get(STORAGE_KEYS.REMEMBER_ME) === true;
};

// Set remember me preference
const setRememberMe = (remember) => {
  storage.set(STORAGE_KEYS.REMEMBER_ME, remember);
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
  const [googleMetadata, setGoogleMetadata] = useState(null);

  const handleSignOut = useCallback(() => {
    setUser(null);
    setProfileStatus({ isComplete: true, isChecking: false });
    setGoogleMetadata(null);
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
      
      if (error) {
        console.warn('⚠️ Auth check error:', error);
        setLoading(false);
        setProfileStatus({ isComplete: true, isChecking: false });
        
        // Don't clear storage immediately on network errors
        if (error.message?.includes('network') || error.message?.includes('fetch')) {
          console.log('🌐 Network error during auth check, keeping cached data');
          return;
        }
        
        // Only clear on actual auth errors
        storage.clear();
        return;
      }
      
      if (!data.session) {
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
      console.error('💥 Authentication check failed:', error);
      setLoading(false);
      setProfileStatus({ isComplete: true, isChecking: false });
      
      // Only clear storage on actual auth errors, not network errors
      if (error.name === 'AuthError' || error.message?.includes('auth')) {
        console.log('🧹 Clearing storage due to auth error');
        storage.clear();
      } else {
        console.log('🌐 Keeping storage due to network error');
      }
    }
  }, [fetchUserData]);

  const validateSessionInBackground = useCallback(async () => {
    try {
      const { data, error } = await getSession();
      storage.set(STORAGE_KEYS.LAST_CHECK, Date.now());
      
      if (error) {
        console.warn('🔄 Background validation error:', error);
        // Don't sign out immediately on errors - could be network issues
        // Only sign out if it's a clear authentication error
        if (error.message?.includes('invalid') || error.message?.includes('expired') || error.message?.includes('unauthorized')) {
          console.log('🔄 Authentication error detected, signing out');
          handleSignOut();
        } else {
          console.log('🔄 Network/temporary error, keeping user logged in');
        }
        return;
      }
      
      if (!data.session) {
        handleSignOut();
        return;
      }
      
      // Update cached session if we got a new one
      const currentCachedSession = storage.get(STORAGE_KEYS.SESSION);
      if (!currentCachedSession || data.session.access_token !== currentCachedSession.access_token) {
        storage.set(STORAGE_KEYS.SESSION, data.session);
      }
      
    } catch (error) {
      console.error('🔄 Background session validation error:', error);
      
      // Only sign out if we're sure it's an auth issue, not a network issue
      if (error.name === 'AuthError' || error.message?.includes('auth')) {
        console.log('🔄 Authentication error in background check, signing out');
        handleSignOut();
      } else {
        console.log('🔄 Network error in background check, keeping user logged in');
        // Update last check time anyway to avoid constant retries
        storage.set(STORAGE_KEYS.LAST_CHECK, Date.now());
      }
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
      const cachedGoogleMetadata = storage.get(STORAGE_KEYS.GOOGLE_METADATA);

      if (cachedUser && cachedSession) {
        // Check if cached session is still valid
        if (isSessionValid(cachedSession)) {
          setUser(cachedUser);
          if (cachedProfileStatus) {
            setProfileStatus(cachedProfileStatus);
          }
          if (cachedGoogleMetadata) {
            setGoogleMetadata(cachedGoogleMetadata);
          }
          setLoading(false);

          // Optionally validate with server in background if it's been a while
          if (shouldCheckWithServer()) {
            validateSessionInBackground();
          }
          return;
        } else if (!isSessionExpired(cachedSession) && shouldAllowOfflineAccess()) {
          // Session is close to expiry but not yet expired, and we're within offline time
          setUser(cachedUser);
          if (cachedProfileStatus) {
            setProfileStatus(cachedProfileStatus);
          }
          if (cachedGoogleMetadata) {
            setGoogleMetadata(cachedGoogleMetadata);
          }
          setLoading(false);

          // Try to refresh the session in the background
          validateSessionInBackground();
          return;
        } else {
          storage.clear();
        }
      } else if (cachedUser && shouldAllowOfflineAccess()) {
        // We have user data but no session, allow offline access for a limited time
        console.log('📱 Using cached user data - offline access mode');
        setUser(cachedUser);
        if (cachedProfileStatus) {
          setProfileStatus(cachedProfileStatus);
        }
        if (cachedGoogleMetadata) {
          setGoogleMetadata(cachedGoogleMetadata);
        }
        setLoading(false);

        // Try to restore session in background
        console.log('🔄 Attempting to restore session in background');
        validateSessionInBackground();
        return;
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
          console.log('✅ User signed in successfully');
          // Cache the new session
          storage.set(STORAGE_KEYS.SESSION, session);
          storage.set(STORAGE_KEYS.LAST_CHECK, Date.now());
          
          // Extract and store Google metadata if available
          if (session.user?.identities?.[0]?.provider === 'google') {
            const identity = session.user.identities[0];
            const userMeta = session.user.user_metadata || {};
            
            const googleData = {
              provider: 'google',
              email: session.user.email,
              // Try multiple possible field names for full name
              full_name: identity.identity_data?.full_name || userMeta?.full_name || userMeta?.name,
              // Try multiple possible field names for first/last name
              first_name: identity.identity_data?.given_name || userMeta?.given_name || userMeta?.first_name,
              last_name: identity.identity_data?.family_name || userMeta?.family_name || userMeta?.last_name,
              // Try multiple possible field names for avatar
              avatar_url: identity.identity_data?.avatar_url || identity.identity_data?.picture || userMeta?.avatar_url || userMeta?.picture,
              picture: identity.identity_data?.picture || userMeta?.picture,
              email_verified: identity.identity_data?.email_verified || userMeta?.email_verified
            };
            
            // Fallback: if we have full_name but no first/last, try to split it
            if (googleData.full_name && !googleData.first_name && !googleData.last_name) {
              const nameParts = googleData.full_name.trim().split(' ');
              if (nameParts.length >= 2) {
                googleData.first_name = nameParts[0];
                googleData.last_name = nameParts.slice(1).join(' ');
              } else if (nameParts.length === 1) {
                googleData.first_name = nameParts[0];
              }
            }
            
            setGoogleMetadata(googleData);
            storage.set(STORAGE_KEYS.GOOGLE_METADATA, googleData);
          }
          
          fetchUserData(session.user.id);
          
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          handleSignOut();
          
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔄 Token refreshed successfully');
          // Update cached session with new tokens
          storage.set(STORAGE_KEYS.SESSION, session);
          storage.set(STORAGE_KEYS.LAST_CHECK, Date.now());
          
          // Don't fetch user data again, just update the session
          console.log('✅ Session tokens updated');
          
        } else if (event === 'PASSWORD_RECOVERY') {
          console.log('🔑 Password recovery initiated');
          
        } else {
          console.log('🔄 Other auth event:', event);
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

  // Auto refresh token before expiry
  useEffect(() => {
    if (!DEV_MODE && user) {
      const refreshInterval = setInterval(() => {
        const cachedSession = storage.get(STORAGE_KEYS.SESSION);
        if (cachedSession && cachedSession.expires_at) {
          const expiresAt = new Date(cachedSession.expires_at);
          const now = new Date();
          const timeUntilExpiry = expiresAt.getTime() - now.getTime();
          
          // Refresh token if it expires within 10 minutes
          if (timeUntilExpiry > 0 && timeUntilExpiry < 10 * 60 * 1000) {
            console.log('🔄 Auto-refreshing token before expiry');
            validateSessionInBackground();
          }
        }
      }, 5 * 60 * 1000); // Check every 5 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [user, validateSessionInBackground]);

  const login = async (credentials, rememberMe = true) => {
    // Set remember me preference
    setRememberMe(rememberMe);
    
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
        
        console.log(`✅ Login successful${rememberMe ? ' (will remember user)' : ''}`);
        await fetchUserData(data.user.id);
        return data.user;
      }
      
      throw new Error('Login failed. User data not found.');
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  };

  const loginWithGoogle = async (rememberMe = true) => {
    // Set remember me preference
    setRememberMe(rememberMe);
    
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
      
      console.log(`✅ Google login initiated${rememberMe ? ' (will remember user)' : ''}`);
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
    googleMetadata,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    deleteAccount,
    setRememberMe,
    isRemembered: shouldRememberUser()
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};