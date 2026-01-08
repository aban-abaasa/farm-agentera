import { 
  fetchData, 
  insertRecord,
  updateRecord,
  deleteRecord 
} from '../../lib/supabase/dbHelpers';

// Table names in Supabase
const FARM_INVENTORY_TABLE = 'farm_inventory';
const INVENTORY_CATEGORIES_TABLE = 'farm_inventory_categories';
const INVENTORY_TRANSACTIONS_TABLE = 'farm_inventory_transactions';
const INVENTORY_ALERTS_TABLE = 'farm_inventory_alerts';

/**
 * Create inventory item
 * @param {string} farmId - Farm ID
 * @param {Object} inventoryData - Inventory item data
 * @returns {Promise} - Created inventory item data
 */
export async function createInventoryItem(farmId, inventoryData) {
  try {
    const inventoryRecord = {
      ...inventoryData,
      farm_id: farmId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(FARM_INVENTORY_TABLE, inventoryRecord);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return { data: null, error };
  }
}

/**
 * Get inventory items for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Inventory items data
 */
export async function getInventoryItems(farmId, options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    let query = supabase
      .from(FARM_INVENTORY_TABLE)
      .select(`
        *,
        category:${INVENTORY_CATEGORIES_TABLE}(
          id,
          name,
          description,
          color_hex
        ),
        transactions:${INVENTORY_TRANSACTIONS_TABLE}(
          id,
          transaction_type,
          quantity,
          transaction_date
        )
      `)
      .eq('farm_id', farmId);

    // Apply filters
    if (options.category_id) {
      query = query.eq('category_id', options.category_id);
    }

    if (options.item_type) {
      query = query.eq('item_type', options.item_type);
    }

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.low_stock_only) {
      query = query.filter('current_quantity', 'lte', 'minimum_quantity');
    }

    // Apply sorting
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? true });
    } else {
      query = query.order('name');
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return { data: [], error };
  }
}

/**
 * Get inventory item by ID
 * @param {string} itemId - Inventory item ID
 * @returns {Promise} - Inventory item data
 */
export async function getInventoryItemById(itemId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(FARM_INVENTORY_TABLE)
      .select(`
        *,
        category:${INVENTORY_CATEGORIES_TABLE}(*),
        transactions:${INVENTORY_TRANSACTIONS_TABLE}(*),
        alerts:${INVENTORY_ALERTS_TABLE}(*)
      `)
      .eq('id', itemId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return { data: null, error };
  }
}

/**
 * Update inventory item
 * @param {string} itemId - Inventory item ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated inventory item data
 */
export async function updateInventoryItem(itemId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(FARM_INVENTORY_TABLE, itemId, updatedData);
}

/**
 * Delete inventory item
 * @param {string} itemId - Inventory item ID
 * @returns {Promise} - Delete result
 */
export async function deleteInventoryItem(itemId) {
  return await deleteRecord(FARM_INVENTORY_TABLE, itemId);
}

/**
 * Get inventory statistics for a farm
 * @param {string} farmId - Farm ID
 * @returns {Promise} - Inventory statistics
 */
export async function getInventoryStats(farmId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(FARM_INVENTORY_TABLE)
      .select(`
        item_type,
        current_quantity,
        minimum_quantity,
        unit_cost,
        category:${INVENTORY_CATEGORIES_TABLE}(name)
      `)
      .eq('farm_id', farmId);

    if (error) throw error;

    // Calculate statistics
    const stats = {
      total_items: data.length,
      total_value: 0,
      low_stock_items: 0,
      out_of_stock_items: 0,
      by_category: {},
      by_type: {}
    };

    data.forEach(item => {
      // Total value
      stats.total_value += (item.current_quantity || 0) * (item.unit_cost || 0);
      
      // Stock status
      if (item.current_quantity <= 0) {
        stats.out_of_stock_items += 1;
      } else if (item.current_quantity <= (item.minimum_quantity || 0)) {
        stats.low_stock_items += 1;
      }
      
      // By category
      const categoryName = item.category?.name || 'Uncategorized';
      if (!stats.by_category[categoryName]) {
        stats.by_category[categoryName] = { count: 0, value: 0 };
      }
      stats.by_category[categoryName].count += 1;
      stats.by_category[categoryName].value += (item.current_quantity || 0) * (item.unit_cost || 0);
      
      // By type
      const itemType = item.item_type || 'Other';
      if (!stats.by_type[itemType]) {
        stats.by_type[itemType] = { count: 0, value: 0 };
      }
      stats.by_type[itemType].count += 1;
      stats.by_type[itemType].value += (item.current_quantity || 0) * (item.unit_cost || 0);
    });
    
    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    return { data: null, error };
  }
}

/**
 * Get low stock items
 * @param {string} farmId - Farm ID
 * @returns {Promise} - Low stock items data
 */
export async function getLowStockItems(farmId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(FARM_INVENTORY_TABLE)
      .select(`
        *,
        category:${INVENTORY_CATEGORIES_TABLE}(name, color_hex)
      `)
      .eq('farm_id', farmId)
      .filter('current_quantity', 'lte', 'minimum_quantity')
      .order('current_quantity');

    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    return { data: [], error };
  }
}

/**
 * Get inventory valuation
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Inventory valuation data
 */
export async function getInventoryValuation(farmId, options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { valuation_method = 'current_cost' } = options;
    
    const { data, error } = await supabase
      .from(FARM_INVENTORY_TABLE)
      .select('name, current_quantity, unit_cost, market_value, purchase_date')
      .eq('farm_id', farmId)
      .gt('current_quantity', 0);

    if (error) throw error;

    const valuation = data.map(item => {
      let value = 0;
      
      if (valuation_method === 'current_cost') {
        value = item.current_quantity * (item.unit_cost || 0);
      } else if (valuation_method === 'market_value') {
        value = item.current_quantity * (item.market_value || item.unit_cost || 0);
      }
      
      return {
        name: item.name,
        quantity: item.current_quantity,
        unit_value: valuation_method === 'market_value' 
          ? (item.market_value || item.unit_cost || 0)
          : (item.unit_cost || 0),
        total_value: value,
        valuation_method
      };
    });

    const totalValue = valuation.reduce((sum, item) => sum + item.total_value, 0);
    
    return { 
      data: {
        items: valuation,
        total_value: totalValue,
        valuation_method,
        calculated_at: new Date().toISOString()
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching inventory valuation:', error);
    return { data: null, error };
  }
}

// Inventory Transactions Management
/**
 * Create inventory transaction
 * @param {string} itemId - Inventory item ID
 * @param {Object} transactionData - Transaction data
 * @returns {Promise} - Created transaction data
 */
export async function createInventoryTransaction(itemId, transactionData) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    // Start a transaction to update both inventory and create transaction record
    const transactionRecord = {
      ...transactionData,
      inventory_item_id: itemId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from(INVENTORY_TRANSACTIONS_TABLE)
      .insert(transactionRecord)
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Update inventory quantity
    const { data: currentItem } = await supabase
      .from(FARM_INVENTORY_TABLE)
      .select('current_quantity')
      .eq('id', itemId)
      .single();

    if (currentItem) {
      let newQuantity = currentItem.current_quantity || 0;
      
      if (transactionData.transaction_type === 'in') {
        newQuantity += transactionData.quantity;
      } else if (transactionData.transaction_type === 'out') {
        newQuantity -= transactionData.quantity;
      }

      await supabase
        .from(FARM_INVENTORY_TABLE)
        .update({
          current_quantity: Math.max(0, newQuantity),
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);
    }
    
    return { data: transaction, error: null };
  } catch (error) {
    console.error('Error creating inventory transaction:', error);
    return { data: null, error };
  }
}

/**
 * Get inventory transactions for an item
 * @param {string} itemId - Inventory item ID
 * @param {Object} options - Query options
 * @returns {Promise} - Transactions data
 */
export async function getInventoryTransactions(itemId, options = {}) {
  const filters = {
    inventory_item_id: itemId,
    ...options.filters
  };

  return await fetchData(INVENTORY_TRANSACTIONS_TABLE, {
    ...options,
    filters,
    orderBy: 'transaction_date',
    ascending: false
  });
}

/**
 * Get all inventory transactions for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - All transactions data
 */
export async function getAllInventoryTransactions(farmId, options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    let query = supabase
      .from(INVENTORY_TRANSACTIONS_TABLE)
      .select(`
        *,
        inventory_item:${FARM_INVENTORY_TABLE}(
          name,
          item_type,
          unit,
          category:${INVENTORY_CATEGORIES_TABLE}(name)
        )
      `)
      .eq('inventory_item.farm_id', farmId);

    if (options.transaction_type) {
      query = query.eq('transaction_type', options.transaction_type);
    }

    if (options.start_date) {
      query = query.gte('transaction_date', options.start_date);
    }

    if (options.end_date) {
      query = query.lte('transaction_date', options.end_date);
    }

    query = query.order('transaction_date', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching all inventory transactions:', error);
    return { data: [], error };
  }
}

// Inventory Categories Management
/**
 * Get inventory categories
 * @param {Object} options - Query options
 * @returns {Promise} - Categories data
 */
export async function getInventoryCategories(options = {}) {
  return await fetchData(INVENTORY_CATEGORIES_TABLE, {
    ...options,
    orderBy: 'name'
  });
}

/**
 * Create inventory category
 * @param {Object} categoryData - Category data
 * @returns {Promise} - Created category data
 */
export async function createInventoryCategory(categoryData) {
  try {
    const categoryRecord = {
      ...categoryData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(INVENTORY_CATEGORIES_TABLE, categoryRecord);
  } catch (error) {
    console.error('Error creating inventory category:', error);
    return { data: null, error };
  }
}

// Inventory Alerts Management
/**
 * Create inventory alert
 * @param {string} farmId - Farm ID
 * @param {Object} alertData - Alert data
 * @returns {Promise} - Created alert data
 */
export async function createInventoryAlert(farmId, alertData) {
  try {
    const alertRecord = {
      ...alertData,
      farm_id: farmId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(INVENTORY_ALERTS_TABLE, alertRecord);
  } catch (error) {
    console.error('Error creating inventory alert:', error);
    return { data: null, error };
  }
}

/**
 * Get inventory alerts for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Alerts data
 */
export async function getInventoryAlerts(farmId, options = {}) {
  const filters = {
    farm_id: farmId,
    ...options.filters
  };

  return await fetchData(INVENTORY_ALERTS_TABLE, {
    ...options,
    filters,
    orderBy: 'created_at',
    ascending: false
  });
}

/**
 * Update inventory alert
 * @param {string} alertId - Alert ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated alert data
 */
export async function updateInventoryAlert(alertId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(INVENTORY_ALERTS_TABLE, alertId, updatedData);
}

/**
 * Search inventory items
 * @param {string} farmId - Farm ID
 * @param {string} searchTerm - Search term
 * @returns {Promise} - Search results
 */
export async function searchInventoryItems(farmId, searchTerm) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(FARM_INVENTORY_TABLE)
      .select(`
        *,
        category:${INVENTORY_CATEGORIES_TABLE}(name)
      `)
      .eq('farm_id', farmId)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
      .order('name');

    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error searching inventory items:', error);
    return { data: [], error };
  }
}

/**
 * Get inventory usage trends
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Usage trends data
 */
export async function getInventoryUsageTrends(farmId, options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { timeframe = '6m', item_type = null } = options;
    
    const endDate = new Date();
    const startDate = new Date();
    
    if (timeframe === '1y') {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else if (timeframe === '6m') {
      startDate.setMonth(endDate.getMonth() - 6);
    } else {
      startDate.setMonth(endDate.getMonth() - 3);
    }

    let query = supabase
      .from(INVENTORY_TRANSACTIONS_TABLE)
      .select(`
        transaction_type,
        quantity,
        transaction_date,
        inventory_item:${FARM_INVENTORY_TABLE}(
          name,
          item_type,
          category:${INVENTORY_CATEGORIES_TABLE}(name)
        )
      `)
      .eq('inventory_item.farm_id', farmId)
      .gte('transaction_date', startDate.toISOString())
      .lte('transaction_date', endDate.toISOString());

    if (item_type) {
      query = query.eq('inventory_item.item_type', item_type);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Process trends data
    const trends = processUsageTrends(data || []);
    
    return { data: trends, error: null };
  } catch (error) {
    console.error('Error fetching inventory usage trends:', error);
    return { data: [], error };
  }
}

// Helper function
function processUsageTrends(transactions) {
  const trends = {
    monthly_usage: {},
    top_used_items: {},
    usage_patterns: []
  };

  transactions.forEach(transaction => {
    const date = new Date(transaction.transaction_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const itemName = transaction.inventory_item?.name || 'Unknown';

    // Monthly usage
    if (!trends.monthly_usage[monthKey]) {
      trends.monthly_usage[monthKey] = { in: 0, out: 0 };
    }
    
    if (transaction.transaction_type === 'in') {
      trends.monthly_usage[monthKey].in += transaction.quantity;
    } else if (transaction.transaction_type === 'out') {
      trends.monthly_usage[monthKey].out += transaction.quantity;
    }

    // Top used items (only outgoing transactions)
    if (transaction.transaction_type === 'out') {
      if (!trends.top_used_items[itemName]) {
        trends.top_used_items[itemName] = 0;
      }
      trends.top_used_items[itemName] += transaction.quantity;
    }
  });

  return trends;
}

// Export the service object
export const farmInventoryService = {
  createInventoryItem,
  getInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryStats,
  getLowStockItems,
  getInventoryValuation,
  createInventoryTransaction,
  getInventoryTransactions,
  getAllInventoryTransactions,
  getInventoryCategories,
  createInventoryCategory,
  createInventoryAlert,
  getInventoryAlerts,
  updateInventoryAlert,
  searchInventoryItems,
  getInventoryUsageTrends,
  getInventorySummary: getInventoryStats // Alias for summary
};
