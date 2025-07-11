import { supabase } from '../../lib/supabase/client';

/**
 * Get all marketplace listings with optional filtering
 * @param {Object} options - Query options
 * @param {string} options.type - Filter by listing type ('land', 'produce', 'service')
 * @param {string} options.status - Filter by status ('active', 'sold', 'expired', 'unavailable')
 * @param {string} options.location - Filter by location
 * @param {number} options.limit - Maximum number of results to return
 * @param {number} options.offset - Number of results to skip (for pagination)
 * @param {string} options.sortBy - Field to sort by
 * @param {boolean} options.ascending - Sort direction (true for ascending, false for descending)
 * @returns {Promise<{data: Array, error: Object}>} - Listings data or error
 */
export const getListings = async (options = {}) => {
  try {
    let query = supabase
      .from('marketplace_listings')
      .select('*');
    
    // Apply filters if provided
    if (options.type) {
      query = query.eq('type', options.type);
    }
    
    if (options.status) {
      query = query.eq('status', options.status);
    } else {
      // By default, only show active listings
      query = query.eq('status', 'active');
    }
    
    if (options.location) {
      query = query.ilike('location', `%${options.location}%`);
    }
    
    // Apply sorting
    if (options.sortBy) {
      query = query.order(options.sortBy, { ascending: options.ascending ?? true });
    } else {
      // Default sort by created_at in descending order (newest first)
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching listings:', error);
    return { data: null, error };
  }
};

/**
 * Get a specific listing by ID with its specialized details
 * @param {number} id - Listing ID
 * @param {string} type - Listing type ('land', 'produce', 'service')
 * @returns {Promise<{data: Object, error: Object}>} - Listing data or error
 */
export const getListingById = async (id, type) => {
  try {
    // First get the base listing
    const { data: listing, error: listingError } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (listingError) throw listingError;
    if (!listing) throw new Error('Listing not found');
    
    // Get the specialized details based on the type
    let detailsTable = '';
    switch (type || listing.type) {
      case 'land':
        detailsTable = 'land_listings';
        break;
      case 'produce':
        detailsTable = 'produce_listings';
        break;
      case 'service':
        detailsTable = 'service_listings';
        break;
      default:
        throw new Error('Invalid listing type');
    }
    
    const { data: details, error: detailsError } = await supabase
      .from(detailsTable)
      .select('*')
      .eq('listing_id', id)
      .single();
    
    if (detailsError) throw detailsError;
    
    // Get the seller/owner information
    const { data: owner, error: ownerError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url, phone_number, email, location, role, is_verified')
      .eq('id', listing.user_id)
      .single();
    
    if (ownerError) throw ownerError;
    
    // Combine all data
    const combinedData = {
      ...listing,
      details,
      owner: {
        id: owner.id,
        name: `${owner.first_name || ''} ${owner.last_name || ''}`.trim(),
        avatar: owner.avatar_url,
        phone: owner.phone_number,
        email: owner.email,
        location: owner.location,
        role: owner.role,
        isVerified: owner.is_verified
      }
    };
    
    return { data: combinedData, error: null };
  } catch (error) {
    console.error('Error fetching listing details:', error);
    return { data: null, error };
  }
};

/**
 * Create a new marketplace listing
 * @param {Object} listingData - Base listing data
 * @param {Object} detailsData - Specialized details data
 * @returns {Promise<{data: Object, error: Object}>} - Created listing or error
 */
export const createListing = async (listingData, detailsData) => {
  try {
    // Start a transaction
    const { data, error } = await supabase.rpc('create_listing', {
      listing_data: listingData,
      details_data: detailsData,
      listing_type: listingData.type
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating listing:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing marketplace listing
 * @param {number} id - Listing ID
 * @param {Object} listingData - Base listing data to update
 * @param {Object} detailsData - Specialized details data to update
 * @returns {Promise<{data: Object, error: Object}>} - Updated listing or error
 */
export const updateListing = async (id, listingData, detailsData) => {
  try {
    // First update the base listing
    const { data: updatedListing, error: listingError } = await supabase
      .from('marketplace_listings')
      .update({
        ...listingData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (listingError) throw listingError;
    
    // Determine the details table based on the listing type
    let detailsTable = '';
    switch (listingData.type || updatedListing.type) {
      case 'land':
        detailsTable = 'land_listings';
        break;
      case 'produce':
        detailsTable = 'produce_listings';
        break;
      case 'service':
        detailsTable = 'service_listings';
        break;
      default:
        throw new Error('Invalid listing type');
    }
    
    // Update the specialized details
    const { data: updatedDetails, error: detailsError } = await supabase
      .from(detailsTable)
      .update({
        ...detailsData,
        updated_at: new Date().toISOString()
      })
      .eq('listing_id', id)
      .select()
      .single();
    
    if (detailsError) throw detailsError;
    
    return { 
      data: { 
        ...updatedListing, 
        details: updatedDetails 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error updating listing:', error);
    return { data: null, error };
  }
};

/**
 * Delete a marketplace listing
 * @param {number} id - Listing ID
 * @returns {Promise<{success: boolean, error: Object}>} - Success status or error
 */
export const deleteListing = async (id) => {
  try {
    // Deleting the base listing will cascade delete the specialized details
    const { error } = await supabase
      .from('marketplace_listings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting listing:', error);
    return { success: false, error };
  }
};

/**
 * Save a listing for a user
 * @param {number} listingId - Listing ID
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, error: Object}>} - Success status or error
 */
export const saveListing = async (listingId, userId) => {
  try {
    const { error } = await supabase
      .from('user_saved_listings')
      .insert({
        user_id: userId,
        listing_id: listingId
      });
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error saving listing:', error);
    return { success: false, error };
  }
};

/**
 * Unsave a listing for a user
 * @param {number} listingId - Listing ID
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, error: Object}>} - Success status or error
 */
export const unsaveListing = async (listingId, userId) => {
  try {
    const { error } = await supabase
      .from('user_saved_listings')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', listingId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error unsaving listing:', error);
    return { success: false, error };
  }
};

/**
 * Get saved listings for a user
 * @param {string} userId - User ID
 * @returns {Promise<{data: Array, error: Object}>} - Saved listings or error
 */
export const getSavedListings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_saved_listings')
      .select(`
        listing_id,
        marketplace_listings (*)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Transform the data to a more usable format
    const listings = data.map(item => item.marketplace_listings);
    
    return { data: listings, error: null };
  } catch (error) {
    console.error('Error fetching saved listings:', error);
    return { data: null, error };
  }
};

/**
 * Get listings for a specific user
 * @param {string} userId - User ID
 * @param {Object} options - Query options (same as getListings)
 * @returns {Promise<{data: Array, error: Object}>} - User's listings or error
 */
export const getUserListings = async (userId, options = {}) => {
  try {
    let query = supabase
      .from('marketplace_listings')
      .select('*')
      .eq('user_id', userId);
    
    // Apply filters if provided
    if (options.type) {
      query = query.eq('type', options.type);
    }
    
    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    // Apply sorting
    if (options.sortBy) {
      query = query.order(options.sortBy, { ascending: options.ascending ?? true });
    } else {
      // Default sort by created_at in descending order (newest first)
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user listings:', error);
    return { data: null, error };
  }
};

/**
 * Increment view count for a listing
 * @param {number} id - Listing ID
 * @returns {Promise<{success: boolean, error: Object}>} - Success status or error
 */
export const incrementListingView = async (id) => {
  try {
    const { error } = await supabase.rpc('increment_listing_view', { listing_id: id });
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return { success: false, error };
  }
};

/**
 * Change the status of a listing
 * @param {number} id - Listing ID
 * @param {string} status - New status ('active', 'sold', 'expired', 'unavailable')
 * @returns {Promise<{success: boolean, error: Object}>} - Success status or error
 */
export const changeListingStatus = async (id, status) => {
  try {
    const { error } = await supabase
      .from('marketplace_listings')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error changing listing status:', error);
    return { success: false, error };
  }
};

/**
 * Search listings by keyword
 * @param {string} keyword - Search keyword
 * @param {Object} options - Query options (same as getListings)
 * @returns {Promise<{data: Array, error: Object}>} - Search results or error
 */
export const searchListings = async (keyword, options = {}) => {
  try {
    let query = supabase
      .from('marketplace_listings')
      .select('*')
      .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,location.ilike.%${keyword}%`);
    
    // Apply filters if provided
    if (options.type) {
      query = query.eq('type', options.type);
    }
    
    if (options.status) {
      query = query.eq('status', options.status);
    } else {
      // By default, only show active listings
      query = query.eq('status', 'active');
    }
    
    // Apply sorting
    if (options.sortBy) {
      query = query.order(options.sortBy, { ascending: options.ascending ?? true });
    } else {
      // Default sort by created_at in descending order (newest first)
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error searching listings:', error);
    return { data: null, error };
  }
}; 

/**
 * Upload listing images to storage
 * @param {string} userId - User ID
 * @param {File[]} files - Image files to upload
 * @param {string} [listingType=''] - Type of listing (land, produce, service)
 * @returns {Promise<{data: string[], error: Object}>} - Array of image URLs or error
 */
export const uploadListingImages = async (userId, files, listingType = '') => {
  try {
    // Import the storage service
    const { uploadMultipleFiles } = await import('./storageService');
    
    // Determine the folder path based on listing type
    let folderPath = `listings/${userId}`;
    if (listingType && ['land', 'produce', 'service'].includes(listingType)) {
      folderPath = `listings/${listingType}/${userId}`;
    }
    
    // Upload multiple files to the determined folder
    const { urls, errors } = await uploadMultipleFiles(
      'marketplace',
      folderPath,
      files,
      {
        maxSizeMB: 5,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        upsert: false
      }
    );
    
    // Log any errors that occurred during upload
    if (errors.length > 0) {
      console.warn('Some images failed to upload:', errors);
    }
    
    // Return the URLs of successfully uploaded images
    return { data: urls, error: errors.length > 0 ? { message: 'Some uploads failed', details: errors } : null };
  } catch (error) {
    console.error('Error uploading images:', error);
    return { data: null, error };
  }
}; 