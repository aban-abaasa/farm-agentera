import { 
  fetchData, 
  fetchById, 
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

/**
 * Fetch all discussion posts with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise} - Posts data
 */
export async function getPosts(options = {}) {
  return await fetchData(POSTS_TABLE, options);
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