/**
 * Blockchain Message Service — BACKBONE
 * Handles blockchain verification for messages
 * Part of Icaneracoin ecosystem
 */

import { supabase } from '../lib/supabase/client';

/**
 * Verify message integrity against blockchain record
 * @param {string} messageId - UUID of the message to verify
 * @returns {Promise<Object>} Verification result
 */
export const verifyMessageIntegrity = async (messageId) => {
  try {
    const { data, error } = await supabase.rpc('verify_message_integrity', {
      p_message_id: messageId,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error verifying message integrity:', error);
    return { data: null, error };
  }
};

/**
 * Get blockchain records for a conversation
 * @param {string} conversationId - UUID of the conversation
 * @returns {Promise<Object>} Blockchain records
 */
export const getConversationBlockchainRecords = async (conversationId) => {
  try {
    const { data, error } = await supabase
      .from('message_blockchain_records')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching blockchain records:', error);
    return { data: null, error };
  }
};

/**
 * Get blockchain statistics for a conversation
 * @param {string} conversationId - UUID of the conversation
 * @returns {Promise<Object>} Blockchain statistics
 */
export const getConversationBlockchainStats = async (conversationId) => {
  try {
    const { data, error } = await supabase
      .from('conversation_blockchain_stats')
      .select('*')
      .eq('conversation_id', conversationId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { data: data || { total_messages: 0, verified_messages: 0, pending_verification: 0 }, error: null };
  } catch (error) {
    console.error('Error fetching blockchain stats:', error);
    return { data: null, error };
  }
};

/**
 * Get blockchain record for a specific message
 * @param {string} messageId - UUID of the message
 * @returns {Promise<Object>} Blockchain record
 */
export const getMessageBlockchainRecord = async (messageId) => {
  try {
    const { data, error } = await supabase
      .from('message_blockchain_records')
      .select('*')
      .eq('message_id', messageId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching message blockchain record:', error);
    return { data: null, error };
  }
};

/**
 * Check if all messages in a conversation are blockchain verified
 * @param {string} conversationId - UUID of the conversation
 * @returns {Promise<boolean>} True if all verified
 */
export const isConversationFullyVerified = async (conversationId) => {
  try {
    const stats = await getConversationBlockchainStats(conversationId);
    
    if (!stats.data || stats.error) return false;
    
    return stats.data.total_messages === stats.data.verified_messages && 
           stats.data.total_messages > 0;
  } catch (error) {
    console.error('Error checking conversation verification:', error);
    return false;
  }
};

/**
 * Subscribe to blockchain record changes for a conversation
 * @param {string} conversationId - UUID of the conversation
 * @param {Function} callback - Callback function when records change
 * @returns {Object} Subscription object
 */
export const subscribeToBlockchainRecords = (conversationId, callback) => {
  return supabase
    .channel(`blockchain:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'message_blockchain_records',
        filter: `conversation_id=eq.${conversationId}`,
      },
      callback
    )
    .subscribe();
};

export default {
  verifyMessageIntegrity,
  getConversationBlockchainRecords,
  getConversationBlockchainStats,
  getMessageBlockchainRecord,
  isConversationFullyVerified,
  subscribeToBlockchainRecords,
};
