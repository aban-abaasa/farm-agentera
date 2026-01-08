import { 
  fetchData, 
  insertRecord,
  updateRecord,
  deleteRecord,
  searchRecords 
} from '../../lib/supabase/dbHelpers';

// Tables in Supabase
const POSTS_TABLE = 'community_posts';
const COMMENTS_TABLE = 'post_comments';
const QUESTIONS_TABLE = 'community_questions';
const ANSWERS_TABLE = 'question_answers';
const CATEGORIES_TABLE = 'forum_categories';
const TAGS_TABLE = 'forum_tags';
const POST_TAGS_TABLE = 'post_tags';
const QUESTION_TAGS_TABLE = 'question_tags';
const POST_LIKES_TABLE = 'post_likes';
const COMMENT_LIKES_TABLE = 'comment_likes';
const POST_REACTIONS_TABLE = 'post_reactions';
const EVENTS_TABLE = 'community_events';
const EVENT_PARTICIPANTS_TABLE = 'event_participants';
const USER_REPUTATION_TABLE = 'user_reputation';
const COMMUNITY_BADGES_TABLE = 'community_badges';
const POST_BOOKMARKS_TABLE = 'post_bookmarks';
const NOTIFICATIONS_TABLE = 'community_notifications';

/**
 * Fetch all discussion posts with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise} - Posts data
 */
export async function getPosts(options = {}) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    let query = supabase
      .from(POSTS_TABLE)
      .select(`
        *,
        user:profiles(id, first_name, last_name, avatar_url),
        category:${CATEGORIES_TABLE}(id, name, color_hex),
        tags:${POST_TAGS_TABLE}(
          tag:${TAGS_TABLE}(id, name, slug, color_hex)
        ),
        comments_count:${COMMENTS_TABLE}(count),
        likes_count:${POST_LIKES_TABLE}(count)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (options.category_id) {
      query = query.eq('category_id', options.category_id);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    // Format the data
    return { 
      data: data?.map(post => ({
        ...post,
        tags: post.tags?.map(tagItem => tagItem.tag) || [],
        comments_count: post.comments_count?.length || 0,
        likes_count: post.likes_count?.length || 0
      })) || [], 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { data: [], error };
  }
}

/**
 * Fetch a single post by ID
 * @param {number|string} id - Post ID
 * @returns {Promise} - Post data with comments
 */
export async function getPostById(id) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(POSTS_TABLE)
      .select(`
        *,
        comments:${COMMENTS_TABLE}(
          *,
          user:profiles(id, first_name, last_name, avatar_url)
        ),
        user:profiles(id, first_name, last_name, avatar_url),
        tags:${POST_TAGS_TABLE}(
          tag:${TAGS_TABLE}(id, name)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Format the tags
    if (data && data.tags) {
      data.tags = data.tags.map(tagItem => tagItem.tag);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching post by ID:`, error);
    return { data: null, error };
  }
}

/**
 * Create a new discussion post
 * @param {Object} post - Post data
 * @param {Array} tags - Array of tag IDs
 * @returns {Promise} - New post
 */
export async function createPost(post, tags = []) {
  try {
    const { data: newPost, error } = await insertRecord(POSTS_TABLE, { 
      ...post, 
      created_at: new Date().toISOString() 
    });
    
    if (error) throw error;
    
    // Add tags if any
    if (tags.length > 0 && newPost) {
      const postId = newPost[0].id;
      
      const tagPromises = tags.map(tagId => 
        insertRecord(POST_TAGS_TABLE, { 
          post_id: postId, 
          tag_id: tagId 
        })
      );
      
      await Promise.all(tagPromises);
    }
    
    return { data: newPost, error: null };
  } catch (error) {
    console.error(`Error creating post:`, error);
    return { data: null, error };
  }
}

/**
 * Update a discussion post
 * @param {number|string} id - Post ID
 * @param {Object} updates - Fields to update
 * @param {Array} tags - New array of tag IDs (optional)
 * @returns {Promise} - Updated post
 */
export async function updatePost(id, updates, tags = null) {
  try {
    const { data: updatedPost, error } = await updateRecord(POSTS_TABLE, { 
      ...updates, 
      updated_at: new Date().toISOString() 
    }, { id });
    
    if (error) throw error;
    
    // Update tags if provided
    if (tags !== null) {
      // Delete existing tags
      await deleteRecord(POST_TAGS_TABLE, { post_id: id });
      
      // Add new tags
      if (tags.length > 0) {
        const tagPromises = tags.map(tagId => 
          insertRecord(POST_TAGS_TABLE, { 
            post_id: id, 
            tag_id: tagId 
          })
        );
        
        await Promise.all(tagPromises);
      }
    }
    
    return { data: updatedPost, error: null };
  } catch (error) {
    console.error(`Error updating post:`, error);
    return { data: null, error };
  }
}

/**
 * Delete a discussion post
 * @param {number|string} id - Post ID
 * @returns {Promise} - Deletion result
 */
export async function deletePost(id) {
  try {
    // Delete associated tags
    await deleteRecord(POST_TAGS_TABLE, { post_id: id });
    
    // Delete associated comments
    await deleteRecord(COMMENTS_TABLE, { post_id: id });
    
    // Delete the post
    return await deleteRecord(POSTS_TABLE, { id });
  } catch (error) {
    console.error(`Error deleting post:`, error);
    return { data: null, error };
  }
}

/**
 * Add a comment to a post
 * @param {Object} comment - Comment data
 * @returns {Promise} - New comment
 */
export async function addComment(comment) {
  return await insertRecord(COMMENTS_TABLE, { 
    ...comment, 
    created_at: new Date().toISOString() 
  });
}

/**
 * Delete a comment
 * @param {number|string} id - Comment ID
 * @returns {Promise} - Deletion result
 */
export async function deleteComment(id) {
  return await deleteRecord(COMMENTS_TABLE, { id });
}

/**
 * Fetch all Q&A questions with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise} - Questions data
 */
export async function getQuestions(options = {}) {
  return await fetchData(QUESTIONS_TABLE, options);
}

/**
 * Fetch a single question by ID
 * @param {number|string} id - Question ID
 * @returns {Promise} - Question data with answers
 */
export async function getQuestionById(id) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(QUESTIONS_TABLE)
      .select(`
        *,
        answers:${ANSWERS_TABLE}(
          *,
          user:profiles(id, first_name, last_name, avatar_url)
        ),
        user:profiles(id, first_name, last_name, avatar_url),
        tags:${QUESTION_TAGS_TABLE}(
          tag:${TAGS_TABLE}(id, name)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Format the tags
    if (data && data.tags) {
      data.tags = data.tags.map(tagItem => tagItem.tag);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching question by ID:`, error);
    return { data: null, error };
  }
}

/**
 * Create a new question
 * @param {Object} question - Question data
 * @param {Array} tags - Array of tag IDs
 * @returns {Promise} - New question
 */
export async function createQuestion(question, tags = []) {
  try {
    const { data: newQuestion, error } = await insertRecord(QUESTIONS_TABLE, { 
      ...question, 
      created_at: new Date().toISOString() 
    });
    
    if (error) throw error;
    
    // Add tags if any
    if (tags.length > 0 && newQuestion) {
      const questionId = newQuestion[0].id;
      
      const tagPromises = tags.map(tagId => 
        insertRecord(QUESTION_TAGS_TABLE, { 
          question_id: questionId, 
          tag_id: tagId 
        })
      );
      
      await Promise.all(tagPromises);
    }
    
    return { data: newQuestion, error: null };
  } catch (error) {
    console.error(`Error creating question:`, error);
    return { data: null, error };
  }
}

/**
 * Update a question
 * @param {number|string} id - Question ID
 * @param {Object} updates - Fields to update
 * @param {Array} tags - New array of tag IDs (optional)
 * @returns {Promise} - Updated question
 */
export async function updateQuestion(id, updates, tags = null) {
  try {
    const { data: updatedQuestion, error } = await updateRecord(QUESTIONS_TABLE, { 
      ...updates, 
      updated_at: new Date().toISOString() 
    }, { id });
    
    if (error) throw error;
    
    // Update tags if provided
    if (tags !== null) {
      // Delete existing tags
      await deleteRecord(QUESTION_TAGS_TABLE, { question_id: id });
      
      // Add new tags
      if (tags.length > 0) {
        const tagPromises = tags.map(tagId => 
          insertRecord(QUESTION_TAGS_TABLE, { 
            question_id: id, 
            tag_id: tagId 
          })
        );
        
        await Promise.all(tagPromises);
      }
    }
    
    return { data: updatedQuestion, error: null };
  } catch (error) {
    console.error(`Error updating question:`, error);
    return { data: null, error };
  }
}

/**
 * Add an answer to a question
 * @param {Object} answer - Answer data
 * @returns {Promise} - New answer
 */
export async function addAnswer(answer) {
  return await insertRecord(ANSWERS_TABLE, { 
    ...answer, 
    created_at: new Date().toISOString() 
  });
}

/**
 * Mark an answer as accepted
 * @param {number|string} questionId - Question ID
 * @param {number|string} answerId - Answer ID
 * @returns {Promise} - Updated question
 */
export async function acceptAnswer(questionId, answerId) {
  return await updateRecord(QUESTIONS_TABLE, { 
    accepted_answer_id: answerId,
    updated_at: new Date().toISOString() 
  }, { id: questionId });
}

/**
 * Get forum categories
 * @returns {Promise} - Categories data
 */
export async function getForumCategories() {
  return await fetchData(CATEGORIES_TABLE, {
    orderBy: 'name'
  });
}

/**
 * Get popular tags
 * @param {number} limit - Number of tags to fetch
 * @returns {Promise} - Popular tags
 */
export async function getPopularTags(limit = 10) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    // This would be better implemented with a stored procedure or custom function
    // For now, we'll get all tags and sort them client-side
    const { data, error } = await supabase
      .from(TAGS_TABLE)
      .select('*');
    
    if (error) throw error;
    
    // In a real implementation, we would use a more sophisticated count mechanism
    return { data: data.slice(0, limit), error: null };
  } catch (error) {
    console.error(`Error fetching popular tags:`, error);
    return { data: null, error };
  }
}

/**
 * Search community content
 * @param {string} query - Search query
 * @param {string} type - Content type ('posts' or 'questions')
 * @param {number} limit - Number of results to return
 * @returns {Promise} - Search results
 */
export async function searchCommunityContent(query, type = 'all', limit = 20) {
  try {
    // Determine which tables to search based on type
    let tables = [];
    if (type === 'all' || type === 'posts') {
      tables.push(POSTS_TABLE);
    }
    if (type === 'all' || type === 'questions') {
      tables.push(QUESTIONS_TABLE);
    }
    
    // Execute search queries
    const searchPromises = tables.map(table => 
      searchRecords(table, query, ['title', 'content'], limit)
    );
    
    const results = await Promise.all(searchPromises);
    
    // Combine and format results
    const allResults = results.reduce((combined, result) => {
      if (result.data) {
        combined.push(...result.data);
      }
      return combined;
    }, []);
    
    return { data: allResults.slice(0, limit), error: null };
  } catch (error) {
    console.error(`Error searching community content:`, error);
    return { data: null, error };
  }
}

/**
 * Like/Unlike a post
 * @param {number|string} postId - Post ID
 * @param {string} userId - User ID
 * @returns {Promise} - Like result
 */
export async function togglePostLike(postId, userId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    // Check if user already liked the post
    const { data: existingLike, error: checkError } = await supabase
      .from(POST_LIKES_TABLE)
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingLike) {
      // Unlike the post
      const { error } = await supabase
        .from(POST_LIKES_TABLE)
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      
      return { data: { liked: false }, error };
    } else {
      // Like the post
      const { error } = await supabase
        .from(POST_LIKES_TABLE)
        .insert({ post_id: postId, user_id: userId });
      
      return { data: { liked: true }, error };
    }
  } catch (error) {
    console.error('Error toggling post like:', error);
    return { data: null, error };
  }
}

/**
 * Like/Unlike a comment
 * @param {number|string} commentId - Comment ID
 * @param {string} userId - User ID
 * @returns {Promise} - Like result
 */
export async function toggleCommentLike(commentId, userId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    // Check if user already liked the comment
    const { data: existingLike, error: checkError } = await supabase
      .from(COMMENT_LIKES_TABLE)
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingLike) {
      // Unlike the comment
      const { error } = await supabase
        .from(COMMENT_LIKES_TABLE)
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId);
      
      return { data: { liked: false }, error };
    } else {
      // Like the comment
      const { error } = await supabase
        .from(COMMENT_LIKES_TABLE)
        .insert({ comment_id: commentId, user_id: userId });
      
      return { data: { liked: true }, error };
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    return { data: null, error };
  }
}

/**
 * Get upcoming community events
 * @param {number} limit - Number of events to fetch
 * @returns {Promise} - Events data
 */
export async function getUpcomingEvents(limit = 5) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(EVENTS_TABLE)
      .select(`
        *,
        organizer:profiles(id, first_name, last_name, avatar_url),
        category:${CATEGORIES_TABLE}(id, name, color_hex),
        participants_count:${EVENT_PARTICIPANTS_TABLE}(count)
      `)
      .eq('status', 'upcoming')
      .gte('start_datetime', new Date().toISOString())
      .order('start_datetime', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    
    return { 
      data: data?.map(event => ({
        ...event,
        participants_count: event.participants_count?.length || 0
      })) || [], 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return { data: [], error };
  }
}

/**
 * Get user's community stats for dashboard
 * @param {string} userId - User ID
 * @returns {Promise} - User community stats
 */
export async function getUserCommunityStats(userId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    // Get post count
    const { count: postsCount } = await supabase
      .from(POSTS_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'published');
    
    // Get question count
    const { count: questionsCount } = await supabase
      .from(QUESTIONS_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    // Get answer count
    const { count: answersCount } = await supabase
      .from(ANSWERS_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    // Get user reputation
    const { data: reputation } = await supabase
      .from(USER_REPUTATION_TABLE)
      .select('total_points, expert_level, badges')
      .eq('user_id', userId)
      .single();
    
    // Get unread notifications count
    const { count: notificationsCount } = await supabase
      .from(NOTIFICATIONS_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    return {
      data: {
        posts_created: postsCount || 0,
        questions_asked: questionsCount || 0,
        answers_given: answersCount || 0,
        reputation_points: reputation?.total_points || 0,
        expert_level: reputation?.expert_level || 'beginner',
        badges_count: reputation?.badges?.length || 0,
        unread_notifications: notificationsCount || 0
      },
      error: null
    };
  } catch (error) {
    console.error('Error fetching user community stats:', error);
    return { data: null, error };
  }
}

/**
 * Get recent community activity for dashboard
 * @param {number} limit - Number of items to fetch
 * @returns {Promise} - Recent activity data
 */
export async function getRecentCommunityActivity(limit = 10) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    // Get recent posts
    const { data: recentPosts } = await supabase
      .from(POSTS_TABLE)
      .select(`
        id, title, content, created_at, post_type, likes, views,
        user:profiles(id, first_name, last_name, avatar_url),
        category:${CATEGORIES_TABLE}(name, color_hex),
        comments_count:${COMMENTS_TABLE}(count),
        likes_count:${POST_LIKES_TABLE}(count)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(Math.ceil(limit / 2));
    
    // Get recent questions
    const { data: recentQuestions } = await supabase
      .from(QUESTIONS_TABLE)
      .select(`
        id, title, content, created_at, status, views,
        user:profiles(id, first_name, last_name, avatar_url),
        category:${CATEGORIES_TABLE}(name, color_hex),
        answers_count:${ANSWERS_TABLE}(count)
      `)
      .order('created_at', { ascending: false })
      .limit(Math.ceil(limit / 2));
    
    // Combine and sort by date
    const allActivity = [
      ...(recentPosts?.map(post => ({ 
        ...post, 
        type: 'post',
        comments_count: post.comments_count?.length || 0,
        likes: post.likes_count?.length || post.likes || 0
      })) || []),
      ...(recentQuestions?.map(question => ({ 
        ...question, 
        type: 'question',
        comments_count: question.answers_count?.length || 0,
        likes: 0 // Questions don't have likes in our schema
      })) || [])
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
     .slice(0, limit);
    
    return { data: allActivity, error: null };
  } catch (error) {
    console.error('Error fetching recent community activity:', error);
    return { data: [], error };
  }
}

/**
 * Get trending topics (popular tags)
 * @param {number} limit - Number of tags to fetch
 * @returns {Promise} - Trending tags
 */
export async function getTrendingTopics(limit = 10) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from('v_trending_topics') // Using the view we created
      .select('*')
      .limit(limit);
    
    if (error) {
      // Fallback to regular tags if view doesn't exist
      const { data: fallbackData } = await supabase
        .from(TAGS_TABLE)
        .select('*')
        .order('usage_count', { ascending: false })
        .limit(limit);
      
      return { data: fallbackData || [], error: null };
    }
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return { data: [], error };
  }
}

/**
 * Bookmark/Unbookmark a post
 * @param {number|string} postId - Post ID
 * @param {string} userId - User ID
 * @returns {Promise} - Bookmark result
 */
export async function togglePostBookmark(postId, userId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    // Check if user already bookmarked the post
    const { data: existingBookmark, error: checkError } = await supabase
      .from(POST_BOOKMARKS_TABLE)
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingBookmark) {
      // Remove bookmark
      const { error } = await supabase
        .from(POST_BOOKMARKS_TABLE)
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      
      return { data: { bookmarked: false }, error };
    } else {
      // Add bookmark
      const { error } = await supabase
        .from(POST_BOOKMARKS_TABLE)
        .insert({ post_id: postId, user_id: userId });
      
      return { data: { bookmarked: true }, error };
    }
  } catch (error) {
    console.error('Error toggling post bookmark:', error);
    return { data: null, error };
  }
}

/**
 * Get user's bookmarked posts
 * @param {string} userId - User ID
 * @param {number} limit - Number of bookmarks to fetch
 * @returns {Promise} - Bookmarked posts
 */
export async function getUserBookmarks(userId, limit = 20) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(POST_BOOKMARKS_TABLE)
      .select(`
        created_at,
        post:${POSTS_TABLE}(
          *,
          user:profiles(id, first_name, last_name, avatar_url),
          category:${CATEGORIES_TABLE}(id, name, color_hex)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return { 
      data: data?.map(bookmark => bookmark.post) || [], 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    return { data: [], error };
  }
}

/**
 * Get user notifications
 * @param {string} userId - User ID
 * @param {number} limit - Number of notifications to fetch
 * @returns {Promise} - User notifications
 */
export async function getUserNotifications(userId, limit = 20) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(NOTIFICATIONS_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return { data: [], error };
  }
}

/**
 * Mark notification as read
 * @param {number|string} notificationId - Notification ID
 * @returns {Promise} - Update result
 */
export async function markNotificationAsRead(notificationId) {
  return await updateRecord(NOTIFICATIONS_TABLE, { 
    is_read: true 
  }, { id: notificationId });
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise} - Update result
 */
export async function markAllNotificationsAsRead(userId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { error } = await supabase
      .from(NOTIFICATIONS_TABLE)
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    return { data: true, error };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { data: null, error };
  }
}

/**
 * Register for an event
 * @param {number|string} eventId - Event ID
 * @param {string} userId - User ID
 * @returns {Promise} - Registration result
 */
export async function registerForEvent(eventId, userId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    // Check if user is already registered
    const { data: existingRegistration, error: checkError } = await supabase
      .from(EVENT_PARTICIPANTS_TABLE)
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingRegistration) {
      return { data: null, error: 'Already registered for this event' };
    }
    
    // Check event capacity and status
    const { data: event, error: eventError } = await supabase
      .from(EVENTS_TABLE)
      .select('max_participants, status')
      .eq('id', eventId)
      .single();
    
    if (eventError) {
      throw eventError;
    }
    
    if (event.status === 'cancelled') {
      return { data: null, error: 'Event has been cancelled' };
    }
    
    // Check if event is full
    if (event.max_participants) {
      const { count } = await supabase
        .from(EVENT_PARTICIPANTS_TABLE)
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);
      
      if (count >= event.max_participants) {
        return { data: null, error: 'Event is full' };
      }
    }
    
    // Register for event
    const { error } = await supabase
      .from(EVENT_PARTICIPANTS_TABLE)
      .insert({ 
        event_id: eventId, 
        user_id: userId,
        registration_date: new Date().toISOString(),
        attendance_status: 'registered'
      });

    if (error) {
      throw error;
    }

    return { data: { registered: true, message: 'Successfully registered' }, error: null };
  } catch (error) {
    console.error('Error registering for event:', error);
    return { data: null, error: error.message || 'Failed to register for event' };
  }
}

/**
 * Unregister from an event
 * @param {number|string} eventId - Event ID
 * @param {string} userId - User ID
 * @returns {Promise} - Unregistration result
 */
export async function unregisterFromEvent(eventId, userId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { error } = await supabase
      .from(EVENT_PARTICIPANTS_TABLE)
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);
    
    return { data: { registered: false, message: 'Successfully unregistered' }, error };
  } catch (error) {
    console.error('Error unregistering from event:', error);
    return { data: null, error: error.message || 'Failed to unregister from event' };
  }
}

/**
 * Check if user is registered for an event
 * @param {number|string} eventId - Event ID
 * @param {string} userId - User ID
 * @returns {Promise} - Registration status
 */
export async function getUserEventRegistration(eventId, userId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from(EVENT_PARTICIPANTS_TABLE)
      .select('id, registration_date, attendance_status')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return { 
      data: { 
        isRegistered: !!data, 
        registration: data 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error checking event registration:', error);
    return { data: { isRegistered: false, registration: null }, error: error.message };
  }
}

/**
 * Add a reaction to a post
 * @param {number|string} postId - Post ID
 * @param {string} userId - User ID
 * @param {string} reactionType - Type of reaction ('like', 'love', 'helpful', etc.)
 * @returns {Promise} - Reaction result
 */
export async function addPostReaction(postId, userId, reactionType = 'like') {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    // Remove any existing reaction from this user on this post
    await supabase
      .from(POST_REACTIONS_TABLE)
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    
    // Add the new reaction
    const { error } = await supabase
      .from(POST_REACTIONS_TABLE)
      .insert({ 
        post_id: postId, 
        user_id: userId, 
        reaction_type: reactionType 
      });
    
    return { data: { reaction: reactionType }, error };
  } catch (error) {
    console.error('Error adding post reaction:', error);
    return { data: null, error };
  }
}

/**
 * Remove a reaction from a post
 * @param {number|string} postId - Post ID
 * @param {string} userId - User ID
 * @returns {Promise} - Reaction removal result
 */
export async function removePostReaction(postId, userId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { error } = await supabase
      .from(POST_REACTIONS_TABLE)
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    
    return { data: { reaction: null }, error };
  } catch (error) {
    console.error('Error removing post reaction:', error);
    return { data: null, error };
  }
}

/**
 * Get community events for a user (organized or participating)
 * @param {string} userId - User ID
 * @param {number} limit - Number of events to fetch
 * @returns {Promise} - User events
 */
export async function getUserEvents(userId, limit = 10) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    // Get events where user is organizer or participant
    const { data: organizerEvents } = await supabase
      .from(EVENTS_TABLE)
      .select(`
        *,
        category:${CATEGORIES_TABLE}(id, name, color_hex),
        participants_count:${EVENT_PARTICIPANTS_TABLE}(count)
      `)
      .eq('organizer_id', userId)
      .order('start_datetime', { ascending: true })
      .limit(Math.ceil(limit / 2));
    
    const { data: participantEvents } = await supabase
      .from(EVENT_PARTICIPANTS_TABLE)
      .select(`
        event:${EVENTS_TABLE}(
          *,
          category:${CATEGORIES_TABLE}(id, name, color_hex),
          participants_count:${EVENT_PARTICIPANTS_TABLE}(count)
        )
      `)
      .eq('user_id', userId)
      .eq('registration_status', 'registered')
      .order('created_at', { ascending: false })
      .limit(Math.ceil(limit / 2));
    
    // Combine and format results
    const allEvents = [
      ...(organizerEvents?.map(event => ({ ...event, role: 'organizer' })) || []),
      ...(participantEvents?.map(item => ({ ...item.event, role: 'participant' })) || [])
    ];
    
    // Remove duplicates and sort
    const uniqueEvents = allEvents
      .filter((event, index, self) => 
        index === self.findIndex(e => e.id === event.id)
      )
      .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
      .slice(0, limit);
    
    return { data: uniqueEvents, error: null };
  } catch (error) {
    console.error('Error fetching user events:', error);
    return { data: [], error };
  }
}

/**
 * Create a new community event
 * @param {Object} eventData - Event information
 * @returns {Promise} - Created event data
 */
export async function createEvent(eventData) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create events');
    }

    // Prepare event data with organizer
    const eventToCreate = {
      ...eventData,
      organizer_id: user.id,
      status: 'upcoming',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create the event
    const { data, error } = await supabase
      .from(EVENTS_TABLE)
      .insert([eventToCreate])
      .select(`
        *,
        organizer:profiles(id, first_name, last_name, avatar_url)
      `)
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating event:', error);
    return { data: null, error };
  }
}

/**
 * Get event participants count
 * @param {number|string} eventId - Event ID
 * @returns {Promise} - Participants count
 */
export async function getEventParticipantsCount(eventId) {
  try {
    const { supabase } = await import('../../lib/supabase/client');
    
    const { count, error } = await supabase
      .from(EVENT_PARTICIPANTS_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);
    
    if (error) {
      throw error;
    }
    
    return { data: count || 0, error: null };
  } catch (error) {
    console.error('Error getting event participants count:', error);
    return { data: 0, error: error.message };
  }
}