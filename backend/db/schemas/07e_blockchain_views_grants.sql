-- =============================================
-- PART 5: CREATE VIEWS AND GRANT PERMISSIONS
-- Run this last (after 07d)
-- =============================================

-- View for blockchain statistics per conversation
CREATE OR REPLACE VIEW conversation_blockchain_stats AS
SELECT
  conversation_id,
  COUNT(*) as total_messages,
  COUNT(CASE WHEN is_verified = TRUE THEN 1 END) as verified_messages,
  COUNT(CASE WHEN is_verified = FALSE THEN 1 END) as pending_verification,
  MAX(created_at) as last_blockchain_record_at,
  MAX(verified_at) as last_verified_at
FROM public.message_blockchain_records
GROUP BY conversation_id;

-- Grant permissions
GRANT SELECT ON public.message_blockchain_records TO authenticated;
GRANT SELECT ON conversation_blockchain_stats TO authenticated;
GRANT EXECUTE ON FUNCTION verify_message_integrity(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_message_blockchain_verified(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION create_message_blockchain_record() TO authenticated;

-- Success message
DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ BLOCKCHAIN INTEGRATION COMPLETE!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Part 1: Tables and indexes created';
  RAISE NOTICE '✅ Part 2: RLS policies created';
  RAISE NOTICE '✅ Part 3: Trigger function created';
  RAISE NOTICE '✅ Part 4: Verification functions created';
  RAISE NOTICE '✅ Part 5: Views and permissions granted';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 All messages will now automatically create blockchain records!';
  RAISE NOTICE '📝 Test by sending a message in your app';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
