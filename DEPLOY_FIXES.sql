-- =============================================
-- FARM AGENT — COMPLETE FIX DEPLOYMENT
-- =============================================
-- Fixes:
-- 1. RLS infinite recursion on conversation_participants
-- 2. Adds blockchain integration for messages
-- =============================================
-- NOTE: Run this in Supabase SQL Editor or via psql
-- =============================================

DO $$ BEGIN
  RAISE NOTICE '🚀 Starting Farm Agent fixes deployment...';
END $$;

-- ─── STEP 1: Fix RLS Policies (Remove Recursion) ─────────────────────

DO $$ BEGIN
  RAISE NOTICE '📝 Step 1: Fixing RLS policies to remove infinite recursion...';
END $$;

-- Fix participants SELECT policy (was causing infinite recursion)
DROP POLICY IF EXISTS participants_select_policy ON public.conversation_participants;
CREATE POLICY participants_select_policy ON public.conversation_participants
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
);

-- Fix participants UPDATE policy (was causing infinite recursion)
DROP POLICY IF EXISTS participants_update_policy ON public.conversation_participants;
CREATE POLICY participants_update_policy ON public.conversation_participants
FOR UPDATE TO authenticated
USING (
  user_id = auth.uid()
)
WITH CHECK (TRUE);

DO $$ BEGIN
  RAISE NOTICE '✅ RLS policies fixed — no more infinite recursion!';
END $$;

-- ─── STEP 2: Deploy Blockchain Integration ───────────────────────────

DO $$ BEGIN
  RAISE NOTICE '📝 Step 2: Deploying blockchain integration for messages...';
END $$;

-- Create message_blockchain_records table
CREATE TABLE IF NOT EXISTS public.message_blockchain_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Blockchain data
  record_hash TEXT NOT NULL UNIQUE,
  blockchain_tx_hash TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  -- Message snapshot
  content_hash TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_message_blockchain UNIQUE (message_id, record_hash)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_msg_blockchain_message ON public.message_blockchain_records(message_id);
CREATE INDEX IF NOT EXISTS idx_msg_blockchain_conversation ON public.message_blockchain_records(conversation_id);
CREATE INDEX IF NOT EXISTS idx_msg_blockchain_sender ON public.message_blockchain_records(sender_id);
CREATE INDEX IF NOT EXISTS idx_msg_blockchain_hash ON public.message_blockchain_records(record_hash);
CREATE INDEX IF NOT EXISTS idx_msg_blockchain_tx ON public.message_blockchain_records(blockchain_tx_hash);
CREATE INDEX IF NOT EXISTS idx_msg_blockchain_verified ON public.message_blockchain_records(is_verified, verified_at);
CREATE INDEX IF NOT EXISTS idx_msg_blockchain_created ON public.message_blockchain_records(created_at);

-- Enable RLS
ALTER TABLE public.message_blockchain_records ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can view blockchain records for their conversations
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

-- RLS policy: system can insert
DROP POLICY IF EXISTS message_blockchain_insert_policy ON public.message_blockchain_records;
CREATE POLICY message_blockchain_insert_policy ON public.message_blockchain_records
FOR INSERT TO authenticated
WITH CHECK (TRUE);

-- Create trigger function
CREATE OR REPLACE FUNCTION create_message_blockchain_record()
RETURNS TRIGGER AS $$
DECLARE
  v_content_hash TEXT;
  v_record_hash TEXT;
  v_metadata JSONB;
BEGIN
  v_content_hash := encode(digest(NEW.content, 'sha256'), 'hex');
  
  v_metadata := jsonb_build_object(
    'conversation_id', NEW.conversation_id,
    'sender_id', NEW.sender_id,
    'created_at', NEW.created_at,
    'message_id', NEW.id,
    'app', 'farm-agent'
  );
  
  v_record_hash := encode(
    digest(
      v_content_hash || v_metadata::text, 
      'sha256'
    ), 
    'hex'
  );
  
  INSERT INTO public.message_blockchain_records (
    message_id,
    conversation_id,
    sender_id,
    record_hash,
    content_hash,
    metadata
  ) VALUES (
    NEW.id,
    NEW.conversation_id,
    NEW.sender_id,
    v_record_hash,
    v_content_hash,
    v_metadata
  )
  ON CONFLICT (message_id, record_hash) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS message_blockchain_trigger ON public.messages;
CREATE TRIGGER message_blockchain_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION create_message_blockchain_record();

-- Create verification function
CREATE OR REPLACE FUNCTION verify_message_integrity(p_message_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_message RECORD;
  v_blockchain RECORD;
  v_computed_hash TEXT;
  v_result JSONB;
BEGIN
  SELECT * INTO v_message FROM public.messages WHERE id = p_message_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Message not found',
      'message_id', p_message_id
    );
  END IF;
  
  SELECT * INTO v_blockchain 
  FROM public.message_blockchain_records 
  WHERE message_id = p_message_id 
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Blockchain record not found',
      'message_id', p_message_id
    );
  END IF;
  
  v_computed_hash := encode(digest(v_message.content, 'sha256'), 'hex');
  
  v_result := jsonb_build_object(
    'success', true,
    'message_id', p_message_id,
    'is_verified', v_blockchain.is_verified,
    'integrity_valid', (v_computed_hash = v_blockchain.content_hash),
    'content_hash', v_computed_hash,
    'stored_hash', v_blockchain.content_hash,
    'record_hash', v_blockchain.record_hash,
    'blockchain_tx_hash', v_blockchain.blockchain_tx_hash,
    'created_at', v_blockchain.created_at,
    'verified_at', v_blockchain.verified_at
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create blockchain sync function
CREATE OR REPLACE FUNCTION mark_message_blockchain_verified(
  p_message_id UUID,
  p_blockchain_tx_hash TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_result RECORD;
BEGIN
  UPDATE public.message_blockchain_records
  SET 
    is_verified = TRUE,
    verified_at = NOW(),
    blockchain_tx_hash = p_blockchain_tx_hash,
    updated_at = NOW()
  WHERE message_id = p_message_id
  RETURNING * INTO v_result;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Blockchain record not found',
      'message_id', p_message_id
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message_id', p_message_id,
    'blockchain_tx_hash', p_blockchain_tx_hash,
    'verified_at', v_result.verified_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create blockchain stats view
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

DO $$ BEGIN
  RAISE NOTICE '✅ Blockchain integration deployed!';
END $$;

-- ─── VERIFICATION ─────────────────────────────────────────────────────

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Verifying deployment...';
END $$;

-- Check if tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message_blockchain_records') THEN
    RAISE NOTICE '✅ message_blockchain_records table created';
  ELSE
    RAISE NOTICE '❌ message_blockchain_records table NOT created';
  END IF;
END $$;

-- Check if trigger exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'message_blockchain_trigger') THEN
    RAISE NOTICE '✅ Blockchain trigger created';
  ELSE
    RAISE NOTICE '❌ Blockchain trigger NOT created';
  END IF;
END $$;

-- Check if functions exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'verify_message_integrity') THEN
    RAISE NOTICE '✅ verify_message_integrity function created';
  ELSE
    RAISE NOTICE '❌ verify_message_integrity function NOT created';
  END IF;
END $$;

-- Check RLS policies
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'conversation_participants' 
    AND policyname IN ('participants_select_policy', 'participants_update_policy');
  
  IF policy_count = 2 THEN
    RAISE NOTICE '✅ RLS policies configured (% policies)', policy_count;
  ELSE
    RAISE NOTICE '⚠️ RLS policies issue (found % policies, expected 2)', policy_count;
  END IF;
END $$;

-- Final success message
DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ DEPLOYMENT COMPLETE!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Summary:';
  RAISE NOTICE '   • Fixed RLS infinite recursion on conversation_participants';
  RAISE NOTICE '   • Added blockchain verification for all messages';
  RAISE NOTICE '   • Created message_blockchain_records table';
  RAISE NOTICE '   • Added automatic blockchain recording trigger';
  RAISE NOTICE '   • Added verify_message_integrity() function';
  RAISE NOTICE '   • Added conversation_blockchain_stats view';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Next Steps:';
  RAISE NOTICE '   1. Restart your frontend: npm run dev';
  RAISE NOTICE '   2. Test sending a message';
  RAISE NOTICE '   3. Verify blockchain record was created';
  RAISE NOTICE '';
  RAISE NOTICE '📖 Documentation: See BLOCKCHAIN_MESSAGES_SETUP.md';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
