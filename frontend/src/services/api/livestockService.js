import { 
  fetchData, 
  insertRecord,
  updateRecord,
  deleteRecord 
} from '../../lib/supabase/dbHelpers';

// Table names in Supabase
const FARM_LIVESTOCK_TABLE = 'farm_livestock';
const LIVESTOCK_HEALTH_RECORDS_TABLE = 'livestock_health_records';
const LIVESTOCK_BREEDING_TABLE = 'livestock_breeding';
const LIVESTOCK_FEEDS_TABLE = 'livestock_feeds';
const LIVESTOCK_VACCINATIONS_TABLE = 'livestock_vaccinations';
const LIVESTOCK_GROUPS_TABLE = 'livestock_groups';

/**
 * Create new livestock record
 * @param {string} farmId - Farm ID
 * @param {Object} livestockData - Livestock data
 * @returns {Promise} - Created livestock data
 */
export async function createLivestock(farmId, livestockData) {
  try {
    const livestockRecord = {
      ...livestockData,
      farm_id: farmId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(FARM_LIVESTOCK_TABLE, livestockRecord);
  } catch (error) {
    console.error('Error creating livestock:', error);
    return { data: null, error };
  }
}

/**
 * Get livestock for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Livestock data
 */
export async function getLivestock(farmId, options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    let query = supabase
      .from(FARM_LIVESTOCK_TABLE)
      .select(`
        *,
        health_records:${LIVESTOCK_HEALTH_RECORDS_TABLE}(
          id,
          visit_date,
          condition_status,
          veterinarian,
          notes
        ),
        breeding_records:${LIVESTOCK_BREEDING_TABLE}(
          id,
          breeding_date,
          expected_delivery,
          status
        ),
        group:${LIVESTOCK_GROUPS_TABLE}(
          id,
          name,
          description
        )
      `)
      .eq('farm_id', farmId);

    // Apply filters
    if (options.animal_type) {
      query = query.eq('animal_type', options.animal_type);
    }

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.group_id) {
      query = query.eq('group_id', options.group_id);
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
    console.error('Error fetching livestock:', error);
    return { data: [], error };
  }
}

/**
 * Get livestock by ID
 * @param {string} livestockId - Livestock ID
 * @returns {Promise} - Livestock data
 */
export async function getLivestockById(livestockId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(FARM_LIVESTOCK_TABLE)
      .select(`
        *,
        health_records:${LIVESTOCK_HEALTH_RECORDS_TABLE}(*),
        breeding_records:${LIVESTOCK_BREEDING_TABLE}(*),
        vaccinations:${LIVESTOCK_VACCINATIONS_TABLE}(*),
        feeds:${LIVESTOCK_FEEDS_TABLE}(*),
        group:${LIVESTOCK_GROUPS_TABLE}(*)
      `)
      .eq('id', livestockId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching livestock:', error);
    return { data: null, error };
  }
}

/**
 * Update livestock information
 * @param {string} livestockId - Livestock ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated livestock data
 */
export async function updateLivestock(livestockId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(FARM_LIVESTOCK_TABLE, livestockId, updatedData);
}

/**
 * Delete livestock record
 * @param {string} livestockId - Livestock ID
 * @returns {Promise} - Delete result
 */
export async function deleteLivestock(livestockId) {
  return await deleteRecord(FARM_LIVESTOCK_TABLE, livestockId);
}

/**
 * Get livestock statistics for a farm
 * @param {string} farmId - Farm ID
 * @returns {Promise} - Livestock statistics
 */
export async function getLivestockStats(farmId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(FARM_LIVESTOCK_TABLE)
      .select('animal_type, status, count')
      .eq('farm_id', farmId);

    if (error) throw error;

    // Process the data to get statistics
    const stats = data.reduce((acc, item) => {
      if (!acc[item.animal_type]) {
        acc[item.animal_type] = { total: 0, healthy: 0, sick: 0, dead: 0 };
      }
      acc[item.animal_type].total += item.count || 1;
      if (item.status === 'healthy') acc[item.animal_type].healthy += item.count || 1;
      if (item.status === 'sick') acc[item.animal_type].sick += item.count || 1;
      if (item.status === 'dead') acc[item.animal_type].dead += item.count || 1;
      return acc;
    }, {});
    
    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching livestock stats:', error);
    return { data: {}, error };
  }
}

// Health Records Management
/**
 * Create health record
 * @param {string} livestockId - Livestock ID
 * @param {Object} healthData - Health record data
 * @returns {Promise} - Created health record
 */
export async function createHealthRecord(livestockId, healthData) {
  try {
    const healthRecord = {
      ...healthData,
      livestock_id: livestockId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(LIVESTOCK_HEALTH_RECORDS_TABLE, healthRecord);
  } catch (error) {
    console.error('Error creating health record:', error);
    return { data: null, error };
  }
}

/**
 * Get health records for livestock
 * @param {string} livestockId - Livestock ID
 * @param {Object} options - Query options
 * @returns {Promise} - Health records data
 */
export async function getHealthRecords(livestockId, options = {}) {
  const filters = {
    livestock_id: livestockId,
    ...options.filters
  };

  return await fetchData(LIVESTOCK_HEALTH_RECORDS_TABLE, {
    ...options,
    filters,
    orderBy: 'visit_date',
    ascending: false
  });
}

/**
 * Update health record
 * @param {string} recordId - Health record ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated health record
 */
export async function updateHealthRecord(recordId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(LIVESTOCK_HEALTH_RECORDS_TABLE, recordId, updatedData);
}

/**
 * Delete health record
 * @param {string} recordId - Health record ID
 * @returns {Promise} - Delete result
 */
export async function deleteHealthRecord(recordId) {
  return await deleteRecord(LIVESTOCK_HEALTH_RECORDS_TABLE, recordId);
}

// Breeding Management
/**
 * Create breeding record
 * @param {string} livestockId - Livestock ID
 * @param {Object} breedingData - Breeding record data
 * @returns {Promise} - Created breeding record
 */
export async function createBreedingRecord(livestockId, breedingData) {
  try {
    const breedingRecord = {
      ...breedingData,
      livestock_id: livestockId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(LIVESTOCK_BREEDING_TABLE, breedingRecord);
  } catch (error) {
    console.error('Error creating breeding record:', error);
    return { data: null, error };
  }
}

/**
 * Get breeding records for livestock
 * @param {string} livestockId - Livestock ID
 * @param {Object} options - Query options
 * @returns {Promise} - Breeding records data
 */
export async function getBreedingRecords(livestockId, options = {}) {
  const filters = {
    livestock_id: livestockId,
    ...options.filters
  };

  return await fetchData(LIVESTOCK_BREEDING_TABLE, {
    ...options,
    filters,
    orderBy: 'breeding_date',
    ascending: false
  });
}

/**
 * Update breeding record
 * @param {string} recordId - Breeding record ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated breeding record
 */
export async function updateBreedingRecord(recordId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(LIVESTOCK_BREEDING_TABLE, recordId, updatedData);
}

/**
 * Delete breeding record
 * @param {string} recordId - Breeding record ID
 * @returns {Promise} - Delete result
 */
export async function deleteBreedingRecord(recordId) {
  return await deleteRecord(LIVESTOCK_BREEDING_TABLE, recordId);
}

// Feed Management
/**
 * Create feed record
 * @param {string} livestockId - Livestock ID
 * @param {Object} feedData - Feed record data
 * @returns {Promise} - Created feed record
 */
export async function createFeedRecord(livestockId, feedData) {
  try {
    const feedRecord = {
      ...feedData,
      livestock_id: livestockId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(LIVESTOCK_FEEDS_TABLE, feedRecord);
  } catch (error) {
    console.error('Error creating feed record:', error);
    return { data: null, error };
  }
}

/**
 * Get feed records for livestock
 * @param {string} livestockId - Livestock ID
 * @param {Object} options - Query options
 * @returns {Promise} - Feed records data
 */
export async function getFeedRecords(livestockId, options = {}) {
  const filters = {
    livestock_id: livestockId,
    ...options.filters
  };

  return await fetchData(LIVESTOCK_FEEDS_TABLE, {
    ...options,
    filters,
    orderBy: 'feed_date',
    ascending: false
  });
}

// Vaccination Management
/**
 * Create vaccination record
 * @param {string} livestockId - Livestock ID
 * @param {Object} vaccinationData - Vaccination record data
 * @returns {Promise} - Created vaccination record
 */
export async function createVaccinationRecord(livestockId, vaccinationData) {
  try {
    const vaccinationRecord = {
      ...vaccinationData,
      livestock_id: livestockId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(LIVESTOCK_VACCINATIONS_TABLE, vaccinationRecord);
  } catch (error) {
    console.error('Error creating vaccination record:', error);
    return { data: null, error };
  }
}

/**
 * Get vaccination records for livestock
 * @param {string} livestockId - Livestock ID
 * @param {Object} options - Query options
 * @returns {Promise} - Vaccination records data
 */
export async function getVaccinationRecords(livestockId, options = {}) {
  const filters = {
    livestock_id: livestockId,
    ...options.filters
  };

  return await fetchData(LIVESTOCK_VACCINATIONS_TABLE, {
    ...options,
    filters,
    orderBy: 'vaccination_date',
    ascending: false
  });
}

// Groups Management
/**
 * Create livestock group
 * @param {string} farmId - Farm ID
 * @param {Object} groupData - Group data
 * @returns {Promise} - Created group data
 */
export async function createLivestockGroup(farmId, groupData) {
  try {
    const groupRecord = {
      ...groupData,
      farm_id: farmId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(LIVESTOCK_GROUPS_TABLE, groupRecord);
  } catch (error) {
    console.error('Error creating livestock group:', error);
    return { data: null, error };
  }
}

/**
 * Get livestock groups for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Groups data
 */
export async function getLivestockGroups(farmId, options = {}) {
  const filters = {
    farm_id: farmId,
    ...options.filters
  };

  return await fetchData(LIVESTOCK_GROUPS_TABLE, {
    ...options,
    filters
  });
}

/**
 * Update livestock group
 * @param {string} groupId - Group ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated group data
 */
export async function updateLivestockGroup(groupId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(LIVESTOCK_GROUPS_TABLE, groupId, updatedData);
}

/**
 * Delete livestock group
 * @param {string} groupId - Group ID
 * @returns {Promise} - Delete result
 */
export async function deleteLivestockGroup(groupId) {
  return await deleteRecord(LIVESTOCK_GROUPS_TABLE, groupId);
}

/**
 * Get upcoming health checkups and vaccinations
 * @param {string} farmId - Farm ID
 * @param {number} days - Number of days to look ahead
 * @returns {Promise} - Upcoming events data
 */
export async function getUpcomingEvents(farmId, days = 30) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    // Get livestock with upcoming health checkups
    const { data: livestock } = await supabase
      .from(FARM_LIVESTOCK_TABLE)
      .select(`
        id,
        tag_number,
        animal_type,
        breed,
        next_health_checkup,
        next_vaccination
      `)
      .eq('farm_id', farmId)
      .or(`next_health_checkup.lte.${futureDate.toISOString()},next_vaccination.lte.${futureDate.toISOString()}`);

    const events = [];
    
    livestock?.forEach(animal => {
      if (animal.next_health_checkup && new Date(animal.next_health_checkup) <= futureDate) {
        events.push({
          type: 'health_checkup',
          livestock_id: animal.id,
          tag_number: animal.tag_number,
          animal_type: animal.animal_type,
          breed: animal.breed,
          due_date: animal.next_health_checkup,
          description: `Health checkup for ${animal.tag_number}`
        });
      }
      
      if (animal.next_vaccination && new Date(animal.next_vaccination) <= futureDate) {
        events.push({
          type: 'vaccination',
          livestock_id: animal.id,
          tag_number: animal.tag_number,
          animal_type: animal.animal_type,
          breed: animal.breed,
          due_date: animal.next_vaccination,
          description: `Vaccination for ${animal.tag_number}`
        });
      }
    });

    // Sort by due date
    events.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    
    return { data: events, error: null };
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return { data: [], error };
  }
}
