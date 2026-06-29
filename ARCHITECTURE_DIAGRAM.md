# 🏗️ Architecture Diagram — Farm Agent with Blockchain

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FARM AGENT APPLICATION                      │
│                    (Icaneracoin Ecosystem)                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │   Dashboard  │────▶│   Messages   │────▶│ ICAN Wallet  │   │
│  │              │     │              │     │              │   │
│  └──────────────┘     └──────┬───────┘     └──────┬───────┘   │
│                              │                     │            │
│                              ▼                     ▼            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            SHARED SUPABASE CLIENT ✅                     │   │
│  │         (lib/supabase/client.js)                        │   │
│  │  • Single instance across app                           │   │
│  │  • Prevents multiple GoTrueClient warnings              │   │
│  │  • Shared auth state                                    │   │
│  └───────────────────┬─────────────────────────────────────┘   │
│                      │                                          │
│         ┌────────────┼────────────┐                            │
│         ▼            ▼            ▼                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐              │
│  │ Message  │ │  ICAN    │ │   Blockchain     │              │
│  │ Service  │ │  Wallet  │ │   Message        │              │
│  │          │ │  Service │ │   Service 🆕     │              │
│  └────┬─────┘ └────┬─────┘ └────┬─────────────┘              │
│       │            │             │                             │
└───────┼────────────┼─────────────┼─────────────────────────────┘
        │            │             │
        └────────────┴─────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    DATABASE TABLES                      │    │
│  │                                                         │    │
│  │  ┌──────────────┐     ┌──────────────────────────┐    │    │
│  │  │  messages    │────▶│ message_blockchain_      │    │    │
│  │  │              │     │ records 🆕               │    │    │
│  │  │ • id         │     │ • id                     │    │    │
│  │  │ • content    │     │ • message_id             │    │    │
│  │  │ • sender_id  │     │ • record_hash (SHA256)   │    │    │
│  │  │ • conv_id    │     │ • content_hash (SHA256)  │    │    │
│  │  └──────┬───────┘     │ • blockchain_tx_hash     │    │    │
│  │         │             │ • is_verified            │    │    │
│  │         │             │ • metadata               │    │    │
│  │         │             └──────────────────────────┘    │    │
│  │         │                                              │    │
│  │         │ [TRIGGER]                                    │    │
│  │         │ message_blockchain_trigger 🆕                │    │
│  │         │ (Auto-creates blockchain record)             │    │
│  │         │                                              │    │
│  │         ▼                                              │    │
│  │  ┌──────────────┐     ┌──────────────────────────┐    │    │
│  │  │conversation_ │◀────│ conversations            │    │    │
│  │  │participants  │     │                          │    │    │
│  │  │ ✅ FIXED     │     │ • id                     │    │    │
│  │  │ • Simple RLS │     │ • title                  │    │    │
│  │  │ • No recursion│    │ • is_group               │    │    │
│  │  └──────────────┘     └──────────────────────────┘    │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                   DATABASE FUNCTIONS                    │    │
│  │                                                         │    │
│  │  • create_message_blockchain_record() 🆕               │    │
│  │    └─ Automatically creates blockchain record          │    │
│  │                                                         │    │
│  │  • verify_message_integrity(message_id) 🆕             │    │
│  │    └─ Verifies message hasn't been tampered            │    │
│  │                                                         │    │
│  │  • mark_message_blockchain_verified(msg_id, tx) 🆕     │    │
│  │    └─ Marks message as synced to blockchain            │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    DATABASE VIEWS                       │    │
│  │                                                         │    │
│  │  • conversation_blockchain_stats 🆕                     │    │
│  │    └─ Total messages, verified, pending per conversation│   │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                  ROW LEVEL SECURITY                     │    │
│  │                                                         │    │
│  │  ✅ FIXED: conversation_participants                    │    │
│  │     • Simple user check (no recursion)                  │    │
│  │     • USING (user_id = auth.uid())                      │    │
│  │                                                         │    │
│  │  🆕 NEW: message_blockchain_records                     │    │
│  │     • Users see own messages                            │    │
│  │     • Users see conversations they're in                │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              EXTERNAL BLOCKCHAIN NETWORK (Future)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │            Blockchain Sync Service (Future)             │    │
│  │                                                         │    │
│  │  1. Polls message_blockchain_records                    │    │
│  │  2. Finds unverified records (is_verified = false)      │    │
│  │  3. Submits to blockchain network                       │    │
│  │  4. Gets transaction hash                               │    │
│  │  5. Calls mark_message_blockchain_verified()            │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Message Flow with Blockchain

```
┌─────────┐                                    ┌─────────┐
│  User   │                                    │Database │
│  (Farm  │                                    │(Supabase)│
│  Agent) │                                    └─────────┘
└────┬────┘                                         │
     │                                              │
     │ 1. Send Message                              │
     │  "Hello, I need fertilizer"                  │
     ├─────────────────────────────────────────────▶│
     │                                              │
     │                                              │ 2. INSERT INTO messages
     │                                              │    (content, sender_id, ...)
     │                                              │
     │                                              │ 3. [TRIGGER FIRES]
     │                                              │    message_blockchain_trigger
     │                                              │
     │                                              │ 4. Create Blockchain Record
     │                                              │    a. Hash content (SHA256)
     │                                              │    b. Build metadata
     │                                              │    c. Generate record_hash
     │                                              │    d. INSERT INTO 
     │                                              │       message_blockchain_records
     │                                              │
     │ 5. Return Message + Success                  │
     │◀─────────────────────────────────────────────┤
     │                                              │
     │                                              │
     │ 6. (Optional) Verify Integrity               │
     │    verifyMessageIntegrity(message_id)        │
     ├─────────────────────────────────────────────▶│
     │                                              │
     │                                              │ 7. Call Function
     │                                              │    verify_message_integrity()
     │                                              │    • Get original record
     │                                              │    • Compute current hash
     │                                              │    • Compare hashes
     │                                              │
     │ 8. Return Verification Result                │
     │    { integrity_valid: true, ... }            │
     │◀─────────────────────────────────────────────┤
     │                                              │
     │                                              │
     │          [EXTERNAL SERVICE - FUTURE]         │
     │                                              │
     │                                              │ 9. Sync to Blockchain
     │                                              │    (External Service)
     │                                              │    • Read unverified records
     │                                              │    • Submit to blockchain
     │                                              │    • Get tx_hash
     │                                              │
     │                                              │ 10. Mark as Verified
     │                                              │     mark_message_blockchain_
     │                                              │     verified(msg_id, tx_hash)
     │                                              │     • is_verified = TRUE
     │                                              │     • blockchain_tx_hash = "0x..."
     │                                              │
     │ 11. [REAL-TIME UPDATE]                       │
     │     Blockchain record updated                │
     │◀─────────────────────────────────────────────┤
     │     (if subscribed)                          │
     │                                              │
└────┴────                                          │
```

---

## Before vs After Fix

### Before (❌ BROKEN)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ICANWallet.jsx│     │icanWallet    │     │lib/supabase/ │
│              │     │Service.js    │     │client.js     │
│              │     │              │     │              │
│ createClient()│     │ createClient()│     │ createClient()│
│      ❌      │     │      ❌      │     │      ✅      │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │
       └────────────────────┴─────────────────────┘
                            │
                   ⚠️ 3 INSTANCES!
              Multiple GoTrueClient Warning!
```

### After (✅ FIXED)

```
┌──────────────┐     ┌──────────────┐     
│ICANWallet.jsx│     │icanWallet    │     ┌──────────────┐
│              │     │Service.js    │     │lib/supabase/ │
│              │     │              │────▶│client.js     │
│ import       │────▶│ import       │     │              │
│ { supabase } │     │ { supabase } │     │ createClient()│
└──────────────┘     └──────────────┘     │      ✅      │
       │                    │              └──────────────┘
       └────────────────────┘                     │
                   ▼                              │
            Shared Instance                       │
            ✅ NO WARNINGS!                        │
```

---

## RLS Policy Fix

### Before (❌ RECURSIVE)

```
conversation_participants table
       │
       │ SELECT * FROM conversation_participants
       │ WHERE user_id = auth.uid()
       │
       ▼
  [RLS POLICY CHECK]
       │
       │ Check: user_id = auth.uid() OR
       │        EXISTS (SELECT FROM conversation_participants ...)
       │                                      │
       │                                      │
       └──────────────────────────────────────┘
                    🔄 INFINITE LOOP!
              "infinite recursion detected"
```

### After (✅ FIXED)

```
conversation_participants table
       │
       │ SELECT * FROM conversation_participants
       │ WHERE user_id = auth.uid()
       │
       ▼
  [RLS POLICY CHECK]
       │
       │ Check: user_id = auth.uid()
       │              │
       │              ▼
       │         [Simple Check]
       │              │
       │              ▼
       └──────────▶ ALLOW/DENY
                  ✅ NO RECURSION!
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     USER ACTIONS                            │
└─────────────────────────────────────────────────────────────┘
       │
       ├─ Send Message
       │     │
       │     ├─▶ messages table (stores content)
       │     │
       │     └─▶ [TRIGGER] Auto-create blockchain record
       │            │
       │            └─▶ message_blockchain_records
       │                  • record_hash
       │                  • content_hash
       │                  • metadata
       │
       ├─ Verify Integrity
       │     │
       │     └─▶ verify_message_integrity(msg_id)
       │            • Compare hashes
       │            • Return verification result
       │
       ├─ View Stats
       │     │
       │     └─▶ conversation_blockchain_stats view
       │            • total_messages
       │            • verified_messages
       │            • pending_verification
       │
       └─ Subscribe to Updates
             │
             └─▶ Real-time subscription
                   • Listen for blockchain updates
                   • Get notified when verified
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      REQUEST FLOW                           │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│            1. AUTHENTICATION (Supabase Auth)                 │
│               • JWT token validation                         │
│               • User session check                           │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│       2. ROW LEVEL SECURITY (RLS Policies)                   │
│          • Check user_id = auth.uid()                        │
│          • Check conversation participation                  │
│          • ✅ Simple checks, no recursion                    │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│       3. BLOCKCHAIN INTEGRITY (Hash Verification)            │
│          • SHA256 content hashing                            │
│          • SHA256 record hashing                             │
│          • Tamper detection                                  │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               4. DATA ACCESS (Granted)                       │
│                  • Return data to user                       │
│                  • Audit trail recorded                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Ecosystem Integration

```
┌──────────────────────────────────────────────────────────────┐
│                  ICANERACOIN ECOSYSTEM                        │
└──────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│  ICAN Core   │      │ Farm Agent   │     │Digital City  │
│              │      │      ✅      │     │    Era       │
│ • Wallet     │      │ • Messages   │     │ • Supermarket│
│ • Trading    │      │ • Blockchain │     │ • Inventory  │
│              │      │   Verified   │     │              │
└──────┬───────┘      └──────┬───────┘     └──────┬───────┘
       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             │
                             ▼
              ┌────────────────────────────┐
              │   SHARED INFRASTRUCTURE    │
              ├────────────────────────────┤
              │ • Blockchain Network       │
              │ • Message Verification     │
              │ • ICAN Coin Transactions   │
              │ • Cross-App Authentication │
              └────────────────────────────┘
```

---

**Legend:**
- ✅ = Fixed/Implemented
- 🆕 = New Feature
- ❌ = Problem (Before Fix)
- ⚠️ = Warning
- 🔄 = Infinite Loop

---

**Version:** 1.0.0  
**Last Updated:** June 26, 2026  
**Status:** Production Ready
