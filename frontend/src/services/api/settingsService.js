import { supabase } from '../../lib/supabase/client';

/**
 * Get user settings
 * @param {string} userId - Optional user ID, defaults to current user
 * @returns {Promise} - User settings data
 */
export async function getUserSettings(userId = null) {
  try {
    // If no userId provided, get current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    // If no settings found, create default settings
    if (!data) {
      return await createDefaultSettings(userId);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return { data: null, error };
  }
}

/**
 * Create default settings for a user
 * @param {string} userId - User ID
 * @returns {Promise} - Created settings data
 */
export async function createDefaultSettings(userId) {
  try {
    const defaultSettings = {
      user_id: userId,
      // Appearance settings
      theme: 'light',
      color_scheme: 'green',
      font_size: 100,
      reduced_motion: false,
      
      // Language & Localization settings
      language: 'en',
      date_format: 'MM/DD/YYYY',
      time_format: '12h',
      timezone: 'UTC',
      
      // Notification settings
      email_notifications: true,
      push_notifications: false,
      marketplace_alerts: true,
      community_alerts: true,
      weather_alerts: true,
      event_reminders: true,
      message_notifications: true,
      
      // Privacy settings
      profile_visibility: 'public',
      contact_info_visibility: 'connections',
      activity_tracking: true,
      location_sharing: false,
      
      // Data usage settings
      auto_play: false,
      high_quality_images: true,
      data_usage_optimization: false,
      download_over_cellular: false,
      
      // Accessibility settings
      high_contrast: false,
      large_text: false,
      screen_reader_support: false
    };

    const { data, error } = await supabase
      .from('user_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating default settings:', error);
    return { data: null, error };
  }
}

/**
 * Update user settings
 * @param {Object} settingsUpdate - Settings to update
 * @param {string} userId - Optional user ID, defaults to current user
 * @returns {Promise} - Updated settings data
 */
export async function updateUserSettings(settingsUpdate, userId = null) {
  try {
    // If no userId provided, get current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      userId = user.id;
    }

    // First, ensure user settings exist
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existingSettings) {
      // Create default settings first
      const { error: createError } = await createDefaultSettings(userId);
      if (createError) throw createError;
    }

    // Convert camelCase to snake_case for database
    const dbUpdate = convertToSnakeCase(settingsUpdate);

    const { data, error } = await supabase
      .from('user_settings')
      .update(dbUpdate)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating user settings:', error);
    return { data: null, error };
  }
}

/**
 * Update specific setting category
 * @param {string} category - Category name (appearance, notifications, privacy, etc.)
 * @param {Object} categorySettings - Settings object for the category
 * @param {string} userId - Optional user ID, defaults to current user
 * @returns {Promise} - Updated settings data
 */
export async function updateSettingsCategory(category, categorySettings, userId = null) {
  try {
    // If no userId provided, get current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      userId = user.id;
    }

    // Validate category
    const validCategories = [
      'appearance', 'language', 'notifications', 
      'privacy', 'dataUsage', 'accessibility'
    ];
    
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }

    // Ensure user settings exist first
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existingSettings) {
      // Create default settings first
      const { error: createError } = await createDefaultSettings(userId);
      if (createError) throw createError;
    }

    // Map category settings to database fields
    let dbUpdate = {};
    
    switch (category) {
      case 'appearance':
        dbUpdate = {
          theme: categorySettings.theme,
          color_scheme: categorySettings.colorScheme,
          font_size: categorySettings.fontSize,
          reduced_motion: categorySettings.reducedMotion
        };
        break;
        
      case 'language':
        dbUpdate = {
          language: categorySettings.language,
          date_format: categorySettings.dateFormat,
          time_format: categorySettings.timeFormat,
          timezone: categorySettings.timezone
        };
        break;
        
      case 'notifications':
        dbUpdate = {
          email_notifications: categorySettings.emailNotifications,
          push_notifications: categorySettings.pushNotifications,
          marketplace_alerts: categorySettings.marketplaceAlerts,
          community_alerts: categorySettings.communityAlerts,
          weather_alerts: categorySettings.weatherAlerts,
          event_reminders: categorySettings.eventReminders,
          message_notifications: categorySettings.messageNotifications
        };
        break;
        
      case 'privacy':
        dbUpdate = {
          profile_visibility: categorySettings.profileVisibility,
          contact_info_visibility: categorySettings.contactInfoVisibility,
          activity_tracking: categorySettings.activityTracking,
          location_sharing: categorySettings.locationSharing
        };
        break;
        
      case 'dataUsage':
        dbUpdate = {
          auto_play: categorySettings.autoPlay,
          high_quality_images: categorySettings.highQualityImages,
          data_usage_optimization: categorySettings.dataUsageOptimization,
          download_over_cellular: categorySettings.downloadOverCellular
        };
        break;
        
      case 'accessibility':
        dbUpdate = {
          high_contrast: categorySettings.highContrast,
          large_text: categorySettings.largeText,
          screen_reader_support: categorySettings.screenReaderSupport,
          reduced_motion: categorySettings.reducedMotion
        };
        break;
    }

    // Filter out undefined values
    dbUpdate = Object.fromEntries(
      Object.entries(dbUpdate).filter(([, value]) => value !== undefined)
    );

    // Use direct update instead of calling updateUserSettings to avoid recursion
    const { data, error } = await supabase
      .from('user_settings')
      .update(dbUpdate)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating settings category:', error);
    return { data: null, error };
  }
}

/**
 * Reset user settings to defaults
 * @param {string} userId - Optional user ID, defaults to current user
 * @returns {Promise} - Reset settings data
 */
export async function resetUserSettings(userId = null) {
  try {
    // If no userId provided, get current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      userId = user.id;
    }

    // Delete existing settings
    const { error: deleteError } = await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // Create new default settings
    return await createDefaultSettings(userId);
  } catch (error) {
    console.error('Error resetting user settings:', error);
    return { data: null, error };
  }
}

/**
 * Export user settings
 * @param {string} userId - Optional user ID, defaults to current user
 * @returns {Promise} - User settings in exportable format
 */
export async function exportUserSettings(userId = null) {
  try {
    const { data, error } = await getUserSettings(userId);
    
    if (error) throw error;
    
    // Convert to camelCase for export
    const exportData = convertToCamelCase(data);
    
    // Remove system fields
    delete exportData.id;
    delete exportData.userId;
    delete exportData.createdAt;
    delete exportData.updatedAt;
    
    return { 
      data: {
        settings: exportData,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error exporting user settings:', error);
    return { data: null, error };
  }
}

/**
 * Import user settings
 * @param {Object} settingsData - Settings data to import
 * @param {string} userId - Optional user ID, defaults to current user
 * @returns {Promise} - Import result
 */
export async function importUserSettings(settingsData, userId = null) {
  try {
    // Validate import data
    if (!settingsData || !settingsData.settings) {
      throw new Error('Invalid settings data format');
    }

    const settings = settingsData.settings;
    
    // Update user settings with imported data
    return await updateUserSettings(settings, userId);
  } catch (error) {
    console.error('Error importing user settings:', error);
    return { data: null, error };
  }
}

/**
 * Get settings for a specific category
 * @param {string} category - Category name
 * @param {string} userId - Optional user ID, defaults to current user
 * @returns {Promise} - Category settings
 */
export async function getSettingsCategory(category, userId = null) {
  try {
    const { data, error } = await getUserSettings(userId);
    
    if (error) throw error;
    
    // Convert to camelCase
    const settings = convertToCamelCase(data);
    
    // Extract category-specific settings
    let categorySettings = {};
    
    switch (category) {
      case 'appearance':
        categorySettings = {
          theme: settings.theme,
          colorScheme: settings.colorScheme,
          fontSize: settings.fontSize,
          reducedMotion: settings.reducedMotion
        };
        break;
        
      case 'language':
        categorySettings = {
          language: settings.language,
          dateFormat: settings.dateFormat,
          timeFormat: settings.timeFormat,
          timezone: settings.timezone
        };
        break;
        
      case 'notifications':
        categorySettings = {
          emailNotifications: settings.emailNotifications,
          pushNotifications: settings.pushNotifications,
          marketplaceAlerts: settings.marketplaceAlerts,
          communityAlerts: settings.communityAlerts,
          weatherAlerts: settings.weatherAlerts,
          eventReminders: settings.eventReminders,
          messageNotifications: settings.messageNotifications
        };
        break;
        
      case 'privacy':
        categorySettings = {
          profileVisibility: settings.profileVisibility,
          contactInfoVisibility: settings.contactInfoVisibility,
          activityTracking: settings.activityTracking,
          locationSharing: settings.locationSharing
        };
        break;
        
      case 'dataUsage':
        categorySettings = {
          autoPlay: settings.autoPlay,
          highQualityImages: settings.highQualityImages,
          dataUsageOptimization: settings.dataUsageOptimization,
          downloadOverCellular: settings.downloadOverCellular
        };
        break;
        
      case 'accessibility':
        categorySettings = {
          highContrast: settings.highContrast,
          largeText: settings.largeText,
          screenReaderSupport: settings.screenReaderSupport,
          reducedMotion: settings.reducedMotion
        };
        break;
        
      default:
        throw new Error(`Invalid category: ${category}`);
    }
    
    return { data: categorySettings, error: null };
  } catch (error) {
    console.error('Error getting settings category:', error);
    return { data: null, error };
  }
}

/**
 * Initialize user settings if they don't exist
 * @param {string} userId - Optional user ID, defaults to current user
 * @returns {Promise} - Initialization result
 */
export async function initializeUserSettings(userId = null) {
  try {
    // If no userId provided, get current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      userId = user.id;
    }

    // Check if settings already exist
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingSettings) {
      return { data: existingSettings, error: null };
    }

    // Create default settings
    return await createDefaultSettings(userId);
  } catch (error) {
    console.error('Error initializing user settings:', error);
    return { data: null, error };
  }
}

// Utility functions
function convertToSnakeCase(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

function convertToCamelCase(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}
