#!/usr/bin/env node
/**
 * Script to migrate mock data to the database
 * This script reads the mock data from the frontend and inserts it into the database
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mock data paths
const MOCK_DATA_DIR = path.join(__dirname, '../../frontend/src/mocks');
const LAND_LISTINGS_PATH = path.join(MOCK_DATA_DIR, 'landListings.js');
const PRODUCE_LISTINGS_PATH = path.join(MOCK_DATA_DIR, 'produceListings.js');
const SERVICE_LISTINGS_PATH = path.join(MOCK_DATA_DIR, 'serviceListings.js');

/**
 * Convert a price string (e.g., "1,200,000 UGX") to a numeric value
 * @param {string} priceString - Price string to convert
 * @returns {number|null} - Numeric price or null if invalid
 */
const convertPriceToNumeric = (priceString) => {
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
const extractAcreage = (sizeString) => {
  if (!sizeString) return null;
  
  const match = sizeString.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
};

/**
 * Convert a date string to ISO format
 * @param {string} dateString - Date string to convert
 * @returns {string|null} - ISO date string or null if invalid
 */
const convertDateToISO = (dateString) => {
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
 * Read mock data from a JavaScript file
 * @param {string} filePath - Path to the JavaScript file
 * @param {string} exportName - Name of the exported variable
 * @returns {Array} - Array of mock data objects
 */
const readMockData = (filePath, exportName) => {
  try {
    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract the array data using a regex pattern
    const pattern = new RegExp(`${exportName}\\s*=\\s*(\\[\\s*\\{[\\s\\S]*?\\}\\s*\\])`, 'm');
    const match = fileContent.match(pattern);
    
    if (!match || !match[1]) {
      console.error(`Could not find export ${exportName} in ${filePath}`);
      return [];
    }
    
    // Convert the string to a JavaScript array
    // This is not secure for production use, but works for our controlled environment
    const arrayString = match[1].replace(/export\s+const\s+\w+\s*=\s*/, '');
    
    // Replace image imports with their string values
    const processedString = arrayString.replace(/(\w+)(?=\s*from\s+['"]\.\.\/assets\/images\/[^'"]+['"])/g, '"$1"');
    
    // Evaluate the string to get the array
    // eslint-disable-next-line no-eval
    const mockData = eval(`(${processedString})`);
    
    return mockData;
  } catch (error) {
    console.error(`Error reading mock data from ${filePath}:`, error);
    return [];
  }
};

/**
 * Convert land listing mock data to database format
 * @param {Object} mockListing - Mock land listing data
 * @param {string} userId - User ID to associate with the listing
 * @returns {Object} - Converted data ready for database insertion
 */
const convertLandListingToDbFormat = (mockListing, userId) => {
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
    expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
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
const convertProduceListingToDbFormat = (mockListing, userId) => {
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
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  };

  // Specialized produce listing data
  const produceDetailsData = {
    produce_type: mockListing.category || 'other',
    crop_name: mockListing.details?.variety || mockListing.title.split('(')[0].trim(),
    quantity: quantity,
    unit: unit,
    harvest_date: mockListing.details?.harvestDate ? new Date(mockListing.details.harvestDate) : null,
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
const convertServiceListingToDbFormat = (mockListing, userId) => {
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
    expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
  };

  // Specialized service listing data
  const serviceDetailsData = {
    service_type: mockListing.category || 'other',
    availability_schedule: mockListing.availability || null,
    price_unit: mockListing.details?.priceDetails?.match(/per\s+\w+/)?.[0] || null,
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
 * Insert a listing into the database using the create_listing stored procedure
 * @param {Object} convertedListing - Converted listing data
 * @returns {Promise<Object>} - Result of the insertion
 */
const insertListing = async (convertedListing) => {
  try {
    const { baseListingData, detailsData } = convertedListing;
    
    const { data, error } = await supabase.rpc('create_listing', {
      listing_data: baseListingData,
      details_data: detailsData,
      listing_type: baseListingData.type
    });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error inserting listing:', error);
    return { success: false, error };
  }
};

/**
 * Get or create a test user to associate with the listings
 * @returns {Promise<string>} - User ID
 */
const getOrCreateTestUser = async () => {
  try {
    // Check if test user exists
    const { data: existingUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'test@agritech.com')
      .limit(1);
    
    if (fetchError) throw fetchError;
    
    if (existingUsers && existingUsers.length > 0) {
      return existingUsers[0].id;
    }
    
    // Create a test user via Supabase auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@agritech.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'User',
        phone: '+256700000000',
        location: 'Kampala, Uganda',
        role: 'user',
        farmer_type: 'mixed',
        farm_size: 10,
        bio: 'This is a test user for the AGRI-TECH platform.'
      }
    });
    
    if (authError) throw authError;
    
    return authData.user.id;
  } catch (error) {
    console.error('Error getting or creating test user:', error);
    process.exit(1);
  }
};

/**
 * Main function to migrate mock data to the database
 */
const migrateMockData = async () => {
  try {
    console.log('Starting migration of mock data to the database...');
    
    // Get or create a test user
    const userId = await getOrCreateTestUser();
    console.log(`Using user ID: ${userId}`);
    
    // Read mock data
    const landListings = readMockData(LAND_LISTINGS_PATH, 'landListingsMockData');
    const produceListings = readMockData(PRODUCE_LISTINGS_PATH, 'produceListingsMockData');
    const serviceListings = readMockData(SERVICE_LISTINGS_PATH, 'serviceListingsMockData');
    
    console.log(`Found ${landListings.length} land listings, ${produceListings.length} produce listings, and ${serviceListings.length} service listings.`);
    
    // Convert and insert land listings
    console.log('Migrating land listings...');
    for (const listing of landListings) {
      const convertedListing = convertLandListingToDbFormat(listing, userId);
      const result = await insertListing(convertedListing);
      
      if (result.success) {
        console.log(`✅ Inserted land listing: ${listing.title}`);
      } else {
        console.error(`❌ Failed to insert land listing: ${listing.title}`, result.error);
      }
    }
    
    // Convert and insert produce listings
    console.log('Migrating produce listings...');
    for (const listing of produceListings) {
      const convertedListing = convertProduceListingToDbFormat(listing, userId);
      const result = await insertListing(convertedListing);
      
      if (result.success) {
        console.log(`✅ Inserted produce listing: ${listing.title}`);
      } else {
        console.error(`❌ Failed to insert produce listing: ${listing.title}`, result.error);
      }
    }
    
    // Convert and insert service listings
    console.log('Migrating service listings...');
    for (const listing of serviceListings) {
      const convertedListing = convertServiceListingToDbFormat(listing, userId);
      const result = await insertListing(convertedListing);
      
      if (result.success) {
        console.log(`✅ Inserted service listing: ${listing.title}`);
      } else {
        console.error(`❌ Failed to insert service listing: ${listing.title}`, result.error);
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

// Run the migration
migrateMockData(); 