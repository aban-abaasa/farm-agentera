import { createContext, useContext, useState, useEffect } from 'react';
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
  const [user, setUser] = useState(DEV_MODE ? MOCK_USER : null);
  const [loading, setLoading] = useState(!DEV_MODE);
  const [profileStatus, setProfileStatus] = useState({ 
    isComplete: DEV_MODE ? true : true, 
    isChecking: !DEV_MODE 
  });

  useEffect(() => {
    // In development mode, skip authentication checks
    if (DEV_MODE) {
      console.log('🔧 Development mode: Authentication bypassed');
      setLoading(false);
      return;
    }

    // Check for existing session with Supabase
    checkAuthStatus();

    // Set up auth state change listener
    const unsubscribe = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        fetchUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfileStatus({ isComplete: true, isChecking: false });
      }
    });

    // Cleanup subscription
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const checkAuthStatus = async () => {
    // Skip in development mode
    if (DEV_MODE) return;

    try {
      const { data, error } = await getSession();
      
      if (error || !data.session) {
        setLoading(false);
        setProfileStatus({ isComplete: true, isChecking: false });
        return;
      }
      
      await fetchUserData(data.session.user.id);
      setLoading(false);
    } catch (error) {
      console.error('Authentication error:', error);
      setLoading(false);
      setProfileStatus({ isComplete: true, isChecking: false });
    }
  };

  const fetchUserData = async (userId) => {
    // Skip in development mode
    if (DEV_MODE) return;

    try {
      // Get user profile from Supabase
      const { data: profile, error } = await getUserProfile(userId);
      
      if (error || !profile) {
        throw error || new Error('User profile not found');
      }
      
      setUser(profile);
      
      // Check if profile is complete
      const { isComplete } = await isProfileComplete(userId);
      setProfileStatus({ isComplete, isChecking: false });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    }
  };

  const login = async (credentials) => {
    // In development mode, return mock user
    if (DEV_MODE) {
      console.log('🔧 Development mode: Mock login successful');
      return MOCK_USER;
    }

    try {
      const { data, error } = await signIn(credentials.email, credentials.password);
      
      if (error) throw error;
      
      if (data?.user) {
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
      return { data: { user: MOCK_USER }, error: null };
    }

    try {
      const { data, error } = await signInWithGoogle();
      
      if (error) throw error;
      
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
    // In development mode, just reset to mock user
    if (DEV_MODE) {
      console.log('🔧 Development mode: Mock logout (resetting to mock user)');
      setUser(MOCK_USER);
      return;
    }

    try {
      await signOut();
      setUser(null);
      setProfileStatus({ isComplete: true, isChecking: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updatedData) => {
    // In development mode, update mock user
    if (DEV_MODE) {
      console.log('🔧 Development mode: Mock profile update');
      const updatedUser = { ...MOCK_USER, ...updatedData };
      setUser(updatedUser);
      return updatedUser;
    }

    try {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await updateUserProfile(user.id, updatedData);
      
      if (error) throw error;
      
      setUser({...user, ...data[0]});
      
      // Check if profile is now complete
      if (!profileStatus.isComplete) {
        const { isComplete } = await isProfileComplete(user.id);
        setProfileStatus({ isComplete, isChecking: false });
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
      console.log('🔧 Development mode: Mock account deletion (no action taken)');
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
      
      // Clear user data from state
      setUser(null);
      setProfileStatus({ isComplete: true, isChecking: false });
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