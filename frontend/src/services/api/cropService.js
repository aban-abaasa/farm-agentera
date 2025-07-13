import { 
  fetchData, 
  insertRecord,
  updateRecord,
  deleteRecord 
} from '../../lib/supabase/dbHelpers';

// Table names in Supabase
const FARM_CROPS_TABLE = 'farm_crops';
const CROP_ACTIVITIES_TABLE = 'crop_activities';
const CROP_SEASONS_TABLE = 'crop_seasons';
const CROP_YIELDS_TABLE = 'crop_yields';
const CROP_TREATMENTS_TABLE = 'crop_treatments';
const CROP_ROTATIONS_TABLE = 'crop_rotations';

/**
 * Create new crop record
 * @param {string} farmId - Farm ID
 * @param {Object} cropData - Crop data
 * @returns {Promise} - Created crop data
 */
export async function createCrop(farmId, cropData) {
  try {
    const cropRecord = {
      ...cropData,
      farm_id: farmId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(FARM_CROPS_TABLE, cropRecord);
  } catch (error) {
    console.error('Error creating crop:', error);
    return { data: null, error };
  }
}

/**
 * Get crops for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Crops data
 */
export async function getCrops(farmId, options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    let query = supabase
      .from(FARM_CROPS_TABLE)
      .select(`
        *,
        field:farm_fields(
          id,
          name,
          area
        ),
        activities:${CROP_ACTIVITIES_TABLE}(
          id,
          activity_type,
          activity_date,
          status
        ),
        yields:${CROP_YIELDS_TABLE}(
          id,
          harvest_date,
          quantity,
          quality_grade
        ),
        current_season:${CROP_SEASONS_TABLE}(
          id,
          season_name,
          planting_date,
          expected_harvest,
          status
        )
      `)
      .eq('farm_id', farmId);

    // Apply filters
    if (options.crop_type) {
      query = query.eq('crop_type', options.crop_type);
    }

    if (options.field_id) {
      query = query.eq('field_id', options.field_id);
    }

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.season_id) {
      query = query.eq('current_season_id', options.season_id);
    }

    // Apply sorting
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching crops:', error);
    return { data: [], error };
  }
}

/**
 * Get crop by ID
 * @param {string} cropId - Crop ID
 * @returns {Promise} - Crop data
 */
export async function getCropById(cropId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(FARM_CROPS_TABLE)
      .select(`
        *,
        field:farm_fields(*),
        activities:${CROP_ACTIVITIES_TABLE}(*),
        yields:${CROP_YIELDS_TABLE}(*),
        treatments:${CROP_TREATMENTS_TABLE}(*),
        seasons:${CROP_SEASONS_TABLE}(*),
        rotations:${CROP_ROTATIONS_TABLE}(*)
      `)
      .eq('id', cropId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching crop:', error);
    return { data: null, error };
  }
}

/**
 * Update crop information
 * @param {string} cropId - Crop ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated crop data
 */
export async function updateCrop(cropId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(FARM_CROPS_TABLE, cropId, updatedData);
}

/**
 * Delete crop record
 * @param {string} cropId - Crop ID
 * @returns {Promise} - Delete result
 */
export async function deleteCrop(cropId) {
  return await deleteRecord(FARM_CROPS_TABLE, cropId);
}

/**
 * Get crop statistics for a farm
 * @param {string} farmId - Farm ID
 * @returns {Promise} - Crop statistics
 */
export async function getCropStats(farmId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(FARM_CROPS_TABLE)
      .select(`
        crop_type,
        status,
        area_planted,
        field:farm_fields(area)
      `)
      .eq('farm_id', farmId);

    if (error) throw error;

    // Process the data to get statistics
    const stats = data.reduce((acc, item) => {
      if (!acc[item.crop_type]) {
        acc[item.crop_type] = { 
          total_area: 0, 
          planted: 0, 
          growing: 0, 
          harvested: 0,
          count: 0
        };
      }
      
      acc[item.crop_type].total_area += item.area_planted || item.field?.area || 0;
      acc[item.crop_type].count += 1;
      
      if (item.status === 'planted') acc[item.crop_type].planted += 1;
      if (item.status === 'growing') acc[item.crop_type].growing += 1;
      if (item.status === 'harvested') acc[item.crop_type].harvested += 1;
      
      return acc;
    }, {});
    
    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching crop stats:', error);
    return { data: {}, error };
  }
}

// Crop Activities Management
/**
 * Create crop activity
 * @param {string} cropId - Crop ID
 * @param {Object} activityData - Activity data
 * @returns {Promise} - Created activity
 */
export async function createCropActivity(cropId, activityData) {
  try {
    const activityRecord = {
      ...activityData,
      crop_id: cropId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(CROP_ACTIVITIES_TABLE, activityRecord);
  } catch (error) {
    console.error('Error creating crop activity:', error);
    return { data: null, error };
  }
}

/**
 * Get activities for a crop
 * @param {string} cropId - Crop ID
 * @param {Object} options - Query options
 * @returns {Promise} - Activities data
 */
export async function getCropActivities(cropId, options = {}) {
  const filters = {
    crop_id: cropId,
    ...options.filters
  };

  return await fetchData(CROP_ACTIVITIES_TABLE, {
    ...options,
    filters,
    orderBy: 'activity_date',
    ascending: false
  });
}

/**
 * Update crop activity
 * @param {string} activityId - Activity ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated activity
 */
export async function updateCropActivity(activityId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(CROP_ACTIVITIES_TABLE, activityId, updatedData);
}

/**
 * Delete crop activity
 * @param {string} activityId - Activity ID
 * @returns {Promise} - Delete result
 */
export async function deleteCropActivity(activityId) {
  return await deleteRecord(CROP_ACTIVITIES_TABLE, activityId);
}

// Crop Seasons Management
/**
 * Create crop season
 * @param {string} cropId - Crop ID
 * @param {Object} seasonData - Season data
 * @returns {Promise} - Created season
 */
export async function createCropSeason(cropId, seasonData) {
  try {
    const seasonRecord = {
      ...seasonData,
      crop_id: cropId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(CROP_SEASONS_TABLE, seasonRecord);
  } catch (error) {
    console.error('Error creating crop season:', error);
    return { data: null, error };
  }
}

/**
 * Get seasons for a crop
 * @param {string} cropId - Crop ID
 * @param {Object} options - Query options
 * @returns {Promise} - Seasons data
 */
export async function getCropSeasons(cropId, options = {}) {
  const filters = {
    crop_id: cropId,
    ...options.filters
  };

  return await fetchData(CROP_SEASONS_TABLE, {
    ...options,
    filters,
    orderBy: 'planting_date',
    ascending: false
  });
}

/**
 * Update crop season
 * @param {string} seasonId - Season ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated season
 */
export async function updateCropSeason(seasonId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(CROP_SEASONS_TABLE, seasonId, updatedData);
}

// Crop Yields Management
/**
 * Create yield record
 * @param {string} cropId - Crop ID
 * @param {Object} yieldData - Yield data
 * @returns {Promise} - Created yield record
 */
export async function createCropYield(cropId, yieldData) {
  try {
    const yieldRecord = {
      ...yieldData,
      crop_id: cropId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(CROP_YIELDS_TABLE, yieldRecord);
  } catch (error) {
    console.error('Error creating crop yield:', error);
    return { data: null, error };
  }
}

/**
 * Get yield records for a crop
 * @param {string} cropId - Crop ID
 * @param {Object} options - Query options
 * @returns {Promise} - Yield records data
 */
export async function getCropYields(cropId, options = {}) {
  const filters = {
    crop_id: cropId,
    ...options.filters
  };

  return await fetchData(CROP_YIELDS_TABLE, {
    ...options,
    filters,
    orderBy: 'harvest_date',
    ascending: false
  });
}

/**
 * Get yield history for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Yield history data
 */
export async function getYieldHistory(farmId, options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    let query = supabase
      .from(CROP_YIELDS_TABLE)
      .select(`
        *,
        crop:${FARM_CROPS_TABLE}(
          id,
          crop_type,
          variety,
          field:farm_fields(name, area)
        )
      `)
      .eq('crop.farm_id', farmId);

    if (options.crop_type) {
      query = query.eq('crop.crop_type', options.crop_type);
    }

    if (options.year) {
      const startDate = `${options.year}-01-01`;
      const endDate = `${options.year}-12-31`;
      query = query.gte('harvest_date', startDate).lte('harvest_date', endDate);
    }

    query = query.order('harvest_date', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching yield history:', error);
    return { data: [], error };
  }
}

// Crop Treatments Management
/**
 * Create treatment record
 * @param {string} cropId - Crop ID
 * @param {Object} treatmentData - Treatment data
 * @returns {Promise} - Created treatment record
 */
export async function createCropTreatment(cropId, treatmentData) {
  try {
    const treatmentRecord = {
      ...treatmentData,
      crop_id: cropId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(CROP_TREATMENTS_TABLE, treatmentRecord);
  } catch (error) {
    console.error('Error creating crop treatment:', error);
    return { data: null, error };
  }
}

/**
 * Get treatment records for a crop
 * @param {string} cropId - Crop ID
 * @param {Object} options - Query options
 * @returns {Promise} - Treatment records data
 */
export async function getCropTreatments(cropId, options = {}) {
  const filters = {
    crop_id: cropId,
    ...options.filters
  };

  return await fetchData(CROP_TREATMENTS_TABLE, {
    ...options,
    filters,
    orderBy: 'application_date',
    ascending: false
  });
}

// Crop Rotation Management
/**
 * Create rotation plan
 * @param {string} farmId - Farm ID
 * @param {Object} rotationData - Rotation data
 * @returns {Promise} - Created rotation plan
 */
export async function createCropRotation(farmId, rotationData) {
  try {
    const rotationRecord = {
      ...rotationData,
      farm_id: farmId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(CROP_ROTATIONS_TABLE, rotationRecord);
  } catch (error) {
    console.error('Error creating crop rotation:', error);
    return { data: null, error };
  }
}

/**
 * Get rotation plans for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Rotation plans data
 */
export async function getCropRotations(farmId, options = {}) {
  const filters = {
    farm_id: farmId,
    ...options.filters
  };

  return await fetchData(CROP_ROTATIONS_TABLE, {
    ...options,
    filters
  });
}

/**
 * Get upcoming crop activities
 * @param {string} farmId - Farm ID
 * @param {number} days - Number of days to look ahead
 * @returns {Promise} - Upcoming activities data
 */
export async function getUpcomingActivities(farmId, days = 30) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    const { data, error } = await supabase
      .from(CROP_ACTIVITIES_TABLE)
      .select(`
        *,
        crop:${FARM_CROPS_TABLE}(
          id,
          crop_type,
          variety,
          field:farm_fields(name)
        )
      `)
      .eq('crop.farm_id', farmId)
      .eq('status', 'scheduled')
      .lte('scheduled_date', futureDate.toISOString())
      .order('scheduled_date');

    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching upcoming activities:', error);
    return { data: [], error };
  }
}

/**
 * Get crops by field
 * @param {string} fieldId - Field ID
 * @param {Object} options - Query options
 * @returns {Promise} - Crops data
 */
export async function getCropsByField(fieldId, options = {}) {
  const filters = {
    field_id: fieldId,
    ...options.filters
  };

  return await fetchData(FARM_CROPS_TABLE, {
    ...options,
    filters
  });
}

/**
 * Search crops by type or variety
 * @param {string} farmId - Farm ID
 * @param {string} searchTerm - Search term
 * @returns {Promise} - Search results
 */
export async function searchCrops(farmId, searchTerm) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(FARM_CROPS_TABLE)
      .select(`
        *,
        field:farm_fields(name)
      `)
      .eq('farm_id', farmId)
      .or(`crop_type.ilike.%${searchTerm}%,variety.ilike.%${searchTerm}%`)
      .order('crop_type');

    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error searching crops:', error);
    return { data: [], error };
  }
}
