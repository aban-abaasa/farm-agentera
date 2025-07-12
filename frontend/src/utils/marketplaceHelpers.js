/**
 * Marketplace utility functions for data formatting and processing
 */

/**
 * Format price for display
 * @param {Object} listing - Marketplace listing object
 * @returns {string} Formatted price string
 */
export const formatPrice = (listing) => {
  if (listing.is_negotiable) {
    return 'Negotiable';
  }
  
  if (!listing.price || listing.price === 0) {
    return 'Contact for price';
  }
  
  // Format price with UGX currency
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0
  }).format(listing.price);
};

/**
 * Get the main image URL for a listing
 * @param {Object} listing - Marketplace listing object
 * @returns {string} Image URL
 */
export const getListingImageUrl = (listing) => {
  // Use thumbnail if available
  if (listing.thumbnail) {
    return listing.thumbnail;
  }
  
  // Use first image from array
  if (listing.images && listing.images.length > 0) {
    return listing.images[0];
  }
  
  // Fallback to placeholder based on listing type
  const typeImages = {
    land: 'farmland,agriculture,field',
    produce: 'vegetables,fruits,crops,harvest',
    service: 'tractor,farming,equipment,tools'
  };
  
  const searchTerms = typeImages[listing.type] || 'agriculture,farming';
  return `https://source.unsplash.com/400x300/?${searchTerms}`;
};

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  return new Intl.DateTimeFormat('en-UG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateString));
};

/**
 * Format time ago from date
 * @param {string} dateString - ISO date string
 * @returns {string} Time ago string (e.g., "2 days ago")
 */
export const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
};

/**
 * Get listing status chip color
 * @param {string} status - Listing status
 * @returns {string} MUI chip color
 */
export const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    sold: 'error',
    expired: 'warning',
    unavailable: 'default'
  };
  
  return colors[status] || 'default';
};

/**
 * Format listing location for display
 * @param {Object} listing - Marketplace listing object
 * @returns {string} Formatted location
 */
export const formatLocation = (listing) => {
  if (listing.district && listing.location) {
    return `${listing.location}, ${listing.district}`;
  }
  
  return listing.location || listing.district || 'Location not specified';
};

/**
 * Get listing type display name
 * @param {string} type - Listing type
 * @returns {string} Display name
 */
export const getTypeDisplayName = (type) => {
  const names = {
    land: 'Land',
    produce: 'Produce',
    service: 'Service'
  };
  
  return names[type] || type;
};

/**
 * Extract listing features based on type
 * @param {Object} listing - Marketplace listing object with details
 * @returns {Array} Array of feature strings
 */
export const getListingFeatures = (listing) => {
  const features = [];
  
  if (listing.type === 'land' && listing.details) {
    const details = listing.details;
    if (details.size_acres) features.push(`${details.size_acres} acres`);
    if (details.land_type) features.push(details.land_type);
    if (details.ownership_type) features.push(details.ownership_type);
    if (details.has_road_access) features.push('Road access');
    if (details.has_electricity) features.push('Electricity');
    if (details.water_source) features.push(`Water: ${details.water_source}`);
  }
  
  if (listing.type === 'produce' && listing.details) {
    const details = listing.details;
    if (details.quantity && details.unit) features.push(`${details.quantity} ${details.unit}`);
    if (details.is_organic) features.push('Organic');
    if (details.harvest_date) features.push(`Harvested: ${formatDate(details.harvest_date)}`);
    if (details.availability) features.push(details.availability);
  }
  
  if (listing.type === 'service' && listing.details) {
    const details = listing.details;
    if (details.service_type) features.push(details.service_type);
    if (details.experience_years) features.push(`${details.experience_years} years exp.`);
    if (details.price_unit) features.push(`Priced ${details.price_unit}`);
    if (details.service_area) features.push(`Serves: ${details.service_area}`);
  }
  
  return features;
};

/**
 * Check if listing is expired
 * @param {Object} listing - Marketplace listing object
 * @returns {boolean} True if expired
 */
export const isListingExpired = (listing) => {
  if (!listing.expiry_date) return false;
  
  return new Date(listing.expiry_date) < new Date();
};

/**
 * Sort listings by specified criteria
 * @param {Array} listings - Array of listings
 * @param {string} sortBy - Sort criteria
 * @param {boolean} ascending - Sort direction
 * @returns {Array} Sorted listings
 */
export const sortListings = (listings, sortBy, ascending = true) => {
  const sorted = [...listings].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'newest':
        valueA = new Date(a.created_at);
        valueB = new Date(b.created_at);
        return valueB - valueA; // Always newest first for this case
        
      case 'oldest':
        valueA = new Date(a.created_at);
        valueB = new Date(b.created_at);
        return valueA - valueB; // Always oldest first for this case
        
      case 'price':
        valueA = a.price || 0;
        valueB = b.price || 0;
        break;
        
      case 'title':
        valueA = a.title.toLowerCase();
        valueB = b.title.toLowerCase();
        break;
        
      case 'location':
        valueA = a.location.toLowerCase();
        valueB = b.location.toLowerCase();
        break;
        
      case 'views':
        valueA = a.views || 0;
        valueB = b.views || 0;
        break;
        
      default:
        return 0;
    }
    
    if (valueA < valueB) return ascending ? -1 : 1;
    if (valueA > valueB) return ascending ? 1 : -1;
    return 0;
  });
  
  return sorted;
};
