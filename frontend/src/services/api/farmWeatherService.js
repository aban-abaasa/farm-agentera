import { 
  fetchData, 
  insertRecord,
  updateRecord 
} from '../../lib/supabase/dbHelpers';

// Table names in Supabase
const FARM_WEATHER_DATA_TABLE = 'farm_weather_data';
const WEATHER_ALERTS_TABLE = 'farm_weather_alerts';
const WEATHER_STATIONS_TABLE = 'farm_weather_stations';

/**
 * Get current weather for a farm
 * @param {string} farmId - Farm ID
 * @returns {Promise} - Current weather data
 */
export async function getCurrentWeather(farmId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    // Get the most recent weather data for the farm
    const { data, error } = await supabase
      .from(FARM_WEATHER_DATA_TABLE)
      .select(`
        *,
        weather_station:${WEATHER_STATIONS_TABLE}(
          id,
          name,
          location,
          station_type
        )
      `)
      .eq('farm_id', farmId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
    
    return { data: data || null, error: null };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    return { data: null, error };
  }
}

/**
 * Get weather history for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Weather history data
 */
export async function getWeatherHistory(farmId, options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { days = 7, data_type = 'all' } = options;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    let query = supabase
      .from(FARM_WEATHER_DATA_TABLE)
      .select(`
        *,
        weather_station:${WEATHER_STATIONS_TABLE}(
          name,
          location
        )
      `)
      .eq('farm_id', farmId)
      .gte('recorded_at', startDate.toISOString())
      .lte('recorded_at', endDate.toISOString())
      .order('recorded_at', { ascending: false });

    if (data_type !== 'all') {
      // Filter by specific data type if needed
      // This could be extended based on schema structure
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching weather history:', error);
    return { data: [], error };
  }
}

/**
 * Get weather forecast for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Weather forecast data
 */
export async function getWeatherForecast(farmId, options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    // Get farm location first
    const { data: farm } = await supabase
      .from('farms')
      .select('latitude, longitude, location')
      .eq('id', farmId)
      .single();

    if (!farm || (!farm.latitude && !farm.longitude)) {
      throw new Error('Farm location not available for weather forecast');
    }

    // Here you would typically call an external weather API
    // For now, we'll return forecast data from our database if available
    const { days = 7 } = options;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);

    const { data, error } = await supabase
      .from(FARM_WEATHER_DATA_TABLE)
      .select('*')
      .eq('farm_id', farmId)
      .eq('data_type', 'forecast')
      .gte('forecast_date', startDate.toISOString())
      .lte('forecast_date', endDate.toISOString())
      .order('forecast_date');

    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return { data: [], error };
  }
}

/**
 * Save weather data
 * @param {string} farmId - Farm ID
 * @param {Object} weatherData - Weather data
 * @returns {Promise} - Saved weather data
 */
export async function saveWeatherData(farmId, weatherData) {
  try {
    const weatherRecord = {
      ...weatherData,
      farm_id: farmId,
      recorded_at: weatherData.recorded_at || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(FARM_WEATHER_DATA_TABLE, weatherRecord);
  } catch (error) {
    console.error('Error saving weather data:', error);
    return { data: null, error };
  }
}

/**
 * Get weather statistics for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Weather statistics
 */
export async function getWeatherStats(farmId, options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { timeframe = '30d' } = options;
    
    const endDate = new Date();
    const startDate = new Date();
    
    if (timeframe === '7d') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (timeframe === '30d') {
      startDate.setDate(endDate.getDate() - 30);
    } else if (timeframe === '90d') {
      startDate.setDate(endDate.getDate() - 90);
    } else {
      startDate.setFullYear(endDate.getFullYear() - 1);
    }

    const { data, error } = await supabase
      .from(FARM_WEATHER_DATA_TABLE)
      .select('temperature, humidity, rainfall, wind_speed, pressure, recorded_at')
      .eq('farm_id', farmId)
      .gte('recorded_at', startDate.toISOString())
      .lte('recorded_at', endDate.toISOString());

    if (error) throw error;

    // Calculate statistics
    const stats = calculateWeatherStats(data || []);
    
    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching weather stats:', error);
    return { data: null, error };
  }
}

/**
 * Get weather trends
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Weather trends data
 */
export async function getWeatherTrends(farmId, options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { metric = 'temperature', interval = 'daily', days = 30 } = options;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const { data, error } = await supabase
      .from(FARM_WEATHER_DATA_TABLE)
      .select(`recorded_at, ${metric}`)
      .eq('farm_id', farmId)
      .gte('recorded_at', startDate.toISOString())
      .lte('recorded_at', endDate.toISOString())
      .order('recorded_at');

    if (error) throw error;

    // Group data by interval
    const trends = groupWeatherDataByInterval(data || [], interval, metric);
    
    return { data: trends, error: null };
  } catch (error) {
    console.error('Error fetching weather trends:', error);
    return { data: [], error };
  }
}

// Weather Alerts Management
/**
 * Create weather alert
 * @param {string} farmId - Farm ID
 * @param {Object} alertData - Alert data
 * @returns {Promise} - Created alert data
 */
export async function createWeatherAlert(farmId, alertData) {
  try {
    const alertRecord = {
      ...alertData,
      farm_id: farmId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(WEATHER_ALERTS_TABLE, alertRecord);
  } catch (error) {
    console.error('Error creating weather alert:', error);
    return { data: null, error };
  }
}

/**
 * Get weather alerts for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Weather alerts data
 */
export async function getWeatherAlerts(farmId, options = {}) {
  const filters = {
    farm_id: farmId,
    ...options.filters
  };

  return await fetchData(WEATHER_ALERTS_TABLE, {
    ...options,
    filters,
    orderBy: 'created_at',
    ascending: false
  });
}

/**
 * Get active weather alerts
 * @param {string} farmId - Farm ID
 * @returns {Promise} - Active weather alerts data
 */
export async function getActiveWeatherAlerts(farmId) {
  const filters = {
    farm_id: farmId,
    is_active: true
  };

  return await fetchData(WEATHER_ALERTS_TABLE, {
    filters,
    orderBy: 'severity',
    ascending: false
  });
}

/**
 * Update weather alert
 * @param {string} alertId - Alert ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated alert data
 */
export async function updateWeatherAlert(alertId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(WEATHER_ALERTS_TABLE, alertId, updatedData);
}

/**
 * Dismiss weather alert
 * @param {string} alertId - Alert ID
 * @returns {Promise} - Updated alert data
 */
export async function dismissWeatherAlert(alertId) {
  return await updateWeatherAlert(alertId, {
    is_active: false,
    dismissed_at: new Date().toISOString()
  });
}

// Weather Stations Management
/**
 * Get weather stations for a farm
 * @param {string} farmId - Farm ID
 * @returns {Promise} - Weather stations data
 */
export async function getWeatherStations(farmId) {
  const filters = {
    farm_id: farmId
  };

  return await fetchData(WEATHER_STATIONS_TABLE, {
    filters,
    orderBy: 'name'
  });
}

/**
 * Create weather station
 * @param {string} farmId - Farm ID
 * @param {Object} stationData - Station data
 * @returns {Promise} - Created station data
 */
export async function createWeatherStation(farmId, stationData) {
  try {
    const stationRecord = {
      ...stationData,
      farm_id: farmId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(WEATHER_STATIONS_TABLE, stationRecord);
  } catch (error) {
    console.error('Error creating weather station:', error);
    return { data: null, error };
  }
}

/**
 * Get weather recommendations based on current conditions
 * @param {string} farmId - Farm ID
 * @returns {Promise} - Weather-based recommendations
 */
export async function getWeatherRecommendations(farmId) {
  try {
    // Get current weather
    const { data: currentWeather } = await getCurrentWeather(farmId);
    
    // Get upcoming forecast
    const { data: forecast } = await getWeatherForecast(farmId, { days: 3 });
    
    if (!currentWeather) {
      return { data: [], error: null };
    }

    const recommendations = generateWeatherRecommendations(currentWeather, forecast);
    
    return { data: recommendations, error: null };
  } catch (error) {
    console.error('Error getting weather recommendations:', error);
    return { data: [], error };
  }
}

/**
 * Get irrigation recommendations based on weather
 * @param {string} farmId - Farm ID
 * @returns {Promise} - Irrigation recommendations
 */
export async function getIrrigationRecommendations(farmId) {
  try {
    // Get recent weather data
    const { data: recentWeather } = await getWeatherHistory(farmId, { days: 7 });
    
    // Get upcoming forecast
    const { data: forecast } = await getWeatherForecast(farmId, { days: 5 });
    
    const recommendations = generateIrrigationRecommendations(recentWeather, forecast);
    
    return { data: recommendations, error: null };
  } catch (error) {
    console.error('Error getting irrigation recommendations:', error);
    return { data: [], error };
  }
}

/**
 * Get weather-based task recommendations
 * @param {string} farmId - Farm ID
 * @returns {Promise} - Task recommendations based on weather
 */
export async function getWeatherTaskRecommendations(farmId) {
  try {
    // Get current weather
    const currentWeather = await getCurrentWeather(farmId);
    
    if (!currentWeather.data) {
      return { data: [], error: null };
    }

    const recommendations = generateTaskRecommendations(currentWeather.data);
    
    return { data: recommendations, error: null };
  } catch (error) {
    console.error('Error getting weather task recommendations:', error);
    return { data: [], error };
  }
}

// Helper functions
function calculateWeatherStats(weatherData) {
  if (weatherData.length === 0) {
    return {
      temperature: { min: 0, max: 0, avg: 0 },
      humidity: { min: 0, max: 0, avg: 0 },
      rainfall: { total: 0, avg: 0 },
      wind_speed: { min: 0, max: 0, avg: 0 }
    };
  }

  const temperatures = weatherData.map(d => d.temperature).filter(t => t != null);
  const humidities = weatherData.map(d => d.humidity).filter(h => h != null);
  const rainfalls = weatherData.map(d => d.rainfall || 0);
  const windSpeeds = weatherData.map(d => d.wind_speed).filter(w => w != null);

  return {
    temperature: {
      min: Math.min(...temperatures),
      max: Math.max(...temperatures),
      avg: temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length
    },
    humidity: {
      min: Math.min(...humidities),
      max: Math.max(...humidities),
      avg: humidities.reduce((sum, h) => sum + h, 0) / humidities.length
    },
    rainfall: {
      total: rainfalls.reduce((sum, r) => sum + r, 0),
      avg: rainfalls.reduce((sum, r) => sum + r, 0) / rainfalls.length
    },
    wind_speed: {
      min: Math.min(...windSpeeds),
      max: Math.max(...windSpeeds),
      avg: windSpeeds.reduce((sum, w) => sum + w, 0) / windSpeeds.length
    }
  };
}

function groupWeatherDataByInterval(data, interval, metric) {
  const grouped = {};
  
  data.forEach(record => {
    const date = new Date(record.recorded_at);
    let key;
    
    if (interval === 'hourly') {
      key = `${date.toISOString().slice(0, 13)}:00:00Z`;
    } else if (interval === 'daily') {
      key = date.toISOString().slice(0, 10);
    } else if (interval === 'weekly') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().slice(0, 10);
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        values: [],
        count: 0
      };
    }
    
    if (record[metric] != null) {
      grouped[key].values.push(record[metric]);
      grouped[key].count += 1;
    }
  });
  
  // Calculate averages
  return Object.values(grouped).map(group => ({
    date: group.date,
    value: group.values.length > 0 
      ? group.values.reduce((sum, val) => sum + val, 0) / group.values.length 
      : 0,
    count: group.count
  })).sort((a, b) => a.date.localeCompare(b.date));
}

function generateWeatherRecommendations(currentWeather, forecast) {
  const recommendations = [];
  
  // Temperature-based recommendations
  if (currentWeather.temperature > 30) {
    recommendations.push({
      type: 'warning',
      category: 'temperature',
      message: 'High temperature detected. Consider increased irrigation and livestock shade.',
      priority: 'high'
    });
  }
  
  if (currentWeather.temperature < 5) {
    recommendations.push({
      type: 'warning',
      category: 'temperature',
      message: 'Low temperature alert. Protect sensitive crops and livestock.',
      priority: 'high'
    });
  }
  
  // Rainfall recommendations
  if (forecast && forecast.some(f => f.rainfall > 20)) {
    recommendations.push({
      type: 'info',
      category: 'rainfall',
      message: 'Heavy rain expected. Postpone field operations and ensure drainage.',
      priority: 'medium'
    });
  }
  
  // Wind recommendations
  if (currentWeather.wind_speed > 25) {
    recommendations.push({
      type: 'warning',
      category: 'wind',
      message: 'High wind speeds. Avoid spraying operations and secure equipment.',
      priority: 'medium'
    });
  }
  
  return recommendations;
}

function generateIrrigationRecommendations(recentWeather, forecast) {
  const recommendations = [];
  
  // Calculate recent rainfall
  const recentRainfall = recentWeather.reduce((sum, w) => sum + (w.rainfall || 0), 0);
  
  // Calculate upcoming rainfall
  const upcomingRainfall = forecast.reduce((sum, f) => sum + (f.rainfall || 0), 0);
  
  if (recentRainfall < 10 && upcomingRainfall < 5) {
    recommendations.push({
      type: 'action',
      message: 'Low recent and forecast rainfall. Consider irrigation scheduling.',
      priority: 'high',
      suggested_action: 'irrigation',
      details: {
        recent_rainfall: recentRainfall,
        forecast_rainfall: upcomingRainfall
      }
    });
  } else if (upcomingRainfall > 20) {
    recommendations.push({
      type: 'info',
      message: 'Significant rainfall expected. Delay irrigation plans.',
      priority: 'medium',
      suggested_action: 'delay_irrigation',
      details: {
        forecast_rainfall: upcomingRainfall
      }
    });
  }
  
  return recommendations;
}

function generateTaskRecommendations(currentWeather) {
  const recommendations = [];
  
  // Good weather for field work
  if (currentWeather.temperature > 10 && currentWeather.temperature < 28 && 
      currentWeather.wind_speed < 15 && !currentWeather.rainfall) {
    recommendations.push({
      type: 'opportunity',
      category: 'field_work',
      message: 'Excellent conditions for field operations and outdoor tasks.',
      priority: 'medium',
      suggested_tasks: ['cultivation', 'harvesting', 'equipment_maintenance']
    });
  }
  
  // Indoor work recommendations
  if (currentWeather.rainfall > 5 || currentWeather.wind_speed > 20) {
    recommendations.push({
      type: 'suggestion',
      category: 'indoor_work',
      message: 'Weather conditions favor indoor activities.',
      priority: 'low',
      suggested_tasks: ['planning', 'record_keeping', 'equipment_repair']
    });
  }
  
  return recommendations;
}

// Export the service object
export const farmWeatherService = {
  getCurrentWeather,
  getWeatherHistory,
  getWeatherForecast,
  saveWeatherData,
  getWeatherStats,
  getWeatherTrends,
  createWeatherAlert,
  getWeatherAlerts,
  getActiveWeatherAlerts,
  updateWeatherAlert,
  dismissWeatherAlert,
  getWeatherStations,
  createWeatherStation,
  getWeatherRecommendations,
  getIrrigationRecommendations,
  getWeatherTaskRecommendations
};
