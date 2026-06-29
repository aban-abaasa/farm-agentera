-- =============================================
-- PART 1: CREATE BLOCKCHAIN TABLES & INDEXES
-- Run this first
-- =============================================

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

-- Success message
DO $$ BEGIN
  RAISE NOTICE '✅ Part 1 Complete: Tables and indexes created';
END $$;
