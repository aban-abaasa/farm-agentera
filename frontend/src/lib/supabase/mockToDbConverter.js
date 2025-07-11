/**
 * Utility functions to convert mock data format to database format
 */

/**
 * Convert a price string (e.g., "1,200,000 UGX") to a numeric value
 * @param {string} priceString - Price string to convert
 * @returns {number|null} - Numeric price or null if invalid
 */
export const convertPriceToNumeric = (priceString) => {
  if (!priceString) return null;
  
  // Extract numeric part and remove commas
  const numericPart = priceString.replace(/[^0-9]/g, '');
  
  if (!numericPart) return null;
  
  return parseInt(numericPart, 10);
};

/**
 * Extract size in acres from a string like "20 acres"
 * @param {string} sizeString - Size string to parse
 * @returns {number|null} - Size in acres or null if invalid
 */
export const extractAcreage = (sizeString) => {
  if (!sizeString) return null;
  
  const match = sizeString.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
};

/**
 * Convert a date string to ISO format
 * @param {string} dateString - Date string to convert
 * @returns {string|null} - ISO date string or null if invalid
 */
export const convertDateToISO = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    return date.toISOString();
  } catch (error) {
    console.error('Invalid date format:', dateString);
    return null;
  }
};

/**
 * Convert land listing mock data to database format
 * @param {Object} mockListing - Mock land listing data
 * @param {string} userId - User ID to associate with the listing
 * @returns {Object} - Converted data ready for database insertion
 */
export const convertLandListingToDbFormat = (mockListing, userId) => {
  // Base listing data
  const baseListingData = {
    title: mockListing.title,
    description: mockListing.description,
    price: convertPriceToNumeric(mockListing.price),
    is_negotiable: mockListing.features?.includes('Negotiable') || false,
    type: 'land',
    status: 'active',
    location: mockListing.location,
    district: mockListing.location?.split(',')[0] || null,
    user_id: userId,
    thumbnail: mockListing.images?.[0] || null,
    images: mockListing.images || [],
    contact_phone: mockListing.owner?.phone || null,
    contact_email: mockListing.owner?.email || null,
    expiry_date: convertDateToISO(mockListing.expiryDate) || null,
  };

  // Specialized land listing data
  const landDetailsData = {
    size_acres: extractAcreage(mockListing.size),
    land_type: mockListing.details?.terrain?.includes('forest') ? 'forested' : 'agricultural',
    ownership_type: mockListing.listingType === 'Sale' ? 'freehold' : 'leasehold',
    is_for_sale: mockListing.listingType === 'Sale',
    lease_term: mockListing.details?.leaseTerms || null,
    soil_type: mockListing.details?.soilType || null,
    water_source: mockListing.details?.waterSource || null,
    has_road_access: mockListing.features?.includes('Road access') || false,
    has_electricity: mockListing.features?.includes('Electricity') || false,
    cadastral_information: null,
  };

  return {
    baseListingData,
    detailsData: landDetailsData
  };
};

/**
 * Convert produce listing mock data to database format
 * @param {Object} mockListing - Mock produce listing data
 * @param {string} userId - User ID to associate with the listing
 * @returns {Object} - Converted data ready for database insertion
 */
export const convertProduceListingToDbFormat = (mockListing, userId) => {
  // Extract quantity and unit from a string like "100 kg"
  let quantity = null;
  let unit = null;
  
  if (mockListing.quantity) {
    const match = mockListing.quantity.match(/(\d+(\.\d+)?)\s*([a-zA-Z]+)/);
    if (match) {
      quantity = parseFloat(match[1]);
      unit = match[3];
    }
  }

  // Base listing data
  const baseListingData = {
    title: mockListing.title,
    description: mockListing.description,
    price: convertPriceToNumeric(mockListing.price),
    is_negotiable: mockListing.features?.includes('Negotiable') || false,
    type: 'produce',
    status: 'active',
    location: mockListing.location,
    district: mockListing.location?.split(',')[0] || null,
    user_id: userId,
    thumbnail: mockListing.images?.[0] || null,
    images: mockListing.images || [],
    contact_phone: mockListing.seller?.phone || null,
    contact_email: mockListing.seller?.email || null,
    expiry_date: convertDateToISO(mockListing.expiryDate) || null,
  };

  // Specialized produce listing data
  const produceDetailsData = {
    produce_type: mockListing.category || 'other',
    crop_name: mockListing.details?.variety || mockListing.title.split('(')[0].trim(),
    quantity: quantity,
    unit: unit,
    harvest_date: convertDateToISO(mockListing.details?.harvestDate) || null,
    is_organic: mockListing.features?.includes('Organic') || false,
    quality_description: mockListing.details?.gradeOrClassification || mockListing.quality || null,
    min_order_quantity: null,
    availability: mockListing.details?.availability || 'in stock',
  };

  return {
    baseListingData,
    detailsData: produceDetailsData
  };
};

/**
 * Convert service listing mock data to database format
 * @param {Object} mockListing - Mock service listing data
 * @param {string} userId - User ID to associate with the listing
 * @returns {Object} - Converted data ready for database insertion
 */
export const convertServiceListingToDbFormat = (mockListing, userId) => {
  // Base listing data
  const baseListingData = {
    title: mockListing.title,
    description: mockListing.description,
    price: convertPriceToNumeric(mockListing.price),
    is_negotiable: mockListing.features?.includes('Negotiable') || false,
    type: 'service',
    status: 'active',
    location: mockListing.location,
    district: mockListing.location?.split(',')[0] || null,
    user_id: userId,
    thumbnail: mockListing.images?.[0] || null,
    images: mockListing.images || [],
    contact_phone: mockListing.provider?.phone || null,
    contact_email: mockListing.provider?.email || null,
    expiry_date: convertDateToISO(mockListing.expiryDate) || null,
  };

  // Specialized service listing data
  const serviceDetailsData = {
    service_type: mockListing.category || 'other',
    availability_schedule: mockListing.availability || null,
    price_unit: mockListing.details?.priceDetails?.match(/per\s+\w+/) || null,
    experience_years: mockListing.details?.experienceYears || null,
    skills: mockListing.features || [],
    equipment: mockListing.details?.equipmentType ? [mockListing.details.equipmentType] : [],
    service_area: mockListing.details?.coverage || mockListing.details?.serviceArea || null,
    qualifications: mockListing.details?.certifications || mockListing.details?.qualifications || null,
  };

  return {
    baseListingData,
    detailsData: serviceDetailsData
  };
};

/**
 * Convert any listing mock data to database format based on type
 * @param {Object} mockListing - Mock listing data
 * @param {string} userId - User ID to associate with the listing
 * @returns {Object} - Converted data ready for database insertion
 */
export const convertListingToDbFormat = (mockListing, userId) => {
  switch (mockListing.type) {
    case 'land':
      return convertLandListingToDbFormat(mockListing, userId);
    case 'produce':
      return convertProduceListingToDbFormat(mockListing, userId);
    case 'service':
      return convertServiceListingToDbFormat(mockListing, userId);
    default:
      throw new Error(`Unknown listing type: ${mockListing.type}`);
  }
};

/**
 * Batch convert mock listings to database format
 * @param {Array} mockListings - Array of mock listings
 * @param {string} userId - User ID to associate with the listings
 * @returns {Array} - Array of converted listings ready for database insertion
 */
export const batchConvertListingsToDbFormat = (mockListings, userId) => {
  return mockListings.map(listing => convertListingToDbFormat(listing, userId));
}; 