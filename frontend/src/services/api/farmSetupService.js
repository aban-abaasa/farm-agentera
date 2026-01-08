import { 
  fetchData, 
  insertRecord,
  updateRecord 
} from '../../lib/supabase/dbHelpers';

// Table names in Supabase
const FARM_SETUP_PROGRESS_TABLE = 'farm_setup_progress';
const FARM_SETUP_RESPONSES_TABLE = 'farm_setup_responses';
const FARM_SETUP_TEMPLATES_TABLE = 'farm_setup_templates';
const FARM_SETUP_GOALS_TABLE = 'farm_setup_goals';
const FARM_SETUP_QUESTIONS_TABLE = 'farm_setup_questions';
const FARM_MODULE_PREFERENCES_TABLE = 'farm_module_preferences';

/**
 * Check if user has completed farm setup
 * @returns {Promise} - Setup status
 */
export async function checkSetupStatus() {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from(FARM_SETUP_PROGRESS_TABLE)
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
    
    return { 
      data: data || { 
        is_complete: false, 
        current_step: 1, 
        total_steps: 6 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error checking setup status:', error);
    return { data: null, error };
  }
}

/**
 * Initialize farm setup progress
 * @returns {Promise} - Setup progress data
 */
export async function initializeSetup() {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const setupRecord = {
      user_id: user.id,
      current_step: 1,
      total_steps: 6,
      is_complete: false,
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(FARM_SETUP_PROGRESS_TABLE, setupRecord);
  } catch (error) {
    console.error('Error initializing setup:', error);
    return { data: null, error };
  }
}

/**
 * Update setup progress
 * @param {number} currentStep - Current step number
 * @param {Object} additionalData - Additional progress data
 * @returns {Promise} - Updated progress data
 */
export async function updateSetupProgress(currentStep, additionalData = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData = {
      current_step: currentStep,
      is_complete: currentStep >= 6,
      completed_at: currentStep >= 6 ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
      ...additionalData
    };

    const { data, error } = await supabase
      .from(FARM_SETUP_PROGRESS_TABLE)
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating setup progress:', error);
    return { data: null, error };
  }
}

/**
 * Save setup responses for a step
 * @param {number} stepNumber - Step number
 * @param {Object} responses - Step responses
 * @returns {Promise} - Saved responses data
 */
export async function saveSetupResponses(stepNumber, responses) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if responses already exist for this step
    const { data: existing } = await supabase
      .from(FARM_SETUP_RESPONSES_TABLE)
      .select('id')
      .eq('user_id', user.id)
      .eq('step_number', stepNumber)
      .single();

    const responseData = {
      user_id: user.id,
      step_number: stepNumber,
      responses: responses,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      // Update existing responses
      return await updateRecord(FARM_SETUP_RESPONSES_TABLE, existing.id, responseData);
    } else {
      // Create new responses
      responseData.created_at = new Date().toISOString();
      return await insertRecord(FARM_SETUP_RESPONSES_TABLE, responseData);
    }
  } catch (error) {
    console.error('Error saving setup responses:', error);
    return { data: null, error };
  }
}

/**
 * Get setup responses for all completed steps
 * @returns {Promise} - All setup responses
 */
export async function getSetupResponses() {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const filters = {
      user_id: user.id
    };

    return await fetchData(FARM_SETUP_RESPONSES_TABLE, {
      filters,
      orderBy: 'step_number'
    });
  } catch (error) {
    console.error('Error fetching setup responses:', error);
    return { data: [], error };
  }
}

/**
 * Get setup responses for a specific step
 * @param {number} stepNumber - Step number
 * @returns {Promise} - Step responses
 */
export async function getStepResponses(stepNumber) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from(FARM_SETUP_RESPONSES_TABLE)
      .select('*')
      .eq('user_id', user.id)
      .eq('step_number', stepNumber)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
    
    return { data: data || null, error: null };
  } catch (error) {
    console.error('Error fetching step responses:', error);
    return { data: null, error };
  }
}

/**
 * Complete the setup process
 * @param {Object} finalData - Final setup data
 * @returns {Promise} - Completion result
 */
export async function completeSetup(finalData = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData = {
      current_step: 6,
      is_complete: true,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...finalData
    };

    const { data, error } = await supabase
      .from(FARM_SETUP_PROGRESS_TABLE)
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error completing setup:', error);
    return { data: null, error };
  }
}

/**
 * Save farm setup goals
 * @param {Array} goals - Array of selected goals
 * @returns {Promise} - Saved goals data
 */
export async function saveFarmGoals(goals) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Delete existing goals first
    await supabase
      .from(FARM_SETUP_GOALS_TABLE)
      .delete()
      .eq('user_id', user.id);

    // Insert new goals
    const goalRecords = goals.map(goal => ({
      user_id: user.id,
      goal_type: goal.type,
      goal_name: goal.name,
      goal_description: goal.description,
      priority: goal.priority || 'medium',
      target_date: goal.targetDate || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from(FARM_SETUP_GOALS_TABLE)
      .insert(goalRecords)
      .select();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error saving farm goals:', error);
    return { data: null, error };
  }
}

/**
 * Get farm setup goals
 * @returns {Promise} - Farm goals data
 */
export async function getFarmGoals() {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const filters = {
      user_id: user.id
    };

    return await fetchData(FARM_SETUP_GOALS_TABLE, {
      filters,
      orderBy: 'created_at'
    });
  } catch (error) {
    console.error('Error fetching farm goals:', error);
    return { data: [], error };
  }
}

/**
 * Save module preferences
 * @param {Array} preferences - Array of module preferences
 * @returns {Promise} - Saved preferences data
 */
export async function saveModulePreferences(preferences) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Delete existing preferences first
    await supabase
      .from(FARM_MODULE_PREFERENCES_TABLE)
      .delete()
      .eq('user_id', user.id);

    // Insert new preferences
    const preferenceRecords = preferences.map(pref => ({
      user_id: user.id,
      module_name: pref.module,
      is_enabled: pref.enabled,
      priority: pref.priority || 'medium',
      settings: pref.settings || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from(FARM_MODULE_PREFERENCES_TABLE)
      .insert(preferenceRecords)
      .select();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error saving module preferences:', error);
    return { data: null, error };
  }
}

/**
 * Get module preferences
 * @returns {Promise} - Module preferences data
 */
export async function getModulePreferences() {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const filters = {
      user_id: user.id
    };

    return await fetchData(FARM_MODULE_PREFERENCES_TABLE, {
      filters,
      orderBy: 'module_name'
    });
  } catch (error) {
    console.error('Error fetching module preferences:', error);
    return { data: [], error };
  }
}

/**
 * Get available setup templates
 * @param {string} farmType - Farm type to filter templates
 * @returns {Promise} - Setup templates data
 */
export async function getSetupTemplates(farmType = null) {
  try {
    const filters = farmType ? { farm_type: farmType } : {};

    return await fetchData(FARM_SETUP_TEMPLATES_TABLE, {
      filters,
      orderBy: 'name'
    });
  } catch (error) {
    console.error('Error fetching setup templates:', error);
    return { data: [], error };
  }
}

/**
 * Get setup questions for a specific step
 * @param {number} stepNumber - Step number
 * @param {string} farmType - Farm type to filter questions
 * @returns {Promise} - Setup questions data
 */
export async function getSetupQuestions(stepNumber, farmType = null) {
  try {
    const filters = {
      step_number: stepNumber,
      is_active: true
    };

    if (farmType) {
      filters.applicable_farm_types = farmType;
    }

    return await fetchData(FARM_SETUP_QUESTIONS_TABLE, {
      filters,
      orderBy: 'display_order'
    });
  } catch (error) {
    console.error('Error fetching setup questions:', error);
    return { data: [], error };
  }
}

/**
 * Reset setup progress (start over)
 * @returns {Promise} - Reset result
 */
export async function resetSetup() {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Delete all related setup data
    await Promise.all([
      supabase
        .from(FARM_SETUP_PROGRESS_TABLE)
        .delete()
        .eq('user_id', user.id),
      supabase
        .from(FARM_SETUP_RESPONSES_TABLE)
        .delete()
        .eq('user_id', user.id),
      supabase
        .from(FARM_SETUP_GOALS_TABLE)
        .delete()
        .eq('user_id', user.id),
      supabase
        .from(FARM_MODULE_PREFERENCES_TABLE)
        .delete()
        .eq('user_id', user.id)
    ]);

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error resetting setup:', error);
    return { data: null, error };
  }
}

// Export farmSetupService object for named import
export const farmSetupService = {
  checkSetupStatus,
  initializeSetup,
  updateSetupProgress,
  saveSetupResponses,
  getSetupResponses,
  getStepResponses,
  completeSetup,
  saveFarmGoals,
  getFarmGoals,
  saveModulePreferences,
  getModulePreferences,
  getSetupTemplates,
  getSetupQuestions,
  resetSetup
};
