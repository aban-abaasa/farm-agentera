import { 
  fetchData, 
  insertRecord,
  updateRecord,
  deleteRecord 
} from '../../lib/supabase/dbHelpers';

// Table names in Supabase
const FARM_TASKS_TABLE = 'farm_tasks';
const TASK_CATEGORIES_TABLE = 'farm_task_categories';
const TASK_ASSIGNMENTS_TABLE = 'farm_task_assignments';
const TASK_COMMENTS_TABLE = 'farm_task_comments';
const TASK_TEMPLATES_TABLE = 'farm_task_templates';

/**
 * Create new task
 * @param {string} farmId - Farm ID
 * @param {Object} taskData - Task data
 * @returns {Promise} - Created task data
 */
export async function createTask(farmId, taskData) {
  try {
    const taskRecord = {
      ...taskData,
      farm_id: farmId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(FARM_TASKS_TABLE, taskRecord);
  } catch (error) {
    console.error('Error creating task:', error);
    return { data: null, error };
  }
}

/**
 * Get tasks for a farm
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Tasks data
 */
export async function getTasks(farmId, options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    let query = supabase
      .from(FARM_TASKS_TABLE)
      .select(`
        *,
        category:${TASK_CATEGORIES_TABLE}(
          id,
          name,
          color_hex,
          icon
        ),
        assignments:${TASK_ASSIGNMENTS_TABLE}(
          id,
          assignee_id,
          assigned_at,
          profiles:assignee_id(
            first_name,
            last_name,
            avatar_url
          )
        ),
        comments:${TASK_COMMENTS_TABLE}(
          id,
          comment,
          created_at,
          profiles:created_by(
            first_name,
            last_name
          )
        )
      `)
      .eq('farm_id', farmId);

    // Apply filters
    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.priority) {
      query = query.eq('priority', options.priority);
    }

    if (options.category_id) {
      query = query.eq('category_id', options.category_id);
    }

    if (options.assigned_to) {
      query = query.eq('assignments.assignee_id', options.assigned_to);
    }

    if (options.due_date_range) {
      if (options.due_date_range.start) {
        query = query.gte('due_date', options.due_date_range.start);
      }
      if (options.due_date_range.end) {
        query = query.lte('due_date', options.due_date_range.end);
      }
    }

    // Apply sorting
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? true });
    } else {
      query = query.order('due_date', { ascending: true });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { data: [], error };
  }
}

/**
 * Get task by ID
 * @param {string} taskId - Task ID
 * @returns {Promise} - Task data
 */
export async function getTaskById(taskId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(FARM_TASKS_TABLE)
      .select(`
        *,
        category:${TASK_CATEGORIES_TABLE}(*),
        assignments:${TASK_ASSIGNMENTS_TABLE}(
          *,
          profiles:assignee_id(*)
        ),
        comments:${TASK_COMMENTS_TABLE}(
          *,
          profiles:created_by(*)
        )
      `)
      .eq('id', taskId)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching task:', error);
    return { data: null, error };
  }
}

/**
 * Update task
 * @param {string} taskId - Task ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated task data
 */
export async function updateTask(taskId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(FARM_TASKS_TABLE, taskId, updatedData);
}

/**
 * Delete task
 * @param {string} taskId - Task ID
 * @returns {Promise} - Delete result
 */
export async function deleteTask(taskId) {
  return await deleteRecord(FARM_TASKS_TABLE, taskId);
}

/**
 * Get today's tasks
 * @param {string} farmId - Farm ID
 * @returns {Promise} - Today's tasks data
 */
export async function getTodaysTasks(farmId) {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  return await getTasks(farmId, {
    due_date_range: {
      start: startOfDay,
      end: endOfDay
    },
    orderBy: 'priority',
    ascending: false
  });
}

/**
 * Get overdue tasks
 * @param {string} farmId - Farm ID
 * @returns {Promise} - Overdue tasks data
 */
export async function getOverdueTasks(farmId) {
  const now = new Date().toISOString();

  return await getTasks(farmId, {
    due_date_range: {
      end: now
    },
    status: ['pending', 'in_progress'],
    orderBy: 'due_date',
    ascending: true
  });
}

/**
 * Get upcoming tasks
 * @param {string} farmId - Farm ID
 * @param {number} days - Number of days to look ahead
 * @returns {Promise} - Upcoming tasks data
 */
export async function getUpcomingTasks(farmId, days = 7) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);

  return await getTasks(farmId, {
    due_date_range: {
      start: now.toISOString(),
      end: futureDate.toISOString()
    },
    status: ['pending', 'in_progress'],
    orderBy: 'due_date',
    ascending: true
  });
}

/**
 * Get tasks by status
 * @param {string} farmId - Farm ID
 * @param {string} status - Task status
 * @returns {Promise} - Tasks data
 */
export async function getTasksByStatus(farmId, status) {
  return await getTasks(farmId, {
    status: status,
    orderBy: 'due_date',
    ascending: true
  });
}

/**
 * Get task statistics for a farm
 * @param {string} farmId - Farm ID
 * @returns {Promise} - Task statistics
 */
export async function getTaskStats(farmId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(FARM_TASKS_TABLE)
      .select('status, priority, due_date, category_id')
      .eq('farm_id', farmId);

    if (error) throw error;

    const now = new Date();
    const stats = {
      total_tasks: data.length,
      pending: 0,
      in_progress: 0,
      completed: 0,
      overdue: 0,
      due_today: 0,
      high_priority: 0,
      medium_priority: 0,
      low_priority: 0,
      by_category: {}
    };

    data.forEach(task => {
      // Status counts
      stats[task.status] = (stats[task.status] || 0) + 1;
      
      // Priority counts
      if (task.priority === 'high') stats.high_priority += 1;
      if (task.priority === 'medium') stats.medium_priority += 1;
      if (task.priority === 'low') stats.low_priority += 1;
      
      // Due date analysis
      const dueDate = new Date(task.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < now && (task.status === 'pending' || task.status === 'in_progress')) {
        stats.overdue += 1;
      }
      
      if (dueDate.toDateString() === today.toDateString()) {
        stats.due_today += 1;
      }
      
      // Category counts
      const categoryId = task.category_id || 'uncategorized';
      stats.by_category[categoryId] = (stats.by_category[categoryId] || 0) + 1;
    });
    
    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching task stats:', error);
    return { data: null, error };
  }
}

/**
 * Complete task
 * @param {string} taskId - Task ID
 * @param {Object} completionData - Completion data
 * @returns {Promise} - Updated task data
 */
export async function completeTask(taskId, completionData = {}) {
  const updateData = {
    status: 'completed',
    completed_at: new Date().toISOString(),
    completion_notes: completionData.notes || null,
    actual_duration: completionData.duration || null,
    ...completionData
  };

  return await updateTask(taskId, updateData);
}

/**
 * Start task
 * @param {string} taskId - Task ID
 * @returns {Promise} - Updated task data
 */
export async function startTask(taskId) {
  const updateData = {
    status: 'in_progress',
    started_at: new Date().toISOString()
  };

  return await updateTask(taskId, updateData);
}

// Task Categories Management
/**
 * Get task categories
 * @param {Object} options - Query options
 * @returns {Promise} - Categories data
 */
export async function getTaskCategories(options = {}) {
  return await fetchData(TASK_CATEGORIES_TABLE, {
    ...options,
    orderBy: 'name'
  });
}

/**
 * Create task category
 * @param {Object} categoryData - Category data
 * @returns {Promise} - Created category data
 */
export async function createTaskCategory(categoryData) {
  try {
    const categoryRecord = {
      ...categoryData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(TASK_CATEGORIES_TABLE, categoryRecord);
  } catch (error) {
    console.error('Error creating task category:', error);
    return { data: null, error };
  }
}

// Task Assignments Management
/**
 * Assign task to user
 * @param {string} taskId - Task ID
 * @param {string} assigneeId - User ID to assign to
 * @param {Object} assignmentData - Assignment data
 * @returns {Promise} - Created assignment data
 */
export async function assignTask(taskId, assigneeId, assignmentData = {}) {
  try {
    const assignmentRecord = {
      task_id: taskId,
      assignee_id: assigneeId,
      assigned_at: new Date().toISOString(),
      ...assignmentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(TASK_ASSIGNMENTS_TABLE, assignmentRecord);
  } catch (error) {
    console.error('Error assigning task:', error);
    return { data: null, error };
  }
}

/**
 * Get task assignments
 * @param {string} taskId - Task ID
 * @returns {Promise} - Assignments data
 */
export async function getTaskAssignments(taskId) {
  const filters = {
    task_id: taskId
  };

  return await fetchData(TASK_ASSIGNMENTS_TABLE, {
    filters
  });
}

/**
 * Remove task assignment
 * @param {string} assignmentId - Assignment ID
 * @returns {Promise} - Delete result
 */
export async function removeTaskAssignment(assignmentId) {
  return await deleteRecord(TASK_ASSIGNMENTS_TABLE, assignmentId);
}

// Task Comments Management
/**
 * Add comment to task
 * @param {string} taskId - Task ID
 * @param {Object} commentData - Comment data
 * @returns {Promise} - Created comment data
 */
export async function addTaskComment(taskId, commentData) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const commentRecord = {
      ...commentData,
      task_id: taskId,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(TASK_COMMENTS_TABLE, commentRecord);
  } catch (error) {
    console.error('Error adding task comment:', error);
    return { data: null, error };
  }
}

/**
 * Get task comments
 * @param {string} taskId - Task ID
 * @returns {Promise} - Comments data
 */
export async function getTaskComments(taskId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(TASK_COMMENTS_TABLE)
      .select(`
        *,
        profiles:created_by(
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching task comments:', error);
    return { data: [], error };
  }
}

/**
 * Update task comment
 * @param {string} commentId - Comment ID
 * @param {Object} updateData - Data to update
 * @returns {Promise} - Updated comment data
 */
export async function updateTaskComment(commentId, updateData) {
  const updatedData = {
    ...updateData,
    updated_at: new Date().toISOString()
  };

  return await updateRecord(TASK_COMMENTS_TABLE, commentId, updatedData);
}

/**
 * Delete task comment
 * @param {string} commentId - Comment ID
 * @returns {Promise} - Delete result
 */
export async function deleteTaskComment(commentId) {
  return await deleteRecord(TASK_COMMENTS_TABLE, commentId);
}

// Task Templates Management
/**
 * Get task templates
 * @param {Object} options - Query options
 * @returns {Promise} - Templates data
 */
export async function getTaskTemplates(options = {}) {
  return await fetchData(TASK_TEMPLATES_TABLE, {
    ...options,
    orderBy: 'name'
  });
}

/**
 * Create task template
 * @param {Object} templateData - Template data
 * @returns {Promise} - Created template data
 */
export async function createTaskTemplate(templateData) {
  try {
    const templateRecord = {
      ...templateData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await insertRecord(TASK_TEMPLATES_TABLE, templateRecord);
  } catch (error) {
    console.error('Error creating task template:', error);
    return { data: null, error };
  }
}

/**
 * Create task from template
 * @param {string} farmId - Farm ID
 * @param {string} templateId - Template ID
 * @param {Object} overrideData - Data to override template values
 * @returns {Promise} - Created task data
 */
export async function createTaskFromTemplate(farmId, templateId, overrideData = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    // Get template data
    const { data: template, error: templateError } = await supabase
      .from(TASK_TEMPLATES_TABLE)
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    // Create task using template data
    const taskData = {
      title: template.title,
      description: template.description,
      category_id: template.category_id,
      priority: template.priority,
      estimated_duration: template.estimated_duration,
      instructions: template.instructions,
      required_equipment: template.required_equipment,
      required_materials: template.required_materials,
      ...overrideData
    };

    return await createTask(farmId, taskData);
  } catch (error) {
    console.error('Error creating task from template:', error);
    return { data: null, error };
  }
}

/**
 * Search tasks
 * @param {string} farmId - Farm ID
 * @param {string} searchTerm - Search term
 * @returns {Promise} - Search results
 */
export async function searchTasks(farmId, searchTerm) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(FARM_TASKS_TABLE)
      .select(`
        *,
        category:${TASK_CATEGORIES_TABLE}(name, color_hex)
      `)
      .eq('farm_id', farmId)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('due_date');

    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error searching tasks:', error);
    return { data: [], error };
  }
}

/**
 * Get task calendar data
 * @param {string} farmId - Farm ID
 * @param {Object} options - Query options
 * @returns {Promise} - Calendar data
 */
export async function getTaskCalendar(farmId, options = {}) {
  try {
    const { month, year } = options;
    const startDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()), 1);
    const endDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()) + 1, 0);

    const { data, error } = await getTasks(farmId, {
      due_date_range: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });

    if (error) throw error;

    // Group tasks by date
    const calendarData = data.reduce((acc, task) => {
      const date = new Date(task.due_date).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {});
    
    return { data: calendarData, error: null };
  } catch (error) {
    console.error('Error fetching task calendar:', error);
    return { data: {}, error };
  }
}

// Export the service object
export const farmTaskService = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTodaysTasks,
  getOverdueTasks,
  getUpcomingTasks,
  getTasksByStatus,
  getTaskStats,
  completeTask,
  startTask,
  getTaskCategories,
  createTaskCategory,
  assignTask,
  getTaskAssignments,
  removeTaskAssignment,
  addTaskComment,
  getTaskComments,
  updateTaskComment,
  deleteTaskComment,
  getTaskCalendar
};
