import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
  Avatar,
  Tooltip,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import { useAppTheme } from '../context/ThemeContext';
import {
  Search,
  CloudDownload,
  ArrowForward,
  Mail,
  BookmarkBorder,
  Share,
  FilterList,
  TrendingUp,
  AccessTime,
  School,
  People,
  InsertDriveFile,
  Star,
  Verified,
  ContactMail,
  Close,
  Group,
  Edit,
  Delete,
  Person,
  CheckCircle,
  GroupAdd
} from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { resourceCategories, featuredResources, recentResources } from '../mocks/resources.jsx';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

// Mock labor data
const mockLaborSources = [
  { id: 1, name: 'John Okello', skills: ['Ploughing', 'Harvesting'], location: 'Lira', contact: '0701234567', rating: 4.8, verified: true },
  { id: 2, name: 'Grace Namatovu', skills: ['Irrigation', 'Weeding'], location: 'Mbarara', contact: '0789876543', rating: 4.6, verified: false },
  { id: 3, name: 'Peter Mugisha', skills: ['Planting', 'Fertilizing'], location: 'Gulu', contact: '0751122334', rating: 4.9, verified: true },
  { id: 4, name: 'Sarah Achieng', skills: ['Harvesting', 'Sorting'], location: 'Jinja', contact: '0779988776', rating: 4.7, verified: false },
  { id: 5, name: 'David Ssemanda', skills: ['Tractor Operation', 'Land Clearing'], location: 'Masaka', contact: '0798765432', rating: 4.5, verified: true },
];

const initialMockGroups = [
  {
    id: 1,
    name: 'Harvest Team',
    description: 'Specialists in crop harvesting and post-harvest handling.',
    members: [1, 4],
    leaderId: 1,
  },
  {
    id: 2,
    name: 'Irrigation Crew',
    description: 'Experts in irrigation and water management.',
    members: [2, 3],
    leaderId: 2,
  },
];

const LabourResourcingSection = () => {
  const [laborSkill, setLaborSkill] = useState('');
  const [laborLocation, setLaborLocation] = useState('');
  const [groups, setGroups] = useState(initialMockGroups);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [editGroupId, setEditGroupId] = useState(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');
  const [editGroupMembers, setEditGroupMembers] = useState([]);
  const [editGroupLeader, setEditGroupLeader] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [bookingGroup, setBookingGroup] = useState(null);
  const [bookingCount, setBookingCount] = useState([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingStep, setBookingStep] = useState(0);
  const [bookingDetails, setBookingDetails] = useState({ date: '', time: '', location: '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState('mobile');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const theme = useTheme();
  const { themeMode } = useAppTheme();
  const isDark = themeMode === 'dark';
  const filteredLabor = mockLaborSources.filter(l =>
    (!laborSkill || l.skills.some(s => s.toLowerCase().includes(laborSkill.toLowerCase()))) &&
    (!laborLocation || l.location.toLowerCase().includes(laborLocation.toLowerCase()))
  );

  // Group helpers
  const getLaborerById = id => mockLaborSources.find(l => l.id === id);

  // Group creation handlers
  const handleOpenCreateGroup = () => {
    setCreateGroupOpen(true);
    setNewGroupName('');
    setNewGroupDesc('');
    setSelectedGroupMembers([]);
  };
  const handleCloseCreateGroup = () => setCreateGroupOpen(false);
  const handleToggleGroupMember = (id) => {
    setSelectedGroupMembers(prev => prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]);
  };
  const handleCreateGroup = () => {
    if (!newGroupName || selectedGroupMembers.length === 0) return;
    setGroups(prev => [
      ...prev,
      {
        id: prev.length + 1,
        name: newGroupName,
        description: newGroupDesc,
        members: selectedGroupMembers,
        leaderId: selectedGroupMembers[0],
      },
    ]);
    setCreateGroupOpen(false);
  };

  // Edit group handlers
  const handleEditGroup = (group) => {
    setEditGroupId(group.id);
    setEditGroupName(group.name);
    setEditGroupDesc(group.description);
    setEditGroupMembers(group.members);
    setEditGroupLeader(group.leaderId);
  };
  const handleSaveEditGroup = () => {
    setGroups(prev => prev.map(g => g.id === editGroupId ? {
      ...g,
      name: editGroupName,
      description: editGroupDesc,
      members: editGroupMembers,
      leaderId: editGroupLeader,
    } : g));
    setEditGroupId(null);
  };
  const handleCancelEditGroup = () => setEditGroupId(null);
  const handleDeleteGroup = (id) => setDeleteConfirmId(id);
  const handleConfirmDeleteGroup = () => {
    setGroups(prev => prev.filter(g => g.id !== deleteConfirmId));
    setDeleteConfirmId(null);
  };
  const handleCancelDeleteGroup = () => setDeleteConfirmId(null);

  // Booking handlers
  const handleBookGroup = (group) => {
    setBookingGroup(group);
    setBookingCount(group.members);
    setBookingStep(0);
    setBookingDetails({ date: '', time: '', location: '', notes: '' });
    setPaymentMethod('mobile');
  };
  const handleConfirmBooking = () => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setBookingGroup(null);
      }, 2000);
    }, 2000);
  };
  const handleCancelBooking = () => setBookingGroup(null);

  return (
    <Box>
      {/* Hero Banner */}
      <Paper elevation={3} sx={{ 
        p: { xs: 3, md: 6 }, 
        mb: 6, 
        borderRadius: 4, 
        background: isDark
          ? `linear-gradient(120deg, ${theme.palette.grey[800]} 0%, ${theme.palette.primary.dark}40 100%)`
          : `linear-gradient(120deg, ${theme.palette.primary.light}20 0%, ${theme.palette.success.light}20 100%)`,
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        <Box sx={{ 
          position: 'absolute', 
          top: -40, 
          right: -40, 
          width: 180, 
          height: 180, 
          borderRadius: '50%', 
          background: `radial-gradient(circle, ${theme.palette.success.main} 0%, ${alpha(theme.palette.success.main, 0)} 70%)`, 
          opacity: 0.12 
        }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight="bold" color="primary.main" gutterBottom>
            Labour Resourcing
          </Typography>
          <Typography variant="h6" color="text.secondary" mb={2}>
            Find skilled laborers for your farm or offer your services to the community. Filter by skill or location.
          </Typography>
        </Box>
      </Paper>
      {/* Filters */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Filter by Skill"
            value={laborSkill}
            onChange={e => setLaborSkill(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ mb: { xs: 2, md: 0 } }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Filter by Location"
            value={laborLocation}
            onChange={e => setLaborLocation(e.target.value)}
            fullWidth
            variant="outlined"
          />
        </Grid>
      </Grid>
      {/* Labor Groups Section */}
      <Paper elevation={2} sx={{ 
        mb: 4, 
        p: 3, 
        borderRadius: 3, 
        background: isDark
          ? `linear-gradient(120deg, ${theme.palette.grey[800]} 0%, ${theme.palette.primary.dark}30 100%)`
          : `linear-gradient(120deg, ${theme.palette.success.light}20 0%, ${theme.palette.primary.light}20 100%)`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <GroupIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h5" fontWeight="bold" color="primary.main">Labor Groups</Typography>
          <Button variant="contained" color="primary" sx={{ ml: 'auto', borderRadius: 2, fontWeight: 'bold' }} onClick={handleOpenCreateGroup} startIcon={<GroupAdd />}>
            Create Group
          </Button>
        </Box>
        <Grid container spacing={2}>
          {groups.length === 0 ? (
            <Grid item xs={12}><Typography>No groups yet. Create one!</Typography></Grid>
          ) : groups.map(group => {
            const leader = getLaborerById(group.leaderId);
            return (
              <Grid item xs={12} md={6} lg={4} key={group.id}>
                <Card sx={{ 
                  p: 2, 
                  borderRadius: 3, 
                  mb: 2, 
                  boxShadow: 3, 
                  backgroundColor: theme.palette.background.paper, 
                  transition: '0.2s', 
                  '&:hover': { boxShadow: 8 } 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <GroupIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">{group.name}</Typography>
                    {leader && <Tooltip title="Group Leader"><CheckCircle color="success" sx={{ ml: 1 }} /></Tooltip>}
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit Group"><IconButton onClick={() => handleEditGroup(group)}><Edit fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete Group"><IconButton onClick={() => handleDeleteGroup(group.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>{group.description}</Typography>
                  {leader && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Person color="primary" sx={{ mr: 0.5 }} />
                      <Typography variant="subtitle2" color="primary.main">Leader: {leader.name}</Typography>
                    </Box>
                  )}
                  <Button size="small" variant="outlined" color="primary" sx={{ mb: 1 }} onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}>
                    {expandedGroup === group.id ? 'Hide Members' : 'View Members'}
                  </Button>
                  {expandedGroup === group.id && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Members:</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {group.members.map(mid => {
                          const member = getLaborerById(mid);
                          return member ? (
                            <Chip key={mid} avatar={<Avatar>{member.name.charAt(0)}</Avatar>} label={member.name} sx={{ mb: 0.5 }} />
                          ) : null;
                        })}
                      </Stack>
                    </Box>
                  )}
                  <Button variant="contained" color="primary" fullWidth onClick={() => handleBookGroup(group)}>Book Workers</Button>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
      {/* Edit Group Modal */}
      {editGroupId && (
        <Paper elevation={24} sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(0,0,0,0.3)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 3, minWidth: 340, maxWidth: '90vw', boxShadow: 8, position: 'relative' }}>
            <IconButton onClick={handleCancelEditGroup} sx={{ position: 'absolute', top: 8, right: 8 }}><Close /></IconButton>
            <Typography variant="h6" fontWeight="bold" mb={2}>Edit Group</Typography>
            <TextField label="Group Name" fullWidth sx={{ mb: 2 }} value={editGroupName} onChange={e => setEditGroupName(e.target.value)} />
            <TextField label="Description" fullWidth sx={{ mb: 2 }} value={editGroupDesc} onChange={e => setEditGroupDesc(e.target.value)} />
            <Typography variant="subtitle2" mb={1}>Select Members:</Typography>
            <Stack direction="column" spacing={1} sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
              {mockLaborSources.map(l => (
                <Button key={l.id} variant={editGroupMembers.includes(l.id) ? 'contained' : 'outlined'} color="primary" sx={{ justifyContent: 'flex-start' }} onClick={() => setEditGroupMembers(prev => prev.includes(l.id) ? prev.filter(mid => mid !== l.id) : [...prev, l.id])}>
                  <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{l.name.charAt(0)}</Avatar>
                  {l.name} {editGroupMembers.includes(l.id) && <span style={{ marginLeft: 8, color: theme.palette.success.main }}>(Selected)</span>}
                </Button>
              ))}
            </Stack>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Group Leader</InputLabel>
              <Select value={editGroupLeader || ''} label="Group Leader" onChange={e => setEditGroupLeader(Number(e.target.value))}>
                {editGroupMembers.map(mid => {
                  const member = getLaborerById(mid);
                  return member ? <MenuItem key={mid} value={mid}>{member.name}</MenuItem> : null;
                })}
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleSaveEditGroup} disabled={!editGroupName || editGroupMembers.length === 0 || !editGroupLeader}>Save Changes</Button>
          </Box>
        </Paper>
      )}
      {/* Delete Group Confirmation */}
      {deleteConfirmId && (
        <Paper elevation={24} sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(0,0,0,0.3)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 3, minWidth: 320, maxWidth: '90vw', boxShadow: 8, position: 'relative', textAlign: 'center' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Delete Group?</Typography>
            <Typography variant="body1" mb={3}>Are you sure you want to delete this group? This action cannot be undone.</Typography>
            <Button variant="contained" color="error" sx={{ mr: 2 }} onClick={handleConfirmDeleteGroup}>Delete</Button>
            <Button variant="outlined" color="primary" onClick={handleCancelDeleteGroup}>Cancel</Button>
          </Box>
        </Paper>
      )}
      {/* Booking Modal */}
      {bookingGroup && (
        <Paper elevation={24} sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(0,0,0,0.3)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 3, minWidth: 340, maxWidth: 500, boxShadow: 8, position: 'relative' }}>
            <IconButton onClick={handleCancelBooking} sx={{ position: 'absolute', top: 8, right: 8 }}><Close /></IconButton>
            <Stepper activeStep={bookingStep} alternativeLabel sx={{ mb: 3 }}>
              <Step><StepLabel>Select Workers</StepLabel></Step>
              <Step><StepLabel>Booking Details</StepLabel></Step>
              <Step><StepLabel>Payment</StepLabel></Step>
              <Step><StepLabel>Confirmation</StepLabel></Step>
            </Stepper>
            {bookingStep === 0 && (
              <>
                <Typography variant="h6" fontWeight="bold" mb={2}>Select workers to book:</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                  {bookingGroup.members.map(mid => {
                    const member = getLaborerById(mid);
                    if (!member) return null;
                    return (
                      <Button
                        key={mid}
                        variant={bookingCount.includes(mid) ? 'contained' : 'outlined'}
                        color="primary"
                        sx={{ mb: 1, borderRadius: 2, minWidth: 0, px: 1.5 }}
                        onClick={() => setBookingCount(prev => prev.includes(mid) ? prev.filter(id => id !== mid) : [...prev, mid])}
                      >
                        <Avatar sx={{ width: 28, height: 28, mr: 1 }}>{member.name.charAt(0)}</Avatar>
                        {member.name}
                      </Button>
                    );
                  })}
                </Stack>
                <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={() => setBookingStep(1)} disabled={bookingCount.length === 0}>Next: Details</Button>
              </>
            )}
            {bookingStep === 1 && (
              <>
                <Typography variant="h6" fontWeight="bold" mb={2}>Booking Details</Typography>
                <TextField label="Date" type="date" fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} value={bookingDetails.date} onChange={e => setBookingDetails(d => ({ ...d, date: e.target.value }))} />
                <TextField label="Time" type="time" fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} value={bookingDetails.time} onChange={e => setBookingDetails(d => ({ ...d, time: e.target.value }))} />
                <TextField label="Location" fullWidth sx={{ mb: 2 }} value={bookingDetails.location} onChange={e => setBookingDetails(d => ({ ...d, location: e.target.value }))} />
                <TextField label="Notes (optional)" fullWidth multiline rows={2} sx={{ mb: 2 }} value={bookingDetails.notes} onChange={e => setBookingDetails(d => ({ ...d, notes: e.target.value }))} />
                <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={() => setBookingStep(2)} disabled={!bookingDetails.date || !bookingDetails.time || !bookingDetails.location}>Next: Payment</Button>
              </>
            )}
            {bookingStep === 2 && (
              <>
                <Typography variant="h6" fontWeight="bold" mb={2}>Payment</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" mb={1}>Select payment method:</Typography>
                  <Stack direction="row" spacing={2} mb={2}>
                    <Button variant={paymentMethod === 'mobile' ? 'contained' : 'outlined'} color="primary" startIcon={<PhoneIphoneIcon />} onClick={() => setPaymentMethod('mobile')}>Mobile Money</Button>
                    <Button variant={paymentMethod === 'card' ? 'contained' : 'outlined'} color="primary" startIcon={<CreditCardIcon />} onClick={() => setPaymentMethod('card')}>Card</Button>
                    <Button variant={paymentMethod === 'cash' ? 'contained' : 'outlined'} color="primary" startIcon={<MonetizationOnIcon />} onClick={() => setPaymentMethod('cash')}>Cash</Button>
                  </Stack>
                  <Typography variant="body2">Total: <b>UGX {(bookingCount.length * 20000).toLocaleString()}</b> ({bookingCount.length} worker(s) × UGX 20,000)</Typography>
                </Box>
                <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleConfirmBooking} disabled={paymentProcessing}>
                  {paymentProcessing ? 'Processing Payment...' : 'Pay Now'}
                </Button>
              </>
            )}
            {bookingStep === 3 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" mb={2}>Booking & Payment Confirmed!</Typography>
                <Typography variant="body1" mb={2}>You have booked {bookingCount.length} worker(s) from {bookingGroup.name}.</Typography>
                <Typography variant="body2" mb={2}>Leader: {getLaborerById(bookingGroup.leaderId)?.name} ({getLaborerById(bookingGroup.leaderId)?.contact})</Typography>
                <Typography variant="body2" mb={2}>Date: {bookingDetails.date} | Time: {bookingDetails.time} | Location: {bookingDetails.location}</Typography>
                <Typography variant="body2" mb={2}>Payment Method: {paymentMethod}</Typography>
                <Button variant="contained" color="primary" onClick={handleCancelBooking}>Done</Button>
              </Box>
            )}
            {/* Stepper navigation */}
            {bookingStep < 3 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button onClick={() => setBookingStep(s => Math.max(0, s - 1))} disabled={bookingStep === 0}>Back</Button>
              </Box>
            )}
          </Box>
        </Paper>
      )}
      {/* Booking Success Message */}
      {bookingSuccess && (
        <Paper elevation={24} sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(0,0,0,0.3)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 3, minWidth: 320, maxWidth: 400, boxShadow: 8, textAlign: 'center' }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" mb={2}>Booking Confirmed!</Typography>
            <Typography variant="body1">Your booking for {bookingCount.length} worker(s) from {bookingGroup?.name} was successful.</Typography>
          </Box>
        </Paper>
      )}
      {/* Labor Cards */}
      <Grid container spacing={3}>
        {filteredLabor.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <img src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png" alt="No results" width={120} style={{ opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" mt={2}>No labor sources found.</Typography>
            </Box>
          </Grid>
        ) : filteredLabor.map(labor => (
          <Grid item xs={12} md={6} lg={4} key={labor.id}>
            <Card sx={{ 
              p: 3, 
              borderRadius: 3, 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2, 
              boxShadow: 4, 
              backgroundColor: theme.palette.background.paper, 
              transition: 'transform 0.2s', 
              '&:hover': { transform: 'scale(1.03)', boxShadow: 8 } 
            }}>
              <Avatar sx={{ bgcolor: labor.verified ? 'success.main' : 'primary.main', mr: 2, width: 64, height: 64, fontSize: 32 }}>
                {labor.name.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mr: 1 }}>{labor.name}</Typography>
                  {labor.verified && <Tooltip title="Verified"><Verified color="success" fontSize="small" /></Tooltip>}
                  {labor.rating >= 4.8 && <Chip label="Top Rated" color="secondary" size="small" sx={{ ml: 1, fontWeight: 'bold' }} />}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {[1,2,3,4,5].map(i => (
                    <Star fontSize="small" sx={{ color: i <= Math.round(labor.rating) ? '#FFD700' : '#E0E0E0' }} />
                  ))}
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>{labor.rating.toFixed(1)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {labor.skills.map(skill => (
                    <Chip key={skill} label={skill} color="primary" size="small" sx={{ fontWeight: 'bold', bgcolor: theme.palette.primary.light, color: theme.palette.primary.contrastText }} />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary">Location: {labor.location}</Typography>
                {groups.filter(g => g.members.includes(labor.id)).length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="primary.main">Groups: {groups.filter(g => g.members.includes(labor.id)).map(g => g.name).join(', ')}</Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Create Group Modal */}
      {createGroupOpen && (
        <Paper elevation={24} sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(0,0,0,0.3)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 3, minWidth: 340, maxWidth: '90vw', boxShadow: 8, position: 'relative' }}>
            <IconButton onClick={handleCloseCreateGroup} sx={{ position: 'absolute', top: 8, right: 8 }}><Close /></IconButton>
            <Typography variant="h6" fontWeight="bold" mb={2}>Create a Labor Group</Typography>
            <TextField label="Group Name" fullWidth sx={{ mb: 2 }} value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
            <TextField label="Description" fullWidth sx={{ mb: 2 }} value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} />
            <Typography variant="subtitle2" mb={1}>Select Members:</Typography>
            <Stack direction="column" spacing={1} sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
              {mockLaborSources.map(l => (
                <Button key={l.id} variant={selectedGroupMembers.includes(l.id) ? 'contained' : 'outlined'} color="primary" sx={{ justifyContent: 'flex-start' }} onClick={() => handleToggleGroupMember(l.id)}>
                  <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{l.name.charAt(0)}</Avatar>
                  {l.name} {selectedGroupMembers.includes(l.id) && <span style={{ marginLeft: 8, color: theme.palette.success.main }}>(Selected)</span>}
                </Button>
              ))}
            </Stack>
            <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleCreateGroup} disabled={!newGroupName || selectedGroupMembers.length === 0}>Create Group</Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

const Resources = () => {
  const [tab, setTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const theme = useTheme();
  const { themeMode } = useAppTheme();
  const isDark = themeMode === 'dark';

  const handleTabChange = (event, newValue) => setTab(newValue);

  return (
    <Box sx={{ 
      pb: 5, 
      background: isDark
        ? `linear-gradient(to bottom, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`
        : `linear-gradient(to bottom, ${theme.palette.grey[50]} 0%, ${theme.palette.success.light}10 100%)`,
      minHeight: '100vh' 
    }}>
      <Container maxWidth="xl">
        <Paper elevation={2} sx={{ 
          mb: 4, 
          borderRadius: 3, 
          p: 2, 
          background: isDark
            ? `linear-gradient(90deg, ${theme.palette.grey[800]} 0%, ${theme.palette.primary.dark}30 100%)`
            : `linear-gradient(90deg, ${theme.palette.primary.light}20 0%, ${theme.palette.success.light}20 100%)`
        }}>
          <Tabs value={tab} onChange={handleTabChange} indicatorColor="primary" textColor="primary" variant="scrollable" scrollButtons="auto">
            <Tab label="Resources" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }} />
            <Tab label="Labour Resourcing" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }} />
          </Tabs>
        </Paper>
        {tab === 0 && (
          <Box sx={{ 
            pb: 5,
            background: isDark
              ? `linear-gradient(to bottom, ${alpha(theme.palette.primary.dark, 0.1)} 0%, transparent 250px)`
              : `linear-gradient(to bottom, ${alpha(theme.palette.success.main, 0.05)} 0%, transparent 250px)`
          }}>
            <Container maxWidth="xl">
              {/* Enhanced Header section with background and graphics */}
              <Box 
                sx={{ 
                  position: 'relative',
                  borderRadius: 4,
                  overflow: 'hidden',
                  mb: 8,
                  mt: 2,
                  py: 8,
                  px: { xs: 3, md: 6 },
                  background: isDark
                    ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.primary.dark}40 100%)`
                    : `linear-gradient(135deg, ${theme.palette.success.light}30 0%, ${theme.palette.success.light}50 100%)`,
                  boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.3)' : '0 10px 30px rgba(76, 175, 80, 0.1)',
                }}
              >
                {/* Decorative circles */}
                <Box sx={{
                  position: 'absolute',
                  width: '300px',
                  height: '300px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.15)} 0%, transparent 70%)`,
                  top: '-100px',
                  right: '-50px',
                  zIndex: 0,
                }} />
                
                <Box sx={{
                  position: 'absolute',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.warning.main, 0.1)} 0%, transparent 70%)`,
                  bottom: '-80px',
                  left: '10%',
                  zIndex: 0,
                }} />
                
                {/* Background pattern */}
                <Box sx={{ 
                  position: 'absolute',
                  right: { xs: -80, md: 60 },
                  bottom: { xs: -20, md: 0 },
                  width: { xs: 200, md: 300 },
                  height: { xs: 200, md: 300 },
                  opacity: { xs: 0.1, md: 0.15 },
                  zIndex: 0,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' fill='%234caf50'%3E%3Cpath d='M384 0H96C60.65 0 32 28.65 32 64v384c0 35.35 28.65 64 64 64h288c35.35 0 64-28.65 64-64V64C448 28.65 419.3 0 384 0zM240 128c35.35 0 64 28.65 64 64s-28.65 64-64 64c-35.34 0-64-28.65-64-64S204.7 128 240 128zM336 384h-192C135.2 384 128 376.8 128 368C128 323.8 163.8 288 208 288h64c44.18 0 80 35.82 80 80C352 376.8 344.8 384 336 384zM496 64H480v96h16C504.8 160 512 152.8 512 144v-64C512 71.16 504.8 64 496 64zM496 192H480v96h16C504.8 288 512 280.8 512 272v-64C512 199.2 504.8 192 496 192zM496 320H480v96h16c8.836 0 16-7.164 16-16v-64C512 327.2 504.8 320 496 320z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: 'contain',
                }} />
                
                {/* Content */}
                <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 'lg' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <School sx={{ color: '#4caf50', mr: 1.5, fontSize: 28 }} />
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        color: '#4caf50', 
                        fontWeight: 600, 
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Knowledge Center
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="h2" 
                    component="h1" 
                    sx={{ 
                      fontWeight: 800, 
                      color: '#2e7d32',
                      mb: 3,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-12px',
                        left: 0,
                        width: '80px',
                        height: '4px',
                        background: `linear-gradient(to right, ${theme.palette.success.main}, ${alpha(theme.palette.success.main, 0.3)})`,
                        borderRadius: '2px',
                      }
                    }}
                  >
                    Farming Resources
                  </Typography>
                  
                  <Typography 
                    variant="h6" 
                    color="text.secondary" 
                    sx={{ 
                      maxWidth: '700px',
                      mt: 4,
                      mb: 5,
                      fontWeight: 'normal'
                    }}
                  >
                    Access comprehensive guides, market information, and educational materials to improve your 
                    farming knowledge and stay updated on the latest agricultural best practices in Uganda.
                  </Typography>
                  
                  {/* Enhanced search box directly in the hero */}
                  <Box 
                    component="form" 
                    sx={{ 
                      display: 'flex', 
                      maxWidth: '700px',
                      position: 'relative',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                      borderRadius: 3,
                      overflow: 'hidden'
                    }}
                  >
                    <TextField
                      fullWidth
                      placeholder="Search for guides, market information, and more..."
                      variant="outlined"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search color="primary" />
                          </InputAdornment>
                        ),
                        sx: { 
                          bgcolor: 'background.paper', 
                          py: 0.5,
                          '& fieldset': {
                            border: 'none'
                          }
                        }
                      }}
                    />
                    <Button 
                      color="primary"
                      variant="contained"
                      sx={{ 
                        borderRadius: 0, 
                        px: 3,
                        boxShadow: 'none',
                        '&:hover': {
                          boxShadow: 'none',
                        }
                      }}
                    >
                      Search
                    </Button>
                  </Box>
                  
                  {/* Quick stats */}
                  <Box sx={{ 
                    display: 'flex', 
                    mt: 6,
                    flexWrap: 'wrap',
                    gap: { xs: 3, md: 5 }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'rgba(76,175,80,0.1)', 
                          color: '#4caf50',
                          mr: 1.5
                        }}
                      >
                        <InsertDriveFile fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color="#2e7d32">
                          200+
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Resource documents
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'rgba(76,175,80,0.1)', 
                          color: '#4caf50',
                          mr: 1.5
                        }}
                      >
                        <People fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color="#2e7d32">
                          15K+
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Farmers helped
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'rgba(76,175,80,0.1)', 
                          color: '#4caf50',
                          mr: 1.5
                        }}
                      >
                        <TrendingUp fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color="#2e7d32">
                          30K+
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Monthly downloads
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Enhanced filter section */}
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  mb: 8, 
                  borderRadius: 3,
                  background: theme => alpha(theme.palette.background.paper, 0.9),
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3,
                  flexWrap: { xs: 'wrap', md: 'nowrap' },
                  gap: 1
                }}>
                  <FilterList color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Filter Resources
                  </Typography>
                  
                  <Box sx={{ 
                    ml: { xs: 0, md: 'auto' }, 
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1
                  }}>
                    <Chip 
                      label="All Resources" 
                      variant={selectedCategory === 'all' ? 'filled' : 'outlined'} 
                      color="primary" 
                      onClick={() => setSelectedCategory('all')}
                      sx={{ fontWeight: 'medium' }}
                    />
                    <Chip 
                      label="Guides" 
                      variant={selectedCategory === 'guides' ? 'filled' : 'outlined'} 
                      color="primary" 
                      onClick={() => setSelectedCategory('guides')}
                      sx={{ fontWeight: 'medium' }}
                    />
                    <Chip 
                      label="Market Info" 
                      variant={selectedCategory === 'market' ? 'filled' : 'outlined'} 
                      color="primary" 
                      onClick={() => setSelectedCategory('market')}
                      sx={{ fontWeight: 'medium' }}
                    />
                    <Chip 
                      label="Technology" 
                      variant={selectedCategory === 'tech' ? 'filled' : 'outlined'} 
                      color="primary" 
                      onClick={() => setSelectedCategory('tech')}
                      sx={{ fontWeight: 'medium' }}
                    />
                  </Box>
                </Box>
                
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={7}>
                    <TextField
                      fullWidth
                      placeholder="Search by title, keyword, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ 
                        bgcolor: 'background.paper', 
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="category-select-label">Category</InputLabel>
                      <Select
                        labelId="category-select-label"
                        value={selectedCategory}
                        label="Category"
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        sx={{ 
                          borderRadius: 2,
                          bgcolor: 'background.paper'
                        }}
                      >
                        <MenuItem value="all">All Categories</MenuItem>
                        <MenuItem value="guides">Farming Guides</MenuItem>
                        <MenuItem value="market">Market Information</MenuItem>
                        <MenuItem value="tech">Agricultural Technology</MenuItem>
                        <MenuItem value="education">Educational Videos</MenuItem>
                        <MenuItem value="funding">Funding & Grants</MenuItem>
                        <MenuItem value="policy">Policy & Regulations</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel id="sort-select-label">Sort By</InputLabel>
                      <Select
                        labelId="sort-select-label"
                        value={sortBy}
                        label="Sort By"
                        onChange={(e) => setSortBy(e.target.value)}
                        sx={{ 
                          borderRadius: 2,
                          bgcolor: 'background.paper'
                        }}
                      >
                        <MenuItem value="newest">Newest First</MenuItem>
                        <MenuItem value="popular">Most Popular</MenuItem>
                        <MenuItem value="downloads">Most Downloaded</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>

              {/* Enhanced Resource categories */}
              <Box sx={{ mb: 8 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    fontWeight="bold" 
                    color="text.primary"
                    sx={{
                      position: 'relative',
                      '&:after': {
                        content: '""',
                        display: 'block',
                        width: 60,
                        height: 3,
                        backgroundColor: 'primary.main',
                        borderRadius: 1.5,
                        mt: 1
                      }
                    }}
                  >
                    Browse Categories
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  {resourceCategories.map((category) => (
                    <Grid item key={category.id} xs={12} sm={6} md={4} lg={2}>
                      <Card 
                        elevation={selectedCategory === category.id ? 3 : 1}
                        onClick={() => setSelectedCategory(category.id)}
                        sx={{ 
                          height: '100%',
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center',
                          p: 3,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          borderRadius: 3,
                          position: 'relative',
                          overflow: 'hidden',
                          border: theme => selectedCategory === category.id ? `2px solid ${theme.palette.primary.main}` : 'none',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: 6
                          },
                          '&:before': selectedCategory === category.id ? {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            bgcolor: 'primary.main'
                          } : {}
                        }}
                      >
                        <Box 
                          sx={{ 
                            color: 'primary.main',
                            mb: 2,
                            p: 1.5,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            transition: 'all 0.3s ease',
                            transform: selectedCategory === category.id ? 'scale(1.1)' : 'scale(1)',
                            '& svg': {
                              width: 40,
                              height: 40
                            }
                          }}
                        >
                          {category.icon}
                        </Box>
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          textAlign="center" 
                          fontWeight="bold"
                          color={selectedCategory === category.id ? 'primary.main' : 'text.primary'}
                          gutterBottom
                        >
                          {category.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          textAlign="center"
                        >
                          {category.description}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Enhanced Featured resources */}
              <Box sx={{ mb: 8 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 4 
                }}>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    fontWeight="bold" 
                    color="text.primary"
                    sx={{
                      position: 'relative',
                      '&:after': {
                        content: '""',
                        display: 'block',
                        width: 60,
                        height: 3,
                        backgroundColor: 'primary.main',
                        borderRadius: 1.5,
                        mt: 1
                      }
                    }}
                  >
                    Featured Resources
                  </Typography>
                  <Button 
                    component={Link} 
                    to="/resources/featured" 
                    endIcon={<ArrowForward />}
                    color="primary"
                    variant="text"
                    sx={{
                      fontWeight: 'medium',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateX(4px)',
                        background: 'none'
                      }
                    }}
                  >
                    View All
                  </Button>
                </Box>
                <Grid container spacing={3}>
                  {featuredResources.map((resource) => (
                    <Grid item key={resource.id} xs={12} sm={6} md={3}>
                      <Card 
                        elevation={2}
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s ease',
                          borderRadius: 3,
                          overflow: 'hidden',
                          bgcolor: 'background.paper',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        <CardActionArea 
                          component={Link}
                          to={`/resources/${resource.id}`}
                          sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'stretch', 
                            flexGrow: 1,
                            '&:hover': {
                              '& .MuiCardMedia-root': {
                                transform: 'scale(1.05)'
                              }
                            }
                          }}
                        >
                          <Box sx={{ position: 'relative' }}>
                            <CardMedia
                              component="img"
                              height="180"
                              image={resource.thumbnail}
                              alt={resource.title}
                              sx={{
                                transition: 'transform 0.5s ease'
                              }}
                            />
                            <Box 
                              sx={{ 
                                position: 'absolute', 
                                top: 12, 
                                right: 12, 
                                bgcolor: 'primary.main',
                                color: 'white',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 6,
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                zIndex: 1
                              }}
                            >
                              {resource.type}
                            </Box>
                            
                            {/* Time indicator at top-left */}
                            <Box 
                              sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: 'rgba(255,255,255,0.9)',
                                color: 'text.secondary',
                                borderRadius: 6,
                                px: 1.5,
                                py: 0.5,
                                fontSize: '0.75rem',
                                fontWeight: 'medium',
                                zIndex: 1,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                              }}
                            >
                              <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                              {new Date(resource.date).toLocaleDateString(undefined, { 
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </Box>
                          </Box>
                          
                          <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography 
                                variant="subtitle1" 
                                component="h3" 
                                fontWeight="bold" 
                                color="text.primary"
                                sx={{
                                  mb: 2,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  lineHeight: 1.3
                                }}
                              >
                                {resource.title}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center'
                            }}>
                              <Avatar 
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(resource.source.charAt(0))}&background=random`} 
                                sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.light' }}
                              >
                                {resource.source.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                                {resource.source}
                              </Typography>
                            </Box>
                          </CardContent>
                        </CardActionArea>
                        
                        <Divider />
                        
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'background.paper',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Tooltip title="View count">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <School fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                                <Typography variant="caption" color="text.secondary">
                                  {resource.views.toLocaleString()}
                                </Typography>
                              </Box>
                            </Tooltip>
                            
                            <Tooltip title="Download count">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CloudDownload fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                                <Typography variant="caption" color="text.secondary">
                                  {resource.downloads.toLocaleString()}
                                </Typography>
                              </Box>
                            </Tooltip>
                          </Box>
                          
                          <Tooltip title="Bookmark">
                            <IconButton 
                              size="small" 
                              sx={{ color: 'text.secondary' }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <BookmarkBorder fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Button 
                            variant="outlined" 
                            color="primary"
                            size="small"
                            startIcon={<CloudDownload />}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            sx={{
                              borderRadius: 6,
                              px: 2,
                              py: 0.5,
                              fontSize: '0.75rem',
                              fontWeight: 'medium',
                              boxShadow: 'none',
                              ml: 1,
                              '&:hover': {
                                boxShadow: '0 4px 8px rgba(76,175,80,0.2)'
                              }
                            }}
                          >
                            Download
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Enhanced Recent resources */}
              <Box sx={{ mb: 8 }}>
                <Typography 
                  variant="h5" 
                  component="h2" 
                  fontWeight="bold" 
                  color="text.primary" 
                  sx={{ 
                    mb: 4,
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      display: 'block',
                      width: 60,
                      height: 3,
                      backgroundColor: 'primary.main',
                      borderRadius: 1.5,
                      mt: 1
                    }
                  }}
                >
                  Recently Added
                </Typography>
                <Grid container spacing={3}>
                  {recentResources.map((resource) => (
                    <Grid item key={resource.id} xs={12} sm={4} md={2}>
                      <Card 
                        elevation={1}
                        component={Link} 
                        to={`/resources/${resource.id}`}
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s ease',
                          borderRadius: 3,
                          overflow: 'hidden',
                          textDecoration: 'none',
                          position: 'relative',
                          border: '1px solid',
                          borderColor: 'divider',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                            borderColor: 'transparent'
                          }
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="140"
                          image={resource.thumbnail}
                          alt={resource.title}
                          sx={{
                            transition: 'all 0.5s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        />
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 10, 
                            right: 10, 
                            bgcolor: 'primary.main',
                            color: 'white',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 6,
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                          }}
                        >
                          {resource.type}
                        </Box>
                        
                        <Box sx={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          borderRadius: 5,
                          px: 1,
                          py: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '0.65rem'
                        }}>
                          <AccessTime sx={{ fontSize: 12, mr: 0.5 }} />
                          {new Date(resource.date).toLocaleDateString(undefined, { 
                            day: 'numeric',
                            month: 'short'
                          })}
                        </Box>
                        
                        <CardContent sx={{ 
                          flexGrow: 1, 
                          p: 2,
                          position: 'relative',
                          '&:hover': {
                            '& .resource-title': {
                              color: 'primary.main'
                            }
                          }
                        }}>
                          <Typography 
                            variant="body2" 
                            component="h3" 
                            fontWeight="bold" 
                            color="text.primary"
                            className="resource-title"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              transition: 'color 0.2s ease'
                            }}
                          >
                            {resource.title}
                          </Typography>
                        </CardContent>
                        
                        <Box sx={{ 
                          p: 1.5, 
                          display: 'flex',
                          justifyContent: 'flex-end',
                          borderTop: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Tooltip title="Save for later">
                            <IconButton size="small" sx={{ color: 'text.secondary', mr: 0.5 }}>
                              <BookmarkBorder fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Share">
                            <IconButton size="small" sx={{ color: 'text.secondary' }}>
                              <Share fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Enhanced Submit resource section */}
              <Paper 
                elevation={3}
                sx={{ 
                  p: { xs: 4, md: 6 }, 
                  mb: 8, 
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundImage: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
                  color: 'white'
                }}
              >
                {/* Decorative elements */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: '-50px', 
                  right: '-50px',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.background.paper, 0.1)} 0%, transparent 70%)`
                }} />
                
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: '-80px', 
                  left: '-80px',
                  width: '300px',
                  height: '300px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.background.paper, 0.1)} 0%, transparent 70%)`
                }} />
                
                <Box sx={{ 
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  bottom: '20px',
                  left: '20px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 3,
                  pointerEvents: 'none'
                }} />
                
                <Box sx={{ 
                  position: 'absolute', 
                  right: { xs: '-120px', md: '10%' }, 
                  top: { xs: '-40px', md: '50%' },
                  transform: { md: 'translateY(-50%)' },
                  width: { xs: '180px', md: '240px' },
                  height: { xs: '180px', md: '240px' },
                  opacity: 0.1,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 512' fill='white'%3E%3Cpath d='M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: 'contain',
                }} />
                
                <Grid container spacing={4} position="relative" zIndex={1}>
                  <Grid item xs={12} md={7}>
                    <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: { xs: 4, md: 0 } }}>
                      <Typography 
                        variant="h4" 
                        component="h2" 
                        fontWeight="bold" 
                        sx={{ mb: 2, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
                      >
                        Have a useful resource to share?
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mb: 4, 
                          maxWidth: { xs: '100%', md: '90%' },
                          opacity: 0.9
                        }}
                      >
                        If you have farming guides, educational materials, or relevant agricultural information that 
                        could benefit other farmers, consider sharing it with our growing community.
                      </Typography>
                      <Button 
                        component={Link} 
                        to="/resources/submit" 
                        variant="contained" 
                        size="large"
                        sx={{ 
                          bgcolor: 'white', 
                          color: '#2e7d32',
                          '&:hover': { 
                            bgcolor: 'rgba(255,255,255,0.9)',
                            transform: 'scale(1.05)'
                          },
                          px: 4,
                          py: 1.5,
                          borderRadius: 3,
                          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                          transition: 'all 0.3s ease',
                          fontWeight: 'bold',
                          textTransform: 'none'
                        }}
                      >
                        Submit a Resource
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      height: '100%', 
                      justifyContent: 'center', 
                      alignItems: 'center' 
                    }}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: 'rgba(255,255,255,0.1)', 
                        borderRadius: 3, 
                        backdropFilter: 'blur(10px)',
                        mb: 2,
                        width: '100%',
                        textAlign: 'center'
                      }}>
                        <Typography variant="h5" fontWeight="medium" sx={{ mb: 1 }}>
                          250+
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Resources submitted by community
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: 'rgba(255,255,255,0.1)', 
                        borderRadius: 3, 
                        backdropFilter: 'blur(10px)',
                        width: '100%',
                        textAlign: 'center'
                      }}>
                        <Typography variant="h5" fontWeight="medium" sx={{ mb: 1 }}>
                          15K+
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Monthly downloads
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Enhanced Newsletter subscription */}
              <Paper 
                elevation={2}
                sx={{ 
                  p: { xs: 4, md: 6 }, 
                  borderRadius: 4,
                  background: theme => `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.15)} 100%)`,
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.03)'
                }}
              >
                {/* Decorative elements */}
                <Box sx={{ 
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '300px',
                  height: '300px',
                  opacity: 0.03,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' fill='%234caf50'%3E%3Cpath d='M64 112c-8.8 0-16 7.2-16 16v22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1V128c0-8.8-7.2-16-16-16H64zM48 212.2V384c0 8.8 7.2 16 16 16H448c8.8 0 16-7.2 16-16V212.2L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64H448c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'bottom right',
                  backgroundSize: 'contain',
                  transform: 'rotate(-10deg)'
                }} />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 1,
                    justifyContent: { xs: 'center', md: 'flex-start' }
                  }}>
                    <Mail color="primary" sx={{ mr: 1.5 }} />
                    <Typography variant="subtitle1" color="primary.main" fontWeight="medium">
                      NEWSLETTER
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="h4" 
                    component="h2" 
                    fontWeight="bold" 
                    sx={{ 
                      mb: 2,
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                  >
                    Stay Updated with Agricultural Resources
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 4, 
                      maxWidth: 'md', 
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                  >
                    Subscribe to our newsletter to receive updates on new farming resources, upcoming 
                    agricultural events, and important farming information tailored for Uganda.
                  </Typography>
                  
                  <Box sx={{ 
                    maxWidth: 'lg',
                    mx: 'auto',
                    background: theme.palette.background.paper,
                    p: 2,
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                  }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={7}>
                        <TextField
                          fullWidth
                          placeholder="Your email address"
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Mail color="primary" />
                              </InputAdornment>
                            ),
                            sx: { 
                              borderRadius: 2,
                              bgcolor: 'background.paper',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: alpha(theme.palette.primary.main, 0.2)
                              }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <FormControl fullWidth variant="outlined" sx={{ borderRadius: 2 }}>
                          <Select
                            value="farmer"
                            displayEmpty
                            sx={{ 
                              borderRadius: 2,
                              bgcolor: 'background.paper',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: alpha(theme.palette.primary.main, 0.2)
                              }
                            }}
                          >
                            <MenuItem value="farmer">I am a Farmer</MenuItem>
                            <MenuItem value="buyer">I am a Buyer</MenuItem>
                            <MenuItem value="supplier">I am a Supplier</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Button 
                          variant="contained" 
                          color="primary"
                          size="large"
                          fullWidth
                          sx={{ 
                            py: 1.5,
                            borderRadius: 2,
                            boxShadow: '0 4px 10px rgba(76,175,80,0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: '0 6px 15px rgba(76,175,80,0.3)'
                            }
                          }}
                        >
                          Subscribe
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      display: 'block', 
                      textAlign: 'center', 
                      mt: 2 
                    }}
                  >
                    By subscribing, you agree to receive agriculture-related marketing emails. 
                    You can unsubscribe at any time.
                  </Typography>
                </Box>
              </Paper>
            </Container>
          </Box>
        )}
        {tab === 1 && <LabourResourcingSection />}
      </Container>
    </Box>
  );
};

export default Resources; 