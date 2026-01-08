import { 
  fetchData, 
  fetchById, 
  insertRecord,
  updateRecord,
  deleteRecord,
  searchRecords,
  countRecords 
} from '../../lib/supabase/dbHelpers';

// Table name in Supabase
const RESOURCES_TABLE = 'resources';
const RESOURCE_CATEGORIES_TABLE = 'resource_categories';

/**
 * Fetch all resources with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise} - Resources data
 */
export async function getResources(options = {}) {
  return await fetchData(RESOURCES_TABLE, options);
}

/**
 * Fetch featured resources
 * @param {number} limit - Number of resources to fetch
 * @returns {Promise} - Featured resources
 */
export async function getFeaturedResources(limit = 4) {
  return await fetchData(RESOURCES_TABLE, {
    filters: { featured: true },
    limit,
    orderBy: 'created_at'
  });
}

/**
 * Fetch recent resources
 * @param {number} limit - Number of resources to fetch
 * @returns {Promise} - Recent resources
 */
export async function getRecentResources(limit = 6) {
  return await fetchData(RESOURCES_TABLE, {
    limit,
    orderBy: 'created_at'
  });
}

/**
 * Fetch a single resource by ID
 * @param {number|string} id - Resource ID
 * @returns {Promise} - Resource data
 */
export async function getResourceById(id) {
  return await fetchById(RESOURCES_TABLE, id);
}

/**
 * Search resources by query
 * @param {string} query - Search query
 * @param {number} limit - Number of results to return
 * @returns {Promise} - Search results
 */
export async function searchResources(query, limit = 20) {
  return await searchRecords(RESOURCES_TABLE, query, ['title', 'description', 'content'], limit);
}

/**
 * Create a new resource
 * @param {Object} resource - Resource data
 * @returns {Promise} - New resource
 */
export async function createResource(resource) {
  return await insertRecord(RESOURCES_TABLE, { 
    ...resource, 
    created_at: new Date().toISOString() 
  });
}

/**
 * Update an existing resource
 * @param {number|string} id - Resource ID
 * @param {Object} updates - Fields to update
 * @returns {Promise} - Updated resource
 */
export async function updateResource(id, updates) {
  return await updateRecord(RESOURCES_TABLE, { 
    ...updates, 
    updated_at: new Date().toISOString() 
  }, { id });
}

/**
 * Delete a resource
 * @param {number|string} id - Resource ID
 * @returns {Promise} - Deleted resource
 */
export async function deleteResource(id) {
  return await deleteRecord(RESOURCES_TABLE, { id });
}

/**
 * Fetch all resource categories
 * @returns {Promise} - Categories data
 */
export async function getResourceCategories() {
  return await fetchData(RESOURCE_CATEGORIES_TABLE, {
    orderBy: 'name'
  });
}

/**
 * Create a new resource category
 * @param {Object} category - Category data
 * @returns {Promise} - New category
 */
export async function createResourceCategory(category) {
  return await insertRecord(RESOURCE_CATEGORIES_TABLE, category);
}

/**
 * Get resource count by category
 * @param {string|number} categoryId - Category ID
 * @returns {Promise} - Count of resources
 */
export async function getResourceCountByCategory(categoryId) {
  return await countRecords(RESOURCES_TABLE, { category_id: categoryId });
} 