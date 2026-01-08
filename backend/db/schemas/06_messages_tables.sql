-- MESSAGES SCHEMA
-- This schema defines tables related to the messaging system

-- Enable the uuid-ossp extension if it's not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;

-- Create messages schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS messages;

-- Set the search path to include the messages schema and public (for uuid functions)
SET search_path TO messages, public;

-- Function to generate UUIDs (fallback if extension doesn't work)
CREATE OR REPLACE FUNCTION messages.generate_uuid()
RETURNS uuid AS $$
BEGIN
    -- Try to use the uuid-ossp function if available
    BEGIN
        RETURN public.uuid_generate_v4();
    EXCEPTION WHEN undefined_function THEN
        -- Fallback to a simple random UUID implementation
        RETURN (
            lpad(to_hex(floor(random() * 256)::int), 2, '0') ||
            lpad(to_hex(floor(random() * 256)::int), 2, '0') ||
            lpad(to_hex(floor(random() * 256)::int), 2, '0') ||
            lpad(to_hex(floor(random() * 256)::int), 2, '0') ||
            '-' ||
            lpad(to_hex(floor(random() * 256)::int), 2, '0') ||
            lpad(to_hex(floor(random() * 256)::int), 2, '0') ||
            '-' ||
            lpad(to_hex(floor(random() * 64)::int + 128), 2, '0') ||
            lpad(to_hex(floor(random() * 256)::int), 2, '0') ||
            '-' ||
            lpad(to_hex(floor(random() * 64)::int + 64), 2, '0') ||
            lpad(to_hex(floor(random() * 256)::int), 2, '0') ||
            '-' ||
            lpad(to_hex(floor(random() * 256)::int), 2, '0') ||
            lpad(to_hex(floor(random() * 256)::int), 2, '0') ||
            lpad(to_hex(floor(random() * 256)::int), 2, '0') ||
            lpad(to_hex(floor(random() * 256)::int), 2, '0') ||
            lpad(to_hex(floor(random() * 256)::int), 2, '0') ||
            lpad(to_hex(floor(random() * 256)::int), 2, '0')
        )::uuid;
    END;
END;
$$ LANGUAGE plpgsql;

-- CONVERSATIONS TABLE
-- Stores information about conversations between users
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT messages.generate_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    title TEXT,
    is_group BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Add RLS policies for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- CONVERSATION_PARTICIPANTS TABLE
-- Links users to conversations they are part of
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT messages.generate_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(conversation_id, user_id)
);

-- Add RLS policies for conversation participants
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- MESSAGES TABLE
-- Stores individual messages within conversations
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT messages.generate_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_edited BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Add RLS policies for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- MESSAGE_ATTACHMENTS TABLE
-- Stores files attached to messages
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY DEFAULT messages.generate_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Add RLS policies for message attachments
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- MESSAGE_READS TABLE
-- Tracks when users have read messages
CREATE TABLE IF NOT EXISTS message_reads (
    id UUID PRIMARY KEY DEFAULT messages.generate_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Add RLS policies for message reads
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- INDEXES FOR PERFORMANCE

-- Indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC) WHERE is_deleted = FALSE;

-- Indexes for conversation_participants 
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_conversation_participants_last_read_at ON conversation_participants(conversation_id, last_read_at);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id, created_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC) WHERE is_deleted = FALSE;

-- Indexes for message_attachments
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id) WHERE is_deleted = FALSE;

-- Indexes for message_reads
CREATE INDEX IF NOT EXISTS idx_message_reads_user_message ON message_reads(user_id, message_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_message_id ON message_reads(message_id);

-- VIEWS

-- Create a view for unread message counts
CREATE OR REPLACE VIEW unread_message_counts AS
SELECT
    cp.user_id,
    cp.conversation_id,
    COUNT(m.id) AS unread_count
FROM
    conversation_participants cp
    JOIN messages m ON cp.conversation_id = m.conversation_id
    LEFT JOIN message_reads mr ON m.id = mr.message_id AND mr.user_id = cp.user_id
WHERE
    m.sender_id != cp.user_id
    AND (cp.last_read_at IS NULL OR m.created_at > cp.last_read_at)
    AND mr.id IS NULL
    AND cp.is_deleted = FALSE
    AND m.is_deleted = FALSE
GROUP BY
    cp.user_id, cp.conversation_id;

-- Create a view for conversation summaries with proper joins
CREATE OR REPLACE VIEW conversation_summaries AS
WITH last_messages AS (
    SELECT DISTINCT ON (conversation_id)
        conversation_id,
        content AS last_message,
        created_at AS last_message_at,
        sender_id AS last_sender_id
    FROM
        messages
    WHERE
        is_deleted = FALSE
    ORDER BY
        conversation_id, created_at DESC
),
message_counts AS (
    SELECT
        conversation_id,
        COUNT(*) AS message_count
    FROM
        messages
    WHERE
        is_deleted = FALSE
    GROUP BY
        conversation_id
),
participant_info AS (
    SELECT
        cp.conversation_id,
        json_agg(
            json_build_object(
                'user_id', cp.user_id,
                'is_admin', cp.is_admin,
                'joined_at', cp.joined_at,
                'last_read_at', cp.last_read_at
            )
        ) AS participants
    FROM
        conversation_participants cp
    WHERE
        cp.is_deleted = FALSE
    GROUP BY
        cp.conversation_id
)
SELECT
    c.id AS conversation_id,
    c.title,
    c.is_group,
    c.created_at,
    c.updated_at,
    c.created_by,
    lm.last_message,
    lm.last_message_at,
    lm.last_sender_id,
    COALESCE(mc.message_count, 0) AS message_count,
    COALESCE(pi.participants, '[]'::json) AS participants
FROM
    conversations c
LEFT JOIN
    last_messages lm ON c.id = lm.conversation_id
LEFT JOIN
    message_counts mc ON c.id = mc.conversation_id
LEFT JOIN
    participant_info pi ON c.id = pi.conversation_id
WHERE
    c.is_deleted = FALSE;

-- FUNCTIONS

-- Function to create a new direct message conversation between two users
CREATE OR REPLACE FUNCTION create_direct_conversation(
    user1_id UUID,
    user2_id UUID,
    initial_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    existing_conversation_id UUID;
    new_conversation_id UUID;
    new_message_id UUID;
BEGIN
    -- Check if a direct conversation already exists between these users
    SELECT c.id INTO existing_conversation_id
    FROM conversations c
    JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = user1_id AND cp1.is_deleted = FALSE
    JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = user2_id AND cp2.is_deleted = FALSE
    WHERE c.is_group = FALSE AND c.is_deleted = FALSE
    LIMIT 1;
    
    -- If conversation exists, return it
    IF existing_conversation_id IS NOT NULL THEN
        -- If there's an initial message, add it to the existing conversation
        IF initial_message IS NOT NULL THEN
            INSERT INTO messages (conversation_id, sender_id, content)
            VALUES (existing_conversation_id, user1_id, initial_message)
            RETURNING id INTO new_message_id;
            
            -- Update the conversation's updated_at timestamp
            UPDATE conversations SET updated_at = NOW() WHERE id = existing_conversation_id;
        END IF;
        
        RETURN existing_conversation_id;
    END IF;
    
    -- Create a new conversation
    INSERT INTO conversations (created_by, is_group)
    VALUES (user1_id, FALSE)
    RETURNING id INTO new_conversation_id;
    
    -- Add both users as participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES 
        (new_conversation_id, user1_id),
        (new_conversation_id, user2_id);
    
    -- Add the initial message if provided
    IF initial_message IS NOT NULL THEN
        INSERT INTO messages (conversation_id, sender_id, content)
        VALUES (new_conversation_id, user1_id, initial_message);
    END IF;
    
    RETURN new_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create a group conversation
CREATE OR REPLACE FUNCTION create_group_conversation(
    creator_id UUID,
    group_title TEXT,
    participant_ids UUID[],
    initial_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    new_conversation_id UUID;
    participant_id UUID;
BEGIN
    -- Create a new group conversation
    INSERT INTO conversations (created_by, is_group, title)
    VALUES (creator_id, TRUE, group_title)
    RETURNING id INTO new_conversation_id;
    
    -- Add creator as admin participant
    INSERT INTO conversation_participants (conversation_id, user_id, is_admin)
    VALUES (new_conversation_id, creator_id, TRUE);
    
    -- Add other participants
    FOREACH participant_id IN ARRAY participant_ids
    LOOP
        -- Skip if it's the creator (already added)
        IF participant_id != creator_id THEN
            INSERT INTO conversation_participants (conversation_id, user_id)
            VALUES (new_conversation_id, participant_id);
        END IF;
    END LOOP;
    
    -- Add the initial message if provided
    IF initial_message IS NOT NULL THEN
        INSERT INTO messages (conversation_id, sender_id, content)
        VALUES (new_conversation_id, creator_id, initial_message);
    END IF;
    
    RETURN new_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
    p_user_id UUID,
    p_conversation_id UUID
) RETURNS VOID AS $$
BEGIN
    -- Update the last_read_at timestamp for the participant
    UPDATE conversation_participants
    SET last_read_at = NOW()
    WHERE user_id = p_user_id AND conversation_id = p_conversation_id;
    
    -- Insert read records for all unread messages
    INSERT INTO message_reads (message_id, user_id)
    SELECT m.id, p_user_id
    FROM messages m
    LEFT JOIN message_reads mr ON m.id = mr.message_id AND mr.user_id = p_user_id
    WHERE m.conversation_id = p_conversation_id
      AND m.sender_id != p_user_id
      AND mr.id IS NULL
      AND m.is_deleted = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create public functions that can be called from Supabase
CREATE OR REPLACE FUNCTION public.create_direct_conversation(
    user1_id UUID,
    user2_id UUID,
    initial_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
BEGIN
    RETURN messages.create_direct_conversation(user1_id, user2_id, initial_message);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.create_group_conversation(
    creator_id UUID,
    group_title TEXT,
    participant_ids UUID[],
    initial_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
BEGIN
    RETURN messages.create_group_conversation(creator_id, group_title, participant_ids, initial_message);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.mark_messages_as_read(
    p_user_id UUID,
    p_conversation_id UUID
) RETURNS VOID AS $$
BEGIN
    PERFORM messages.mark_messages_as_read(p_user_id, p_conversation_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.create_direct_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_group_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_messages_as_read TO authenticated;

-- TRIGGERS

-- Trigger function to update conversation's updated_at timestamp when a new message is added
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for messages table (drop if exists first)
DROP TRIGGER IF EXISTS update_conversation_timestamp_trigger ON messages;
CREATE TRIGGER update_conversation_timestamp_trigger
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- ROW LEVEL SECURITY POLICIES

-- Policies for conversations
DROP POLICY IF EXISTS conversations_select_policy ON conversations;
CREATE POLICY conversations_select_policy ON conversations
    FOR SELECT
    USING (
        id IN (
            SELECT conversation_id FROM conversation_participants
            WHERE user_id = auth.uid() AND is_deleted = FALSE
        )
    );

DROP POLICY IF EXISTS conversations_insert_policy ON conversations;
CREATE POLICY conversations_insert_policy ON conversations
    FOR INSERT
    WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS conversations_update_policy ON conversations;
CREATE POLICY conversations_update_policy ON conversations
    FOR UPDATE
    USING (
        id IN (
            SELECT conversation_id FROM conversation_participants
            WHERE user_id = auth.uid() AND is_admin = TRUE AND is_deleted = FALSE
        )
    );

DROP POLICY IF EXISTS conversations_delete_policy ON conversations;
CREATE POLICY conversations_delete_policy ON conversations
    FOR DELETE
    USING (created_by = auth.uid());

-- Policies for conversation_participants
DROP POLICY IF EXISTS conversation_participants_select_policy ON conversation_participants;
CREATE POLICY conversation_participants_select_policy ON conversation_participants
    FOR SELECT
    USING (
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants
            WHERE user_id = auth.uid() AND is_deleted = FALSE
        )
    );

DROP POLICY IF EXISTS conversation_participants_insert_policy ON conversation_participants;
CREATE POLICY conversation_participants_insert_policy ON conversation_participants
    FOR INSERT
    WITH CHECK (
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants
            WHERE user_id = auth.uid() AND is_admin = TRUE AND is_deleted = FALSE
        )
    );

DROP POLICY IF EXISTS conversation_participants_update_policy ON conversation_participants;
CREATE POLICY conversation_participants_update_policy ON conversation_participants
    FOR UPDATE
    USING (
        (user_id = auth.uid()) OR
        (conversation_id IN (
            SELECT conversation_id FROM conversation_participants
            WHERE user_id = auth.uid() AND is_admin = TRUE AND is_deleted = FALSE
        ))
    );

-- Policies for messages
DROP POLICY IF EXISTS messages_select_policy ON messages;
CREATE POLICY messages_select_policy ON messages
    FOR SELECT
    USING (
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants
            WHERE user_id = auth.uid() AND is_deleted = FALSE
        )
    );

DROP POLICY IF EXISTS messages_insert_policy ON messages;
CREATE POLICY messages_insert_policy ON messages
    FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants
            WHERE user_id = auth.uid() AND is_deleted = FALSE
        )
    );

DROP POLICY IF EXISTS messages_update_policy ON messages;
CREATE POLICY messages_update_policy ON messages
    FOR UPDATE
    USING (sender_id = auth.uid());

-- Policies for message_attachments
DROP POLICY IF EXISTS message_attachments_select_policy ON message_attachments;
CREATE POLICY message_attachments_select_policy ON message_attachments
    FOR SELECT
    USING (
        message_id IN (
            SELECT m.id FROM messages m
            JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE cp.user_id = auth.uid() AND cp.is_deleted = FALSE
        )
    );

DROP POLICY IF EXISTS message_attachments_insert_policy ON message_attachments;
CREATE POLICY message_attachments_insert_policy ON message_attachments
    FOR INSERT
    WITH CHECK (
        message_id IN (
            SELECT id FROM messages WHERE sender_id = auth.uid()
        )
    );

-- Policies for message_reads
DROP POLICY IF EXISTS message_reads_select_policy ON message_reads;
CREATE POLICY message_reads_select_policy ON message_reads
    FOR SELECT
    USING (
        user_id = auth.uid() OR
        message_id IN (
            SELECT m.id FROM messages m
            JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE cp.user_id = auth.uid() AND cp.is_deleted = FALSE
        )
    );

DROP POLICY IF EXISTS message_reads_insert_policy ON message_reads;
CREATE POLICY message_reads_insert_policy ON message_reads
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- CREATE PUBLIC SCHEMA VIEWS FOR SUPABASE ACCESS
-- These views allow Supabase to access the messaging data with proper relationships

-- Switch to public schema for these views
SET search_path TO public, messages;

-- Create public view for conversation summaries that Supabase can use
CREATE OR REPLACE VIEW public.conversation_summaries AS
SELECT
    cs.*
FROM
    messages.conversation_summaries cs;

-- Create public view for unread message counts
CREATE OR REPLACE VIEW public.unread_message_counts AS
SELECT
    umc.*
FROM
    messages.unread_message_counts umc;

-- Create public view for conversations with better access
CREATE OR REPLACE VIEW public.conversations AS
SELECT
    c.*
FROM
    messages.conversations c;

-- Create public view for conversation participants 
CREATE OR REPLACE VIEW public.conversation_participants AS
SELECT
    cp.*
FROM
    messages.conversation_participants cp;

-- Create public view for messages
CREATE OR REPLACE VIEW public.messages AS
SELECT
    m.*
FROM
    messages.messages m;

-- Create public view for message attachments
CREATE OR REPLACE VIEW public.message_attachments AS
SELECT
    ma.*
FROM
    messages.message_attachments ma;

-- Create public view for message reads
CREATE OR REPLACE VIEW public.message_reads AS
SELECT
    mr.*
FROM
    messages.message_reads mr;

-- Grant necessary permissions on public views
GRANT SELECT ON public.conversation_summaries TO authenticated;
GRANT SELECT ON public.unread_message_counts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_attachments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_reads TO authenticated;

-- Enable RLS on public views (they inherit from the base tables)
ALTER VIEW public.conversations SET (security_barrier = true);
ALTER VIEW public.conversation_participants SET (security_barrier = true);
ALTER VIEW public.messages SET (security_barrier = true);
ALTER VIEW public.message_attachments SET (security_barrier = true);
ALTER VIEW public.message_reads SET (security_barrier = true);

-- Reset search path
RESET search_path;