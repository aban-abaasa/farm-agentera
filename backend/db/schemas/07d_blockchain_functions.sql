-- =============================================
-- PART 4: CREATE VERIFICATION FUNCTIONS
-- Run this fourth (after 07c)
-- =============================================

-- Function to verify message integrity
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

-- Function to mark message as blockchain-verified
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

-- Success message
DO $$ BEGIN
  RAISE NOTICE '✅ Part 4 Complete: Verification functions created';
END $$;
