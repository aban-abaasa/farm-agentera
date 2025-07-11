import { supabase } from '../../lib/supabase/client';
import { getCurrentUser } from './authService';

/**
 * Get conversations for the current user
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of conversations to return
 * @param {number} options.offset - Number of conversations to skip
 * @returns {Promise<Object>} - Conversations data and error if any
 */
export const getConversations = async (options = {}) => {
  try {
    const { limit = 20, offset = 0 } = options;

    // Get conversations from the conversation_summaries view
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversation_summaries')
      .select('*')
      .order('last_message_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (conversationsError) throw conversationsError;

    if (!conversations || conversations.length === 0) {
      return { data: [], error: null };
    }

    // Get conversation IDs
    const conversationIds = conversations.map(c => c.conversation_id);

    // Get participants for these conversations
    const { data: participants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        user_id,
        is_admin,
        joined_at,
        last_read_at,
        profiles:user_id (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .in('conversation_id', conversationIds)
      .eq('is_deleted', false);

    if (participantsError) throw participantsError;

    // Get unread counts for each conversation
    const { data: unreadData, error: unreadError } = await supabase
      .from('unread_message_counts')
      .select('conversation_id, unread_count');

    if (unreadError) throw unreadError;

    // Combine the data
    const conversationsWithData = conversations.map(conversation => {
      const conversationParticipants = participants.filter(p => p.conversation_id === conversation.conversation_id);
      const unreadInfo = unreadData.find(u => u.conversation_id === conversation.conversation_id) || { unread_count: 0 };
      
      return {
        ...conversation,
        conversation_participants: conversationParticipants,
        unread_count: parseInt(unreadInfo.unread_count || 0)
      };
    });

    return { data: conversationsWithData, error: null };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { data: null, error };
  }
};

/**
 * Get messages for a specific conversation
 * @param {string} conversationId - ID of the conversation
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of messages to return
 * @param {number} options.offset - Number of messages to skip
 * @returns {Promise<Object>} - Messages data and error if any
 */
export const getMessages = async (conversationId, options = {}) => {
  try {
    const { limit = 50, offset = 0 } = options;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        is_edited,
        sender_id,
        profiles:sender_id (
          id,
          first_name,
          last_name,
          avatar_url
        ),
        message_attachments (
          id,
          file_url,
          file_type,
          file_name,
          file_size
        )
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { data: null, error };
  }
};

/**
 * Send a new message in a conversation
 * @param {string} conversationId - ID of the conversation
 * @param {string} content - Message content
 * @param {Array} attachments - Array of attachment objects
 * @returns {Promise<Object>} - New message data and error if any
 */
export const sendMessage = async (conversationId, content, attachments = []) => {
  try {
    // Get current user ID
    const { data, error: userError } = await getCurrentUser();
    if (userError || !data.user) throw new Error('User not authenticated');
    
    const user = data.user;

    // Insert the message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content
      })
      .select();

    if (messageError) throw messageError;

    // If there are attachments, add them
    if (attachments.length > 0 && messageData[0]) {
      const messageId = messageData[0].id;
      const attachmentRecords = attachments.map(attachment => ({
        message_id: messageId,
        file_url: attachment.url,
        file_type: attachment.type,
        file_name: attachment.name,
        file_size: attachment.size
      }));

      const { error: attachmentError } = await supabase
        .from('message_attachments')
        .insert(attachmentRecords);

      if (attachmentError) throw attachmentError;
    }

    return { data: messageData[0], error: null };
  } catch (error) {
    console.error('Error sending message:', error);
    return { data: null, error };
  }
};

/**
 * Create a new direct conversation with another user
 * @param {string} otherUserId - ID of the user to start conversation with
 * @param {string} initialMessage - First message content (optional)
 * @returns {Promise<Object>} - New conversation data and error if any
 */
export const createDirectConversation = async (otherUserId, initialMessage = null) => {
  try {
    // Get current user ID
    const { data, error: userError } = await getCurrentUser();
    if (userError || !data.user) throw new Error('User not authenticated');
    
    const user = data.user;

    // Call the function to create a direct conversation
    const { data: conversationData, error } = await supabase
      .rpc('create_direct_conversation', {
        user1_id: user.id,
        user2_id: otherUserId,
        initial_message: initialMessage
      });

    if (error) throw error;

    return { data: conversationData, error: null };
  } catch (error) {
    console.error('Error creating direct conversation:', error);
    return { data: null, error };
  }
};

/**
 * Create a new group conversation
 * @param {string} title - Group conversation title
 * @param {Array<string>} participantIds - Array of user IDs to include in the group
 * @param {string} initialMessage - First message content (optional)
 * @returns {Promise<Object>} - New conversation data and error if any
 */
export const createGroupConversation = async (title, participantIds, initialMessage = null) => {
  try {
    // Get current user ID
    const { data, error: userError } = await getCurrentUser();
    if (userError || !data.user) throw new Error('User not authenticated');
    
    const user = data.user;

    // Call the function to create a group conversation
    const { data: conversationData, error } = await supabase
      .rpc('create_group_conversation', {
        creator_id: user.id,
        group_title: title,
        participant_ids: participantIds,
        initial_message: initialMessage
      });

    if (error) throw error;

    return { data: conversationData, error: null };
  } catch (error) {
    console.error('Error creating group conversation:', error);
    return { data: null, error };
  }
};

/**
 * Mark all messages in a conversation as read
 * @param {string} conversationId - ID of the conversation
 * @returns {Promise<Object>} - Result and error if any
 */
export const markConversationAsRead = async (conversationId) => {
  try {
    // Get current user ID
    const { data, error: userError } = await getCurrentUser();
    if (userError || !data.user) throw new Error('User not authenticated');
    
    const user = data.user;

    // Call the function to mark messages as read
    const { error } = await supabase
      .rpc('mark_messages_as_read', {
        p_user_id: user.id,
        p_conversation_id: conversationId
      });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    return { success: false, error };
  }
};

/**
 * Get total count of unread messages across all conversations
 * @returns {Promise<Object>} - Count data and error if any
 */
export const getUnreadMessageCount = async () => {
  try {
    // Get current user ID
    const { data, error: userError } = await getCurrentUser();
    if (userError || !data.user) throw new Error('User not authenticated');
    
    const user = data.user;

    const { data: unreadData, error } = await supabase
      .from('unread_message_counts')
      .select('unread_count')
      .eq('user_id', user.id);

    if (error) throw error;

    // Sum up all unread counts
    const totalUnread = unreadData.reduce((sum, item) => sum + parseInt(item.unread_count || 0), 0);

    return { count: totalUnread, error: null };
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return { count: 0, error };
  }
};

/**
 * Delete a message (soft delete)
 * @param {string} messageId - ID of the message to delete
 * @returns {Promise<Object>} - Result and error if any
 */
export const deleteMessage = async (messageId) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: true })
      .eq('id', messageId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting message:', error);
    return { success: false, error };
  }
};

/**
 * Edit a message
 * @param {string} messageId - ID of the message to edit
 * @param {string} newContent - New message content
 * @returns {Promise<Object>} - Updated message data and error if any
 */
export const editMessage = async (messageId, newContent) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ 
        content: newContent,
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select();

    if (error) throw error;

    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error editing message:', error);
    return { data: null, error };
  }
};

/**
 * Leave a conversation (for group conversations)
 * @param {string} conversationId - ID of the conversation to leave
 * @returns {Promise<Object>} - Result and error if any
 */
export const leaveConversation = async (conversationId) => {
  try {
    // Get current user ID
    const { data, error: userError } = await getCurrentUser();
    if (userError || !data.user) throw new Error('User not authenticated');
    
    const user = data.user;

    const { error } = await supabase
      .from('conversation_participants')
      .update({ is_deleted: true })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error leaving conversation:', error);
    return { success: false, error };
  }
}; 