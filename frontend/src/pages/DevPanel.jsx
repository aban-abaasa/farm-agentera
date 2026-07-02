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
              <p style={{ fontSize:14, fontWeight:900, color:th.txt, lineHeight:1.3 }}>Backbone</p>
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
