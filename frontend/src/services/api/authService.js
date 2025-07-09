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
    // Create the user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (authError) throw authError;
    
    if (authData.user) {
      // Create user profile with additional information
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          first_name: userData.firstName || '',
          last_name: userData.lastName || '',
          created_at: new Date().toISOString()
        });
        
      if (profileError) throw profileError;
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
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('user-content')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-content')
      .getPublicUrl(filePath);
    
    // Update the user profile with the avatar URL
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: publicUrl,
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    
    return { 
      data: { 
        avatar_url: publicUrl,
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