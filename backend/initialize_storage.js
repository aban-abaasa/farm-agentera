#!/usr/bin/env node

/**
 * Storage initialization script for AGRI-TECH platform.
 * This script creates the necessary buckets and folder structure in Supabase Storage.
 * 
 * Usage:
 * - Initialize all buckets: node initialize_storage.js
 * - Initialize specific bucket: node initialize_storage.js user-content
 * - Show help: node initialize_storage.js --help
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2);
const showHelp = args.includes('--help');
const verbose = args.includes('--verbose');

// Remove flags from args to get only the bucket names
const requestedBuckets = args.filter(arg => !arg.startsWith('--'));

// Show help if requested
if (showHelp) {
  console.log(`
Storage Initialization Script for AGRI-TECH Platform

Usage:
  node initialize_storage.js [options] [buckets...]

Options:
  --help              Show this help message
  --verbose           Show more detailed output during execution

Buckets:
  user-content        User profile images, avatars, etc.
  marketplace         Marketplace listing images and attachments
  resources           Educational resources, documents, etc.
  community           Community post images and attachments

Examples:
  node initialize_storage.js                       # Initialize all buckets
  node initialize_storage.js user-content          # Initialize only user-content bucket
  node initialize_storage.js --verbose marketplace # Initialize marketplace with verbose output
  `);
  process.exit(0);
}

// Bucket folder structure definitions
const BUCKET_STRUCTURE = {
  'user-content': [
    'avatars',
    'cover-photos',
    'documents'
  ],
  'marketplace': [
    'listings/land',
    'listings/produce',
    'listings/service',
    'thumbnails'
  ],
  'resources': [
    'articles',
    'documents',
    'videos',
    'images',
    'guides'
  ],
  'community': [
    'posts',
    'profiles',
    'events',
    'forum',
    'qa'
  ]
};

// Bucket configuration options
const BUCKET_OPTIONS = {
  'user-content': {
    public: false,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
  },
  'marketplace': {
    public: false,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
  },
  'resources': {
    public: true,
    fileSizeLimit: 20 * 1024 * 1024, // 20MB
  },
  'community': {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
  }
};

// All bucket names
const ALL_BUCKETS = Object.keys(BUCKET_STRUCTURE);

/**
 * Create a bucket if it doesn't exist
 * @param {Object} supabase - Supabase client
 * @param {string} bucketName - Bucket name
 * @param {Object} options - Bucket options
 * @returns {Promise<boolean>} Success status
 */
async function createBucketIfNotExists(supabase, bucketName, options = {}) {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) throw listError;
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      verbose && console.log(`  Bucket ${bucketName} already exists`);
      return true;
    }
    
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: options.public || false,
      fileSizeLimit: options.fileSizeLimit || null,
      allowedMimeTypes: options.allowedMimeTypes || null
    });
    
    if (error) throw error;
    
    console.log(`  Created bucket: ${bucketName}`);
    return true;
  } catch (error) {
    console.error(`Error creating bucket ${bucketName}:`, error.message);
    return false;
  }
}

/**
 * Create a folder in a bucket
 * @param {Object} supabase - Supabase client
 * @param {string} bucket - Bucket name
 * @param {string} folder - Folder path
 * @returns {Promise<boolean>} Success status
 */
async function createFolder(supabase, bucket, folder) {
  try {
    // Supabase storage doesn't have a direct "create folder" API
    // Instead, we create an empty .keep file in the folder
    const emptyBuffer = Buffer.from('', 'utf-8');
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(`${folder}/.keep`, emptyBuffer, {
        contentType: 'text/plain'
      });
    
    if (error) {
      // If the error is because the file already exists, that's fine
      if (error.message && error.message.includes('The resource already exists')) {
        verbose && console.log(`  - Folder ${folder} already exists`);
        return true;
      }
      throw error;
    }
    
    verbose && console.log(`  - Created folder: ${folder}`);
    return true;
  } catch (error) {
    console.error(`Error creating folder ${folder} in bucket ${bucket}:`, error.message);
    return false;
  }
}

/**
 * Initialize a bucket with the specified folder structure
 * @param {Object} supabase - Supabase client
 * @param {string} bucket - Bucket name
 * @returns {Promise<boolean>} Success status
 */
async function initializeBucket(supabase, bucket) {
  console.log(`Initializing bucket: ${bucket}`);
  
  // Create the bucket if it doesn't exist
  const options = BUCKET_OPTIONS[bucket] || {};
  const bucketCreated = await createBucketIfNotExists(supabase, bucket, options);
  
  if (!bucketCreated) {
    console.error(`Failed to create or verify bucket: ${bucket}`);
    return false;
  }
  
  // Create the folder structure
  const folders = BUCKET_STRUCTURE[bucket];
  if (!folders) {
    console.error(`Error: No folder structure defined for bucket ${bucket}`);
    return false;
  }
  
  let allSuccess = true;
  for (const folder of folders) {
    const success = await createFolder(supabase, bucket, folder);
    if (!success) {
      allSuccess = false;
    }
  }
  
  return allSuccess;
}

/**
 * Initialize all specified buckets or all buckets if none are specified
 */
async function initializeStorage() {
  // Get Supabase URL and key from environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment');
    process.exit(1);
  }
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Determine which buckets to initialize
  const bucketsToInitialize = requestedBuckets.length > 0 
    ? requestedBuckets.filter(bucket => ALL_BUCKETS.includes(bucket))
    : ALL_BUCKETS;
  
  if (bucketsToInitialize.length === 0) {
    if (requestedBuckets.length > 0) {
      console.error('Error: No valid bucket names provided. Valid buckets are:', ALL_BUCKETS.join(', '));
    } else {
      console.error('Error: No buckets to initialize');
    }
    process.exit(1);
  }
  
  console.log(`Initializing ${bucketsToInitialize.length} bucket(s): ${bucketsToInitialize.join(', ')}`);
  
  // Initialize each bucket
  let allSuccess = true;
  for (const bucket of bucketsToInitialize) {
    const success = await initializeBucket(supabase, bucket);
    if (!success) {
      allSuccess = false;
      console.error(`Failed to initialize bucket: ${bucket}`);
    } else {
      console.log(`Successfully initialized bucket: ${bucket}`);
    }
  }
  
  if (allSuccess) {
    console.log('All buckets initialized successfully!');
    return true;
  } else {
    console.error('Some buckets failed to initialize. Check the logs for details.');
    return false;
  }
}

// Run the initialization if this file is executed directly
if (require.main === module) {
  initializeStorage()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

module.exports = { initializeStorage }; 