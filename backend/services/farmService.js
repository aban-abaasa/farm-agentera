const { supabase } = require('../config/supabase');

/**
 * Farm Management Service
 * Handles all farm-related operations including setup, management, and analytics
 */

class FarmService {
  
  /**
   * Get or create farm setup progress for a user
   */
  static async getFarmSetupProgress(userId) {
    try {
      // Check if user already has setup progress
      let { data: progress, error } = await supabase
        .from('farm_setup_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no progress exists, create one
      if (!progress) {
        const { data: newProgress, error: createError } = await supabase
          .from('farm_setup_progress')
          .insert({
            user_id: userId,
            current_step: 'basic_info',
            completion_percentage: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        progress = newProgress;
      }

      return { data: progress, error: null };
    } catch (error) {
      console.error('Error getting farm setup progress:', error);
      return { data: null, error };
    }
  }

  /**
   * Update farm setup progress
   */
  static async updateFarmSetupProgress(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('farm_setup_progress')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating farm setup progress:', error);
      return { data: null, error };
    }
  }

  /**
   * Save farm setup responses
   */
  static async saveFarmSetupResponse(setupProgressId, stepName, questionKey, responseValue, responseData = null) {
    try {
      const { data, error } = await supabase
        .from('farm_setup_responses')
        .upsert({
          setup_progress_id: setupProgressId,
          step_name: stepName,
          question_key: questionKey,
          response_value: responseValue,
          response_data: responseData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error saving farm setup response:', error);
      return { data: null, error };
    }
  }

  /**
   * Get farm setup questions for a specific step
   */
  static async getFarmSetupQuestions(stepName, farmType = null) {
    try {
      let query = supabase
        .from('farm_setup_questions')
        .select('*')
        .eq('step_name', stepName)
        .order('display_order');

      if (farmType) {
        query = query.or(`applicable_farm_types.is.null,applicable_farm_types.cs.{${farmType}}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error getting farm setup questions:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user's farm setup responses for a step
   */
  static async getFarmSetupResponses(setupProgressId, stepName = null) {
    try {
      let query = supabase
        .from('farm_setup_responses')
        .select('*')
        .eq('setup_progress_id', setupProgressId);

      if (stepName) {
        query = query.eq('step_name', stepName);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error getting farm setup responses:', error);
      return { data: null, error };
    }
  }

  /**
   * Create a new farm from setup data
   */
  static async createFarmFromSetup(userId, setupData) {
    try {
      // Start a transaction
      const { data: farm, error: farmError } = await supabase
        .from('farms')
        .insert({
          user_id: userId,
          name: setupData.farm_name,
          description: setupData.farm_description,
          location: setupData.farm_location,
          address: setupData.farm_address,
          total_area_hectares: parseFloat(setupData.total_area),
          established_date: setupData.established_year ? new Date(setupData.established_year) : null,
          farm_type: setupData.primary_farm_type,
          primary_crops: setupData.main_crops || [],
          status: 'active'
        })
        .select()
        .single();

      if (farmError) throw farmError;

      // Create default farm module preferences
      await this.createDefaultModulePreferences(farm.id, setupData);

      // Create default financial categories
      await this.createDefaultFinancialCategories(farm.id, setupData.primary_farm_type);

      // Create default fields if provided
      if (setupData.default_fields) {
        await this.createDefaultFields(farm.id, setupData.default_fields);
      }

      // Mark setup as completed
      await this.updateFarmSetupProgress(userId, {
        farm_id: farm.id,
        setup_completed: true,
        completion_percentage: 100,
        completed_at: new Date().toISOString()
      });

      return { data: farm, error: null };
    } catch (error) {
      console.error('Error creating farm from setup:', error);
      return { data: null, error };
    }
  }

  /**
   * Create default module preferences based on setup responses
   */
  static async createDefaultModulePreferences(farmId, setupData) {
    try {
      const preferences = {
        farm_id: farmId,
        livestock_enabled: setupData.has_livestock === true || setupData.primary_farm_type === 'livestock' || setupData.primary_farm_type === 'mixed',
        crops_enabled: setupData.has_crops === true || setupData.primary_farm_type === 'crops' || setupData.primary_farm_type === 'mixed',
        irrigation_enabled: setupData.irrigation_available === true,
        financial_enabled: true,
        inventory_enabled: true,
        analytics_enabled: true,
        weather_enabled: true,
        tasks_enabled: true,
        breeding_tracking: setupData.breeding_program === true,
        health_monitoring: setupData.veterinary_care === true,
        automated_alerts: setupData.mobile_notifications !== false,
        mobile_notifications: setupData.mobile_notifications !== false,
        weather_api_enabled: true,
        market_price_alerts: false
      };

      const { data, error } = await supabase
        .from('farm_module_preferences')
        .insert(preferences)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating module preferences:', error);
      return { data: null, error };
    }
  }

  /**
   * Create default financial categories
   */
  static async createDefaultFinancialCategories(farmId, farmType) {
    try {
      const categories = [];

      // Income categories
      const incomeCategories = [
        'Livestock Sales',
        'Crop Sales',
        'Milk Sales',
        'Egg Sales',
        'Processed Products',
        'Services',
        'Government Subsidies',
        'Other Income'
      ];

      // Expense categories
      const expenseCategories = [
        'Feed & Supplies',
        'Seeds & Planting Materials',
        'Fertilizers & Chemicals',
        'Veterinary & Medicine',
        'Labor Costs',
        'Equipment & Tools',
        'Fuel & Energy',
        'Utilities',
        'Rent & Land Costs',
        'Insurance',
        'Transportation',
        'Marketing & Sales',
        'Other Expenses'
      ];

      // Add income categories
      incomeCategories.forEach(name => {
        categories.push({
          farm_id: farmId,
          name,
          category_type: 'income'
        });
      });

      // Add expense categories
      expenseCategories.forEach(name => {
        categories.push({
          farm_id: farmId,
          name,
          category_type: 'expense'
        });
      });

      const { data, error } = await supabase
        .from('farm_financial_categories')
        .insert(categories)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating financial categories:', error);
      return { data: null, error };
    }
  }

  /**
   * Create default farm fields
   */
  static async createDefaultFields(farmId, fieldsData) {
    try {
      const fields = fieldsData.map(field => ({
        farm_id: farmId,
        name: field.name,
        area_hectares: field.area_hectares,
        current_use: field.current_use,
        status: 'active'
      }));

      const { data, error } = await supabase
        .from('farm_fields')
        .insert(fields)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating default fields:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user's farm
   */
  static async getUserFarm(userId) {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select(`
          *,
          farm_module_preferences (*),
          farm_fields (*)
        `)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { data: data || null, error: null };
    } catch (error) {
      console.error('Error getting user farm:', error);
      return { data: null, error };
    }
  }

  /**
   * Get farm overview data
   */
  static async getFarmOverview(farmId) {
    try {
      const { data, error } = await supabase
        .from('farm_overview')
        .select('*')
        .eq('id', farmId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error getting farm overview:', error);
      return { data: null, error };
    }
  }

  /**
   * Get farm analytics data
   */
  static async getFarmAnalytics(farmId, period = 'monthly', limit = 12) {
    try {
      const { data, error } = await supabase
        .from('farm_analytics_metrics')
        .select('*')
        .eq('farm_id', farmId)
        .eq('metric_period', period)
        .order('metric_date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error getting farm analytics:', error);
      return { data: null, error };
    }
  }

  /**
   * Get farm alerts
   */
  static async getFarmAlerts(farmId, status = 'active') {
    try {
      const { data, error } = await supabase
        .from('farm_alerts')
        .select('*')
        .eq('farm_id', farmId)
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error getting farm alerts:', error);
      return { data: null, error };
    }
  }

  /**
   * Get farm tasks
   */
  static async getFarmTasks(farmId, status = null, limit = 20) {
    try {
      let query = supabase
        .from('farm_tasks')
        .select('*')
        .eq('farm_id', farmId)
        .order('scheduled_date', { ascending: true })
        .limit(limit);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error getting farm tasks:', error);
      return { data: null, error };
    }
  }

  /**
   * Update farm information
   */
  static async updateFarm(farmId, updates) {
    try {
      const { data, error } = await supabase
        .from('farms')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', farmId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating farm:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if user has completed farm setup
   */
  static async isSetupCompleted(userId) {
    try {
      const { data, error } = await supabase
        .from('farm_setup_progress')
        .select('setup_completed, farm_id')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { 
        isCompleted: data?.setup_completed || false, 
        farmId: data?.farm_id || null,
        error: null 
      };
    } catch (error) {
      console.error('Error checking setup completion:', error);
      return { isCompleted: false, farmId: null, error };
    }
  }

}

module.exports = FarmService;
