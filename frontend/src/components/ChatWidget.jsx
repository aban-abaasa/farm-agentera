import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, Fab, Paper, Stack, Typography, IconButton, TextField, Button, Badge,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PublicIcon from '@mui/icons-material/Public';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import {
  resolveChatIdentity,
  isDeveloperSession,
  getGuestIdentity,
  setGuestIdentity,
  getStoredConversationId,
  storeConversationId,
  createConversation,
  fetchConversation,
  fetchMessages,
  sendMessage,
  markConversationRead,
  subscribeToMessages,
  subscribeToConversation,
} from '../services/chatService';
import {
  createLandingMessage,
  fetchPublicThreads,
  getOrCreateGuestLikeKey,
  likeMessage,
  replyToLandingMessage,
  subscribeToPublicLandingMessages,
} from '../services/landingMessagesService';

const HIDDEN_PREFIXES = ['/dev-panel'];
const dedupe = (list, item) => (list.some((m) => m.id === item.id) ? list : [...list, item]);

const ChatWidget = () => {
  const location = useLocation();

  const [identity, setIdentity] = useState(null);
  const [identityReady, setIdentityReady] = useState(false);
  const [guestForm, setGuestForm] = useState({ name: '', email: '' });
  const [guestFormError, setGuestFormError] = useState('');
  const [guestLikeKey] = useState(() => getOrCreateGuestLikeKey());

  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState('support'); // 'support' | 'community'
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const [supportConvId, setSupportConvId] = useState(null);
  const [supportMessages, setSupportMessages] = useState([]);
  const [supportUnread, setSupportUnread] = useState(false);

  const [communityThreads, setCommunityThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);

  const scrollRef = useRef(null);
  const openRef = useRef(open);
  const channelRef = useRef(channel);
  useEffect(() => { openRef.current = open; }, [open]);
  useEffect(() => { channelRef.current = channel; }, [channel]);

  const hidden = HIDDEN_PREFIXES.some((p) => location.pathname.startsWith(p)) || isDeveloperSession();
  const scopeKey = identity ? (identity.isGuest ? 'guest' : `user_${identity.userId}`) : null;

  useEffect(() => {
    if (hidden) { setIdentityReady(true); return; }
    let cancelled = false;
    (async () => {
      const resolved = await resolveChatIdentity();
      if (cancelled) return;
      if (resolved) {
        setIdentity({ ...resolved, isGuest: false });
      } else {
        const stored = getGuestIdentity();
        if (stored?.name) setIdentity({ ...stored, isGuest: true });
      }
      setIdentityReady(true);
    })();
    return () => { cancelled = true; };
  }, [hidden]);

  useEffect(() => {
    setSupportMessages([]);
    setSupportConvId(null);
    setSupportUnread(false);
    if (!scopeKey) return;
    const storedId = getStoredConversationId(scopeKey);
    if (!storedId) return;

    let cancelled = false;
    (async () => {
      const conv = await fetchConversation(storedId);
      if (!conv || cancelled) return;
      setSupportConvId(conv.id);
      setSupportUnread(!!conv.unread_by_user);
    })();
    return () => { cancelled = true; };
  }, [scopeKey]);

  useEffect(() => {
    if (!supportConvId) return;
    let cancelled = false;
    (async () => {
      const msgs = await fetchMessages(supportConvId);
      if (!cancelled) setSupportMessages(msgs);
    })();

    const unsubMessages = subscribeToMessages(supportConvId, (msg) => {
      setSupportMessages((prev) => dedupe(prev, msg));
      if (msg.sender_role === 'dev' && !(openRef.current && channelRef.current === 'support')) {
        setSupportUnread(true);
      }
    });
    const unsubConversation = subscribeToConversation(supportConvId, (conv) => {
      if (conv.unread_by_user && !(openRef.current && channelRef.current === 'support')) {
        setSupportUnread(true);
      }
    });

    return () => { cancelled = true; unsubMessages(); unsubConversation(); };
  }, [supportConvId]);

  useEffect(() => {
    if (hidden) return;
    let cancelled = false;
    const load = () => fetchPublicThreads(50, { authId: identity?.isGuest ? null : identity?.authId, guestKey: guestLikeKey })
      .then((rows) => { if (!cancelled) setCommunityThreads(rows); }).catch(() => {});
    load();
    const unsubscribe = subscribeToPublicLandingMessages(() => load());
    return () => { cancelled = true; unsubscribe(); };
  }, [hidden, identity?.authId, identity?.isGuest, guestLikeKey]);

  const selectedThread = communityThreads.find((t) => t.id === selectedThreadId) || null;

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [supportMessages, communityThreads, selectedThreadId, open, channel]);

  const markChannelRead = (ch) => {
    if (ch === 'support') {
      setSupportUnread(false);
      if (supportConvId) markConversationRead(supportConvId, 'user');
    }
  };

  const handleOpen = () => {
    setOpen(true);
    markChannelRead(channel);
  };

  const handleSwitchChannel = (ch) => {
    setChannel(ch);
    markChannelRead(ch);
  };

  const ensureIdentity = () => {
    if (identity) return identity;
    const name = guestForm.name.trim();
    const email = guestForm.email.trim();
    if (!name || !email) {
      setGuestFormError('Please enter your name and email so we can reply.');
      return null;
    }
    const guest = { name, email, isGuest: true };
    setGuestIdentity(guest);
    setIdentity(guest);
    return guest;
  };

  const handleLike = async (messageId) => {
    setCommunityThreads((prev) => prev.map((t) => {
      const bump = (m) => (m.id === messageId && !m.likedByMe
        ? { ...m, likeCount: (m.likeCount || 0) + 1, likedByMe: true }
        : m);
      return { ...bump(t), replies: t.replies.map(bump) };
    }));
    try {
      await likeMessage({ messageId, authId: identity?.isGuest ? null : identity?.authId, guestKey: guestLikeKey });
    } catch (err) {
      console.error('[ChatWidget] failed to like message:', err);
    }
  };

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending) return;

    const who = ensureIdentity();
    if (!who) return;

    setSending(true);
    try {
      if (channel === 'community') {
        const senderAuthId = who.isGuest ? null : who.authId;
        if (selectedThreadId) {
          await replyToLandingMessage({ parentId: selectedThreadId, name: who.name, email: who.email, authId: senderAuthId, message: body });
        } else {
          await createLandingMessage({ name: who.name, email: who.email, authId: senderAuthId, message: body, isPublic: true });
        }
        setCommunityThreads(await fetchPublicThreads(50, { authId: senderAuthId, guestKey: guestLikeKey }));
      } else {
        const key = who.isGuest ? 'guest' : `user_${who.userId}`;
        let convId = supportConvId;
        if (!convId) {
          const conv = await createConversation({
            name: who.name,
            email: who.email,
            userId: who.userId || null,
            role: who.role || 'guest',
            portal: 'landing',
            subject: 'Support chat',
          });
          convId = conv.id;
          storeConversationId(key, convId);
          setSupportConvId(convId);
        }
        const senderRole = who.isGuest ? 'guest' : (who.role || 'guest');
        const msg = await sendMessage(convId, { senderRole, senderName: who.name, body });
        setSupportMessages((prev) => dedupe(prev, msg));
      }
      setDraft('');
    } catch (err) {
      console.error('[ChatWidget] send failed:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (hidden || !identityReady) return null;

  const needsGuestForm = !identity;

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1300 }}>
      {open && (
        <Paper
          elevation={8}
          sx={{ mb: 1.5, width: 340, maxWidth: '90vw', height: 448, display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }}
        >
          <Box sx={{ px: 2, py: 1.5, background: 'linear-gradient(135deg,#2e7d32,#1b5e20)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {channel === 'community' ? 'Community' : 'FARM-AGENT Support'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {channel === 'community' ? 'Public Q&A — everyone can read this' : 'We usually reply within a few minutes'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#fff' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Stack direction="row" spacing={0.5} sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Button
              size="small"
              fullWidth
              variant={channel === 'support' ? 'contained' : 'text'}
              color="success"
              startIcon={<SupportAgentIcon fontSize="small" />}
              onClick={() => handleSwitchChannel('support')}
              sx={{ textTransform: 'none' }}
            >
              Support {supportUnread && channel !== 'support' && <Badge color="error" variant="dot" sx={{ ml: 0.5 }} />}
            </Button>
            <Button
              size="small"
              fullWidth
              variant={channel === 'community' ? 'contained' : 'text'}
              color="success"
              startIcon={<PublicIcon fontSize="small" />}
              onClick={() => handleSwitchChannel('community')}
              sx={{ textTransform: 'none' }}
            >
              Community
            </Button>
          </Stack>

          <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1.5, bgcolor: 'action.hover' }}>
            {channel === 'community' ? (
              selectedThread ? (
                <>
                  <Button size="small" onClick={() => setSelectedThreadId(null)} sx={{ textTransform: 'none', mb: 0.5, px: 0 }}>
                    ← Back to Community
                  </Button>
                  <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight="bold" color="success.main">{selectedThread.name || 'Website visitor'}</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{selectedThread.message}</Typography>
                    <Button
                      size="small"
                      variant={selectedThread.likedByMe ? 'contained' : 'text'}
                      color="success"
                      startIcon={<ThumbUpIcon sx={{ fontSize: 14 }} />}
                      onClick={() => handleLike(selectedThread.id)}
                      disabled={selectedThread.likedByMe}
                      sx={{ mt: 0.5, textTransform: 'none', minWidth: 0, py: 0.25 }}
                    >
                      {selectedThread.likeCount || 0}
                    </Button>
                  </Paper>
                  {selectedThread.replies.map((r) => (
                    <Paper
                      key={r.id}
                      variant="outlined"
                      sx={{
                        p: 1.25, mt: 1, ml: 2, borderRadius: 2,
                        bgcolor: r.sender_role === 'dev' ? 'rgba(46,125,50,0.10)' : 'background.paper',
                      }}
                    >
                      <Typography variant="caption" fontWeight="bold">
                        {r.sender_role === 'dev' ? 'FARM-AGENT Team' : (r.name || 'Website visitor')}
                        {r.reward_reason && ' · 🪙'}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.message}</Typography>
                      <Button
                        size="small"
                        variant={r.likedByMe ? 'contained' : 'text'}
                        color="success"
                        startIcon={<ThumbUpIcon sx={{ fontSize: 12 }} />}
                        onClick={() => handleLike(r.id)}
                        disabled={r.likedByMe}
                        sx={{ mt: 0.5, textTransform: 'none', minWidth: 0, py: 0.25 }}
                      >
                        {r.likeCount || 0}
                      </Button>
                    </Paper>
                  ))}
                  {selectedThread.replies.length === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, textAlign: 'center' }}>
                      No replies yet — be the first to reply.
                    </Typography>
                  )}
                </>
              ) : communityThreads.length === 0 ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
                  No public questions yet — ask something below.
                </Typography>
              ) : (
                communityThreads.map((t) => (
                  <Paper
                    key={t.id}
                    variant="outlined"
                    onClick={() => setSelectedThreadId(t.id)}
                    sx={{ p: 1.25, mb: 1, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <Typography variant="caption" fontWeight="bold" color="success.main">{t.name || 'Website visitor'}</Typography>
                    <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {t.message}
                    </Typography>
                    {t.replies.length > 0 && (
                      <Typography variant="caption" color="text.secondary">{t.replies.length} {t.replies.length === 1 ? 'reply' : 'replies'}</Typography>
                    )}
                  </Paper>
                ))
              )
            ) : (
              <>
                {supportMessages.length === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
                    Send us a message — a real person from the team will reply here.
                  </Typography>
                )}
                {supportMessages.map((m) => {
                  const isMe = m.sender_role !== 'dev';
                  return (
                    <Box key={m.id} sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', mb: 1 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          maxWidth: '80%', px: 1.5, py: 1, borderRadius: 2.5,
                          bgcolor: isMe ? 'success.main' : 'background.paper',
                          color: isMe ? '#fff' : 'text.primary',
                        }}
                      >
                        {!isMe && <Typography variant="caption" fontWeight="bold" color="success.main" display="block">Team</Typography>}
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.body}</Typography>
                      </Paper>
                    </Box>
                  );
                })}
              </>
            )}
          </Box>

          {needsGuestForm && (
            <Stack spacing={1} sx={{ px: 1.5, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={1}>
                <TextField size="small" fullWidth placeholder="Your name" value={guestForm.name}
                  onChange={(e) => setGuestForm((p) => ({ ...p, name: e.target.value }))} />
                <TextField size="small" fullWidth placeholder="Your email" type="email" value={guestForm.email}
                  onChange={(e) => setGuestForm((p) => ({ ...p, email: e.target.value }))} />
              </Stack>
              {guestFormError && <Typography variant="caption" color="error.main">{guestFormError}</Typography>}
            </Stack>
          )}

          <Box sx={{ px: 1.5, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            {channel === 'community' && selectedThread && (
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="caption" color="success.main" noWrap sx={{ maxWidth: '75%' }}>
                  Replying to: "{selectedThread.message}"
                </Typography>
                <Button size="small" onClick={() => setSelectedThreadId(null)} sx={{ textTransform: 'none', minWidth: 0, p: 0 }}>Cancel</Button>
              </Stack>
            )}
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                fullWidth
                multiline
                maxRows={3}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  channel === 'community'
                    ? (selectedThreadId ? 'Write a reply…' : 'Ask something publicly…')
                    : 'Type your message…'
                }
              />
              <IconButton color="success" onClick={handleSend} disabled={sending || !draft.trim()}>
                <SendIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      )}

      <Fab
        color="success"
        onClick={() => (open ? setOpen(false) : handleOpen())}
        sx={{ boxShadow: 4 }}
      >
        {open ? <CloseIcon /> : (
          <Badge color="error" variant="dot" invisible={!supportUnread}>
            <ChatIcon />
          </Badge>
        )}
      </Fab>
    </Box>
  );
};

export default ChatWidget;
