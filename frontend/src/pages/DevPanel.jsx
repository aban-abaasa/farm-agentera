import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase/client';
import PeopleIcon            from '@mui/icons-material/People';
import AgricultureIcon       from '@mui/icons-material/Agriculture';
import StorefrontIcon        from '@mui/icons-material/Storefront';
import WorkspacePremiumIcon  from '@mui/icons-material/WorkspacePremium';
import ShieldIcon            from '@mui/icons-material/Shield';
import LogoutIcon            from '@mui/icons-material/Logout';
import RefreshIcon           from '@mui/icons-material/Refresh';
import LightModeIcon         from '@mui/icons-material/LightMode';
import DarkModeIcon          from '@mui/icons-material/DarkMode';
import SearchIcon            from '@mui/icons-material/Search';
import CardGiftcardIcon      from '@mui/icons-material/CardGiftcard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon        from '@mui/icons-material/TrendingUp';
import VerifiedIcon          from '@mui/icons-material/Verified';
import ToggleOnIcon          from '@mui/icons-material/ToggleOn';
import ToggleOffIcon         from '@mui/icons-material/ToggleOff';
import ContentCopyIcon       from '@mui/icons-material/ContentCopy';
import CheckCircleIcon       from '@mui/icons-material/CheckCircle';
import LockIcon              from '@mui/icons-material/Lock';
import MonetizationOnIcon    from '@mui/icons-material/MonetizationOn';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import TagIcon               from '@mui/icons-material/Tag';
import GppGoodIcon           from '@mui/icons-material/GppGood';
import GppBadIcon            from '@mui/icons-material/GppBad';
import ForumIcon             from '@mui/icons-material/Forum';
import PublicIcon            from '@mui/icons-material/Public';
import DeleteIcon            from '@mui/icons-material/Delete';
import SendIcon              from '@mui/icons-material/Send';
import TaskAltIcon           from '@mui/icons-material/TaskAlt';
import MailIcon               from '@mui/icons-material/Mail';
import VpnKeyIcon             from '@mui/icons-material/VpnKey';
import EraApiDevTab           from '../components/EraApiDevTab';
import {
  devListAllLandingMessages,
  devDeleteLandingMessage,
  devReplyToLandingMessage,
  devMarkCorrectAnswer,
  devGrantLandingBonus,
} from '../services/landingMessagesService';
import {
  listConversations,
  fetchMessages as fetchChatMessages,
  sendMessage as sendChatMessage,
  markConversationRead,
  subscribeToAllConversations,
  subscribeToMessages as subscribeToChatMessages,
} from '../services/chatService';

export const SESSION_KEY = 'farm_dev_panel_auth';
const DEV_TOKEN   = 'dev_Farm_Ag3nt_KV25';
const ICAN_TO_UGX = 5000;

// ─── TABS ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'users',         label: 'Users',        Icon: PeopleIcon           },
  { id: 'farms',         label: 'Registered Farms', Icon: AgricultureIcon  },
  { id: 'suppliers',     label: 'Suppliers',    Icon: StorefrontIcon       },
  { id: 'subscriptions', label: 'Subscriptions',Icon: WorkspacePremiumIcon },
  { id: 'value',         label: 'Value & Chain',Icon: ShieldIcon           },
  { id: 'board',         label: 'Public Board', Icon: ForumIcon            },
  { id: 'messages',      label: 'Messages',     Icon: MailIcon             },
  { id: 'api',           label: 'API',          Icon: VpnKeyIcon           },
];

const PLANS = ['basic', 'pro', 'enterprise'];
const PLAN_GRAD = {
  basic:      'linear-gradient(135deg,#475569,#334155)',
  pro:        'linear-gradient(135deg,#059669,#065f46)',
  enterprise: 'linear-gradient(135deg,#d97706,#b45309)',
};
const PLAN_CLR = { basic:'#94a3b8', pro:'#34d399', enterprise:'#fbbf24' };

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt      = n => Number(n||0).toLocaleString();
const fmtI     = n => Number(n||0).toFixed(2);
const fmtUGX   = n => 'UGX '+(Number(n||0)*ICAN_TO_UGX).toLocaleString();
const fmtDate  = d => d?new Date(d).toLocaleDateString('en-UG',{day:'2-digit',month:'short',year:'numeric'}):'—';
const fmtTime  = d => d?new Date(d).toLocaleString('en-UG',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'—';
const shortHash= h => h?(h.slice(0,10)+'…'+h.slice(-6)):'—';
const initials = n => (n||'').trim().split(/\s+/).slice(0,2).map(w=>w[0]?.toUpperCase()||'').join('');

// ─── THEME ───────────────────────────────────────────────────────────────────
const themes = {
  dark: {
    bg:        { background:'#030b06', minHeight:'100vh', width:'100%', color:'#f1f5f9' },
    header:    { background:'rgba(3,11,6,0.92)', borderBottom:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)' },
    card:      { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16 },
    glass:     { background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12 },
    input:     { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'#f1f5f9', borderRadius:10, outline:'none' },
    track:     { background:'rgba(255,255,255,0.10)', borderRadius:99 },
    pill:      { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:10, color:'#94a3b8' },
    divider:   { borderColor:'rgba(255,255,255,0.07)' },
    muted:     '#64748b',
    sub:       '#94a3b8',
    tabActive: { borderBottom:'2px solid #22c55e', color:'#4ade80', background:'rgba(34,197,94,0.08)' },
    tabInact:  { borderBottom:'2px solid transparent', color:'#64748b' },
    txt:       '#f1f5f9',
    accent:    '#22c55e',
  },
  light: {
    bg:        { background:'#f0f7f1', minHeight:'100vh', width:'100%', color:'#0f172a' },
    header:    { background:'rgba(255,255,255,0.95)', borderBottom:'1px solid #e2e8f0', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)' },
    card:      { background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:16, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
    glass:     { background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12 },
    input:     { background:'#ffffff', border:'1px solid #cbd5e1', color:'#0f172a', borderRadius:10, outline:'none' },
    track:     { background:'#e2e8f0', borderRadius:99 },
    pill:      { background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:10, color:'#475569' },
    divider:   { borderColor:'#e2e8f0' },
    muted:     '#94a3b8',
    sub:       '#64748b',
    tabActive: { borderBottom:'2px solid #16a34a', color:'#16a34a', background:'#f0fdf4' },
    tabInact:  { borderBottom:'2px solid transparent', color:'#64748b' },
    txt:       '#0f172a',
    accent:    '#16a34a',
  },
};

// ─── SMALL SHARED COMPONENTS ──────────────────────────────────────────────────
const Avatar = ({ name='', color='#22c55e', size=36 }) => (
  <div style={{ width:size, height:size, borderRadius:size, background:color, flexShrink:0,
    display:'flex', alignItems:'center', justifyContent:'center',
    fontWeight:800, fontSize:size*0.35, color:'#fff', letterSpacing:0.5 }}>
    {initials(name)||'?'}
  </div>
);

const StatCard = ({ Icon, label, value, sub, grad, th }) => (
  <div style={{ ...th.card, padding:20 }}>
    <div style={{ width:44, height:44, borderRadius:12, background:grad,
      display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
      <Icon sx={{ fontSize:20, color:'#fff' }}/>
    </div>
    <p style={{ fontSize:24, fontWeight:900, lineHeight:1, color:th.txt }}>{value}</p>
    <p style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.12em', color:th.muted, marginTop:4 }}>{label}</p>
    {sub && <p style={{ fontSize:12, color:th.sub, marginTop:2 }}>{sub}</p>}
  </div>
);

const ProgBar = ({ pct, color, th }) => (
  <div style={{ ...th.track, height:6, overflow:'hidden' }}>
    <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, background:color, borderRadius:99, transition:'width 0.6s ease' }}/>
  </div>
);

const Badge = ({ label, color='#22c55e' }) => (
  <span style={{ display:'inline-flex', borderRadius:8, padding:'2px 8px', fontSize:10,
    fontWeight:700, textTransform:'capitalize', letterSpacing:'0.04em',
    background:color+'18', color, border:`1px solid ${color}30` }}>{label}</span>
);

const Empty = ({ msg, th }) => (
  <div style={{ ...th.card, padding:'64px 24px', textAlign:'center' }}>
    <p style={{ color:th.muted, fontSize:14 }}>{msg}</p>
  </div>
);

const Divider = ({ th }) => (
  <div style={{ borderTop:`1px solid`, ...th.divider, margin:'0' }}/>
);

// ─── Public landing-page message board (moderation) ────────────────────────
// ─── Private support chat inbox ────────────────────────────────────────
const fmtChatTime = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return date.toLocaleDateString();
};

const MessagesTab = ({ th }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedId,    setSelectedId]    = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [reply,         setReply]         = useState('');
  const [sending,       setSending]       = useState(false);
  const scrollRef = useRef(null);

  const refresh = useCallback(async () => {
    setConversations(await listConversations());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    return subscribeToAllConversations((payload) => {
      const row = payload.new;
      if (!row || row.kind === 'team') return;
      setConversations(prev =>
        [row, ...prev.filter(c => c.id !== row.id)]
          .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at))
      );
    });
  }, []);

  useEffect(() => {
    if (!selectedId) { setMessages([]); return; }
    let cancelled = false;
    (async () => {
      const msgs = await fetchChatMessages(selectedId);
      if (cancelled) return;
      setMessages(msgs);
      await markConversationRead(selectedId, 'dev');
      setConversations(prev => prev.map(c => c.id === selectedId ? { ...c, unread_by_dev: false } : c));
    })();
    const unsub = subscribeToChatMessages(selectedId, (msg) => {
      setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
    });
    return () => { cancelled = true; unsub(); };
  }, [selectedId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const selected = conversations.find(c => c.id === selectedId);

  const handleReply = async () => {
    const body = reply.trim();
    if (!body || !selectedId || sending) return;
    setSending(true);
    try {
      const msg = await sendChatMessage(selectedId, { senderRole: 'dev', senderName: 'FARM-AGENT Team', body });
      setMessages(prev => [...prev, msg]);
      setReply('');
    } catch (e) {
      console.error('[MessagesTab] reply failed:', e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display:'grid', gap:16, gridTemplateColumns: '320px 1fr' }}>
      <div style={{ ...th.card, overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid', ...th.divider }}>
          <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:th.muted }}>
            Conversations ({conversations.length})
          </p>
        </div>
        <div style={{ maxHeight:'65vh', overflowY:'auto' }}>
          {conversations.map(c => (
            <button key={c.id} onClick={() => setSelectedId(c.id)}
              style={{ width:'100%', textAlign:'left', cursor:'pointer', border:'none', borderBottom:'1px solid',
                ...th.divider, padding:'12px 16px', background: selectedId === c.id ? 'rgba(34,197,94,0.10)' : 'transparent' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                <span style={{ fontSize:13, fontWeight:600, color:th.txt }}>{c.guest_name || c.role || 'Guest'}</span>
                {c.unread_by_dev && <span style={{ height:8, width:8, borderRadius:99, background:'#ef4444', flexShrink:0 }}/>}
              </div>
              <p style={{ fontSize:11, color:th.muted }}>{c.guest_email}</p>
              <div style={{ marginTop:4, display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ ...th.pill, fontSize:10, padding:'2px 8px', textTransform:'capitalize' }}>{c.portal}</span>
                <span style={{ fontSize:10, color:th.muted }}>{fmtChatTime(c.last_message_at)}</span>
              </div>
              {c.last_message_preview && <p style={{ marginTop:4, fontSize:11, color:th.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.last_message_preview}</p>}
            </button>
          ))}
          {conversations.length === 0 && (
            <p style={{ padding:'40px 16px', textAlign:'center', fontSize:13, color:th.muted }}>No conversations yet.</p>
          )}
        </div>
      </div>

      <div style={{ ...th.card, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {!selected ? (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:th.muted }}>
            Select a conversation to reply
          </div>
        ) : (
          <>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid', ...th.divider }}>
              <p style={{ fontSize:13, fontWeight:700, color:th.txt }}>{selected.guest_name || 'Guest'}</p>
              <p style={{ fontSize:11, color:th.muted }}>{selected.guest_email} · {selected.portal}</p>
            </div>
            <div ref={scrollRef} style={{ flex:1, overflowY:'auto', padding:'12px 16px', display:'flex', flexDirection:'column', gap:8, maxHeight:'48vh' }}>
              {messages.map(m => {
                const fromDev = m.sender_role === 'dev';
                return (
                  <div key={m.id} style={{ display:'flex', justifyContent: fromDev ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth:'75%', borderRadius:14, padding:'8px 12px', fontSize:13,
                      background: fromDev ? 'linear-gradient(135deg,#22c55e,#166534)' : th.glass.background,
                      color: fromDev ? '#fff' : th.txt, border: fromDev ? 'none' : th.glass.border }}>
                      {!fromDev && (
                        <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', color:th.muted, marginBottom:2 }}>
                          {m.sender_name || selected.role}
                        </p>
                      )}
                      <p style={{ whiteSpace:'pre-wrap', wordBreak:'break-word' }}>{m.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px', borderTop:'1px solid', ...th.divider }}>
              <input value={reply} onChange={e => setReply(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleReply(); }}
                placeholder="Reply as FARM-AGENT Team…"
                style={{ ...th.input, flex:1, padding:'8px 12px', fontSize:13, boxSizing:'border-box' }}/>
              <button onClick={handleReply} disabled={sending || !reply.trim()}
                style={{ cursor:'pointer', width:34, height:34, borderRadius:10, border:'none', flexShrink:0,
                  background:'linear-gradient(135deg,#16a34a,#064e3b)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                  opacity: (sending || !reply.trim()) ? 0.5 : 1 }}>
                <SendIcon sx={{ fontSize:15 }}/>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const PublicBoardTab = ({ th }) => {
  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [replying,   setReplying]   = useState(false);
  const [markingId,  setMarkingId]  = useState(null);
  const [markError,  setMarkError]  = useState('');
  const [grantTargetId, setGrantTargetId] = useState(null);
  const [grantAmount,   setGrantAmount]   = useState('');
  const [grantingId,    setGrantingId]    = useState(null);
  const [grantError,    setGrantError]    = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await devListAllLandingMessages(DEV_TOKEN));
    } catch (e) {
      console.error('[PublicBoardTab] failed to load messages:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleDelete = async (id) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await devDeleteLandingMessage(DEV_TOKEN, id);
      if (expandedId === id) setExpandedId(null);
      await refresh();
    } catch (e) {
      console.error('[PublicBoardTab] failed to delete message:', e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleReply = async (id) => {
    const body = replyDraft.trim();
    if (!body || replying) return;
    setReplying(true);
    try {
      await devReplyToLandingMessage(DEV_TOKEN, id, body);
      setReplyDraft('');
      await refresh();
    } catch (e) {
      console.error('[PublicBoardTab] failed to reply:', e);
    } finally {
      setReplying(false);
    }
  };

  const handleMarkCorrect = async (id) => {
    if (markingId) return;
    setMarkingId(id);
    setMarkError('');
    try {
      await devMarkCorrectAnswer(DEV_TOKEN, id);
      await refresh();
    } catch (e) {
      console.error('[PublicBoardTab] failed to mark correct answer:', e);
      setMarkError(e?.message || 'Failed to mark as correct answer.');
    } finally {
      setMarkingId(null);
    }
  };

  const handleOpenGrant = (id) => {
    setGrantTargetId(prev => (prev === id ? null : id));
    setGrantAmount('');
    setGrantError('');
  };

  const handleGrant = async (item) => {
    const amt = parseFloat(grantAmount);
    if (!amt || amt <= 0 || grantingId) return;
    setGrantingId(item.id);
    setGrantError('');
    try {
      await devGrantLandingBonus(DEV_TOKEN, item.user_id, amt, 'Manual grant from Public Board');
      setGrantTargetId(null);
      setGrantAmount('');
      await refresh();
    } catch (e) {
      console.error('[PublicBoardTab] failed to grant bonus:', e);
      setGrantError(e?.message || 'Failed to grant ICAN.');
    } finally {
      setGrantingId(null);
    }
  };

  const topLevel = items.filter(m => !m.parent_id);

  return (
    <div style={{ ...th.card, overflow:'hidden' }}>
      <div style={{ padding:'14px 20px', borderBottom:`1px solid`, ...th.divider, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:th.muted }}>
          Landing page messages ({topLevel.length})
        </p>
        <button onClick={refresh} title="Refresh"
          style={{ ...th.pill, cursor:'pointer', padding:'6px 9px', display:'flex', alignItems:'center', border:'none' }}>
          <RefreshIcon sx={{ fontSize:15, animation: loading ? 'spin 1s linear infinite' : 'none' }}/>
        </button>
      </div>
      <div style={{ maxHeight:'65vh', overflowY:'auto' }}>
        {topLevel.map((m, i) => {
          const replies = items.filter(it => it.parent_id === m.id);
          const isExpanded = expandedId === m.id;
          return (
            <div key={m.id}>
              <div style={{ padding:'14px 20px', display:'flex', alignItems:'flex-start', gap:12 }}>
                <div onClick={() => { setExpandedId(isExpanded ? null : m.id); setReplyDraft(''); }}
                  style={{ flex:1, minWidth:0, cursor:'pointer' }}>
                  <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:8, marginBottom:3 }}>
                    <span style={{ fontWeight:700, fontSize:13, color:th.txt }}>{m.name || 'Website visitor'}</span>
                    <Badge
                      label={m.is_public ? 'Public' : 'Private'}
                      color={m.is_public ? '#38bdf8' : '#fbbf24'}
                    />
                    {m.origin_app && <Badge label={m.origin_app} color="#a78bfa" />}
                    {m.reward_reason === 'popular' && <Badge label="🪙 Popular" color="#fbbf24" />}
                    <span style={{ fontSize:10, color:th.muted }}>{fmtTime(m.created_at)}</span>
                    {replies.length > 0 && (
                      <span style={{ fontSize:10, color:th.muted }}>· {replies.length} {replies.length===1?'reply':'replies'}</span>
                    )}
                  </div>
                  {m.email && <p style={{ fontSize:11, color:th.sub }}>{m.email}</p>}
                  <p style={{ fontSize:13, color:th.txt, marginTop:4, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>{m.message}</p>
                </div>
                <button onClick={() => handleDelete(m.id)} disabled={deletingId === m.id} title="Delete message"
                  style={{ cursor:'pointer', flexShrink:0, width:30, height:30, borderRadius:8, border:'none',
                    background:'rgba(248,113,113,0.10)', color:'#f87171', display:'flex', alignItems:'center', justifyContent:'center',
                    opacity: deletingId === m.id ? 0.4 : 1 }}>
                  <DeleteIcon sx={{ fontSize:15 }}/>
                </button>
              </div>

              {isExpanded && (
                <div style={{ padding:'0 20px 16px 52px' }}>
                  {m.user_id && (
                    <div style={{ marginBottom: 10 }}>
                      <button onClick={() => handleOpenGrant(m.id)}
                        style={{ cursor:'pointer', display:'inline-flex', alignItems:'center', gap:4,
                          fontSize:11, fontWeight:600, padding:'4px 8px', borderRadius:8, border:'1px solid rgba(245,158,11,0.3)',
                          background:'rgba(245,158,11,0.10)', color:'#fbbf24' }}>
                        <CardGiftcardIcon sx={{ fontSize:12 }}/> Grant ICAN to {m.name || 'this poster'}
                      </button>
                      {grantTargetId === m.id && (
                        <div style={{ marginTop:6, display:'flex', alignItems:'center', gap:8 }}>
                          <input type="number" min="0.01" step="0.01" value={grantAmount}
                            onChange={e => setGrantAmount(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleGrant(m); }}
                            placeholder="Amount"
                            style={{ ...th.input, width:100, padding:'6px 10px', fontSize:12, boxSizing:'border-box' }}/>
                          <button onClick={() => handleGrant(m)} disabled={grantingId === m.id || !grantAmount}
                            style={{ cursor:'pointer', padding:'6px 10px', borderRadius:8, border:'none', fontSize:11, fontWeight:700,
                              background:'#f59e0b', color:'#1e1300', opacity: (grantingId === m.id || !grantAmount) ? 0.5 : 1 }}>
                            {grantingId === m.id ? 'Granting…' : 'Confirm'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom: m.is_public ? 10 : 0 }}>
                    {replies.map(r => (
                      <div key={r.id} style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8,
                        borderRadius:10, padding:'8px 10px',
                        background: r.sender_role === 'dev' ? 'rgba(34,197,94,0.10)' : th.glass.background,
                        border: r.sender_role === 'dev' ? '1px solid rgba(34,197,94,0.25)' : th.glass.border }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:6 }}>
                            <span style={{ fontSize:12, fontWeight:700, color: r.sender_role==='dev' ? th.accent : th.txt }}>
                              {r.sender_role === 'dev' ? 'FARM-AGENT Team' : (r.name || 'Website visitor')}
                            </span>
                            {r.reward_reason && <Badge label="🪙 Correct answer" color="#fbbf24" />}
                            <span style={{ fontSize:10, color:th.muted }}>{fmtTime(r.created_at)}</span>
                          </div>
                          <p style={{ fontSize:12, color:th.txt, marginTop:2, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>{r.message}</p>
                          <div style={{ marginTop:6, display:'flex', flexWrap:'wrap', alignItems:'center', gap:6 }}>
                            {r.sender_role !== 'dev' && r.user_id && !r.rewarded_at && (
                              <button onClick={() => handleMarkCorrect(r.id)} disabled={markingId === r.id}
                                style={{ cursor:'pointer', display:'inline-flex', alignItems:'center', gap:4,
                                  fontSize:11, fontWeight:600, padding:'4px 8px', borderRadius:8, border:'1px solid rgba(34,197,94,0.3)',
                                  background:'rgba(34,197,94,0.10)', color:'#4ade80', opacity: markingId === r.id ? 0.5 : 1 }}>
                                <TaskAltIcon sx={{ fontSize:12 }}/> {markingId === r.id ? 'Marking…' : 'Mark correct answer (+1 ICAN)'}
                              </button>
                            )}
                            {r.sender_role !== 'dev' && r.user_id && (
                              <button onClick={() => handleOpenGrant(r.id)}
                                style={{ cursor:'pointer', display:'inline-flex', alignItems:'center', gap:4,
                                  fontSize:11, fontWeight:600, padding:'4px 8px', borderRadius:8, border:'1px solid rgba(245,158,11,0.3)',
                                  background:'rgba(245,158,11,0.10)', color:'#fbbf24' }}>
                                <CardGiftcardIcon sx={{ fontSize:12 }}/> Grant ICAN
                              </button>
                            )}
                          </div>
                          {grantTargetId === r.id && (
                            <div style={{ marginTop:6, display:'flex', alignItems:'center', gap:8 }}>
                              <input type="number" min="0.01" step="0.01" value={grantAmount}
                                onChange={e => setGrantAmount(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleGrant(r); }}
                                placeholder="Amount"
                                style={{ ...th.input, width:100, padding:'6px 10px', fontSize:12, boxSizing:'border-box' }}/>
                              <button onClick={() => handleGrant(r)} disabled={grantingId === r.id || !grantAmount}
                                style={{ cursor:'pointer', padding:'6px 10px', borderRadius:8, border:'none', fontSize:11, fontWeight:700,
                                  background:'#f59e0b', color:'#1e1300', opacity: (grantingId === r.id || !grantAmount) ? 0.5 : 1 }}>
                                {grantingId === r.id ? 'Granting…' : 'Confirm'}
                              </button>
                            </div>
                          )}
                        </div>
                        <button onClick={() => handleDelete(r.id)} disabled={deletingId === r.id} title="Delete reply"
                          style={{ cursor:'pointer', flexShrink:0, width:24, height:24, borderRadius:6, border:'none',
                            background:'rgba(248,113,113,0.10)', color:'#f87171', display:'flex', alignItems:'center', justifyContent:'center',
                            opacity: deletingId === r.id ? 0.4 : 1 }}>
                          <DeleteIcon sx={{ fontSize:12 }}/>
                        </button>
                      </div>
                    ))}
                    {replies.length === 0 && <p style={{ fontSize:11, color:th.muted }}>No replies yet.</p>}
                    {markError && <p style={{ fontSize:11, color:'#f87171' }}>{markError}</p>}
                    {grantError && <p style={{ fontSize:11, color:'#f87171' }}>{grantError}</p>}
                  </div>

                  {m.is_public && (
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <input value={replyDraft} onChange={e => setReplyDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleReply(m.id); }}
                        placeholder="Reply as FARM-AGENT Team…"
                        style={{ ...th.input, flex:1, padding:'8px 12px', fontSize:13, boxSizing:'border-box' }}/>
                      <button onClick={() => handleReply(m.id)} disabled={replying || !replyDraft.trim()}
                        style={{ cursor:'pointer', width:34, height:34, borderRadius:10, border:'none', flexShrink:0,
                          background:'linear-gradient(135deg,#16a34a,#064e3b)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                          opacity: (replying || !replyDraft.trim()) ? 0.5 : 1 }}>
                        <SendIcon sx={{ fontSize:15 }}/>
                      </button>
                    </div>
                  )}
                </div>
              )}
              {i < topLevel.length - 1 && <Divider th={th}/>}
            </div>
          );
        })}
        {!loading && topLevel.length === 0 && (
          <p style={{ padding:40, textAlign:'center', color:th.muted, fontSize:14 }}>No landing page messages yet.</p>
        )}
      </div>
    </div>
  );
};

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
const FarmDevDashboard = ({ onLogout }) => {
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem('farm_dev_theme')||'dark');
  const th = themes[themeKey];
  const toggle = () => { const n = themeKey==='dark'?'light':'dark'; setThemeKey(n); localStorage.setItem('farm_dev_theme',n); };

  const [tab,      setTab]      = useState('users');
  const [loading,  setLoading]  = useState(false);
  const [search,   setSearch]   = useState('');
  const [lastSync, setLastSync] = useState(null);
  const [copied,   setCopied]   = useState('');

  const [users,       setUsers]       = useState([]);
  const [farms,       setFarms]       = useState([]);
  const [suppliers,   setSuppliers]   = useState([]);
  const [wallets,     setWallets]     = useState({});
  const [walletRows,  setWalletRows]  = useState([]);
  const [subs,        setSubs]        = useState([]);
  const [subsReady,   setSubsReady]   = useState(false);
  const [blockchain,  setBlockchain]  = useState([]);
  const [systemTots,  setSystemTots]  = useState([]);

  const rpc = useCallback(async (fn, params={}) => {
    try {
      const { data, error } = await supabase.rpc(fn, { dev_token: DEV_TOKEN, ...params });
      if (error) { console.warn(`[FarmDev] ${fn}:`, error.message); return []; }
      return data || [];
    } catch(e) { console.warn(`[FarmDev] ${fn}:`, e); return []; }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [uR, fR, spR, wR, bcR, syR] = await Promise.all([
      rpc('farm_dev_get_profiles'),
      rpc('farm_dev_get_farms'),
      rpc('farm_dev_get_suppliers'),
      rpc('farm_dev_get_wallets'),
      rpc('farm_dev_get_blockchain'),
      rpc('farm_dev_system_totals'),
    ]);
    setUsers(uR);
    setFarms(fR);
    setSuppliers(spR);
    setWalletRows(wR);
    const wm = {}; wR.forEach(w => { wm[w.user_id] = w; }); setWallets(wm);
    setBlockchain(bcR);
    setSystemTots(syR);
    try {
      const { data, error } = await supabase.from('farm_subscriptions').select('*').order('created_at', { ascending: false });
      if (!error) { setSubs(data||[]); setSubsReady(true); }
      else { setSubsReady(false); setSubs([]); }
    } catch { setSubsReady(false); }
    setLastSync(new Date());
    setLoading(false);
  }, [rpc]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const grantBonus = async (uid, amt) => {
    await rpc('farm_dev_grant_bonus', { target_user_id: uid, bonus_amount: amt });
    await fetchAll();
  };

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text); setTimeout(() => setCopied(''), 1600);
  };

  // Subscription helpers
  const subFor = uid => subs.find(s => s.user_id === uid);
  const upsertSub = async (uid, plan) => {
    if (!subsReady) return;
    const existing = subFor(uid);
    if (existing) {
      const { data } = await supabase.from('farm_subscriptions').update({ plan, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single();
      if (data) setSubs(prev => prev.map(s => s.id === existing.id ? data : s));
    } else {
      const { data } = await supabase.from('farm_subscriptions').insert({ user_id: uid, plan, active: true }).select().single();
      if (data) setSubs(prev => [data, ...prev]);
    }
  };
  const toggleSub = async (id, current) => {
    await supabase.from('farm_subscriptions').update({ active: !current, updated_at: new Date().toISOString() }).eq('id', id);
    setSubs(prev => prev.map(s => s.id === id ? { ...s, active: !current } : s));
  };

  // Aggregates
  const totalIcan   = walletRows.reduce((s,w) => s+Number(w.ican_balance||0), 0);
  const totalEarned = walletRows.reduce((s,w) => s+Number(w.total_earned||0), 0);
  const totalTithe  = walletRows.reduce((s,w) => s+Number(w.total_tithe_paid||0), 0);
  const totalAcres  = farms.reduce((s,f) => s+Number(f.size_acres||0), 0);
  const bcVerified  = blockchain.filter(b => b.is_verified).length;
  const bcPending   = blockchain.length - bcVerified;

  const q = search.toLowerCase();
  const filteredUsers    = q ? users.filter(u => (`${u.first_name} ${u.last_name} ${u.email||''}`).toLowerCase().includes(q)) : users;
  const filteredFarms    = q ? farms.filter(f => (`${f.name} ${f.location||''}`).toLowerCase().includes(q)) : farms;
  const filteredSuppliers= q ? suppliers.filter(s => (`${s.title} ${s.location||''} ${s.type}`).toLowerCase().includes(q)) : suppliers;

  const avatarColors = ['#22c55e','#f59e0b','#38bdf8','#a78bfa','#f97316','#ec4899','#14b8a6'];
  const ac = (i) => avatarColors[i % avatarColors.length];

  const typeColor = { land:'#f59e0b', produce:'#22c55e', service:'#38bdf8', other:'#94a3b8' };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={th.bg}>

      {/* ══ HEADER ══ */}
      <div style={{ position:'sticky', top:0, zIndex:50, ...th.header }}>
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#16a34a,#064e3b)',
              display:'flex', alignItems:'center', justifyContent:'center', position:'relative', flexShrink:0, boxShadow:'0 4px 16px rgba(22,163,74,0.3)' }}>
              <AgricultureIcon sx={{ fontSize:20, color:'#fff' }}/>
              <div style={{ position:'absolute', top:-2, right:-2, width:10, height:10, borderRadius:10,
                background:'#4ade80', border:`2px solid ${themeKey==='dark'?'#030b06':'#f0f7f1'}` }}/>
            </div>
            <div>
              <p style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.2em', color:th.muted, lineHeight:1 }}>Dev Console</p>
              <p style={{ fontSize:14, fontWeight:900, color:th.txt, lineHeight:1.3 }}>AgriBone</p>
            </div>
          </div>

          {/* Right controls */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {lastSync && (
              <span style={{ fontSize:10, color:th.muted, display:'none' }}
                className="sm-show">{lastSync.toLocaleTimeString()}</span>
            )}
            <button onClick={fetchAll} disabled={loading} title="Refresh"
              style={{ ...th.pill, cursor:'pointer', padding:'7px 10px', display:'flex', alignItems:'center' }}>
              <RefreshIcon sx={{ fontSize:16, animation: loading ? 'spin 1s linear infinite' : 'none' }}/>
            </button>
            <button onClick={toggle}
              style={{ ...th.pill, cursor:'pointer', padding:'7px 10px', display:'flex', alignItems:'center' }}>
              {themeKey==='dark'?<LightModeIcon sx={{fontSize:16}}/>:<DarkModeIcon sx={{fontSize:16}}/>}
            </button>
            <button onClick={onLogout}
              style={{ cursor:'pointer', padding:'7px 14px', borderRadius:10, border:'1px solid rgba(248,113,113,0.25)',
                background:'rgba(248,113,113,0.10)', color:'#f87171', fontSize:12, fontWeight:600,
                display:'flex', alignItems:'center', gap:6 }}>
              <LogoutIcon sx={{fontSize:14}}/> Exit
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 24px', display:'flex', overflowX:'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSearch(''); }}
              style={{ cursor:'pointer', padding:'11px 18px', display:'flex', alignItems:'center', gap:7,
                fontSize:12, fontWeight:600, whiteSpace:'nowrap', transition:'all 0.15s',
                background:'transparent', border:'none',
                ...(tab===t.id ? th.tabActive : th.tabInact) }}>
              <t.Icon sx={{fontSize:14}}/>{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div style={{ maxWidth:1400, margin:'0 auto', padding:'24px 24px 48px' }}>

        {/* Search */}
        {['users','farms','suppliers'].includes(tab) && (
          <div style={{ position:'relative', marginBottom:20 }}>
            <SearchIcon sx={{ fontSize:16, position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:th.muted }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
              style={{ ...th.input, width:'100%', boxSizing:'border-box', padding:'10px 14px 10px 36px', fontSize:14 }}/>
          </div>
        )}

        {/* ═══ USERS TAB ═══ */}
        {tab==='users' && (<>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:20 }}>
            <StatCard Icon={PeopleIcon}              label="Registered Users"   value={fmt(users.length)}      grad="linear-gradient(135deg,#16a34a,#064e3b)"  th={th}/>
            <StatCard Icon={AccountBalanceWalletIcon} label="Total icaneracoin"  value={fmtI(totalIcan)}        grad="linear-gradient(135deg,#0891b2,#0e7490)"  sub={fmtUGX(totalIcan)} th={th}/>
            <StatCard Icon={TrendingUpIcon}           label="Total Earned"       value={fmtI(totalEarned)}      grad="linear-gradient(135deg,#7c3aed,#5b21b6)"  sub={fmtUGX(totalEarned)} th={th}/>
            <StatCard Icon={VerifiedIcon}             label="Total Tithe Paid"   value={fmtI(totalTithe)}       grad="linear-gradient(135deg,#d97706,#b45309)"  sub={fmtUGX(totalTithe)} th={th}/>
          </div>

          <div style={th.card}>
            <div style={{ padding:'14px 20px', borderBottom:`1px solid`, ...th.divider }}>
              <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:th.muted }}>
                All Users ({filteredUsers.length})
              </p>
            </div>
            {filteredUsers.map((u, i) => {
              const w = wallets[u.id];
              const sub = subFor(u.id);
              const name = `${u.first_name||''} ${u.last_name||''}`.trim() || u.email || '—';
              return (
                <div key={u.id}>
                  <div style={{ padding:'14px 20px', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                    <Avatar name={name} color={ac(i)} size={40}/>
                    <div style={{ flex:1, minWidth:120 }}>
                      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:8, marginBottom:2 }}>
                        <span style={{ fontWeight:700, fontSize:14, color:th.txt }}>{name}</span>
                        {u.farmer_type && <Badge label={u.farmer_type} color={th.accent}/>}
                        {sub && <Badge label={sub.plan} color={PLAN_CLR[sub.plan]}/>}
                        {sub && !sub.active && <Badge label="paused" color="#64748b"/>}
                      </div>
                      <p style={{ fontSize:12, color:th.sub }}>{u.email}</p>
                      <p style={{ fontSize:11, color:th.muted }}>
                        {u.phone_number||'—'}{u.farm_location||u.location ? ` · ${u.farm_location||u.location}` : ''}
                        {u.farm_size ? ` · ${u.farm_size} acres` : ''}
                        <span style={{ marginLeft:6, color:th.muted }}>Joined {fmtDate(u.created_at)}</span>
                      </p>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ fontWeight:800, fontSize:15, color:'#38bdf8' }}>{w ? fmtI(w.ican_balance) : '0.00'}</p>
                      <p style={{ fontSize:11, color:th.muted }}>{w ? fmtUGX(w.ican_balance) : '—'}</p>
                    </div>
                    <button onClick={() => grantBonus(u.id, 10)}
                      style={{ cursor:'pointer', padding:'6px 12px', borderRadius:8,
                        border:'1px solid rgba(251,191,36,0.25)', background:'rgba(251,191,36,0.10)',
                        color:'#fbbf24', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                      <CardGiftcardIcon sx={{fontSize:13}}/> +10 ICAN
                    </button>
                  </div>
                  {i < filteredUsers.length-1 && <Divider th={th}/>}
                </div>
              );
            })}
            {filteredUsers.length===0 && <p style={{ padding:40, textAlign:'center', color:th.muted, fontSize:14 }}>No users found.</p>}
          </div>
        </>)}

        {/* ═══ FARMS TAB ═══ */}
        {tab==='farms' && (<>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:20 }}>
            <StatCard Icon={AgricultureIcon} label="Registered Farms" value={fmt(farms.length)}         grad="linear-gradient(135deg,#16a34a,#064e3b)" th={th}/>
            <StatCard Icon={TrendingUpIcon}  label="Total Acres"      value={fmt(Math.round(totalAcres))} grad="linear-gradient(135deg,#0891b2,#0e7490)" sub="combined farmland" th={th}/>
            <StatCard Icon={PeopleIcon}      label="Farm Owners"      value={fmt(new Set(farms.map(f=>f.user_id)).size)} grad="linear-gradient(135deg,#7c3aed,#5b21b6)" th={th}/>
          </div>

          <div style={th.card}>
            <div style={{ padding:'14px 20px', borderBottom:`1px solid`, ...th.divider }}>
              <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:th.muted }}>
                All Registered Farms ({filteredFarms.length})
              </p>
            </div>
            {filteredFarms.map((f, i) => {
              const owner = users.find(u => u.id === f.user_id);
              const ownerName = owner ? `${owner.first_name||''} ${owner.last_name||''}`.trim() || owner.email : '—';
              const ican = wallets[f.user_id];
              return (
                <div key={f.id}>
                  <div style={{ padding:'16px 20px', display:'flex', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#16a34a,#064e3b)',
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <AgricultureIcon sx={{ fontSize:20, color:'#fff' }}/>
                    </div>
                    <div style={{ flex:1, minWidth:160 }}>
                      <p style={{ fontWeight:700, fontSize:15, color:th.txt, marginBottom:3 }}>{f.name}</p>
                      <p style={{ fontSize:12, color:th.sub }}>Owner: {ownerName}</p>
                      <p style={{ fontSize:11, color:th.muted }}>
                        {f.location||'—'}{f.farm_type ? ` · ${f.farm_type}` : ''} · Registered {fmtDate(f.created_at)}
                      </p>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ fontWeight:800, fontSize:18, color:th.accent }}>{fmt(Math.round(f.size_acres))}</p>
                      <p style={{ fontSize:11, color:th.muted }}>acres</p>
                      {ican && <p style={{ fontSize:12, color:'#38bdf8', marginTop:2 }}>{fmtI(ican.ican_balance)} ICAN</p>}
                    </div>
                  </div>
                  {i < filteredFarms.length-1 && <Divider th={th}/>}
                </div>
              );
            })}
            {filteredFarms.length===0 && <p style={{ padding:40, textAlign:'center', color:th.muted, fontSize:14 }}>No farms registered yet.</p>}
          </div>
        </>)}

        {/* ═══ SUPPLIERS TAB ═══ */}
        {tab==='suppliers' && (<>
          {/* Type breakdown */}
          {(()=>{
            const byType = suppliers.reduce((acc,s)=>{ const k=s.type||'other'; acc[k]=(acc[k]||0)+1; return acc; },{});
            return (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:20 }}>
                {Object.entries(byType).map(([type,count])=>(
                  <StatCard key={type} Icon={StorefrontIcon} label={type} value={fmt(count)}
                    grad={`linear-gradient(135deg,${typeColor[type]||'#64748b'},${typeColor[type]||'#64748b'}99)`} th={th}/>
                ))}
                <StatCard Icon={TrendingUpIcon} label="Total Listings" value={fmt(suppliers.length)} grad="linear-gradient(135deg,#7c3aed,#5b21b6)" th={th}/>
              </div>
            );
          })()}

          <div style={th.card}>
            <div style={{ padding:'14px 20px', borderBottom:`1px solid`, ...th.divider }}>
              <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:th.muted }}>
                Marketplace Suppliers ({filteredSuppliers.length})
              </p>
            </div>
            {filteredSuppliers.map((s, i) => {
              const owner = users.find(u => u.id === s.user_id);
              const ownerName = owner ? `${owner.first_name||''} ${owner.last_name||''}`.trim() || owner.email : '—';
              const color = typeColor[s.type] || '#64748b';
              return (
                <div key={s.id}>
                  <div style={{ padding:'14px 20px', display:'flex', alignItems:'flex-start', gap:14, flexWrap:'wrap' }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:`${color}18`,
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1px solid ${color}30` }}>
                      <StorefrontIcon sx={{ fontSize:18, color }}/>
                    </div>
                    <div style={{ flex:1, minWidth:160 }}>
                      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:8, marginBottom:3 }}>
                        <span style={{ fontWeight:700, fontSize:14, color:th.txt }}>{s.title}</span>
                        <Badge label={s.type} color={color}/>
                        <Badge label={s.status} color={s.status==='active'?th.accent:'#64748b'}/>
                      </div>
                      <p style={{ fontSize:12, color:th.sub }}>Supplier: {ownerName}</p>
                      <p style={{ fontSize:11, color:th.muted }}>
                        {s.location||'—'}{s.district ? ` · ${s.district}` : ''} · {fmt(s.views)} views · {fmtDate(s.created_at)}
                      </p>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      {Number(s.price)>0
                        ? <><p style={{ fontWeight:800, fontSize:15, color:th.accent }}>UGX {fmt(s.price)}</p>
                            <p style={{ fontSize:10, color:th.muted }}>listed price</p></>
                        : <p style={{ fontSize:12, color:th.muted }}>Negotiable</p>
                      }
                    </div>
                  </div>
                  {i < filteredSuppliers.length-1 && <Divider th={th}/>}
                </div>
              );
            })}
            {filteredSuppliers.length===0 && <p style={{ padding:40, textAlign:'center', color:th.muted, fontSize:14 }}>No suppliers yet.</p>}
          </div>
        </>)}

        {/* ═══ SUBSCRIPTIONS TAB ═══ */}
        {tab==='subscriptions' && (<>
          {!subsReady ? (
            <div style={{ ...th.card, padding:24 }}>
              <p style={{ fontWeight:700, color:'#fbbf24', marginBottom:8 }}>Subscriptions table not ready</p>
              <p style={{ fontSize:13, color:th.sub }}>Run <strong>DEV_PANEL_ACCESS.sql</strong> in Supabase SQL Editor then refresh.</p>
            </div>
          ) : (<>
            {/* Plan summary */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
              {PLANS.map(plan => {
                const cnt = subs.filter(s=>s.plan===plan&&s.active).length;
                return (
                  <div key={plan} style={{ borderRadius:16, padding:20, background:PLAN_GRAD[plan], border:'1px solid rgba(255,255,255,0.10)' }}>
                    <p style={{ fontSize:28, fontWeight:900, color:'#fff', lineHeight:1 }}>{cnt}</p>
                    <p style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:'rgba(255,255,255,0.7)', marginTop:4, textTransform:'capitalize' }}>{plan}</p>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:2 }}>
                      {plan==='basic'?'Free':plan==='pro'?'UGX 30,000/mo':'UGX 80,000/mo'}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Bulk apply */}
            <div style={{ ...th.glass, padding:16, marginBottom:16, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
              <p style={{ fontSize:12, fontWeight:700, color:th.muted, textTransform:'uppercase', letterSpacing:'0.1em', flexShrink:0 }}>Bulk Apply:</p>
              {PLANS.map(plan => (
                <button key={plan} onClick={async()=>{ for(const u of users) await upsertSub(u.id,plan); }}
                  style={{ cursor:'pointer', padding:'7px 18px', borderRadius:10, border:'none',
                    background:PLAN_GRAD[plan], color:'#fff', fontSize:12, fontWeight:700, textTransform:'capitalize' }}>
                  All → {plan}
                </button>
              ))}
            </div>

            {/* Per-user list */}
            <div style={th.card}>
              <div style={{ padding:'14px 20px', borderBottom:`1px solid`, ...th.divider }}>
                <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:th.muted }}>User Plans</p>
              </div>
              {users.map((u, i) => {
                const sub = subFor(u.id);
                const name = `${u.first_name||''} ${u.last_name||''}`.trim() || u.email || '—';
                return (
                  <div key={u.id}>
                    <div style={{ padding:'12px 20px', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                      <Avatar name={name} color={ac(i)} size={36}/>
                      <div style={{ flex:1, minWidth:120 }}>
                        <p style={{ fontWeight:600, fontSize:13, color:th.txt }}>{name}</p>
                        <p style={{ fontSize:11, color:th.muted }}>{u.email}</p>
                      </div>
                      <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                        {PLANS.map(plan => (
                          <button key={plan} onClick={() => upsertSub(u.id, plan)}
                            style={{ cursor:'pointer', padding:'5px 12px', borderRadius:8, fontSize:11, fontWeight:700,
                              textTransform:'capitalize', transition:'all 0.15s',
                              background: sub?.plan===plan ? PLAN_GRAD[plan] : 'transparent',
                              color: sub?.plan===plan ? '#fff' : th.muted,
                              border: sub?.plan===plan ? 'none' : `1px solid rgba(255,255,255,0.12)` }}>
                            {plan}
                          </button>
                        ))}
                        {sub && (
                          <button onClick={() => toggleSub(sub.id, sub.active)}
                            style={{ cursor:'pointer', padding:'5px 10px', borderRadius:8, fontSize:11, fontWeight:700,
                              display:'flex', alignItems:'center', gap:4, border:'none',
                              background: sub.active ? 'rgba(248,113,113,0.12)' : 'rgba(74,222,128,0.12)',
                              color: sub.active ? '#f87171' : '#4ade80' }}>
                            {sub.active ? <><ToggleOffIcon sx={{fontSize:14}}/>Pause</> : <><ToggleOnIcon sx={{fontSize:14}}/>Resume</>}
                          </button>
                        )}
                      </div>
                    </div>
                    {i < users.length-1 && <Divider th={th}/>}
                  </div>
                );
              })}
              {users.length===0 && <p style={{ padding:40, textAlign:'center', color:th.muted, fontSize:14 }}>No users found.</p>}
            </div>
          </>)}
        </>)}

        {/* ═══ VALUE & BLOCKCHAIN TAB ═══ */}
        {tab==='value' && (<>
          {/* ICAN value cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:20 }}>
            <StatCard Icon={MonetizationOnIcon}      label="ICAN in Circulation"   value={fmtI(totalIcan)}    grad="linear-gradient(135deg,#0891b2,#0e7490)"  sub={fmtUGX(totalIcan)}   th={th}/>
            <StatCard Icon={TrendingUpIcon}           label="Total Ever Earned"     value={fmtI(totalEarned)}  grad="linear-gradient(135deg,#16a34a,#064e3b)"  sub={fmtUGX(totalEarned)} th={th}/>
            <StatCard Icon={VerifiedIcon}             label="Total Tithe Collected" value={fmtI(totalTithe)}   grad="linear-gradient(135deg,#d97706,#b45309)"  sub={fmtUGX(totalTithe)}  th={th}/>
            <StatCard Icon={LockIcon}                 label="Blockchain Records"     value={fmt(blockchain.length)} grad="linear-gradient(135deg,#7c3aed,#5b21b6)" sub={`${fmt(bcVerified)} verified`} th={th}/>
          </div>

          {/* ICAN floor reference */}
          <div style={{ ...th.card, padding:20, marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <MonetizationOnIcon sx={{ fontSize:18, color:th.accent }}/>
              <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:th.muted }}>icaneracoin Reference Rate</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12 }}>
              {[
                { label:'Floor price',   val:'1 ICAN = 5,000 UGX', color:'#38bdf8' },
                { label:'Tithe rate',    val:'10% auto-deducted',   color:'#fbbf24' },
                { label:'System value',  val:`UGX ${fmt(totalIcan*ICAN_TO_UGX)}`, color:th.accent },
                { label:'Active holders',val:fmt(walletRows.filter(w=>Number(w.ican_balance)>0).length), color:'#a78bfa' },
              ].map(r => (
                <div key={r.label} style={{ ...th.glass, padding:14 }}>
                  <p style={{ fontSize:15, fontWeight:800, color:r.color }}>{r.val}</p>
                  <p style={{ fontSize:11, color:th.muted, marginTop:3 }}>{r.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ICAN distribution by farmer type */}
          {systemTots.length > 0 && (
            <div style={{ ...th.card, padding:20, marginBottom:16 }}>
              <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:th.muted, marginBottom:14 }}>
                icaneracoin by Farmer Type
              </p>
              {systemTots.map((r,i) => {
                const colors = ['#22c55e','#f59e0b','#38bdf8','#a78bfa','#f97316'];
                const pct = totalIcan>0 ? (Number(r.total_balance)/totalIcan)*100 : 0;
                return (
                  <div key={r.farmer_type} style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:13, fontWeight:600, textTransform:'capitalize', color:th.txt }}>{r.farmer_type||'general'}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:colors[i%colors.length] }}>{fmtI(r.total_balance)} ICAN <span style={{ fontSize:11, color:th.muted }}>({pct.toFixed(1)}%)</span></span>
                    </div>
                    <ProgBar pct={pct} color={colors[i%colors.length]} th={th}/>
                    <p style={{ fontSize:10, color:th.muted, marginTop:3 }}>{fmt(r.user_count)} farmers · {fmt(r.farm_count)} farms · Tithe: {fmtI(r.total_tithe)} ICAN</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Blockchain security records */}
          <div style={{ ...th.card, overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:`1px solid`, ...th.divider, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <LockIcon sx={{ fontSize:14, color:th.accent }}/>
                <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:th.muted }}>Message Blockchain Security</p>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <span style={{ fontSize:11, background:'rgba(74,222,128,0.12)', color:'#4ade80', borderRadius:8, padding:'3px 10px', fontWeight:700 }}>
                  {fmt(bcVerified)} verified
                </span>
                {bcPending>0 && (
                  <span style={{ fontSize:11, background:'rgba(251,191,36,0.12)', color:'#fbbf24', borderRadius:8, padding:'3px 10px', fontWeight:700 }}>
                    {fmt(bcPending)} pending
                  </span>
                )}
              </div>
            </div>

            {blockchain.length===0 && (
              <p style={{ padding:40, textAlign:'center', color:th.muted, fontSize:14 }}>No blockchain records yet. Run the SQL in Supabase.</p>
            )}

            {blockchain.slice(0,30).map((bc, i) => (
              <div key={bc.id}>
                <div style={{ padding:'12px 20px', display:'flex', alignItems:'flex-start', gap:14, flexWrap:'wrap' }}>
                  {/* Verified indicator */}
                  <div style={{ flexShrink:0, marginTop:2 }}>
                    {bc.is_verified
                      ? <GppGoodIcon sx={{ fontSize:22, color:'#4ade80' }}/>
                      : <GppBadIcon  sx={{ fontSize:22, color:'#fbbf24' }}/>}
                  </div>

                  <div style={{ flex:1, minWidth:160 }}>
                    {/* Record hash */}
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                      <TagIcon sx={{ fontSize:11, color:th.muted }}/>
                      <span style={{ fontSize:11, fontFamily:'monospace', color:'#38bdf8' }}>{shortHash(bc.record_hash)}</span>
                      <button onClick={() => copyText(bc.record_hash||'')}
                        style={{ cursor:'pointer', background:'none', border:'none', padding:2, color:th.muted, display:'flex' }}>
                        {copied===bc.record_hash
                          ? <CheckCircleIcon sx={{ fontSize:11, color:'#4ade80' }}/>
                          : <ContentCopyIcon sx={{ fontSize:11 }}/>}
                      </button>
                    </div>
                    {/* TX hash */}
                    {bc.blockchain_tx_hash && (
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                        <LockIcon sx={{ fontSize:11, color:th.muted }}/>
                        <span style={{ fontSize:11, fontFamily:'monospace', color:th.sub }}>{shortHash(bc.blockchain_tx_hash)}</span>
                        <button onClick={() => copyText(bc.blockchain_tx_hash||'')}
                          style={{ cursor:'pointer', background:'none', border:'none', padding:2, color:th.muted, display:'flex' }}>
                          {copied===bc.blockchain_tx_hash
                            ? <CheckCircleIcon sx={{ fontSize:11, color:'#4ade80' }}/>
                            : <ContentCopyIcon sx={{ fontSize:11 }}/>}
                        </button>
                      </div>
                    )}
                    <p style={{ fontSize:10, color:th.muted }}>
                      {fmtTime(bc.created_at)}
                      {bc.verified_at ? ` · Verified ${fmtTime(bc.verified_at)}` : ''}
                    </p>
                  </div>

                  <div style={{ flexShrink:0 }}>
                    <span style={{
                      fontSize:10, fontWeight:700, borderRadius:8, padding:'3px 10px',
                      background: bc.is_verified ? 'rgba(74,222,128,0.12)' : 'rgba(251,191,36,0.12)',
                      color: bc.is_verified ? '#4ade80' : '#fbbf24',
                      border: `1px solid ${bc.is_verified ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)'}`,
                    }}>{bc.is_verified ? 'Verified' : 'Pending'}</span>
                  </div>
                </div>
                {i < Math.min(blockchain.length,30)-1 && <Divider th={th}/>}
              </div>
            ))}

            {blockchain.length > 30 && (
              <p style={{ padding:'10px 20px', textAlign:'center', fontSize:11, color:th.muted, borderTop:`1px solid`, ...th.divider }}>
                Showing 30 of {fmt(blockchain.length)} records
              </p>
            )}
          </div>
        </>)}

        {/* ═══ PUBLIC BOARD TAB ═══ */}
        {tab==='board' && <PublicBoardTab th={th}/>}
        {tab==='messages' && <MessagesTab th={th}/>}
        {tab==='api' && <EraApiDevTab theme={themeKey}/>}

      </div>

      {/* spin keyframes */}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
const DevPanel = () => {
  const navigate = useNavigate();
  const authenticated = sessionStorage.getItem(SESSION_KEY) === 'true';
  useEffect(() => { if (!authenticated) navigate('/', { replace: true }); }, [authenticated, navigate]);
  const handleLogout = () => { sessionStorage.removeItem(SESSION_KEY); navigate('/', { replace: true }); };
  if (!authenticated) return null;
  return <FarmDevDashboard onLogout={handleLogout}/>;
};

export default DevPanel;
