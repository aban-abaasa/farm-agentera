import { 
  fetchData, 
  insertRecord,
  updateRecord,
  deleteRecord 
} from '../../lib/supabase/dbHelpers';

// Table names in Supabase
const FARM_FINANCIAL_TRANSACTIONS_TABLE = 'farm_financial_transactions';
const FARM_BUDGETS_TABLE = 'farm_budgets';
const FARM_BUDGET_CATEGORIES_TABLE = 'farm_budget_categories';
const FARM_FINANCIAL_GOALS_TABLE = 'farm_financial_goals';
const FARM_CONTRACTS_TABLE = 'farm_contracts';

/**
 * Create financial transaction
 * @param {string} farmId - Farm ID
 * @param {Object} transactionData - Transaction data
 * @returns {Promise} - Created transaction data
 */
export async function createTransaction(farmId, transactionData) {
  try {
    const transactionRecord = {
      ...transactionData,
      farm_id: farmId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(FARM_FINANCIAL_TRANSACTIONS_TABLE, transactionRecord);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return { data: null, error };
  }
}

/**
 * Get financial transactions for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Transactions data
 */
export async function getTransactions(farmId, options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    let query = supabase
      .from(FARM_FINANCIAL_TRANSACTIONS_TABLE)
      .select(`
        *,
        category:${FARM_BUDGET_CATEGORIES_TABLE}(
          id,
          name,
          color_hex
        )
      `)
      .eq('farm_id', farmId);

    // Apply filters
    if (options.transaction_type) {
      query = query.eq('transaction_type', options.transaction_type);
    }

    if (options.category_id) {
      query = query.eq('category_id', options.category_id);
    }

    if (options.start_date) {
      query = query.gte('transaction_date', options.start_date);
    }

    if (options.end_date) {
      query = query.lte('transaction_date', options.end_date);
    }

    // Apply sorting
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? true });
    } else {
      query = query.order('transaction_date', { ascending: false });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { data: [], error };
  }
}

/**
 * Get transaction by ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise} - Transaction data
 */
export async function getTransactionById(transactionId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(FARM_FINANCIAL_TRANSACTIONS_TABLE)
      .select(`
        *,
        category:${FARM_BUDGET_CATEGORIES_TABLE}(*)
      `)
      .eq('id', transactionId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return { data: null, error };
  }
}

/**
 * Update transaction
 * @param {string} transactionId - Transaction ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated transaction data
 */
export async function updateTransaction(transactionId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(FARM_FINANCIAL_TRANSACTIONS_TABLE, transactionId, updatedData);
}

/**
 * Delete transaction
 * @param {string} transactionId - Transaction ID
 * @returns {Promise} - Delete result
 */
export async function deleteTransaction(transactionId) {
  return await deleteRecord(FARM_FINANCIAL_TRANSACTIONS_TABLE, transactionId);
}

/**
 * Get financial summary for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Financial summary data
 */
export async function getFinancialSummary(farmId, options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { timeframe = '1y' } = options;
    
    const endDate = new Date();
    const startDate = new Date();
    
    if (timeframe === '1y') {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else if (timeframe === '6m') {
      startDate.setMonth(endDate.getMonth() - 6);
    } else if (timeframe === '3m') {
      startDate.setMonth(endDate.getMonth() - 3);
    } else {
      startDate.setMonth(endDate.getMonth() - 1);
    }

    const { data, error } = await supabase
      .from(FARM_FINANCIAL_TRANSACTIONS_TABLE)
      .select('transaction_type, amount, category_id, transaction_date')
      .eq('farm_id', farmId)
      .gte('transaction_date', startDate.toISOString())
      .lte('transaction_date', endDate.toISOString());

    if (error) throw error;

    // Calculate summary
    const summary = data.reduce((acc, transaction) => {
      if (transaction.transaction_type === 'income') {
        acc.total_income += transaction.amount;
      } else if (transaction.transaction_type === 'expense') {
        acc.total_expenses += transaction.amount;
      }
      return acc;
    }, {
      total_income: 0,
      total_expenses: 0,
      net_profit: 0,
      transaction_count: data.length
    });

    summary.net_profit = summary.total_income - summary.total_expenses;
    summary.profit_margin = summary.total_income > 0 
      ? (summary.net_profit / summary.total_income) * 100 
      : 0;
    
    return { data: summary, error: null };
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    return { data: null, error };
  }
}

/**
 * Get income by category
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Income by category data
 */
export async function getIncomeByCategory(farmId, options = {}) {
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

    const { data, error } = await supabase
      .from(FARM_FINANCIAL_TRANSACTIONS_TABLE)
      .select(`
        amount,
        category:${FARM_BUDGET_CATEGORIES_TABLE}(name, color_hex)
      `)
      .eq('farm_id', farmId)
      .eq('transaction_type', 'income')
      .gte('transaction_date', startDate.toISOString())
      .lte('transaction_date', endDate.toISOString());

    if (error) throw error;

    // Group by category
    const categoryData = data.reduce((acc, transaction) => {
      const categoryName = transaction.category?.name || 'Uncategorized';
      const categoryColor = transaction.category?.color_hex || '#999999';
      
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          amount: 0,
          color: categoryColor,
          count: 0
        };
      }
      
      acc[categoryName].amount += transaction.amount;
      acc[categoryName].count += 1;
      
      return acc;
    }, {});
    
    return { data: Object.values(categoryData), error: null };
  } catch (error) {
    console.error('Error fetching income by category:', error);
    return { data: [], error };
  }
}

/**
 * Get expenses by category
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Expenses by category data
 */
export async function getExpensesByCategory(farmId, options = {}) {
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

    const { data, error } = await supabase
      .from(FARM_FINANCIAL_TRANSACTIONS_TABLE)
      .select(`
        amount,
        category:${FARM_BUDGET_CATEGORIES_TABLE}(name, color_hex)
      `)
      .eq('farm_id', farmId)
      .eq('transaction_type', 'expense')
      .gte('transaction_date', startDate.toISOString())
      .lte('transaction_date', endDate.toISOString());

    if (error) throw error;

    // Group by category
    const categoryData = data.reduce((acc, transaction) => {
      const categoryName = transaction.category?.name || 'Uncategorized';
      const categoryColor = transaction.category?.color_hex || '#999999';
      
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          amount: 0,
          color: categoryColor,
          count: 0
        };
      }
      
      acc[categoryName].amount += transaction.amount;
      acc[categoryName].count += 1;
      
      return acc;
    }, {});
    
    return { data: Object.values(categoryData), error: null };
  } catch (error) {
    console.error('Error fetching expenses by category:', error);
    return { data: [], error };
  }
}

// Budget Management
/**
 * Create budget
 * @param {string} farmId - Farm ID
 * @param {Object} budgetData - Budget data
 * @returns {Promise} - Created budget data
 */
export async function createBudget(farmId, budgetData) {
  try {
    const budgetRecord = {
      ...budgetData,
      farm_id: farmId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(FARM_BUDGETS_TABLE, budgetRecord);
  } catch (error) {
    console.error('Error creating budget:', error);
    return { data: null, error };
  }
}

/**
 * Get budgets for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Budgets data
 */
export async function getBudgets(farmId, options = {}) {
  const filters = {
    farm_id: farmId,
    ...options.filters
  };

  return await fetchData(FARM_BUDGETS_TABLE, {
    ...options,
    filters
  });
}

/**
 * Update budget
 * @param {string} budgetId - Budget ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated budget data
 */
export async function updateBudget(budgetId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(FARM_BUDGETS_TABLE, budgetId, updatedData);
}

/**
 * Delete budget
 * @param {string} budgetId - Budget ID
 * @returns {Promise} - Delete result
 */
export async function deleteBudget(budgetId) {
  return await deleteRecord(FARM_BUDGETS_TABLE, budgetId);
}

// Budget Categories Management
/**
 * Get budget categories
 * @param {Object} options - Query options
 * @returns {Promise} - Budget categories data
 */
export async function getBudgetCategories(options = {}) {
  return await fetchData(FARM_BUDGET_CATEGORIES_TABLE, {
    ...options,
    orderBy: 'name'
  });
}

/**
 * Create budget category
 * @param {Object} categoryData - Category data
 * @returns {Promise} - Created category data
 */
export async function createBudgetCategory(categoryData) {
  try {
    const categoryRecord = {
      ...categoryData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(FARM_BUDGET_CATEGORIES_TABLE, categoryRecord);
  } catch (error) {
    console.error('Error creating budget category:', error);
    return { data: null, error };
  }
}

// Financial Goals Management
/**
 * Create financial goal
 * @param {string} farmId - Farm ID
 * @param {Object} goalData - Goal data
 * @returns {Promise} - Created goal data
 */
export async function createFinancialGoal(farmId, goalData) {
  try {
    const goalRecord = {
      ...goalData,
      farm_id: farmId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(FARM_FINANCIAL_GOALS_TABLE, goalRecord);
  } catch (error) {
    console.error('Error creating financial goal:', error);
    return { data: null, error };
  }
}

/**
 * Get financial goals for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Financial goals data
 */
export async function getFinancialGoals(farmId, options = {}) {
  const filters = {
    farm_id: farmId,
    ...options.filters
  };

  return await fetchData(FARM_FINANCIAL_GOALS_TABLE, {
    ...options,
    filters
  });
}

/**
 * Update financial goal
 * @param {string} goalId - Goal ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated goal data
 */
export async function updateFinancialGoal(goalId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(FARM_FINANCIAL_GOALS_TABLE, goalId, updatedData);
}

// Contracts Management
/**
 * Create contract
 * @param {string} farmId - Farm ID
 * @param {Object} contractData - Contract data
 * @returns {Promise} - Created contract data
 */
export async function createContract(farmId, contractData) {
  try {
    const contractRecord = {
      ...contractData,
      farm_id: farmId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(FARM_CONTRACTS_TABLE, contractRecord);
  } catch (error) {
    console.error('Error creating contract:', error);
    return { data: null, error };
  }
}

/**
 * Get contracts for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Contracts data
 */
export async function getContracts(farmId, options = {}) {
  const filters = {
    farm_id: farmId,
    ...options.filters
  };

  return await fetchData(FARM_CONTRACTS_TABLE, {
    ...options,
    filters
  });
}

/**
 * Update contract
 * @param {string} contractId - Contract ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated contract data
 */
export async function updateContract(contractId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(FARM_CONTRACTS_TABLE, contractId, updatedData);
}

/**
 * Get cash flow data
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Cash flow data
 */
export async function getCashFlow(farmId, options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { timeframe = '1y', interval = 'month' } = options;
    
    const endDate = new Date();
    const startDate = new Date();
    
    if (timeframe === '1y') {
      startDate.setFullYear(endDate.getFullYear() - 1);
    } else if (timeframe === '6m') {
      startDate.setMonth(endDate.getMonth() - 6);
    } else {
      startDate.setMonth(endDate.getMonth() - 3);
    }

    const { data, error } = await supabase
      .from(FARM_FINANCIAL_TRANSACTIONS_TABLE)
      .select('transaction_type, amount, transaction_date')
      .eq('farm_id', farmId)
      .gte('transaction_date', startDate.toISOString())
      .lte('transaction_date', endDate.toISOString())
      .order('transaction_date');

    if (error) throw error;

    // Group by interval and calculate cash flow
    const cashFlowData = groupTransactionsByInterval(data, interval);
    
    return { data: cashFlowData, error: null };
  } catch (error) {
    console.error('Error fetching cash flow:', error);
    return { data: [], error };
  }
}

/**
 * Get financial trends
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Financial trends data
 */
export async function getFinancialTrends(farmId, options = {}) {
  try {
    const { timeframe = '1y' } = options;
    
    const [
      summary,
      cashFlow,
      incomeByCategory,
      expensesByCategory
    ] = await Promise.all([
      getFinancialSummary(farmId, { timeframe }),
      getCashFlow(farmId, { timeframe }),
      getIncomeByCategory(farmId, { timeframe }),
      getExpensesByCategory(farmId, { timeframe })
    ]);

    const trends = {
      summary: summary.data,
      cash_flow: cashFlow.data,
      income_by_category: incomeByCategory.data,
      expenses_by_category: expensesByCategory.data,
      calculated_at: new Date().toISOString()
    };
    
    return { data: trends, error: null };
  } catch (error) {
    console.error('Error fetching financial trends:', error);
    return { data: null, error };
  }
}

// Helper functions
function groupTransactionsByInterval(transactions, interval) {
  const grouped = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.transaction_date);
    let key;
    
    if (interval === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (interval === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = date.toISOString().split('T')[0];
    }
    
    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        income: 0,
        expenses: 0,
        net_cash_flow: 0
      };
    }
    
    if (transaction.transaction_type === 'income') {
      grouped[key].income += transaction.amount;
    } else if (transaction.transaction_type === 'expense') {
      grouped[key].expenses += transaction.amount;
    }
    
    grouped[key].net_cash_flow = grouped[key].income - grouped[key].expenses;
  });
  
  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
}

// Export the service object
export const farmFinanceService = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getFinancialSummary,
  getIncomeByCategory,
  getExpensesByCategory,
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  getBudgetCategories,
  createBudgetCategory,
  createFinancialGoal,
  getFinancialGoals,
  updateFinancialGoal,
  createContract,
  getContracts,
  updateContract,
  getCashFlow,
  getFinancialTrends
};
