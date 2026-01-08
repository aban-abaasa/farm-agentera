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
const EVENTS_TABLE = 'community_events';

/**
 * Fetch all events with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise} - Events data
 */
export async function getEvents(options = {}) {
  return await fetchData(EVENTS_TABLE, options);
}

/**
 * Fetch a single event by ID
 * @param {number|string} id - Event ID
 * @returns {Promise} - Event data
 */
export async function getEventById(id) {
  return await fetchById(EVENTS_TABLE, id);
}

/**
 * Fetch upcoming events
 * @param {number} limit - Number of events to fetch
 * @returns {Promise} - Upcoming events
 */
export async function getUpcomingEvents(limit = 10) {
  const currentDate = new Date().toISOString();
  
  return await fetchData(EVENTS_TABLE, {
    filters: {
      date: {
        operator: 'gte',
        value: currentDate
      }
    },
    orderBy: 'date',
    ascending: true,
    limit
  });
}

/**
 * Fetch past events
 * @param {number} limit - Number of events to fetch
 * @returns {Promise} - Past events
 */
export async function getPastEvents(limit = 10) {
  const currentDate = new Date().toISOString();
  
  return await fetchData(EVENTS_TABLE, {
    filters: {
      date: {
        
        operator: 'lt',
        value: currentDate
      }
    },
    orderBy: 'date',
    ascending: false,
    limit
  });
}

/**
 * Fetch events by category
 * @param {string} category - Event category
 * @param {number} limit - Number of events to fetch
 * @returns {Promise} - Events in the category
 */
export async function getEventsByCategory(category, limit = 10) {
  return await fetchData(EVENTS_TABLE, {
    filters: { category },
    orderBy: 'date',
    ascending: true,
    limit
  });
}

/**
 * Search events by query
 * @param {string} query - Search query
 * @param {number} limit - Number of results to return
 * @returns {Promise} - Search results
 */
export async function searchEvents(query, limit = 20) {
  return await searchRecords(EVENTS_TABLE, query, ['title', 'description', 'location', 'organizer'], limit);
}

/**
 * Create a new event
 * @param {Object} event - Event data
 * @returns {Promise} - New event
 */
export async function createEvent(event) {
  return await insertRecord(EVENTS_TABLE, { 
    ...event, 
    created_at: new Date().toISOString() 
  });
}

/**
 * Update an existing event
 * @param {number|string} id - Event ID
 * @param {Object} updates - Fields to update
 * @returns {Promise} - Updated event
 */
export async function updateEvent(id, updates) {
  return await updateRecord(EVENTS_TABLE, { 
    ...updates, 
    updated_at: new Date().toISOString() 
  }, { id });
}

/**
 * Delete an event
 * @param {number|string} id - Event ID
 * @returns {Promise} - Deleted event
 */
export async function deleteEvent(id) {
  return await deleteRecord(EVENTS_TABLE, { id });
}

/**
 * Register a user for an event
 * @param {number|string} eventId - Event ID
 * @param {number|string} userId - User ID
 * @returns {Promise} - Registration data
 */
export async function registerForEvent(eventId, userId) {
  return await insertRecord('event_registrations', {
    event_id: eventId,
    user_id: userId,
    created_at: new Date().toISOString(),
    attended: false
  });
}

/**
 * Get event attendees count
 * @param {number|string} eventId - Event ID
 * @returns {Promise} - Count of registrations
 */
export async function getEventAttendeesCount(eventId) {
  return await countRecords('event_registrations', { event_id: eventId });
}

/**
 * Get event categories
 * @returns {Promise} - Event categories with counts
 */
export async function getEventCategories() {
  // This would typically be a specialized query or stored procedure in Supabase
  // For now, we'll use a simple approach
  const { data: events, error } = await fetchData(EVENTS_TABLE);
  
  if (error || !events) return { categories: [], error };
  
  const categoryCounts = events.reduce((counts, event) => {
    const category = event.category?.toLowerCase();
    if (category) {
      counts[category] = (counts[category] || 0) + 1;
    }
    return counts;
  }, {});
  
  const categories = Object.entries(categoryCounts).map(([id, count]) => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    count
  }));
  
  // Add "All Events" category
  categories.unshift({
    id: 'all',
    name: 'All Events',
    count: events.length
  });
  
  return { categories, error: null };
} 