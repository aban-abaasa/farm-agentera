const { supabase } = require('../config/supabase');

/**
 * Livestock Management Service
 * Handles all livestock-related operations
 */

class LivestockService {

  /**
   * Get livestock categories for a farm
   */
  static async getLivestockCategories(farmId) {
    try {
      const { data, error } = await supabase
        .from('livestock_categories')
        .select('*')
        .eq('farm_id', farmId)
        .order('name');

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error getting livestock categories:', error);
      return { data: null, error };
    }
  }

  /**
   * Create livestock category
   */
  static async createLivestockCategory(farmId, categoryData) {
    try {
      const { data, error } = await supabase
        .from('livestock_categories')
        .insert({
          farm_id: farmId,
          ...categoryData
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating livestock category:', error);
      return { data: null, error };
    }
  }

  /**
   * Get animals for a farm
   */
  static async getAnimals(farmId, options = {}) {
    try {
      let query = supabase
        .from('livestock_animals')
        .select(`
          *,
          category:livestock_categories(name, species),
          mother:mother_id(name, tag_number),
          father:father_id(name, tag_number)
        `)
        .eq('farm_id', farmId);

      if (options.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error getting animals:', error);
      return { data: null, error };
    }
  }

  /**
   * Create new animal
   */
  static async createAnimal(farmId, animalData) {
    try {
      const { data, error } = await supabase
        .from('livestock_animals')
        .insert({
          farm_id: farmId,
          ...animalData
        })
        .select(`
          *,
          category:livestock_categories(name, species)
        `)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating animal:', error);
      return { data: null, error };
    }
  }

  /**
   * Update animal
   */
  static async updateAnimal(animalId, updates) {
    try {
      const { data, error } = await supabase
        .from('livestock_animals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', animalId)
        .select(`
          *,
          category:livestock_categories(name, species)
        `)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating animal:', error);
      return { data: null, error };
    }
  }

  /**
   * Get animal by ID
   */
  static async getAnimalById(animalId) {
    try {
      const { data, error } = await supabase
        .from('livestock_animals')
        .select(`
          *,
          category:livestock_categories(name, species),
          mother:mother_id(name, tag_number),
          father:father_id(name, tag_number)
        `)
        .eq('id', animalId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error getting animal by ID:', error);
      return { data: null, error };
    }
  }

  /**
   * Get health records for an animal
   */
  static async getHealthRecords(animalId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('livestock_health_records')
        .select('*')
        .eq('animal_id', animalId)
        .order('date_recorded', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error getting health records:', error);
      return { data: null, error };
    }
  }

  /**
   * Create health record
   */
  static async createHealthRecord(animalId, recordData) {
    try {
      const { data, error } = await supabase
        .from('livestock_health_records')
        .insert({
          animal_id: animalId,
          ...recordData
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating health record:', error);
      return { data: null, error };
    }
  }

  /**
   * Get breeding records for a farm
   */
  static async getBreedingRecords(farmId, options = {}) {
    try {
      let query = supabase
        .from('livestock_breeding_records')
        .select(`
          *,
          mother:mother_id(name, tag_number, breed),
          father:father_id(name, tag_number, breed)
        `)
        .eq('farm_id', farmId);

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      query = query.order('breeding_date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error getting breeding records:', error);
      return { data: null, error };
    }
  }

  /**
   * Create breeding record
   */
  static async createBreedingRecord(farmId, breedingData) {
    try {
      const { data, error } = await supabase
        .from('livestock_breeding_records')
        .insert({
          farm_id: farmId,
          ...breedingData
        })
        .select(`
          *,
          mother:mother_id(name, tag_number, breed),
          father:father_id(name, tag_number, breed)
        `)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating breeding record:', error);
      return { data: null, error };
    }
  }

  /**
   * Get livestock statistics for a farm
   */
  static async getLivestockStats(farmId) {
    try {
      // Get total counts by category
      const { data: categoryCounts, error: categoryError } = await supabase
        .from('livestock_animals')
        .select('category_id, livestock_categories(name, species)')
        .eq('farm_id', farmId)
        .eq('status', 'active');

      if (categoryError) throw categoryError;

      // Get health status counts
      const { data: healthCounts, error: healthError } = await supabase
        .from('livestock_animals')
        .select('health_status')
        .eq('farm_id', farmId)
        .eq('status', 'active');

      if (healthError) throw healthError;

      // Get recent births (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentBirths, error: birthsError } = await supabase
        .from('livestock_animals')
        .select('id')
        .eq('farm_id', farmId)
        .eq('acquisition_type', 'born')
        .gte('acquisition_date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (birthsError) throw birthsError;

      // Process the data
      const totalAnimals = categoryCounts.length;
      const healthyAnimals = healthCounts.filter(a => a.health_status === 'healthy').length;
      const sickAnimals = healthCounts.filter(a => a.health_status === 'sick').length;

      // Group by category
      const categoryStats = {};
      categoryCounts.forEach(animal => {
        const categoryName = animal.livestock_categories?.name || 'Unknown';
        categoryStats[categoryName] = (categoryStats[categoryName] || 0) + 1;
      });

      const stats = {
        total: totalAnimals,
        healthy: healthyAnimals,
        sick: sickAnimals,
        recentBirths: recentBirths.length,
        categoryBreakdown: categoryStats
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error getting livestock stats:', error);
      return { data: null, error };
    }
  }

  /**
   * Get upcoming health activities (vaccinations, checkups)
   */
  static async getUpcomingHealthActivities(farmId, days = 30) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await supabase
        .from('livestock_health_records')
        .select(`
          *,
          animal:livestock_animals(name, tag_number, livestock_categories(name))
        `)
        .eq('livestock_animals.farm_id', farmId)
        .not('next_checkup_date', 'is', null)
        .lte('next_checkup_date', futureDate.toISOString().split('T')[0])
        .order('next_checkup_date');

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error getting upcoming health activities:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete animal
   */
  static async deleteAnimal(animalId) {
    try {
      const { data, error } = await supabase
        .from('livestock_animals')
        .delete()
        .eq('id', animalId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error deleting animal:', error);
      return { data: null, error };
    }
  }

  /**
   * Get animals suitable for breeding (by gender and age)
   */
  static async getBreedingCandidates(farmId, gender, categoryId = null) {
    try {
      let query = supabase
        .from('livestock_animals')
        .select('id, name, tag_number, breed, birth_date, category_id')
        .eq('farm_id', farmId)
        .eq('status', 'active')
        .eq('gender', gender);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by age (animals should be at least 1 year old for breeding)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const breedingCandidates = data.filter(animal => {
        if (!animal.birth_date) return true; // If no birth date, assume mature
        return new Date(animal.birth_date) <= oneYearAgo;
      });

      return { data: breedingCandidates, error: null };
    } catch (error) {
      console.error('Error getting breeding candidates:', error);
      return { data: null, error };
    }
  }

}

module.exports = LivestockService;
