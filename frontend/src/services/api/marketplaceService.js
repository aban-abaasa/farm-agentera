import { 
  fetchData, 
  fetchById, 
  insertRecord,
  updateRecord,
  deleteRecord,
  searchRecords, 
  countRecords
} from '../../lib/supabase/dbHelpers';

// Tables in Supabase
const LISTINGS_TABLE = 'marketplace_listings';
const LAND_LISTINGS_TABLE = 'land_listings';
const PRODUCE_LISTINGS_TABLE = 'produce_listings';
const SERVICE_LISTINGS_TABLE = 'service_listings';

/**
 * Fetch all listings with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise} - Listings data
 */
export async function getAllListings(options = {}) {
  return await fetchData(LISTINGS_TABLE, options);
}

/**
 * Fetch a single listing by ID
 * @param {number|string} id - Listing ID
 * @returns {Promise} - Listing data
 */
export async function getListingById(id) {
  return await fetchById(LISTINGS_TABLE, id);
}

/**
 * Search listings by query
 * @param {string} query - Search query
 * @param {number} limit - Number of results to return
 * @returns {Promise} - Search results
 */
export async function searchListings(query, limit = 20) {
  return await searchRecords(LISTINGS_TABLE, query, ['title', 'description'], limit);
}

/**
 * Create a new listing
 * @param {Object} listing - Listing data
 * @param {string} listingType - Type of listing (land, produce, service)
 * @returns {Promise} - New listing and its details
 */
export async function createListing(listing, listingType) {
  // First, create the base listing
  const { data: newListing, error } = await insertRecord(LISTINGS_TABLE, { 
    ...listing, 
    type: listingType,
    created_at: new Date().toISOString(),
    status: 'active'
  });
  
  if (error || !newListing) return { data: null, error };
  
  // Then, create the specific listing type with additional details
  const specificTable = getTableForType(listingType);
  let specificData = listing.details || {};
  
  const { data: details, error: detailsError } = await insertRecord(specificTable, { 
    ...specificData,
    listing_id: newListing[0].id
  });
  
  if (detailsError) return { data: newListing, error: detailsError };
  
  return { 
    data: { 
      ...newListing[0],
      details: details[0]
    }, 
    error: null
  };
}

/**
 * Update an existing listing
 * @param {number|string} id - Listing ID
 * @param {Object} updates - Fields to update
 * @param {string} listingType - Type of listing (land, produce, service)
 * @returns {Promise} - Updated listing
 */
export async function updateListing(id, updates, listingType) {
  // Update base listing
  const { data: updatedListing, error } = await updateRecord(LISTINGS_TABLE, { 
    ...updates, 
    updated_at: new Date().toISOString() 
  }, { id });
  
  if (error || !updatedListing) return { data: null, error };
  
  // Update specific details if provided
  if (updates.details) {
    const specificTable = getTableForType(listingType);
    
    const { error: detailsError } = await updateRecord(specificTable, updates.details, { 
      listing_id: id 
    });
    
    if (detailsError) return { data: updatedListing, error: detailsError };
  }
  
  return { data: updatedListing, error: null };
}

/**
 * Delete a listing
 * @param {number|string} id - Listing ID
 * @param {string} listingType - Type of listing (land, produce, service)
 * @returns {Promise} - Deletion result
 */
export async function deleteListing(id, listingType) {
  // First delete the specific listing details
  const specificTable = getTableForType(listingType);
  await deleteRecord(specificTable, { listing_id: id });
  
  // Then delete the base listing
  return await deleteRecord(LISTINGS_TABLE, { id });
}

/**
 * Get land listings with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise} - Land listings
 */
export async function getLandListings(options = {}) {
  // Enhanced query to join land_listings table with listings table
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    let query = supabase
      .from(LISTINGS_TABLE)
      .select(`
        *,
        land_details:${LAND_LISTINGS_TABLE}(*)
      `)
      .eq('type', 'land')
      .order('created_at', { ascending: false });
    
    // Apply limit
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching land listings:', error);
    return { data: null, error };
  }
}

/**
 * Get produce listings with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise} - Produce listings
 */
export async function getProduceListings(options = {}) {
  // Enhanced query to join produce_listings table with listings table
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    let query = supabase
      .from(LISTINGS_TABLE)
      .select(`
        *,
        produce_details:${PRODUCE_LISTINGS_TABLE}(*)
      `)
      .eq('type', 'produce')
      .order('created_at', { ascending: false });
    
    // Apply limit
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching produce listings:', error);
    return { data: null, error };
  }
}

/**
 * Get service listings with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise} - Service listings
 */
export async function getServiceListings(options = {}) {
  // Enhanced query to join service_listings table with listings table
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    let query = supabase
      .from(LISTINGS_TABLE)
      .select(`
        *,
        service_details:${SERVICE_LISTINGS_TABLE}(*)
      `)
      .eq('type', 'service')
      .order('created_at', { ascending: false });
    
    // Apply limit
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching service listings:', error);
    return { data: null, error };
  }
}

/**
 * Get the specific table name for a listing type
 * @param {string} type - Listing type
 * @returns {string} - Table name
 */
function getTableForType(type) {
  switch (type.toLowerCase()) {
    case 'land':
      return LAND_LISTINGS_TABLE;
    case 'produce':
      return PRODUCE_LISTINGS_TABLE;
    case 'service':
      return SERVICE_LISTINGS_TABLE;
    default:
      throw new Error(`Unknown listing type: ${type}`);
  }
}

/**
 * Get listings by user ID
 * @param {number|string} userId - User ID
 * @returns {Promise} - User's listings
 */
export async function getUserListings(userId) {
  return await fetchData(LISTINGS_TABLE, {
    filters: { user_id: userId },
    orderBy: 'created_at',
    ascending: false
  });
}

/**
 * Mark a listing as sold/rented/unavailable
 * @param {number|string} id - Listing ID
 * @returns {Promise} - Updated listing
 */
export async function markListingAsUnavailable(id) {
  return await updateRecord(LISTINGS_TABLE, { 
    status: 'unavailable',
    updated_at: new Date().toISOString() 
  }, { id });
}

/**
 * Get saved/favorite listings for a user
 * @param {number|string} userId - User ID
 * @returns {Promise} - Saved listings
 */
export async function getSavedListings(userId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from('user_saved_listings')
      .select(`
        listing_id,
        listings:marketplace_listings(*)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Format the data to return just the listings
    const listings = data.map(item => item.listings);
    
    return { data: listings, error: null };
  } catch (error) {
    console.error('Error fetching saved listings:', error);
    return { data: null, error };
  }
}

/**
 * Save/favorite a listing for a user
 * @param {number|string} userId - User ID
 * @param {number|string} listingId - Listing ID
 * @returns {Promise} - Result
 */
export async function saveListing(userId, listingId) {
  return await insertRecord('user_saved_listings', {
    user_id: userId,
    listing_id: listingId,
    created_at: new Date().toISOString()
  });
}

/**
 * Remove a saved/favorite listing for a user
 * @param {number|string} userId - User ID
 * @param {number|string} listingId - Listing ID
 * @returns {Promise} - Result
 */
export async function removeSavedListing(userId, listingId) {
  return await deleteRecord('user_saved_listings', {
    user_id: userId,
    listing_id: listingId
  });
} 