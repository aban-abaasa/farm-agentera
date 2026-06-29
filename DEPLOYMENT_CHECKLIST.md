# ✅ Deployment Checklist — Farm Agent Fixes

## Pre-Deployment

- [ ] Backup current database
  ```bash
  pg_dump -U postgres your_database > backup_$(date +%Y%m%d_%H%M%S).sql
  ```
- [ ] Stop frontend dev server (if running)
- [ ] Verify you're on correct database
  ```bash
  psql -U postgres -d your_database -c "SELECT current_database();"
  ```

---

## Deployment Steps

### 1. Database Changes

- [ ] Navigate to FARM-AGENT folder
  ```bash
  cd FARM-AGENT
  ```

- [ ] Run deployment script
  ```bash
  psql -U postgres -d your_database -f DEPLOY_FIXES.sql
  ```

- [ ] Verify no errors in output
  - [ ] See "✅ RLS policies fixed"
  - [ ] See "✅ Blockchain integration deployed!"
  - [ ] See "✅ DEPLOYMENT COMPLETE!"

### 2. Frontend Changes

- [ ] Navigate to frontend folder
  ```bash
  cd frontend
  ```

- [ ] Clear node modules cache (optional but recommended)
  ```bash
  rm -rf node_modules/.vite
  ```

- [ ] Restart dev server
  ```bash
  npm run dev
  ```

### 3. Browser Testing

- [ ] Open browser at http://localhost:5173 (or your dev URL)

- [ ] Open browser console (F12)

- [ ] Navigate to messages/dashboard page

- [ ] Verify no errors:
  - [ ] ❌ No "Multiple GoTrueClient instances" warning
  - [ ] ❌ No "infinite recursion detected" error
  - [ ] ❌ No 500 Internal Server Error
  - [ ] ✅ Messages load successfully
  - [ ] ✅ Can view conversations
  - [ ] ✅ Dashboard loads

---

## Post-Deployment Verification

### Database Checks

```sql
-- 1. Verify table exists
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'message_blockchain_records';
-- Expected: Should return 1 row

-- 2. Verify trigger exists
SELECT tgname FROM pg_trigger 
WHERE tgname = 'message_blockchain_trigger';
-- Expected: Should return 1 row

-- 3. Verify functions exist
SELECT proname FROM pg_proc 
WHERE proname IN ('verify_message_integrity', 'mark_message_blockchain_verified');
-- Expected: Should return 2 rows

-- 4. Verify view exists
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname = 'conversation_blockchain_stats';
-- Expected: Should return 1 row

-- 5. Check RLS policies
SELECT policyname FROM pg_policies 
WHERE tablename = 'conversation_participants' 
  AND policyname IN ('participants_select_policy', 'participants_update_policy');
-- Expected: Should return 2 rows
```

### Functional Testing

- [ ] **Test 1: Send Message**
  1. Open a conversation
  2. Send a test message
  3. Message appears successfully
  4. No errors in console

- [ ] **Test 2: Verify Blockchain Record**
  ```javascript
  // In browser console
  import { getMessageBlockchainRecord } from './services/blockchainMessageService';
  
  // Get the message ID from the latest message
  const messageId = 'your-message-id-here';
  const record = await getMessageBlockchainRecord(messageId);
  console.log(record);
  ```
  - [ ] Record exists
  - [ ] Has `record_hash`
  - [ ] Has `content_hash`
  - [ ] `is_verified` = false (will be true after blockchain sync)

- [ ] **Test 3: Verify Statistics**
  ```javascript
  import { getConversationBlockchainStats } from './services/blockchainMessageService';
  
  const stats = await getConversationBlockchainStats('conversation-id');
  console.log(stats);
  ```
  - [ ] Returns statistics object
  - [ ] `total_messages` > 0
  - [ ] `pending_verification` > 0

- [ ] **Test 4: Verify Integrity**
  ```javascript
  import { verifyMessageIntegrity } from './services/blockchainMessageService';
  
  const result = await verifyMessageIntegrity('message-id');
  console.log(result);
  ```
  - [ ] Returns verification result
  - [ ] `integrity_valid` = true
  - [ ] `content_hash` matches `stored_hash`

---

## Rollback Plan (If Needed)

If deployment fails, rollback using:

```sql
-- 1. Remove blockchain table
DROP TABLE IF EXISTS message_blockchain_records CASCADE;

-- 2. Remove blockchain view
DROP VIEW IF EXISTS conversation_blockchain_stats;

-- 3. Remove blockchain functions
DROP FUNCTION IF EXISTS create_message_blockchain_record() CASCADE;
DROP FUNCTION IF EXISTS verify_message_integrity(UUID) CASCADE;
DROP FUNCTION IF EXISTS mark_message_blockchain_verified(UUID, TEXT) CASCADE;

-- 4. Restore from backup (if needed)
psql -U postgres -d your_database < backup_20260626_HHMMSS.sql
```

---

## Success Criteria

Deployment is successful when:

✅ **Database**
- message_blockchain_records table exists
- Trigger fires on message insert
- Functions are callable
- View returns data

✅ **Frontend**
- No console warnings
- No console errors
- Messages load successfully
- Can send new messages

✅ **Blockchain**
- Blockchain records created automatically
- Can verify message integrity
- Statistics view works
- RLS policies protect data

---

## Common Issues

### Issue: "relation already exists"
**Solution:** Table already created, skip or drop and recreate
```sql
DROP TABLE IF EXISTS message_blockchain_records CASCADE;
-- Then re-run DEPLOY_FIXES.sql
```

### Issue: "permission denied for table"
**Solution:** Grant proper permissions
```sql
GRANT ALL ON message_blockchain_records TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
```

### Issue: Frontend still shows warnings
**Solution:**
1. Clear browser cache (Ctrl+Shift+F5)
2. Delete node_modules/.vite folder
3. Restart dev server

### Issue: Messages not creating blockchain records
**Solution:** Check trigger
```sql
-- Verify trigger exists and is enabled
SELECT * FROM pg_trigger WHERE tgname = 'message_blockchain_trigger';

-- Re-create trigger if needed
DROP TRIGGER IF EXISTS message_blockchain_trigger ON messages;
CREATE TRIGGER message_blockchain_trigger
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION create_message_blockchain_record();
```

---

## Monitoring

After deployment, monitor these metrics:

```sql
-- 1. Blockchain record creation rate
SELECT 
  DATE(created_at) as date,
  COUNT(*) as records_created
FROM message_blockchain_records
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 2. Verification status
SELECT 
  is_verified,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM message_blockchain_records
GROUP BY is_verified;

-- 3. Recent unverified messages
SELECT 
  mbr.created_at,
  mbr.message_id,
  u.email as sender
FROM message_blockchain_records mbr
JOIN auth.users u ON u.id = mbr.sender_id
WHERE mbr.is_verified = FALSE
ORDER BY mbr.created_at DESC
LIMIT 10;
```

---

## Documentation References

- **Quick Deploy:** `QUICK_DEPLOY.md`
- **Full Setup:** `BLOCKCHAIN_MESSAGES_SETUP.md`
- **Technical Details:** `FIXES_SUMMARY.md`
- **Overview:** `README_FIXES.md`

---

## Sign-Off

Deployment completed by: __________________

Date: __________________

Verification completed: ☐ Yes  ☐ No

Issues encountered: ☐ None  ☐ See notes below

Notes:
_______________________________________________________
_______________________________________________________
_______________________________________________________

---

**Status:** Ready for Production ✅  
**Version:** 1.0.0  
**Last Updated:** June 26, 2026
