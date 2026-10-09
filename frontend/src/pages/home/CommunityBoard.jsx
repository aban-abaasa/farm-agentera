import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Button, Card, Container, Grid, Typography, Stack, Link, Avatar,
  Chip, TextField, Radio, RadioGroup, FormControlLabel, IconButton,
  CircularProgress, Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import { Public, Lock, Send, Person, Forum, ThumbUp } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { SectionHeading } from '../../components/classic/Ornament';
import {
  createLandingMessage,
  fetchPublicThreads,
  getMyIcanBalance,
  getOrCreateGuestLikeKey,
  hasIcanWallet,
  likeMessage,
  listMyLandingMessages,
  replyToLandingMessage,
  subscribeToPublicLandingMessages,
} from '../../services/landingMessagesService';

const GUEST_IDENTITY_KEY = 'farm_agent_guest_identity';

const fmtBoardTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return date.toLocaleDateString();
};

const getGuestIdentity = () => {
  try {
    const raw = localStorage.getItem(GUEST_IDENTITY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setGuestIdentity = (identity) => {
  try {
    localStorage.setItem(GUEST_IDENTITY_KEY, JSON.stringify(identity));
  } catch {
    // ignore storage errors (private browsing, quota, etc.)
  }
};

/** Public Q&A board + private notes to the AgriBone team (landing page). */
const CommunityBoard = () => {
  const { user } = useAuth();
  // ── Community message board state ───────────────────────────────────────
  const authId = user?.id || null;
  const identityName = user
    ? (`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'You')
    : null;
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', message: '', isPublic: true });
  const [hasWallet, setHasWallet] = useState(false);
  const [threads, setThreads] = useState([]);
  const [myMessages, setMyMessages] = useState([]);
  const [submitState, setSubmitState] = useState('idle'); // idle | sending | sent | error
  const [expandedId, setExpandedId] = useState(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [replyState, setReplyState] = useState('idle'); // idle | sending | error
  const [guestIdentity, setGuestIdentityState] = useState(() => getGuestIdentity());
  const [guestReplyForm, setGuestReplyForm] = useState({ name: '', email: '' });
  const [guestLikeKey] = useState(() => getOrCreateGuestLikeKey());
  const [selectedContributor, setSelectedContributor] = useState(null);
  const [contributorBalance, setContributorBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Real posters shown individually (name + message count); every guest
  // post (no user_id) folds into one aggregate "Guests" entry instead of
  // showing as separate unnamed people.
  const contributors = useMemo(() => {
    const byUser = new Map();
    let guestCount = 0;
    const visit = (m) => {
      if (m.user_id) {
        const existing = byUser.get(m.user_id);
        if (existing) {
          existing.count += 1;
          existing.name = m.name || existing.name;
        } else {
          byUser.set(m.user_id, { authId: m.user_id, name: m.name || 'Community member', count: 1 });
        }
      } else {
        guestCount += 1;
      }
    };
    threads.forEach((t) => {
      visit(t);
      t.replies.forEach(visit);
    });
    const list = Array.from(byUser.values()).sort((a, b) => b.count - a.count);
    if (guestCount > 0) list.push({ authId: null, name: 'Guests', count: guestCount, isGuestGroup: true });
    return list;
  }, [threads]);

  const handleSelectContributor = (c) => {
    if (c.isGuestGroup) return;
    setSelectedContributor(c);
    setContributorBalance(null);
    if (authId && c.authId === authId) {
      setBalanceLoading(true);
      getMyIcanBalance(c.authId)
        .then((bal) => setContributorBalance(bal))
        .catch(() => setContributorBalance(null))
        .finally(() => setBalanceLoading(false));
    }
  };

  // Personalize the contact form for a signed-in user and check whether
  // they hold an active ICAN wallet — private posting requires one.
  useEffect(() => {
    if (!user) {
      setHasWallet(false);
      return;
    }
    setContactForm((prev) => ({
      ...prev,
      name: prev.name || identityName || '',
      email: prev.email || user.email || '',
    }));
    let cancelled = false;
    hasIcanWallet(user.id)
      .then((ok) => { if (!cancelled) setHasWallet(ok); })
      .catch(() => { if (!cancelled) setHasWallet(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Public community board — everyone can read these, live-updated.
  const loadThreads = useCallback(() => {
    return fetchPublicThreads(50, { authId, guestKey: guestLikeKey })
      .then((rows) => setThreads(rows))
      .catch((err) => console.error('[Home] failed to load public threads:', err));
  }, [authId, guestLikeKey]);

  useEffect(() => {
    loadThreads();
    return subscribeToPublicLandingMessages(() => { loadThreads(); });
  }, [loadThreads]);

  const handleLike = async (messageId) => {
    setThreads((prev) => prev.map((t) => {
      const bump = (m) => (m.id === messageId && !m.likedByMe
        ? { ...m, likeCount: (m.likeCount || 0) + 1, likedByMe: true }
        : m);
      return { ...bump(t), replies: t.replies.map(bump) };
    }));
    try {
      await likeMessage({ messageId, authId, guestKey: guestLikeKey });
    } catch (err) {
      console.error('[Home] failed to like message:', err);
      loadThreads();
    }
  };

  // A signed-in visitor's own message history, public and private.
  useEffect(() => {
    if (!authId) { setMyMessages([]); return; }
    let cancelled = false;
    listMyLandingMessages(authId)
      .then((rows) => { if (!cancelled) setMyMessages(rows); })
      .catch((err) => console.error('[Home] failed to load your messages:', err));
    return () => { cancelled = true; };
  }, [authId]);

  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    if (!contactForm.message.trim() || submitState === 'sending') return;

    setSubmitState('sending');
    try {
      const saved = await createLandingMessage({
        name: contactForm.name,
        email: contactForm.email,
        company: contactForm.company,
        message: contactForm.message,
        authId,
        // Only a wallet-holding poster can go private — force public otherwise.
        isPublic: hasWallet ? contactForm.isPublic : true,
      });

      setSubmitState('sent');
      setContactForm((prev) => ({ ...prev, message: '' }));
      if (saved.is_public) {
        loadThreads();
      }
      if (authId) {
        setMyMessages((prev) => [saved, ...prev]);
      }
    } catch (err) {
      console.error('[Home] failed to post message:', err);
      setSubmitState('error');
    }
  };

  const handleToggleThread = (threadId) => {
    setExpandedId((prev) => (prev === threadId ? null : threadId));
    setReplyDraft('');
    setReplyState('idle');
  };

  const handleSaveGuestReplyIdentity = () => {
    const name = guestReplyForm.name.trim();
    const email = guestReplyForm.email.trim();
    if (!name) return;
    const guest = { name, email };
    setGuestIdentity(guest);
    setGuestIdentityState(guest);
  };

  const handleSendReply = async (threadId) => {
    const body = replyDraft.trim();
    if (!body || replyState === 'sending') return;

    const who = user
      ? { name: identityName, email: user.email, authId }
      : guestIdentity?.name
        ? { name: guestIdentity.name, email: guestIdentity.email, authId: null }
        : null;
    if (!who) return;

    setReplyState('sending');
    try {
      await replyToLandingMessage({ parentId: threadId, name: who.name, email: who.email, authId: who.authId, message: body });
      setReplyDraft('');
      setReplyState('idle');
      await loadThreads();
    } catch (err) {
      console.error('[Home] failed to reply:', err);
      setReplyState('error');
    }
  };

  return (
    <>
        <Box
          sx={{
            py: { xs: 7, md: 10 },
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'divider',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Container maxWidth="xl">
            <SectionHeading
              kicker="The Community Board"
              title="Ask Us Anything"
              subtitle="Post a public question for the community or send the AgriBone team a private note. Anyone can read the public messages below."
            />

            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Card
                  component="form"
                  onSubmit={handleContactSubmit}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: undefined,
                    boxShadow: 3
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    {user ? `Welcome back, ${identityName}` : 'Talk to the AgriBone team'}
                  </Typography>
                  <Stack spacing={2}>
                    <TextField label="Your name" name="name" value={contactForm.name} onChange={handleContactChange} fullWidth size="small" />
                    <TextField label="Email address" type="email" name="email" value={contactForm.email} onChange={handleContactChange} fullWidth size="small" />
                    <TextField label="Farm / company (optional)" name="company" value={contactForm.company} onChange={handleContactChange} fullWidth size="small" />
                    <TextField
                      label="Message"
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactChange}
                      fullWidth
                      multiline
                      rows={4}
                      size="small"
                      placeholder="Ask about land leasing, marketplace listings, farm tools, or anything else."
                    />

                    {user && hasWallet ? (
                      <RadioGroup
                        row
                        value={contactForm.isPublic ? 'public' : 'private'}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, isPublic: e.target.value === 'public' }))}
                      >
                        <FormControlLabel
                          value="public"
                          control={<Radio size="small" />}
                          label={<Stack direction="row" alignItems="center" gap={0.5}><Public fontSize="small" /> Public</Stack>}
                        />
                        <FormControlLabel
                          value="private"
                          control={<Radio size="small" />}
                          label={<Stack direction="row" alignItems="center" gap={0.5}><Lock fontSize="small" /> Private</Stack>}
                        />
                      </RadioGroup>
                    ) : user ? (
                      <Typography variant="caption" color="text.secondary">
                        Messages here are public — anyone can see them, but the AgriBone team can remove any message.{' '}
                        <Link component={RouterLink} to="/ican-wallet">Connect your ICAN wallet</Link> to unlock private messages.
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Messages here are public — anyone can see them, but the AgriBone team can remove any message.
                        Sign in with an ICAN wallet to choose public or private for your own messages.
                      </Typography>
                    )}

                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={submitState === 'sending' || !contactForm.message.trim()}
                      startIcon={submitState === 'sending' ? <CircularProgress size={16} color="inherit" /> : <Send />}
                      sx={{ alignSelf: 'flex-start', px: 3 }}
                    >
                      {submitState === 'sending' ? 'Posting…' : 'Send message'}
                    </Button>
                    {submitState === 'sent' && (
                      <Typography variant="body2" color="success.main">Thanks — your message has been posted.</Typography>
                    )}
                    {submitState === 'error' && (
                      <Typography variant="body2" color="error.main">Something went wrong sending that. Please try again.</Typography>
                    )}
                  </Stack>

                  {user && myMessages.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary' }}>
                        Your messages
                      </Typography>
                      <Stack spacing={1} sx={{ mt: 1, maxHeight: 240, overflowY: 'auto', pr: 1 }}>
                        {myMessages.map((m) => (
                          <Box
                            key={m.id}
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: 'action.hover',
                              border: '1px solid'
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Chip
                                size="small"
                                icon={m.is_public ? <Public sx={{ fontSize: 14 }} /> : <Lock sx={{ fontSize: 14 }} />}
                                label={m.is_public ? 'Public' : 'Private'}
                                sx={{
                                  bgcolor: m.is_public ? 'rgba(60,110,71,0.14)' : 'rgba(168,132,47,0.18)',
                                  color: m.is_public ? 'success.main' : 'warning.dark',
                                  fontWeight: 600
                                }}
                              />
                              <Typography variant="caption" color="text.secondary">{fmtBoardTime(m.created_at)}</Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ mt: 1 }}>{m.message}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 7 }}>
                <Grid container spacing={2}>
                  {threads.map((m) => {
                    const isExpanded = expandedId === m.id;
                    const canReply = !!(user || guestIdentity?.name);
                    return (
                      <Grid key={m.id} size={{ xs: 12, sm: isExpanded ? 12 : 6 }}>
                        <Card
                          sx={{
                            p: 2.5,
                            borderRadius: 2,
                            height: '100%',
                            border: undefined
                          }}
                        >
                          <Box onClick={() => handleToggleThread(m.id)} sx={{ cursor: 'pointer' }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', width: 36, height: 36 }}>
                                <Person fontSize="small" />
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle2" fontWeight="bold" noWrap>{m.name || 'Website visitor'}</Typography>
                                <Typography variant="caption" color="text.secondary">{fmtBoardTime(m.created_at)}</Typography>
                              </Box>
                              {m.reward_reason && (
                                <Chip size="small" color="warning" label="🪙 Rewarded" />
                              )}
                              {m.replies.length > 0 && (
                                <Chip size="small" label={`${m.replies.length} ${m.replies.length === 1 ? 'reply' : 'replies'}`} />
                              )}
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>{m.message}</Typography>
                          </Box>

                          <Button
                            size="small"
                            variant={m.likedByMe ? 'contained' : 'outlined'}
                            color="primary"
                            startIcon={<ThumbUp fontSize="small" />}
                            onClick={() => handleLike(m.id)}
                            disabled={m.likedByMe}
                            sx={{ mt: 1.5 }}
                          >
                            {m.likeCount || 0}
                          </Button>

                          {isExpanded && (
                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                              <Stack spacing={1.5}>
                                {m.replies.map((r) => (
                                  <Box
                                    key={r.id}
                                    sx={{
                                      p: 1.5,
                                      borderRadius: 2,
                                      bgcolor: r.sender_role === 'dev'
                                        ? 'rgba(60,110,71,0.12)'
                                        : ('action.hover')
                                    }}
                                  >
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography
                                          variant="caption"
                                          fontWeight="bold"
                                          sx={{ color: r.sender_role === 'dev' ? 'success.main' : 'text.primary' }}
                                        >
                                          {r.sender_role === 'dev' ? 'AgriBone Team' : (r.name || 'Website visitor')}
                                        </Typography>
                                        {r.reward_reason && <Chip size="small" color="warning" label="🪙 Correct answer" />}
                                      </Stack>
                                      <Typography variant="caption" color="text.secondary">{fmtBoardTime(r.created_at)}</Typography>
                                    </Stack>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>{r.message}</Typography>
                                    <Button
                                      size="small"
                                      variant={r.likedByMe ? 'contained' : 'outlined'}
                                      color="primary"
                                      startIcon={<ThumbUp sx={{ fontSize: 14 }} />}
                                      onClick={() => handleLike(r.id)}
                                      disabled={r.likedByMe}
                                      sx={{ mt: 1, minWidth: 0, py: 0.25 }}
                                    >
                                      {r.likeCount || 0}
                                    </Button>
                                  </Box>
                                ))}
                                {m.replies.length === 0 && (
                                  <Typography variant="caption" color="text.secondary">No replies yet.</Typography>
                                )}
                              </Stack>

                              {!canReply && (
                                <Stack spacing={1} sx={{ mt: 1.5 }}>
                                  <TextField
                                    size="small"
                                    placeholder="Your name"
                                    value={guestReplyForm.name}
                                    onChange={(e) => setGuestReplyForm((p) => ({ ...p, name: e.target.value }))}
                                  />
                                  <TextField
                                    size="small"
                                    placeholder="Your email"
                                    type="email"
                                    value={guestReplyForm.email}
                                    onChange={(e) => setGuestReplyForm((p) => ({ ...p, email: e.target.value }))}
                                  />
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={handleSaveGuestReplyIdentity}
                                    disabled={!guestReplyForm.name.trim()}
                                    
                                  >
                                    Continue as this name
                                  </Button>
                                </Stack>
                              )}

                              {canReply && (
                                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    placeholder={`Reply as ${identityName || guestIdentity?.name}…`}
                                    value={replyDraft}
                                    onChange={(e) => setReplyDraft(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendReply(m.id); }}
                                  />
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleSendReply(m.id)}
                                    disabled={replyState === 'sending' || !replyDraft.trim()}
                                  >
                                    <Send fontSize="small" />
                                  </IconButton>
                                </Stack>
                              )}
                              {replyState === 'error' && (
                                <Typography variant="caption" color="error.main">Reply failed — please try again.</Typography>
                              )}
                            </Box>
                          )}
                        </Card>
                      </Grid>
                    );
                  })}
                  {threads.length === 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Forum sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">No public messages yet — be the first to ask something.</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>

            {contributors.length > 0 && (
              <Box sx={{ mt: 5 }}>
                <Typography variant="overline" color="text.secondary">Community members</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
                  {contributors.map((c) => (
                    <Chip
                      key={c.authId || 'guests'}
                      icon={<Person sx={{ fontSize: 16 }} />}
                      label={`${c.name} · ${c.count} ${c.count === 1 ? 'message' : 'messages'}`}
                      onClick={c.isGuestGroup ? undefined : () => handleSelectContributor(c)}
                      variant="outlined"
                      sx={{ cursor: c.isGuestGroup ? 'default' : 'pointer' }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Container>
        </Box>

      <Dialog open={!!selectedContributor} onClose={() => setSelectedContributor(null)} maxWidth="xs" fullWidth>
        {selectedContributor && (
          <>
            <DialogTitle>{selectedContributor.name}</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary">
                {selectedContributor.count} {selectedContributor.count === 1 ? 'message' : 'messages'} on the community board
              </Typography>
              {authId === selectedContributor.authId && (
                <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(168,132,47,0.12)', border: '1px solid rgba(168,132,47,0.4)' }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: 'warning.dark' }}>Your ICAN balance</Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: 'warning.dark' }}>
                    {balanceLoading ? '…' : `${(contributorBalance ?? 0).toFixed(2)} ICAN`}
                  </Typography>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
};

export default CommunityBoard;
