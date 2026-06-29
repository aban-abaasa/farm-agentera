-- =============================================
-- PART 3: CREATE TRIGGER FUNCTION
-- Run this third (after 07b)
-- =============================================

-- Automatically create blockchain record when message is inserted
CREATE OR REPLACE FUNCTION create_message_blockchain_record()
RETURNS TRIGGER AS $$
DECLARE
  v_content_hash TEXT;
  v_record_hash TEXT;
  v_metadata JSONB;
BEGIN
  -- Generate content hash
  v_content_hash := encode(digest(NEW.content, 'sha256'), 'hex');
  
  -- Build metadata
  v_metadata := jsonb_build_object(
    'conversation_id', NEW.conversation_id,
    'sender_id', NEW.sender_id,
    'created_at', NEW.created_at,
    'message_id', NEW.id,
    'app', 'farm-agent'
  );
  
  -- Generate record hash
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

-- Create trigger
DROP TRIGGER IF EXISTS message_blockchain_trigger ON public.messages;
CREATE TRIGGER message_blockchain_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION create_message_blockchain_record();

-- Success message
DO $$ BEGIN
  RAISE NOTICE '✅ Part 3 Complete: Trigger function created';
END $$;
