import { supabase } from './client';

/**
 * General database helper functions for Supabase
 */

/**
 * Fetches data from a table with optional filters
 * @param {string} table - The name of the table
 * @param {Object} options - Query options
 * @param {Object} options.filters - Filter conditions
 * @param {Array} options.columns - Columns to select
 * @param {number} options.limit - Number of rows to return
 * @param {number} options.offset - Number of rows to skip
 * @param {string} options.orderBy - Column to order by
 * @param {boolean} options.ascending - Order direction 
 * @returns {Promise} - Query result
 */
export async function fetchData(table, options = {}) {
  try {
    const { 
      filters = {}, 
      columns = '*', 
      limit = 100, 
      offset = 0,
      orderBy = 'created_at',
      ascending = false
    } = options;

    let query = supabase
      .from(table)
      .select(columns)
      .limit(limit)
      .order(orderBy, { ascending });

    if (offset > 0) {
      query = query.range(offset, offset + limit - 1);
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === 'object') {
          // Handle range queries and other complex filters
          const { operator, value: filterValue } = value;
          query = query.filter(key, operator, filterValue);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching data from ${table}:`, error);
    return { data: null, error };
  }
}

/**
 * Inserts a record into a table
 * @param {string} table - The name of the table
 * @param {Object} record - The record to insert
 * @returns {Promise} - Newly created record
 */
export async function insertRecord(table, record) {
  try {
    const { data, error } = await supabase
      .from(table)
      .insert(record)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error inserting record into ${table}:`, error);
    return { data: null, error };
  }
}

/**
 * Updates a record in a table
 * @param {string} table - The name of the table
 * @param {Object} updates - The fields to update
 * @param {Object} conditions - The conditions to match
 * @returns {Promise} - Updated record
 */
export async function updateRecord(table, updates, conditions) {
  try {
    let query = supabase.from(table).update(updates);

    // Apply conditions
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating record in ${table}:`, error);
    return { data: null, error };
  }
}

/**
 * Deletes a record from a table
 * @param {string} table - The name of the table
 * @param {Object} conditions - The conditions to match
 * @returns {Promise} - Deleted record
 */
export async function deleteRecord(table, conditions) {
  try {
    let query = supabase.from(table).delete();

    // Apply conditions
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error deleting record from ${table}:`, error);
    return { data: null, error };
  }
}

/**
 * Fetches a single record by ID
 * @param {string} table - The name of the table
 * @param {number|string} id - The ID of the record
 * @param {Array|string} columns - Columns to select
 * @returns {Promise} - The record
 */
export async function fetchById(table, id, columns = '*') {
  try {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching record by ID from ${table}:`, error);
    return { data: null, error };
  }
}

/**
 * Performs a full text search on a table
 * @param {string} table - The name of the table
 * @param {string} query - The search query
 * @param {Array} columns - Columns to search in
 * @param {number} limit - Number of results to return
 * @returns {Promise} - Search results
 */
export async function searchRecords(table, query, columns, limit = 20) {
  try {
    // This assumes you have a text search function or column set up in Supabase
    // You may need to adjust this based on your Supabase configuration
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .textSearch('search', query)
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error searching records in ${table}:`, error);
    return { data: null, error };
  }
}

/**
 * Counts records in a table with optional filters
 * @param {string} table - The name of the table
 * @param {Object} filters - Filter conditions
 * @returns {Promise} - Count result
 */
export async function countRecords(table, filters = {}) {
  try {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { count, error } = await query;

    if (error) throw error;
    return { count, error: null };
  } catch (error) {
    console.error(`Error counting records in ${table}:`, error);
    return { count: 0, error };
  }
} 