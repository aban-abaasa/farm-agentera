import { supabase } from '../../lib/supabase/client';

/**
 * Sign up a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} userData - Additional user data (first_name, last_name, etc.)
 * @returns {Promise} - Authentication data
 */
export async function signUp(email, password, userData = {}) {
  try {
    // Create the user account with all relevant user metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName || '',
          last_name: userData.lastName || '',
          phone: userData.phone || '',
          location: userData.location || '',
          role: userData.role || 'user',
          farmer_type: userData.farmingType || '',
          farm_size: userData.farmSize || null,
          bio: userData.bio || ''
        }
      }
    });
    
    if (authError) throw authError;
    
    // The profile will be created automatically by the database trigger
    // But we'll update it with any additional fields not handled by the trigger
    if (authData?.user?.id) {
      // Wait a moment to ensure the trigger has had time to create the profile
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the profile with additional fields
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone_number: userData.phone || null,
          location: userData.location || null,
          role: userData.role || 'user',
          farmer_type: userData.farmingType || null,
          farm_size: userData.farmSize ? parseFloat(userData.farmSize) : null,
          bio: userData.bio || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user.id);
      
      if (updateError) {
        console.error('Error updating profile after signup:', updateError);
        // Continue despite error - the user is still created
      }
    }
    
    return { data: authData, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return { data: null, error };
  }
}

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Authentication data
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    return { data: null, error };
  }
}

/**
 * Sign out the current user
 * @returns {Promise} - Sign out result
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
}

/**
 * Get the current user
 * @returns {Promise} - User data
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { data: null, error };
  }
}

/**
 * Reset password
 * @param {string} email - User email
 * @returns {Promise} - Reset result
 */
export async function resetPassword(email) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { data: null, error };
  }
}

/**
 * Update password
 * @param {string} newPassword - New password
 * @returns {Promise} - Update result
 */
export async function updatePassword(newPassword) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating password:', error);
    return { data: null, error };
  }
}

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Promise} - User profile
 */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { data: null, error };
  }
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 * @returns {Promise} - Updated profile
 */
export async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }
}

/**
 * Upload a user avatar
 * @param {string} userId - User ID
 * @param {File} file - Avatar image file
 * @returns {Promise} - Upload result with URL
 */
export async function uploadAvatar(userId, file) {
  try {
    // Import the storage service
    const { uploadFile } = await import('./storageService');
    
    // Generate a unique filename for the avatar
    const fileExt = file.name.split('.').pop().toLowerCase();
    const filename = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    
    // Upload the file to the avatars folder with a simpler path structure
    const { url: avatarUrl, error: uploadError } = await uploadFile(
      'user-content', 
      'avatars', 
      file, 
      { 
        customFilename: filename, // Use custom filename instead of path with userId
        maxSizeMB: 2,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        upsert: true
      }
    );
    
    if (uploadError) throw uploadError;
    
    // Update the user profile with the avatar URL
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    
    return { 
      data: { 
        avatar_url: avatarUrl,
        profile: data[0] 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return { data: null, error };
  }
}

/**
 * Get session
 * @returns {Promise} - Session data
 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting session:', error);
    return { data: null, error };
  }
}

/**
 * Set up auth state change listener
 * @param {Function} callback - Function to call when auth state changes
 * @returns {Function} - Unsubscribe function
 */
export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  
  return data.subscription.unsubscribe;
}

/**
 * Delete user account
 * @param {string} userId - User ID to delete
 * @returns {Promise} - Result of deletion operation
 */
export async function deleteUserAccount(userId) {
  try {
    // Get the current session to get the access token
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData?.session?.access_token) {
      throw new Error('No active session found. Please log in again.');
    }
    
    // Call the backend API to delete the user
    const API_URL = 'http://localhost:5000'; // This should be configured in your environment
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete account: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Sign out the user after successful deletion
      await signOut();
      
      return { success: true, error: null, message: data.message };
    } catch (fetchError) {
      // Handle specific network errors
      if (fetchError.name === 'AbortError') {
        throw new Error('Connection to server timed out. Please try again later.');
      } else if (fetchError.message.includes('Failed to fetch') || !window.navigator.onLine) {
        throw new Error('Cannot connect to the server. Please check your internet connection and try again.');
      } else {
        throw fetchError;
      }
    }
  } catch (error) {
    console.error('Error deleting user account:', error);
    return { 
      success: false, 
      error,
      isConnectionError: error.message.includes('Cannot connect') || 
                         error.message.includes('timed out') || 
                         error.message.includes('Failed to fetch')
    };
  }
} 

/**
 * Sign in with Google
 * @returns {Promise} - Authentication data
 */
export async function signInWithGoogle() {
  try {
    // Explicitly set the correct redirect URL with the proper port for localhost
    // This fixes the issue with redirecting to localhost:3000 instead of localhost:5173
    const redirectTo = window.location.hostname === 'localhost' 
      ? 'http://localhost:5173/auth/callback'
      : `${window.location.origin}/auth/callback`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { data: null, error };
  }
}

/**
 * Check if user profile is complete
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if profile is complete
 */
export async function isProfileComplete(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, phone_number, location, role')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    // Check if essential fields are filled
    const isComplete = Boolean(
      data.first_name && 
      data.last_name && 
      data.phone_number && 
      data.location && 
      data.role
    );
    
    return { isComplete, data, error: null };
  } catch (error) {
    console.error('Error checking profile completion:', error);
    return { isComplete: false, data: null, error };
  }
} 