-- =============================================
-- PART 2: CREATE RLS POLICIES
-- Run this second (after 07a)
-- =============================================

-- Users can view blockchain records for their conversations
DROP POLICY IF EXISTS message_blockchain_select_policy ON public.message_blockchain_records;
CREATE POLICY message_blockchain_select_policy ON public.message_blockchain_records
FOR SELECT TO authenticated
USING (
  sender_id = auth.uid() 
  OR conversation_id IN (
    SELECT cp.conversation_id 
    FROM public.conversation_participants cp
    WHERE cp.user_id = auth.uid() 
      AND cp.is_deleted = FALSE
  )
);

-- System can insert blockchain records
DROP POLICY IF EXISTS message_blockchain_insert_policy ON public.message_blockchain_records;
CREATE POLICY message_blockchain_insert_policy ON public.message_blockchain_records
FOR INSERT TO authenticated
WITH CHECK (TRUE);

-- Success message
DO $$ BEGIN
  RAISE NOTICE '✅ Part 2 Complete: RLS policies created';
END $$;
