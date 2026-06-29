-- =============================================
-- BLOCKCHAIN INTEGRATION FOR MESSAGES
-- Farm Agent Application - Icaneracoin Ecosystem
-- =============================================
-- Purpose: Add blockchain verification for message integrity
-- Ensures all messages are immutably recorded on blockchain

-- ─── MESSAGE BLOCKCHAIN RECORDS TABLE ─────────────────────────────────

CREATE TABLE IF NOT EXISTS public.message_blockchain_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Blockchain data
  record_hash TEXT NOT NULL UNIQUE, -- SHA256 hash of message content + metadata
  blockchain_tx_hash TEXT, -- Transaction hash on blockchain (if synced)
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  -- Message snapshot for verification
  content_hash TEXT NOT NULL, -- Hash of message content
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata (timestamp, sender, etc)
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_message_blockchain UNIQUE (message_id, record_hash)
);

-- ─── INDEXES ──────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_msg_blockchain_message ON public.message_blockchain_records(message_id);
CREATE INDEX IF NOT EXISTS idx_msg_blockchain_conversation ON public.message_blockchain_records(conversation_id);
CREATE INDEX IF NOT EXISTS idx_msg_blockchain_sender ON public.message_blockchain_records(sender_id);
CREATE INDEX IF NOT EXISTS idx_msg_blockchain_hash ON public.message_blockchain_records(record_hash);
CREATE INDEX IF NOT EXISTS idx_msg_blockchain_tx ON public.message_blockchain_records(blockchain_tx_hash);
CREATE INDEX IF NOT EXISTS idx_msg_blockchain_verified ON public.message_blockchain_records(is_verified, verified_at);
CREATE INDEX IF NOT EXISTS idx_msg_blockchain_created ON public.message_blockchain_records(created_at);

-- ─── RLS POLICIES ─────────────────────────────────────────────────────

ALTER TABLE public.message_blockchain_records ENABLE ROW LEVEL SECURITY;

-- Users can view blockchain records for their own messages or conversations they're part of
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

-- System can insert blockchain records (triggered automatically)
DROP POLICY IF EXISTS message_blockchain_insert_policy ON public.message_blockchain_records;
CREATE POLICY message_blockchain_insert_policy ON public.message_blockchain_records
FOR INSERT TO authenticated
WITH CHECK (TRUE);

-- ─── TRIGGER FUNCTION ─────────────────────────────────────────────────

-- Automatically create blockchain record when message is inserted
CREATE OR REPLACE FUNCTION create_message_blockchain_record()
RETURNS TRIGGER AS $$
DECLARE
  v_content_hash TEXT;
  v_record_hash TEXT;
  v_metadata JSONB;
BEGIN
  -- Generate content hash (SHA256 of message content)
  v_content_hash := encode(digest(NEW.content, 'sha256'), 'hex');
  
  -- Build metadata
  v_metadata := jsonb_build_object(
    'conversation_id', NEW.conversation_id,
    'sender_id', NEW.sender_id,
    'created_at', NEW.created_at,
    'message_id', NEW.id,
    'app', 'farm-agent'
  );
  
  -- Generate record hash (SHA256 of content_hash + metadata)
  v_record_hash := encode(
    digest(
      v_content_hash || v_metadata::text, 
      'sha256'
    ), 
    'hex'
  );
  
  -- Insert blockchain record
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

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS message_blockchain_trigger ON public.messages;
CREATE TRIGGER message_blockchain_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION create_message_blockchain_record();

-- ─── VERIFICATION FUNCTION ────────────────────────────────────────────

-- Function to verify message integrity against blockchain record
CREATE OR REPLACE FUNCTION verify_message_integrity(p_message_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_message RECORD;
  v_blockchain RECORD;
  v_computed_hash TEXT;
  v_result JSONB;
BEGIN
  -- Get message
  SELECT * INTO v_message FROM public.messages WHERE id = p_message_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Message not found',
      'message_id', p_message_id
    );
  END IF;
  
  -- Get blockchain record
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
  
  -- Compute current content hash
  v_computed_hash := encode(digest(v_message.content, 'sha256'), 'hex');
  
  -- Verify integrity
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

-- ─── BLOCKCHAIN SYNC FUNCTION ─────────────────────────────────────────

-- Function to mark message as blockchain-verified (called by external blockchain sync service)
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

-- ─── CONVERSATION BLOCKCHAIN VIEW ─────────────────────────────────────

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

-- ─── GRANTS ───────────────────────────────────────────────────────────

GRANT SELECT ON public.message_blockchain_records TO authenticated;
GRANT SELECT ON conversation_blockchain_stats TO authenticated;
GRANT EXECUTE ON FUNCTION verify_message_integrity(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_message_blockchain_verified(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION create_message_blockchain_record() TO authenticated;

-- ─── COMMENTS ─────────────────────────────────────────────────────────

COMMENT ON TABLE public.message_blockchain_records IS 'Blockchain verification records for messages - ensures message integrity across the Icaneracoin ecosystem';
COMMENT ON FUNCTION verify_message_integrity(UUID) IS 'Verify message integrity against blockchain record';
COMMENT ON FUNCTION mark_message_blockchain_verified(UUID, TEXT) IS 'Mark message as verified on blockchain (called by sync service)';
COMMENT ON VIEW conversation_blockchain_stats IS 'Blockchain verification statistics per conversation';

-- ─── SUCCESS MESSAGE ──────────────────────────────────────────────────

DO $$
BEGIN
  RAISE NOTICE '✅ Message blockchain integration deployed successfully';
  RAISE NOTICE '📝 All new messages will automatically create blockchain records';
  RAISE NOTICE '🔐 Message integrity can be verified via verify_message_integrity()';
  RAISE NOTICE '⛓️ External blockchain sync service can mark messages as verified';
END $$;
