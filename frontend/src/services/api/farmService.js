import { 
  fetchData, 
  insertRecord,
  updateRecord,
  deleteRecord 
} from '../../lib/supabase/dbHelpers';

// Table names in Supabase
const FARMS_TABLE = 'farms';
const FARM_FIELDS_TABLE = 'farm_fields';
const FARM_EQUIPMENT_TABLE = 'farm_equipment';
const FARM_INFRASTRUCTURE_TABLE = 'farm_infrastructure';

/**
 * Create a new farm for the current user
 * @param {Object} farmData - Farm data
 * @returns {Promise} - Created farm data
 */
export async function createFarm(farmData) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if user already has a farm
    const { data: existingFarm } = await supabase
      .from(FARMS_TABLE)
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingFarm) {
      // User already has a farm, update it instead
      const updatedData = {
        ...farmData,
        updated_at: new Date().toISOString()
      };

      const { data: updatedFarm, error: updateError } = await supabase
        .from(FARMS_TABLE)
        .update(updatedData)
        .eq('id', existingFarm.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return { data: updatedFarm, error: null };
    }

    // No existing farm, create new one
    const farmRecord = {
      ...farmData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const result = await insertRecord(FARMS_TABLE, farmRecord);
    
    if (result.error) {
      throw result.error;
    }

    // Ensure we return the first farm object if data is an array
    const createdFarm = Array.isArray(result.data) ? result.data[0] : result.data;
    
    return { data: createdFarm, error: null };
  } catch (error) {
    console.error('Error creating farm:', error);
    return { data: null, error };
  }
}

/**
 * Get farms for the current user
 * @param {Object} options - Query options
 * @returns {Promise} - Farms data
 */
export async function getFarms(options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const filters = {
      user_id: user.id,
      ...options.filters
    };

    return await fetchData(FARMS_TABLE, {
      ...options,
      filters
    });
  } catch (error) {
    console.error('Error fetching farms:', error);
    return { data: [], error };
  }
}

/**
 * Get a single farm by ID
 * @param {string} farmId - Farm ID
 * @returns {Promise} - Farm data
 */
export async function getFarmById(farmId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from(FARMS_TABLE)
      .select(`
        *,
        fields:${FARM_FIELDS_TABLE}(*),
        equipment:${FARM_EQUIPMENT_TABLE}(*),
        infrastructure:${FARM_INFRASTRUCTURE_TABLE}(*)
      `)
      .eq('id', farmId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching farm:', error);
    return { data: null, error };
  }
}

/**
 * Update farm information
 * @param {string} farmId - Farm ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated farm data
 */
export async function updateFarm(farmId, updateData) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify ownership
    const { data: farm } = await supabase
      .from(FARMS_TABLE)
      .select('id')
      .eq('id', farmId)
      .eq('user_id', user.id)
      .single();

    if (!farm) {
      throw new Error('Farm not found or access denied');
    }

    const updatedData = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    return await updateRecord(FARMS_TABLE, farmId, updatedData);
  } catch (error) {
    console.error('Error updating farm:', error);
    return { data: null, error };
  }
}

/**
 * Delete a farm
 * @param {string} farmId - Farm ID
 * @returns {Promise} - Delete result
 */
export async function deleteFarm(farmId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify ownership
    const { data: farm } = await supabase
      .from(FARMS_TABLE)
      .select('id')
      .eq('id', farmId)
      .eq('user_id', user.id)
      .single();

    if (!farm) {
      throw new Error('Farm not found or access denied');
    }

    return await deleteRecord(FARMS_TABLE, farmId);
  } catch (error) {
    console.error('Error deleting farm:', error);
    return { data: null, error };
  }
}

/**
 * Get farm overview/dashboard data
 * @param {string} farmId - Farm ID
 * @returns {Promise} - Farm overview data
 */
export async function getFarmOverview(farmId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from(FARMS_TABLE)
      .select(`
        id,
        name,
        farm_type,
        total_area,
        location,
        fields:${FARM_FIELDS_TABLE}(id, name, area, crop_type),
        livestock:farm_livestock(id, animal_type, count),
        equipment:${FARM_EQUIPMENT_TABLE}(id, name, type, status),
        infrastructure:${FARM_INFRASTRUCTURE_TABLE}(id, name, type, status)
      `)
      .eq('id', farmId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching farm overview:', error);
    return { data: null, error };
  }
}

// Farm Fields Management
/**
 * Create a new field
 * @param {string} farmId - Farm ID
 * @param {Object} fieldData - Field data
 * @returns {Promise} - Created field data
 */
export async function createField(farmId, fieldData) {
  try {
    const fieldRecord = {
      ...fieldData,
      farm_id: farmId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(FARM_FIELDS_TABLE, fieldRecord);
  } catch (error) {
    console.error('Error creating field:', error);
    return { data: null, error };
  }
}

/**
 * Get fields for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Fields data
 */
export async function getFields(farmId, options = {}) {
  const filters = {
    farm_id: farmId,
    ...options.filters
  };

  return await fetchData(FARM_FIELDS_TABLE, {
    ...options,
    filters
  });
}

/**
 * Update field information
 * @param {string} fieldId - Field ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated field data
 */
export async function updateField(fieldId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(FARM_FIELDS_TABLE, fieldId, updatedData);
}

/**
 * Delete a field
 * @param {string} fieldId - Field ID
 * @returns {Promise} - Delete result
 */
export async function deleteField(fieldId) {
  return await deleteRecord(FARM_FIELDS_TABLE, fieldId);
}

// Farm Equipment Management
/**
 * Create new equipment
 * @param {string} farmId - Farm ID
 * @param {Object} equipmentData - Equipment data
 * @returns {Promise} - Created equipment data
 */
export async function createEquipment(farmId, equipmentData) {
  try {
    const equipmentRecord = {
      ...equipmentData,
      farm_id: farmId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(FARM_EQUIPMENT_TABLE, equipmentRecord);
  } catch (error) {
    console.error('Error creating equipment:', error);
    return { data: null, error };
  }
}

/**
 * Get equipment for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Equipment data
 */
export async function getEquipment(farmId, options = {}) {
  const filters = {
    farm_id: farmId,
    ...options.filters
  };

  return await fetchData(FARM_EQUIPMENT_TABLE, {
    ...options,
    filters
  });
}

/**
 * Update equipment information
 * @param {string} equipmentId - Equipment ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated equipment data
 */
export async function updateEquipment(equipmentId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(FARM_EQUIPMENT_TABLE, equipmentId, updatedData);
}

/**
 * Delete equipment
 * @param {string} equipmentId - Equipment ID
 * @returns {Promise} - Delete result
 */
export async function deleteEquipment(equipmentId) {
  return await deleteRecord(FARM_EQUIPMENT_TABLE, equipmentId);
}

// Farm Infrastructure Management
/**
 * Create new infrastructure
 * @param {string} farmId - Farm ID
 * @param {Object} infrastructureData - Infrastructure data
 * @returns {Promise} - Created infrastructure data
 */
export async function createInfrastructure(farmId, infrastructureData) {
  try {
    const infrastructureRecord = {
      ...infrastructureData,
      farm_id: farmId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(FARM_INFRASTRUCTURE_TABLE, infrastructureRecord);
  } catch (error) {
    console.error('Error creating infrastructure:', error);
    return { data: null, error };
  }
}

/**
 * Get infrastructure for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Infrastructure data
 */
export async function getInfrastructure(farmId, options = {}) {
  const filters = {
    farm_id: farmId,
    ...options.filters
  };

  return await fetchData(FARM_INFRASTRUCTURE_TABLE, {
    ...options,
    filters
  });
}

/**
 * Update infrastructure information
 * @param {string} infrastructureId - Infrastructure ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated infrastructure data
 */
export async function updateInfrastructure(infrastructureId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(FARM_INFRASTRUCTURE_TABLE, infrastructureId, updatedData);
}

/**
 * Delete infrastructure
 * @param {string} infrastructureId - Infrastructure ID
 * @returns {Promise} - Delete result
 */
export async function deleteInfrastructure(infrastructureId) {
  return await deleteRecord(FARM_INFRASTRUCTURE_TABLE, infrastructureId);
}

/**
 * Search farms by name or location
 * @param {string} searchTerm - Search term
 * @param {Object} options - Search options
 * @returns {Promise} - Search results
 */
export async function searchFarms(searchTerm) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from(FARMS_TABLE)
      .select('*')
      .eq('user_id', user.id)
      .or(`name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
      .order('name');

    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error searching farms:', error);
    return { data: [], error };
  }
}

/**
 * Get farm setup progress
 * @returns {Promise} - Setup progress data
 */
export async function getFarmSetupProgress() {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('farm_setup_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
    
    return { 
      data: data || { 
        setup_completed: false, 
        current_step: 'basic_info',
        completion_percentage: 0,
        form_data: {}
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error getting farm setup progress:', error);
    return { data: null, error };
  }
}

/**
 * Update farm setup progress
 * @param {Object} progressData - Progress data
 * @returns {Promise} - Updated progress data
 */
export async function updateFarmSetupProgress(progressData) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const updateData = {
      ...progressData,
      updated_at: new Date().toISOString()
    };

    // Try to update first
    const { data: updateResult, error: updateError } = await supabase
      .from('farm_setup_progress')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError && updateError.code === 'PGRST116') {
      // No existing record, create new one
      const insertData = {
        user_id: user.id,
        ...updateData,
        created_at: new Date().toISOString()
      };

      const { data: insertResult, error: insertError } = await supabase
        .from('farm_setup_progress')
        .insert(insertData)
        .select()
        .single();

      if (insertError) throw insertError;
      return { data: insertResult, error: null };
    }

    if (updateError) throw updateError;
    return { data: updateResult, error: null };
  } catch (error) {
    console.error('Error updating farm setup progress:', error);
    return { data: null, error };
  }
}

/**
 * Complete farm setup
 * @returns {Promise} - Completion result
 */
export async function completeFarmSetup() {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const updateData = {
      current_step: 'complete',
      completion_percentage: 100,
      setup_completed: true,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // First check if a record exists
    const { data: existingProgress } = await supabase
      .from('farm_setup_progress')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingProgress) {
      // Update existing record
      const { data: updateResult, error: updateError } = await supabase
        .from('farm_setup_progress')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return { data: updateResult, error: null };
    } else {
      // Create new record
      const insertData = {
        user_id: user.id,
        ...updateData,
        created_at: new Date().toISOString()
      };

      const { data: insertResult, error: insertError } = await supabase
        .from('farm_setup_progress')
        .insert(insertData)
        .select()
        .single();

      if (insertError) throw insertError;
      return { data: insertResult, error: null };
    }
  } catch (error) {
    console.error('Error completing farm setup:', error);
    return { data: null, error };
  }
}

/**
 * Save farm goals
 * @param {string} farmId - Farm ID
 * @param {Array} goals - Array of goal strings
 * @returns {Promise} - Saved goals result
 */
export async function saveFarmGoals(farmId, goals) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!farmId) {
      throw new Error('Farm ID is required');
    }

    if (!goals || !Array.isArray(goals) || goals.length === 0) {
      return { data: [], error: null };
    }

    // Verify farm ownership first
    const { data: farm, error: farmError } = await supabase
      .from('farms')
      .select('id')
      .eq('id', farmId)
      .eq('user_id', user.id)
      .single();

    if (farmError || !farm) {
      throw new Error('Farm not found or access denied');
    }

    // Delete existing goals for this farm
    const { error: deleteError } = await supabase
      .from('farm_goals')
      .delete()
      .eq('farm_id', farmId);

    if (deleteError) {
      console.warn('Warning: Could not delete existing goals:', deleteError);
    }

    // Insert new goals
    const goalRecords = goals.map((goal) => ({
      farm_id: farmId,
      title: goal,
      goal_type: 'general',
      category: 'general',
      priority: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('farm_goals')
      .insert(goalRecords)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving farm goals:', error);
    return { data: null, error };
  }
}

// Export farmService object for named import
export const farmService = {
  createFarm,
  getFarms,
  getFarmById,
  updateFarm,
  deleteFarm,
  getFarmOverview,
  createField,
  getFields,
  updateField,
  deleteField,
  createEquipment,
  getEquipment,
  updateEquipment,
  deleteEquipment,
  createInfrastructure,
  getInfrastructure,
  updateInfrastructure,
  deleteInfrastructure,
  searchFarms,
  getFarmSetupProgress,
  updateFarmSetupProgress,
  completeFarmSetup,
  saveFarmGoals
};
