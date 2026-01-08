import { 
  fetchData 
} from '../../lib/supabase/dbHelpers';

// Table names in Supabase
const FARM_ANALYTICS_TABLE = 'farm_analytics';
const PERFORMANCE_METRICS_TABLE = 'farm_performance_metrics';
const PRODUCTIVITY_METRICS_TABLE = 'farm_productivity_metrics';
const FINANCIAL_METRICS_TABLE = 'farm_financial_metrics';
const ENVIRONMENTAL_METRICS_TABLE = 'farm_environmental_metrics';

/**
 * Get farm analytics dashboard data
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Analytics dashboard data
 */
export async function getFarmAnalytics(farmId, options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { timeframe = '30d', category = 'all' } = options;
    
    // Calculate date range based on timeframe
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    let query = supabase
      .from(FARM_ANALYTICS_TABLE)
      .select(`
        *,
        performance_metrics:${PERFORMANCE_METRICS_TABLE}(*),
        productivity_metrics:${PRODUCTIVITY_METRICS_TABLE}(*),
        financial_metrics:${FINANCIAL_METRICS_TABLE}(*),
        environmental_metrics:${ENVIRONMENTAL_METRICS_TABLE}(*)
      `)
      .eq('farm_id', farmId)
      .gte('recorded_date', startDate.toISOString())
      .lte('recorded_date', endDate.toISOString());

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    query = query.order('recorded_date', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching farm analytics:', error);
    return { data: [], error };
  }
}

/**
 * Get production analytics
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Production analytics data
 */
export async function getProductionAnalytics(farmId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    // Get crop production data
    const { data: cropData } = await supabase
      .from('crop_yields')
      .select(`
        *,
        crop:farm_crops(
          crop_type,
          variety,
          field:farm_fields(name, area)
        )
      `)
      .eq('crop.farm_id', farmId);

    // Get livestock production data
    const { data: livestockData } = await supabase
      .from('farm_livestock')
      .select(`
        id,
        animal_type,
        count,
        production_data
      `)
      .eq('farm_id', farmId);

    // Process and aggregate the data
    const analytics = {
      crop_production: processCropProduction(cropData || []),
      livestock_production: processLivestockProduction(livestockData || []),
      total_production_value: 0,
      production_trends: []
    };

    // Calculate total production value
    analytics.total_production_value = 
      analytics.crop_production.total_value + 
      analytics.livestock_production.total_value;
    
    return { data: analytics, error: null };
  } catch (error) {
    console.error('Error fetching production analytics:', error);
    return { data: null, error };
  }
}

/**
 * Get financial analytics
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Financial analytics data
 */
export async function getFinancialAnalytics(farmId, options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { timeframe = '1y' } = options;
    const endDate = new Date();
    const startDate = new Date();
    
    if (timeframe === '1y') {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else if (timeframe === '6m') {
      startDate.setMonth(endDate.getMonth() - 6);
    } else {
      startDate.setMonth(endDate.getMonth() - 3);
    }

    // Get financial transactions
    const { data: transactions } = await supabase
      .from('farm_financial_transactions')
      .select('*')
      .eq('farm_id', farmId)
      .gte('transaction_date', startDate.toISOString())
      .lte('transaction_date', endDate.toISOString());

    // Get financial metrics
    const { data: metrics } = await supabase
      .from(FINANCIAL_METRICS_TABLE)
      .select('*')
      .eq('farm_id', farmId)
      .gte('recorded_date', startDate.toISOString())
      .order('recorded_date', { ascending: false })
      .limit(1);

    const analytics = processFinancialData(transactions || [], metrics || []);
    
    return { data: analytics, error: null };
  } catch (error) {
    console.error('Error fetching financial analytics:', error);
    return { data: null, error };
  }
}

/**
 * Get performance metrics
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Performance metrics data
 */
export async function getPerformanceMetrics(farmId, options = {}) {
  try {
    const filters = {
      farm_id: farmId,
      ...options.filters
    };

    const result = await fetchData(PERFORMANCE_METRICS_TABLE, {
      ...options,
      filters,
      orderBy: 'recorded_date',
      ascending: false
    });

    if (result.data && result.data.length > 0) {
      // Calculate performance trends
      const trends = calculatePerformanceTrends(result.data);
      result.data[0].trends = trends;
    }

    return result;
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return { data: [], error };
  }
}

/**
 * Get productivity metrics
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Productivity metrics data
 */
export async function getProductivityMetrics(farmId, options = {}) {
  try {
    const filters = {
      farm_id: farmId,
      ...options.filters
    };

    return await fetchData(PRODUCTIVITY_METRICS_TABLE, {
      ...options,
      filters,
      orderBy: 'recorded_date',
      ascending: false
    });
  } catch (error) {
    console.error('Error fetching productivity metrics:', error);
    return { data: [], error };
  }
}

/**
 * Get environmental metrics
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Environmental metrics data
 */
export async function getEnvironmentalMetrics(farmId, options = {}) {
  try {
    const filters = {
      farm_id: farmId,
      ...options.filters
    };

    return await fetchData(ENVIRONMENTAL_METRICS_TABLE, {
      ...options,
      filters,
      orderBy: 'recorded_date',
      ascending: false
    });
  } catch (error) {
    console.error('Error fetching environmental metrics:', error);
    return { data: [], error };
  }
}

/**
 * Get comparative analytics (compare with similar farms)
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Comparative analytics data
 */
export async function getComparativeAnalytics(farmId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    // Get current farm data
    const { data: currentFarm } = await supabase
      .from('farms')
      .select('farm_type, total_area, location')
      .eq('id', farmId)
      .single();

    if (!currentFarm) {
      throw new Error('Farm not found');
    }

    // Get similar farms for comparison
    const { data: similarFarms } = await supabase
      .from('farms')
      .select(`
        id,
        farm_type,
        total_area,
        performance_metrics:${PERFORMANCE_METRICS_TABLE}(*)
      `)
      .eq('farm_type', currentFarm.farm_type)
      .neq('id', farmId)
      .limit(50);

    // Get current farm metrics
    const { data: currentMetrics } = await supabase
      .from(PERFORMANCE_METRICS_TABLE)
      .select('*')
      .eq('farm_id', farmId)
      .order('recorded_date', { ascending: false })
      .limit(1);

    const comparison = calculateComparativeMetrics(
      currentMetrics[0] || {},
      similarFarms || []
    );
    
    return { data: comparison, error: null };
  } catch (error) {
    console.error('Error fetching comparative analytics:', error);
    return { data: null, error };
  }
}

/**
 * Get analytics trends over time
 * @param {string} farmId - Farm ID
 * @param {string} metric - Metric to analyze
 * @param {Object} options - Query options
 * @returns {Promise} - Trends data
 */
export async function getAnalyticsTrends(farmId, metric, options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { timeframe = '6m', interval = 'month' } = options;
    
    const endDate = new Date();
    const startDate = new Date();
    
    if (timeframe === '1y') {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else if (timeframe === '6m') {
      startDate.setMonth(endDate.getMonth() - 6);
    } else {
      startDate.setMonth(endDate.getMonth() - 3);
    }

    // Determine which table to query based on metric
    let table = FARM_ANALYTICS_TABLE;
    if (metric.includes('performance')) table = PERFORMANCE_METRICS_TABLE;
    if (metric.includes('productivity')) table = PRODUCTIVITY_METRICS_TABLE;
    if (metric.includes('financial')) table = FINANCIAL_METRICS_TABLE;
    if (metric.includes('environmental')) table = ENVIRONMENTAL_METRICS_TABLE;

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('farm_id', farmId)
      .gte('recorded_date', startDate.toISOString())
      .lte('recorded_date', endDate.toISOString())
      .order('recorded_date');

    if (error) throw error;

    // Group data by interval and calculate trends
    const trends = groupDataByInterval(data || [], interval, metric);
    
    return { data: trends, error: null };
  } catch (error) {
    console.error('Error fetching analytics trends:', error);
    return { data: [], error };
  }
}

/**
 * Generate analytics report
 * @param {string} farmId - Farm ID
 * @param {Object} options - Report options
 * @returns {Promise} - Analytics report data
 */
export async function generateAnalyticsReport(farmId, options = {}) {
  try {
    const { reportType = 'comprehensive', timeframe = '1y' } = options;
    
    const [
      analytics,
      production,
      financial,
      performance,
      productivity,
      environmental
    ] = await Promise.all([
      getFarmAnalytics(farmId, { timeframe }),
      getProductionAnalytics(farmId, { timeframe }),
      getFinancialAnalytics(farmId, { timeframe }),
      getPerformanceMetrics(farmId, { timeframe }),
      getProductivityMetrics(farmId, { timeframe }),
      getEnvironmentalMetrics(farmId, { timeframe })
    ]);

    const report = {
      farm_id: farmId,
      report_type: reportType,
      timeframe: timeframe,
      generated_at: new Date().toISOString(),
      overview: analytics.data?.[0] || {},
      production: production.data || {},
      financial: financial.data || {},
      performance: performance.data?.[0] || {},
      productivity: productivity.data?.[0] || {},
      environmental: environmental.data?.[0] || {},
      summary: generateReportSummary()
    };
    
    return { data: report, error: null };
  } catch (error) {
    console.error('Error generating analytics report:', error);
    return { data: null, error };
  }
}

// Helper functions
function processCropProduction(cropData) {
  const production = {
    total_yield: 0,
    total_value: 0,
    crops: {},
    yield_per_hectare: 0
  };

  cropData.forEach(yield_record => {
    const cropType = yield_record.crop?.crop_type || 'Unknown';
    const quantity = yield_record.quantity || 0;
    const value = yield_record.market_value || 0;

    if (!production.crops[cropType]) {
      production.crops[cropType] = {
        total_yield: 0,
        total_value: 0,
        yield_count: 0
      };
    }

    production.crops[cropType].total_yield += quantity;
    production.crops[cropType].total_value += value;
    production.crops[cropType].yield_count += 1;

    production.total_yield += quantity;
    production.total_value += value;
  });

  return production;
}

function processLivestockProduction(livestockData) {
  const production = {
    total_count: 0,
    total_value: 0,
    animals: {}
  };

  livestockData.forEach(animal => {
    const animalType = animal.animal_type || 'Unknown';
    const count = animal.count || 1;
    const productionValue = animal.production_data?.monthly_value || 0;

    if (!production.animals[animalType]) {
      production.animals[animalType] = {
        count: 0,
        value: 0
      };
    }

    production.animals[animalType].count += count;
    production.animals[animalType].value += productionValue;

    production.total_count += count;
    production.total_value += productionValue;
  });

  return production;
}

function processFinancialData(transactions, metrics) {
  const financial = {
    total_revenue: 0,
    total_expenses: 0,
    net_profit: 0,
    profit_margin: 0,
    revenue_by_category: {},
    expenses_by_category: {},
    monthly_trends: []
  };

  transactions.forEach(transaction => {
    if (transaction.transaction_type === 'income') {
      financial.total_revenue += transaction.amount;
      const category = transaction.category || 'Other';
      financial.revenue_by_category[category] = 
        (financial.revenue_by_category[category] || 0) + transaction.amount;
    } else if (transaction.transaction_type === 'expense') {
      financial.total_expenses += transaction.amount;
      const category = transaction.category || 'Other';
      financial.expenses_by_category[category] = 
        (financial.expenses_by_category[category] || 0) + transaction.amount;
    }
  });

  financial.net_profit = financial.total_revenue - financial.total_expenses;
  financial.profit_margin = financial.total_revenue > 0 
    ? (financial.net_profit / financial.total_revenue) * 100 
    : 0;

  if (metrics.length > 0) {
    const latestMetrics = metrics[0];
    financial.roi = latestMetrics.roi || 0;
    financial.cash_flow = latestMetrics.cash_flow || 0;
  }

  return financial;
}

function calculatePerformanceTrends(metricsData) {
  if (metricsData.length < 2) return {};

  const latest = metricsData[0];
  const previous = metricsData[1];

  return {
    productivity_change: calculatePercentageChange(
      previous.productivity_score,
      latest.productivity_score
    ),
    efficiency_change: calculatePercentageChange(
      previous.efficiency_score,
      latest.efficiency_score
    ),
    quality_change: calculatePercentageChange(
      previous.quality_score,
      latest.quality_score
    ),
    sustainability_change: calculatePercentageChange(
      previous.sustainability_score,
      latest.sustainability_score
    )
  };
}

function calculateComparativeMetrics(currentMetrics, similarFarms) {
  const comparison = {
    productivity_percentile: 0,
    efficiency_percentile: 0,
    profitability_percentile: 0,
    sustainability_percentile: 0,
    benchmark_data: {}
  };

  if (similarFarms.length === 0) return comparison;

  // Calculate percentiles based on similar farms
  const productivityScores = similarFarms
    .map(farm => farm.performance_metrics?.[0]?.productivity_score)
    .filter(score => score != null);

  if (productivityScores.length > 0 && currentMetrics.productivity_score) {
    comparison.productivity_percentile = calculatePercentile(
      currentMetrics.productivity_score,
      productivityScores
    );
  }

  return comparison;
}

function calculatePercentageChange(oldValue, newValue) {
  if (!oldValue || oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

function calculatePercentile(value, dataset) {
  if (dataset.length === 0) return 0;
  
  const sorted = dataset.sort((a, b) => a - b);
  const belowCount = sorted.filter(v => v < value).length;
  return (belowCount / sorted.length) * 100;
}

function groupDataByInterval(data, interval, metric) {
  // This would group data by the specified interval (day, week, month, year)
  // and calculate trend values for the specified metric
  return data.map(item => ({
    date: item.recorded_date,
    value: item[metric] || 0
  }));
}

function generateReportSummary() {
  return {
    key_insights: [
      'Production analysis completed',
      'Financial performance evaluated',
      'Operational efficiency assessed'
    ],
    recommendations: [
      'Monitor key performance indicators',
      'Optimize resource allocation',
      'Plan for next season improvements'
    ],
    performance_rating: 'Good'
  };
}

// Export the service object
export const farmAnalyticsService = {
  getFarmAnalytics,
  getProductionAnalytics,
  getFinancialAnalytics,
  getPerformanceMetrics,
  getProductivityMetrics,
  getEnvironmentalMetrics,
  getComparativeAnalytics,
  getAnalyticsTrends,
  generateAnalyticsReport,
  getDashboardAnalytics: getFarmAnalytics // Alias for dashboard
};
