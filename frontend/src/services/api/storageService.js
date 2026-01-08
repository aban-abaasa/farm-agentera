import { supabase } from '../../lib/supabase/client';

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSizeMB - Maximum size in MB
 * @param {string[]} options.allowedTypes - Allowed MIME types
 * @returns {Object} Validation result { valid: boolean, error: string|null }
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
  } = options;
  
  // Check file size
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB` };
  }
  
  // Check file type
  if (allowedTypes && allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed types: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}` 
    };
  }
  
  return { valid: true, error: null };
};

/**
 * Generate a unique filename
 * @param {string} originalFilename - Original filename
 * @param {string} [prefix] - Optional prefix (e.g., userId)
 * @returns {string} Unique filename with extension
 */
export const generateUniqueFilename = (originalFilename, prefix = '') => {
  const fileExt = originalFilename.split('.').pop().toLowerCase();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  
  const prefixStr = prefix ? `${prefix}-` : '';
  return `${prefixStr}${timestamp}-${randomString}.${fileExt}`;
};

/**
 * Upload a file to Supabase Storage
 * @param {string} bucket - Storage bucket name
 * @param {string} folder - Folder path
 * @param {File} file - File to upload
 * @param {Object} [options] - Upload options
 * @param {string} [options.userId] - User ID to include in the filename
 * @param {boolean} [options.upsert=false] - Whether to replace existing files
 * @param {number} [options.maxSizeMB=5] - Maximum file size in MB
 * @param {string[]} [options.allowedTypes] - Allowed file types
 * @param {string} [options.customFilename] - Custom filename to use instead of auto-generated one
 * @returns {Promise<{url: string|null, path: string|null, error: Object|null}>}
 */
export const uploadFile = async (bucket, folder, file, options = {}) => {
  try {
    // Validate file
    const validation = validateFile(file, {
      maxSizeMB: options.maxSizeMB || 5,
      allowedTypes: options.allowedTypes || null
    });
    
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // Generate filename or use custom name
    let filename;
    if (options.customFilename) {
      filename = options.customFilename;
    } else {
      filename = generateUniqueFilename(file.name, options.userId);
    }
    
    // Create full path
    const filePath = folder ? `${folder}/${filename}` : filename;
    
    // Upload to Supabase
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { 
        upsert: options.upsert || false,
        contentType: file.type // Set the correct content type
      });
      
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    return { url: publicUrl, path: filePath, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { url: null, path: null, error };
  }
};

/**
 * Upload multiple files to Supabase Storage
 * @param {string} bucket - Storage bucket name
 * @param {string} folder - Folder path
 * @param {File[]} files - Array of files to upload
 * @param {Object} [options] - Upload options (same as uploadFile)
 * @returns {Promise<{urls: string[], paths: string[], errors: Object[]}>}
 */
export const uploadMultipleFiles = async (bucket, folder, files, options = {}) => {
  const results = {
    urls: [],
    paths: [],
    errors: []
  };
  
  // Process files sequentially to avoid overwhelming the API
  for (const file of files) {
    const { url, path, error } = await uploadFile(bucket, folder, file, options);
    
    if (error) {
      results.errors.push({ file: file.name, error });
    } else {
      if (url) results.urls.push(url);
      if (path) results.paths.push(path);
    }
  }
  
  return results;
};

/**
 * Delete a file from Supabase Storage
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path
 * @returns {Promise<{success: boolean, error: Object|null}>}
 */
export const deleteFile = async (bucket, path) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
      
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error };
  }
};

/**
 * Delete multiple files from Supabase Storage
 * @param {string} bucket - Storage bucket name
 * @param {string[]} paths - Array of file paths
 * @returns {Promise<{success: boolean, error: Object|null}>}
 */
export const deleteMultipleFiles = async (bucket, paths) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);
      
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting multiple files:', error);
    return { success: false, error };
  }
};

/**
 * List files in a bucket/folder
 * @param {string} bucket - Storage bucket name
 * @param {string} [folder] - Optional folder path
 * @param {Object} [options] - Listing options
 * @param {number} [options.limit] - Maximum number of files to list
 * @param {number} [options.offset] - Offset for pagination
 * @param {string} [options.sortBy] - Sort by field
 * @param {boolean} [options.ascending] - Sort direction
 * @returns {Promise<{files: Object[], error: Object|null}>}
 */
export const listFiles = async (bucket, folder = '', options = {}) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: options.limit || 100,
        offset: options.offset || 0,
        sortBy: { column: options.sortBy || 'name', order: options.ascending ? 'asc' : 'desc' }
      });
      
    if (error) throw error;
    
    // Add public URLs to the files
    const filesWithUrls = data.map(file => {
      // Skip folders (directories don't have URLs)
      if (file.metadata === null) {
        return { ...file, isDirectory: true };
      }
      
      const path = folder ? `${folder}/${file.name}` : file.name;
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
        
      return { 
        ...file,
        isDirectory: false,
        path,
        publicUrl
      };
    });
    
    return { files: filesWithUrls, error: null };
  } catch (error) {
    console.error('Error listing files:', error);
    return { files: [], error };
  }
};

/**
 * Create a folder in Supabase Storage
 * @param {string} bucket - Storage bucket name
 * @param {string} folderPath - Folder path to create
 * @returns {Promise<{success: boolean, error: Object|null}>}
 */
export const createFolder = async (bucket, folderPath) => {
  try {
    // Supabase doesn't have a direct "create folder" API
    // Instead, we create an empty .keep file in the folder
    const { error } = await supabase.storage
      .from(bucket)
      .upload(`${folderPath}/.keep`, new Blob([''], { type: 'text/plain' }));
      
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error creating folder:', error);
    return { success: false, error };
  }
};

/**
 * Get a public URL for a file
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path
 * @returns {string} Public URL
 */
export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return data.publicUrl;
};

/**
 * Check if a file exists
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path
 * @returns {Promise<{exists: boolean, error: Object|null}>}
 */
export const fileExists = async (bucket, path) => {
  try {
    // Try to get file metadata
    const { data, error } = await supabase.storage
      .from(bucket)
      .getPublicUrl(path);
      
    if (error) throw error;
    
    // If we got data back, the file exists
    return { exists: !!data, error: null };
  } catch (error) {
    // Handle "not found" as a non-error case
    if (error.message && error.message.includes('not found')) {
      return { exists: false, error: null };
    }
    
    console.error('Error checking if file exists:', error);
    return { exists: false, error };
  }
}; 