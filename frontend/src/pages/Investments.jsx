import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Divider, Tabs, Tab, Modal, TextField, Fab, Fade, Paper, Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Snackbar, Alert } from '@mui/material';
import PaidIcon from '@mui/icons-material/Paid';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AddIcon from '@mui/icons-material/Add';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';

// Mock data for opportunities
const mockOpportunities = [
  {
    id: 1,
    type: 'Land Lease',
    title: '10 Acres in Luweero',
    location: 'Luweero, Central',
    summary: 'Fertile land available for maize or beans. Owner seeks partner or investor.',
    image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=400&q=80',
    owner: 'Farmer Grace',
    role: 'Land Owner',
  },
  {
    id: 2,
    type: 'Agri-Project',
    title: 'Organic Coffee Expansion',
    location: 'Mbale, Eastern',
    summary: 'Seeking investment to expand organic coffee farm. High ROI expected.',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    owner: 'Coffee Co-op',
    role: 'Investor',
  },
  {
    id: 3,
    type: 'Support Request',
    title: 'Irrigation for Cassava',
    location: 'Gulu, Northern',
    summary: 'Farmer needs support for irrigation equipment. Open to partners or donors.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    owner: 'Farmer John',
    role: 'Supporter',
  },
];

const mockStories = [
  {
    name: 'Sarah (Urban Investor)',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    story: 'I invested in a rice project and now receive quarterly updates and profits. It feels great to support Ugandan farmers!'
  },
  {
    name: 'Moses (Land Owner)',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    story: 'Leasing my land through this platform helped me find a reliable partner and boost my income.'
  },
  {
    name: 'AgroTech Group',
    avatar: '',
    story: 'We connected with both investors and land owners to launch a successful greenhouse project.'
  }
];

const bankServiceTypes = [
  'All',
  'Bank',
  'Microfinance',
  'Insurance',
  'Fintech',
  'SACCO'
];

const mockBanks = [
  {
    id: 1,
    name: 'Equity Bank',
    type: 'Bank',
    tags: ['Loans', 'Savings', 'Investment'],
    location: 'Kampala, Uganda',
    summary: 'Affordable agri-loans, savings, and investment products for farmers and agri-entrepreneurs.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Equity_Bank_Logo.png',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/2/2e/Equity_Bank_Logo.png',
      'https://www.equitybank.co.ug/images/ebl-logo.png'
    ],
    featured: true,
    rating: 4.7,
    contact: {
      phone: '+256 800 122 122',
      email: 'info@equitybank.co.ug',
      website: 'https://www.equitybank.co.ug/' // Official website
    },
    services: ['Agri-Loans', 'Savings Accounts', 'Mobile Banking', 'Investment Advisory'],
    map: 'https://maps.googleapis.com/maps/api/staticmap?center=Kampala,Uganda&zoom=13&size=300x120&key=FAKE_KEY'
  },
  {
    id: 2,
    name: 'Centenary Bank',
    type: 'Microfinance',
    tags: ['Microloans', 'Group Savings'],
    location: 'Nationwide',
    summary: 'Microloans, group savings, and agri-finance for rural communities and cooperatives.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Centenary_Bank_logo.png',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/7/7d/Centenary_Bank_logo.png'
    ],
    featured: false,
    rating: 4.3,
    contact: {
      phone: '+256 414 251 479',
      email: 'info@centenarybank.co.ug',
      website: 'https://www.centenarybank.co.ug/' // Official website
    },
    services: ['Microloans', 'Group Savings', 'Agri-Finance'],
    map: 'https://maps.googleapis.com/maps/api/staticmap?center=Kampala,Uganda&zoom=13&size=300x120&key=FAKE_KEY'
  },
  {
    id: 3,
    name: 'dfcu Bank',
    type: 'Bank',
    tags: ['Agri-Finance', 'Leasing'],
    location: 'Kampala & Major Towns',
    summary: 'Specialized agri-finance, equipment leasing, and insurance for agribusinesses.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/DFCU_Bank_logo.png',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/2/2a/DFCU_Bank_logo.png'
    ],
    featured: false,
    rating: 4.1,
    contact: {
      phone: '+256 312 300 200',
      email: 'customercare@dfcugroup.com',
      website: 'https://www.dfcugroup.com/' // Official website
    },
    services: ['Agri-Finance', 'Equipment Leasing', 'Insurance'],
    map: 'https://maps.googleapis.com/maps/api/staticmap?center=Kampala,Uganda&zoom=13&size=300x120&key=FAKE_KEY'
  },
  {
    id: 4,
    name: 'UAP Old Mutual',
    type: 'Insurance',
    tags: ['Crop Insurance', 'Livestock Insurance'],
    location: 'Kampala, Uganda',
    summary: 'Comprehensive crop and livestock insurance for farmers and agribusinesses.',
    logo: 'https://www.uapoldmutual.com/sites/default/files/2021-03/UAPOM_Logo.png',
    images: [
      'https://www.uapoldmutual.com/sites/default/files/2021-03/UAPOM_Logo.png'
    ],
    featured: true,
    rating: 4.5,
    contact: {
      phone: '+256 312 215 500',
      email: 'info@uapoldmutual.com',
      website: 'https://www.uapoldmutual.com/' // Official website
    },
    services: ['Crop Insurance', 'Livestock Insurance', 'Agri-Asset Protection'],
    map: 'https://maps.googleapis.com/maps/api/staticmap?center=Kampala,Uganda&zoom=13&size=300x120&key=FAKE_KEY'
  },
  {
    id: 5,
    name: 'Eversend',
    type: 'Fintech',
    tags: ['Mobile Wallet', 'Payments'],
    location: 'Online',
    summary: 'Digital wallet and payments for farmers, cooperatives, and agri-SMEs.',
    logo: 'https://pbs.twimg.com/profile_images/1206558572326252544/2QwQwQwA_400x400.jpg',
    images: [
      'https://pbs.twimg.com/profile_images/1206558572326252544/2QwQwQwA_400x400.jpg'
    ],
    featured: false,
    rating: 4.0,
    contact: {
      phone: '+256 200 905 900',
      email: 'support@eversend.co',
      website: 'https://eversend.co/' // Official website
    },
    services: ['Mobile Wallet', 'Payments', 'Remittances'],
    map: ''
  },
  {
    id: 6,
    name: 'Wazalendo SACCO',
    type: 'SACCO',
    tags: ['Savings', 'Loans'],
    location: 'Nationwide',
    summary: 'Member-owned savings and credit cooperative for rural and peri-urban communities.',
    logo: 'https://wazalendo.co.ug/wp-content/uploads/2020/09/wazalendo-logo.png',
    images: [
      'https://wazalendo.co.ug/wp-content/uploads/2020/09/wazalendo-logo.png'
    ],
    featured: false,
    rating: 4.2,
    contact: {
      phone: '+256 414 667 600',
      email: 'info@wazalendo.co.ug',
      website: 'https://wazalendo.co.ug/' // Official website
    },
    services: ['Savings', 'Loans', 'Member Services'],
    map: ''
  }
];

function TabPanel({ children, value, index }) {
  return (
    <Fade in={value === index} timeout={400} unmountOnExit>
      <div hidden={value !== index} style={{ width: '100%' }}>
        {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
      </div>
    </Fade>
  );
}

function LandOwnersSection({ opportunities, setOpportunities }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ type: 'Land Lease', title: '', location: '', summary: '', image: '', owner: '', role: 'Land Owner' });
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [imagePreview, setImagePreview] = useState('');
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Add/Edit modal handlers
  const openAddModal = () => {
    setForm({ type: 'Land Lease', title: '', location: '', summary: '', image: '', owner: '', role: 'Land Owner' });
    setImagePreview('');
    setEditId(null);
    setModalOpen(true);
  };
  const openEditModal = (opp) => {
    setForm({ ...opp });
    setImagePreview(opp.image || '');
    setEditId(opp.id);
    setModalOpen(true);
  };
  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFormSubmit = e => {
    e.preventDefault();
    if (!form.title || !form.location || !form.summary || !form.owner) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
      return;
    }
    if (editId) {
      setOpportunities(ops => ops.map(o => o.id === editId ? { ...form, id: editId, image: imagePreview || form.image } : o));
      setSnackbar({ open: true, message: 'Opportunity updated!', severity: 'success' });
    } else {
      setOpportunities(ops => [{ ...form, id: Date.now(), image: imagePreview || form.image }, ...ops]);
      setSnackbar({ open: true, message: 'Opportunity posted!', severity: 'success' });
    }
    setModalOpen(false);
    setForm({ type: 'Land Lease', title: '', location: '', summary: '', image: '', owner: '', role: 'Land Owner' });
    setImagePreview('');
    setEditId(null);
  };

  // Contact modal handlers
  const openContactModal = (opp) => {
    setSelected(opp);
    setContactForm({ name: '', email: '', message: '' });
    setContactSuccess(false);
    setContactOpen(true);
  };
  const handleContactChange = e => setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  const handleContactSubmit = e => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setSnackbar({ open: true, message: 'Please fill all contact fields.', severity: 'error' });
      return;
    }
    setContactSuccess(true);
    setSnackbar({ open: true, message: 'Message sent to support team!', severity: 'success' });
    setTimeout(() => setContactOpen(false), 1200);
  };

  // Delete dialog handlers
  const openDeleteDialog = (opp) => {
    setSelected(opp);
    setDeleteDialogOpen(true);
  };
  const handleDelete = () => {
    setOpportunities(ops => ops.filter(o => o.id !== selected.id));
    setSnackbar({ open: true, message: 'Opportunity deleted.', severity: 'info' });
    setDeleteDialogOpen(false);
    setSelected(null);
  };

  // Details modal handler
  const openDetailsModal = (opp) => {
    setSelected(opp);
    setSelectedImageIdx(0);
    setDetailsOpen(true);
  };

  return (
    <>
      <Typography variant="h5" fontWeight="bold" color="primary.main" mb={2}>Land Owners: List, Lease, or Find Partners</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>Have land but need inputs or partners? List your land, find investors, or request support.</Typography>
      <Button variant="contained" color="success" startIcon={<AddIcon />} sx={{ borderRadius: 3, fontWeight: 'bold', mb: 3 }} onClick={openAddModal}>
        Post Land/Opportunity
      </Button>
      {opportunities.filter(o => o.role === 'Land Owner' || o.type === 'Land Lease').length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <img src="https://www.svgrepo.com/show/331984/empty-box.svg" alt="No opportunities" style={{ width: 120, opacity: 0.5 }} />
          <Typography variant="body1" color="text.secondary" mt={2}>No land owner opportunities yet. Be the first to post!</Typography>
        </Box>
      ) : (
      <Grid container spacing={3}>
        {opportunities.filter(o => o.role === 'Land Owner' || o.type === 'Land Lease').map(o => (
          <Grid item xs={12} sm={6} md={4} key={o.id}>
            <Fade in timeout={500}>
              <Card elevation={6} sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { boxShadow: 12, transform: 'scale(1.04)' }, position: 'relative', overflow: 'hidden', background: 'linear-gradient(120deg, #f3e5f5 0%, #e8f5e9 100%)' }}>
                <Box sx={{ position: 'relative', height: 140 }}>
                  <img src={o.image} alt={o.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <Chip label="Land Owner" color="success" size="small" sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 'bold' }} />
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.light', mr: 1 }}>
                      {o.owner?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">{o.title}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>📍 {o.location}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{o.summary}</Typography>
                  <Typography variant="caption" color="primary.main" fontWeight="bold">By: {o.owner}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Tooltip title="View Details"><Button variant="outlined" color="info" size="small" onClick={() => openDetailsModal(o)}>View Details</Button></Tooltip>
                    <Tooltip title="Contact via Support Team"><Button variant="outlined" color="primary" size="small" onClick={() => openContactModal(o)}>Contact</Button></Tooltip>
                    <Tooltip title="Edit"><Button variant="outlined" color="secondary" size="small" onClick={() => openEditModal(o)}>Edit</Button></Tooltip>
                    <Tooltip title="Delete"><Button variant="outlined" color="error" size="small" onClick={() => openDeleteDialog(o)}>Delete</Button></Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
      )}

      {/* Add/Edit Opportunity Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editId ? 'Edit Opportunity' : 'Post Land/Opportunity'}</DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent>
            <TextField select label="Type" name="type" value={form.type} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }}>
              <option value="">Select Type</option>
              <option value="Land Lease">Land Lease</option>
              <option value="Agri-Project">Agri-Project</option>
              <option value="Support Request">Support Request</option>
            </TextField>
            <TextField label="Title" name="title" value={form.title} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Location" name="location" value={form.location} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Summary" name="summary" value={form.summary} onChange={handleFormChange} fullWidth required multiline rows={2} sx={{ mb: 2 }} />
            <TextField label="Image URL (optional)" name="image" value={form.image} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} />
            <TextField label="Your Name/Group" name="owner" value={form.owner} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} />
            <TextField select label="Role" name="role" value={form.role} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }}>
              <option value="">Select Role</option>
              <option value="Land Owner">Land Owner</option>
              <option value="Investor">Investor</option>
              <option value="Supporter">Supporter</option>
            </TextField>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button onClick={() => setModalOpen(false)} color="secondary">Cancel</Button>
              <Button type="submit" variant="contained" color="primary">Submit</Button>
            </Box>
          </DialogContent>
        </form>
      </Dialog>

      {/* Contact Modal */}
      <Dialog open={contactOpen} onClose={() => setContactOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Contact via Support Team</DialogTitle>
        <form onSubmit={handleContactSubmit}>
          <DialogContent>
            {contactSuccess ? (
              <Alert severity="success">Message sent! Our support team will contact you soon.</Alert>
            ) : (
              <>
                <TextField label="Your Name" name="name" value={contactForm.name} onChange={handleContactChange} fullWidth required sx={{ mb: 2 }} />
                <TextField label="Email" name="email" value={contactForm.email} onChange={handleContactChange} type="email" fullWidth required sx={{ mb: 2 }} />
                <TextField label="Message" name="message" value={contactForm.message} onChange={handleContactChange} fullWidth required multiline rows={3} sx={{ mb: 2 }} />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContactOpen(false)} color="secondary">Cancel</Button>
            {!contactSuccess && <Button type="submit" variant="contained" color="primary">Send</Button>}
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs">
        <DialogTitle>Delete Opportunity?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this opportunity?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Land Opportunity Details</DialogTitle>
        <DialogContent>
          {selected && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                {/* Image carousel/gallery */}
                {Array.isArray(selected.images) && selected.images.length > 0 ? (
                  <>
                    <img src={selected.images[selectedImageIdx]} alt={selected.title} style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                      {selected.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`thumb-${idx}`}
                          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, border: selectedImageIdx === idx ? '2px solid #4caf50' : '1px solid #ccc', cursor: 'pointer' }}
                          onClick={() => setSelectedImageIdx(idx)}
                        />
                      ))}
                    </Box>
                  </>
                ) : (
                  <img src={selected.image} alt={selected.title} style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8 }} />
                )}
              </Box>
              <Typography variant="h6" fontWeight="bold" mb={1}>{selected.title}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>📍 {selected.location}</Typography>
              <Typography variant="body1" mb={2}>{selected.summary}</Typography>
              <Typography variant="subtitle2" color="primary.main">Owner: {selected.owner}</Typography>
              <Typography variant="caption" color="text.secondary">Type: {selected.type}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

function InvestorsSection({ opportunities, setOpportunities }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ type: 'Agri-Project', title: '', location: '', summary: '', image: '', owner: '', role: 'Investor' });
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [imagePreview, setImagePreview] = useState('');
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Add/Edit modal handlers
  const openAddModal = () => {
    setForm({ type: 'Agri-Project', title: '', location: '', summary: '', image: '', owner: '', role: 'Investor' });
    setImagePreview('');
    setEditId(null);
    setModalOpen(true);
  };
  const openEditModal = (opp) => {
    setForm({ ...opp });
    setImagePreview(opp.image || '');
    setEditId(opp.id);
    setModalOpen(true);
  };
  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFormSubmit = e => {
    e.preventDefault();
    if (!form.title || !form.location || !form.summary || !form.owner) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
      return;
    }
    if (editId) {
      setOpportunities(ops => ops.map(o => o.id === editId ? { ...form, id: editId, image: imagePreview || form.image } : o));
      setSnackbar({ open: true, message: 'Opportunity updated!', severity: 'success' });
    } else {
      setOpportunities(ops => [{ ...form, id: Date.now(), image: imagePreview || form.image }, ...ops]);
      setSnackbar({ open: true, message: 'Opportunity posted!', severity: 'success' });
    }
    setModalOpen(false);
    setForm({ type: 'Agri-Project', title: '', location: '', summary: '', image: '', owner: '', role: 'Investor' });
    setImagePreview('');
    setEditId(null);
  };

  // Contact modal handlers
  const openContactModal = (opp) => {
    setSelected(opp);
    setContactForm({ name: '', email: '', message: '' });
    setContactSuccess(false);
    setContactOpen(true);
  };
  const handleContactChange = e => setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  const handleContactSubmit = e => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setSnackbar({ open: true, message: 'Please fill all contact fields.', severity: 'error' });
      return;
    }
    setContactSuccess(true);
    setSnackbar({ open: true, message: 'Message sent to support team!', severity: 'success' });
    setTimeout(() => setContactOpen(false), 1200);
  };

  // Delete dialog handlers
  const openDeleteDialog = (opp) => {
    setSelected(opp);
    setDeleteDialogOpen(true);
  };
  const handleDelete = () => {
    setOpportunities(ops => ops.filter(o => o.id !== selected.id));
    setSnackbar({ open: true, message: 'Opportunity deleted.', severity: 'info' });
    setDeleteDialogOpen(false);
    setSelected(null);
  };

  // Details modal handler
  const openDetailsModal = (opp) => {
    setSelected(opp);
    setSelectedImageIdx(0);
    setDetailsOpen(true);
  };

  return (
    <>
      <Typography variant="h5" fontWeight="bold" color="primary.main" mb={2}>Investors: Invest, Lease, or Partner</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>Urban or diaspora? Invest in agri-projects, lease land, or partner with farmers for shared success.</Typography>
      <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={{ borderRadius: 3, fontWeight: 'bold', mb: 3 }} onClick={openAddModal}>
        Post Investment/Project
      </Button>
      {opportunities.filter(o => o.role === 'Investor' || o.type === 'Agri-Project').length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <img src="https://www.svgrepo.com/show/331984/empty-box.svg" alt="No opportunities" style={{ width: 120, opacity: 0.5 }} />
          <Typography variant="body1" color="text.secondary" mt={2}>No investor opportunities yet. Be the first to post!</Typography>
        </Box>
      ) : (
      <Grid container spacing={3}>
        {opportunities.filter(o => o.role === 'Investor' || o.type === 'Agri-Project').map(o => (
          <Grid item xs={12} sm={6} md={4} key={o.id}>
            <Fade in timeout={500}>
              <Card elevation={6} sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { boxShadow: 12, transform: 'scale(1.04)' }, position: 'relative', overflow: 'hidden', background: 'linear-gradient(120deg, #e3f2fd 0%, #fce4ec 100%)' }}>
                <Box sx={{ position: 'relative', height: 140 }}>
                  <img src={o.image} alt={o.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <Chip label="Investor" color="primary" size="small" sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 'bold' }} />
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', mr: 1 }}>
                      {o.owner?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">{o.title}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>📍 {o.location}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{o.summary}</Typography>
                  <Typography variant="caption" color="primary.main" fontWeight="bold">By: {o.owner}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Tooltip title="View Details"><Button variant="outlined" color="info" size="small" onClick={() => openDetailsModal(o)}>View Details</Button></Tooltip>
                    <Tooltip title="Contact via Support Team"><Button variant="outlined" color="primary" size="small" onClick={() => openContactModal(o)}>Contact</Button></Tooltip>
                    <Tooltip title="Edit"><Button variant="outlined" color="secondary" size="small" onClick={() => openEditModal(o)}>Edit</Button></Tooltip>
                    <Tooltip title="Delete"><Button variant="outlined" color="error" size="small" onClick={() => openDeleteDialog(o)}>Delete</Button></Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
      )}

      {/* Add/Edit Opportunity Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editId ? 'Edit Opportunity' : 'Post Investment/Project'}</DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent>
            <TextField label="Title" name="title" value={form.title} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Location" name="location" value={form.location} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Summary" name="summary" value={form.summary} onChange={handleFormChange} fullWidth required multiline rows={2} sx={{ mb: 2 }} />
            <TextField label="Image URL (optional)" name="image" value={form.image} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} />
            <TextField label="Your Name/Group" name="owner" value={form.owner} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} />
            <TextField select label="Role" name="role" value={form.role} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }}>
              <option value="">Select Role</option>
              <option value="Land Owner">Land Owner</option>
              <option value="Investor">Investor</option>
              <option value="Supporter">Supporter</option>
            </TextField>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button onClick={() => setModalOpen(false)} color="secondary">Cancel</Button>
              <Button type="submit" variant="contained" color="primary">Submit</Button>
            </Box>
          </DialogContent>
        </form>
      </Dialog>

      {/* Contact Modal */}
      <Dialog open={contactOpen} onClose={() => setContactOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Contact via Support Team</DialogTitle>
        <form onSubmit={handleContactSubmit}>
          <DialogContent>
            {contactSuccess ? (
              <Alert severity="success">Message sent! Our support team will contact you soon.</Alert>
            ) : (
              <>
                <TextField label="Your Name" name="name" value={contactForm.name} onChange={handleContactChange} fullWidth required sx={{ mb: 2 }} />
                <TextField label="Email" name="email" value={contactForm.email} onChange={handleContactChange} type="email" fullWidth required sx={{ mb: 2 }} />
                <TextField label="Message" name="message" value={contactForm.message} onChange={handleContactChange} fullWidth required multiline rows={3} sx={{ mb: 2 }} />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContactOpen(false)} color="secondary">Cancel</Button>
            {!contactSuccess && <Button type="submit" variant="contained" color="primary">Send</Button>}
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs">
        <DialogTitle>Delete Opportunity?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this opportunity?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Investment Opportunity Details</DialogTitle>
        <DialogContent>
          {selected && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                {Array.isArray(selected.images) && selected.images.length > 0 ? (
                  <>
                    <img src={selected.images[selectedImageIdx]} alt={selected.title} style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                      {selected.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`thumb-${idx}`}
                          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, border: selectedImageIdx === idx ? '2px solid #1976d2' : '1px solid #ccc', cursor: 'pointer' }}
                          onClick={() => setSelectedImageIdx(idx)}
                        />
                      ))}
                    </Box>
                  </>
                ) : (
                  <img src={selected.image} alt={selected.title} style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8 }} />
                )}
              </Box>
              <Typography variant="h6" fontWeight="bold" mb={1}>{selected.title}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>📍 {selected.location}</Typography>
              <Typography variant="body1" mb={2}>{selected.summary}</Typography>
              <Typography variant="subtitle2" color="primary.main">Owner: {selected.owner}</Typography>
              <Typography variant="caption" color="text.secondary">Type: {selected.type}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

function SupportersSection({ opportunities, setOpportunities }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ type: 'Support Request', title: '', location: '', summary: '', image: '', owner: '', role: 'Supporter' });
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [imagePreview, setImagePreview] = useState('');
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Add/Edit modal handlers
  const openAddModal = () => {
    setForm({ type: 'Support Request', title: '', location: '', summary: '', image: '', owner: '', role: 'Supporter' });
    setImagePreview('');
    setEditId(null);
    setModalOpen(true);
  };
  const openEditModal = (opp) => {
    setForm({ ...opp });
    setImagePreview(opp.image || '');
    setEditId(opp.id);
    setModalOpen(true);
  };
  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFormSubmit = e => {
    e.preventDefault();
    if (!form.title || !form.location || !form.summary || !form.owner) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
      return;
    }
    if (editId) {
      setOpportunities(ops => ops.map(o => o.id === editId ? { ...form, id: editId, image: imagePreview || form.image } : o));
      setSnackbar({ open: true, message: 'Opportunity updated!', severity: 'success' });
    } else {
      setOpportunities(ops => [{ ...form, id: Date.now(), image: imagePreview || form.image }, ...ops]);
      setSnackbar({ open: true, message: 'Opportunity posted!', severity: 'success' });
    }
    setModalOpen(false);
    setForm({ type: 'Support Request', title: '', location: '', summary: '', image: '', owner: '', role: 'Supporter' });
    setImagePreview('');
    setEditId(null);
  };

  // Contact modal handlers
  const openContactModal = (opp) => {
    setSelected(opp);
    setContactForm({ name: '', email: '', message: '' });
    setContactSuccess(false);
    setContactOpen(true);
  };
  const handleContactChange = e => setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  const handleContactSubmit = e => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setSnackbar({ open: true, message: 'Please fill all contact fields.', severity: 'error' });
      return;
    }
    setContactSuccess(true);
    setSnackbar({ open: true, message: 'Message sent to support team!', severity: 'success' });
    setTimeout(() => setContactOpen(false), 1200);
  };

  // Delete dialog handlers
  const openDeleteDialog = (opp) => {
    setSelected(opp);
    setDeleteDialogOpen(true);
  };
  const handleDelete = () => {
    setOpportunities(ops => ops.filter(o => o.id !== selected.id));
    setSnackbar({ open: true, message: 'Opportunity deleted.', severity: 'info' });
    setDeleteDialogOpen(false);
    setSelected(null);
  };

  // Details modal handler
  const openDetailsModal = (opp) => {
    setSelected(opp);
    setSelectedImageIdx(0);
    setDetailsOpen(true);
  };

  return (
    <>
      <Typography variant="h5" fontWeight="bold" color="primary.main" mb={2}>Supporters: Donate, Mentor, or Provide Inputs</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>Support farmers by donating, offering expertise, or providing agri-inputs. Every contribution counts!</Typography>
      <Button variant="contained" color="secondary" startIcon={<AddIcon />} sx={{ borderRadius: 3, fontWeight: 'bold', mb: 3 }} onClick={openAddModal}>
        Post Support/Request
      </Button>
      {opportunities.filter(o => o.role === 'Supporter' || o.type === 'Support Request').length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <img src="https://www.svgrepo.com/show/331984/empty-box.svg" alt="No opportunities" style={{ width: 120, opacity: 0.5 }} />
          <Typography variant="body1" color="text.secondary" mt={2}>No supporter opportunities yet. Be the first to post!</Typography>
        </Box>
      ) : (
      <Grid container spacing={3}>
        {opportunities.filter(o => o.role === 'Supporter' || o.type === 'Support Request').map(o => (
          <Grid item xs={12} sm={6} md={4} key={o.id}>
            <Fade in timeout={500}>
              <Card elevation={6} sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { boxShadow: 12, transform: 'scale(1.04)' }, position: 'relative', overflow: 'hidden', background: 'linear-gradient(120deg, #fce4ec 0%, #e3f2fd 100%)' }}>
                <Box sx={{ position: 'relative', height: 140 }}>
                  <img src={o.image} alt={o.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <Chip label="Supporter" color="secondary" size="small" sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 'bold' }} />
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.light', mr: 1 }}>
                      {o.owner?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">{o.title}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>📍 {o.location}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{o.summary}</Typography>
                  <Typography variant="caption" color="primary.main" fontWeight="bold">By: {o.owner}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Tooltip title="View Details"><Button variant="outlined" color="info" size="small" onClick={() => openDetailsModal(o)}>View Details</Button></Tooltip>
                    <Tooltip title="Contact via Support Team"><Button variant="outlined" color="primary" size="small" onClick={() => openContactModal(o)}>Contact</Button></Tooltip>
                    <Tooltip title="Edit"><Button variant="outlined" color="secondary" size="small" onClick={() => openEditModal(o)}>Edit</Button></Tooltip>
                    <Tooltip title="Delete"><Button variant="outlined" color="error" size="small" onClick={() => openDeleteDialog(o)}>Delete</Button></Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
      )}

      {/* Add/Edit Opportunity Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editId ? 'Edit Opportunity' : 'Post Support/Request'}</DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent>
            <TextField select label="Type" name="type" value={form.type} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }}>
              <option value="">Select Type</option>
              <option value="Land Lease">Land Lease</option>
              <option value="Agri-Project">Agri-Project</option>
              <option value="Support Request">Support Request</option>
            </TextField>
            <TextField label="Title" name="title" value={form.title} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Location" name="location" value={form.location} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Summary" name="summary" value={form.summary} onChange={handleFormChange} fullWidth required multiline rows={2} sx={{ mb: 2 }} />
            <TextField label="Image URL (optional)" name="image" value={form.image} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} />
            <TextField label="Your Name/Group" name="owner" value={form.owner} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} />
            <TextField select label="Role" name="role" value={form.role} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }}>
              <option value="">Select Role</option>
              <option value="Land Owner">Land Owner</option>
              <option value="Investor">Investor</option>
              <option value="Supporter">Supporter</option>
            </TextField>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button onClick={() => setModalOpen(false)} color="secondary">Cancel</Button>
              <Button type="submit" variant="contained" color="primary">Submit</Button>
            </Box>
          </DialogContent>
        </form>
      </Dialog>

      {/* Contact Modal */}
      <Dialog open={contactOpen} onClose={() => setContactOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Contact via Support Team</DialogTitle>
        <form onSubmit={handleContactSubmit}>
          <DialogContent>
            {contactSuccess ? (
              <Alert severity="success">Message sent! Our support team will contact you soon.</Alert>
            ) : (
              <>
                <TextField label="Your Name" name="name" value={contactForm.name} onChange={handleContactChange} fullWidth required sx={{ mb: 2 }} />
                <TextField label="Email" name="email" value={contactForm.email} onChange={handleContactChange} type="email" fullWidth required sx={{ mb: 2 }} />
                <TextField label="Message" name="message" value={contactForm.message} onChange={handleContactChange} fullWidth required multiline rows={3} sx={{ mb: 2 }} />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContactOpen(false)} color="secondary">Cancel</Button>
            {!contactSuccess && <Button type="submit" variant="contained" color="primary">Send</Button>}
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs">
        <DialogTitle>Delete Opportunity?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this opportunity?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Support Opportunity Details</DialogTitle>
        <DialogContent>
          {selected && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                {Array.isArray(selected.images) && selected.images.length > 0 ? (
                  <>
                    <img src={selected.images[selectedImageIdx]} alt={selected.title} style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                      {selected.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`thumb-${idx}`}
                          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, border: selectedImageIdx === idx ? '2px solid #d81b60' : '1px solid #ccc', cursor: 'pointer' }}
                          onClick={() => setSelectedImageIdx(idx)}
                        />
                      ))}
                    </Box>
                  </>
                ) : (
                  <img src={selected.image} alt={selected.title} style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8 }} />
                )}
              </Box>
              <Typography variant="h6" fontWeight="bold" mb={1}>{selected.title}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>📍 {selected.location}</Typography>
              <Typography variant="body1" mb={2}>{selected.summary}</Typography>
              <Typography variant="subtitle2" color="primary.main">Owner: {selected.owner}</Typography>
              <Typography variant="caption" color="text.secondary">Type: {selected.type}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

function BanksSection() {
  const [contactOpen, setContactOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', inquiryType: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredBanks = mockBanks.filter(bank =>
    (filter === 'All' || bank.type === filter) &&
    (bank.name.toLowerCase().includes(search.toLowerCase()) || bank.location.toLowerCase().includes(search.toLowerCase()))
  );

  const openContactModal = (bank) => {
    setSelected(bank);
    setContactForm({ name: '', email: '', inquiryType: '', message: '' });
    setContactSuccess(false);
    setContactOpen(true);
  };
  const handleContactChange = e => setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  const handleContactSubmit = e => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.inquiryType || !contactForm.message) {
      setSnackbar({ open: true, message: 'Please fill all contact fields.', severity: 'error' });
      return;
    }
    setContactSuccess(true);
    setSnackbar({ open: true, message: 'Message sent to service provider!', severity: 'success' });
    setTimeout(() => setContactOpen(false), 1200);
  };
  const openDetailsModal = (bank) => {
    setSelected(bank);
    setSelectedImageIdx(0);
    setDetailsOpen(true);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" color="primary.main" mb={2} sx={{ letterSpacing: 1 }}>Banks & Financial Services</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>Find agri-loans, microfinance, insurance, fintech, and SACCO services for your farming or agribusiness needs.</Typography>
      {/* Filter & Search Bar */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {bankServiceTypes.map(type => (
            <Chip
              key={type}
              label={type}
              color={filter === type ? 'primary' : 'default'}
              onClick={() => setFilter(type)}
              sx={{ fontWeight: 'bold', fontSize: 14, borderRadius: 2 }}
            />
          ))}
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 2, px: 2 }}>
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <TextField
            variant="standard"
            placeholder="Search by name or location"
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ disableUnderline: true }}
            sx={{ minWidth: 180 }}
          />
        </Box>
      </Box>
      <Grid container spacing={3}>
        {filteredBanks.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <img src="https://www.svgrepo.com/show/331984/empty-box.svg" alt="No services" style={{ width: 120, opacity: 0.5 }} />
              <Typography variant="body1" color="text.secondary" mt={2}>No services found. Try another filter or search.</Typography>
            </Box>
          </Grid>
        ) : filteredBanks.map(bank => (
          <Grid item xs={12} sm={6} md={4} key={bank.id}>
            <Fade in timeout={600}>
              <Card elevation={8} sx={{ borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { boxShadow: 16, transform: 'scale(1.035)' }, position: 'relative', overflow: 'hidden', background: 'linear-gradient(120deg, #e3f2fd 0%, #fffde7 100%)' }}>
                {bank.featured && <Chip label="Featured" color="success" size="small" sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 'bold', zIndex: 2 }} />}
                <Box sx={{ position: 'relative', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff', borderBottom: '1px solid #eee' }}>
                  <img src={bank.logo} alt={bank.name} style={{ maxWidth: 100, maxHeight: 60, objectFit: 'contain' }} />
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <Typography variant="h6" fontWeight="bold">{bank.name}</Typography>
                    <Chip label={bank.type} color="info" size="small" sx={{ fontWeight: 'bold', ml: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto', gap: 0.5 }}>
                      <StarIcon sx={{ color: '#FFD600', fontSize: 20 }} />
                      <Typography variant="body2" fontWeight="bold">{bank.rating}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    {bank.tags.map(tag => <Chip key={tag} label={tag} size="small" color="secondary" sx={{ fontSize: 12, fontWeight: 500 }} />)}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>📍 {bank.location}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{bank.summary}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Tooltip title="View Details"><Button variant="outlined" color="info" size="small" onClick={() => openDetailsModal(bank)}>View Details</Button></Tooltip>
                    <Tooltip title="Contact"><Button variant="outlined" color="primary" size="small" onClick={() => openContactModal(bank)}>Contact</Button></Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
      {/* Contact Modal */}
      <Dialog open={contactOpen} onClose={() => setContactOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Contact {selected?.name}</DialogTitle>
        <form onSubmit={handleContactSubmit}>
          <DialogContent>
            {contactSuccess ? (
              <Alert severity="success">Message sent! The service provider will contact you soon.</Alert>
            ) : (
              <>
                <TextField label="Your Name" name="name" value={contactForm.name} onChange={handleContactChange} fullWidth required sx={{ mb: 2 }} />
                <TextField label="Email" name="email" value={contactForm.email} onChange={handleContactChange} type="email" fullWidth required sx={{ mb: 2 }} />
                <TextField select label="Inquiry Type" name="inquiryType" value={contactForm.inquiryType} onChange={handleContactChange} fullWidth required sx={{ mb: 2 }}>
                  <option value="">Select Inquiry</option>
                  <option value="Loan">Loan</option>
                  <option value="Account">Account</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Other">Other</option>
                </TextField>
                <TextField label="Message" name="message" value={contactForm.message} onChange={handleContactChange} fullWidth required multiline rows={3} sx={{ mb: 2 }} />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContactOpen(false)} color="secondary">Cancel</Button>
            {!contactSuccess && <Button type="submit" variant="contained" color="primary">Send</Button>}
          </DialogActions>
        </form>
      </Dialog>
      {/* Details Modal */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{selected?.name} Details</DialogTitle>
        <DialogContent>
          {selected && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                {Array.isArray(selected.images) && selected.images.length > 0 ? (
                  <>
                    <img src={selected.images[selectedImageIdx]} alt={selected.name + ' logo'} style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, background: '#fff' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                      {selected.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={selected.name + ' logo thumb ' + (idx + 1)}
                          style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 4, border: selectedImageIdx === idx ? '2px solid #1976d2' : '1px solid #ccc', cursor: 'pointer', background: '#fff' }}
                          onClick={() => setSelectedImageIdx(idx)}
                        />
                      ))}
                    </Box>
                  </>
                ) : (
                  <img src={selected.logo} alt={selected.name + ' logo'} style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, background: '#fff' }} />
                )}
              </Box>
              <Typography variant="h6" fontWeight="bold" mb={1}>{selected.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip label={selected.type} color="info" size="small" sx={{ fontWeight: 'bold' }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StarIcon sx={{ color: '#FFD600', fontSize: 20 }} />
                  <Typography variant="body2" fontWeight="bold">{selected.rating}</Typography>
                </Box>
                {selected.featured && <Chip label="Featured" color="success" size="small" sx={{ fontWeight: 'bold' }} />}
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                {selected.tags.map(tag => <Chip key={tag} label={tag} size="small" color="secondary" sx={{ fontSize: 12, fontWeight: 500 }} />)}
              </Box>
              <Typography variant="body2" color="text.secondary" mb={1}>📍 {selected.location}</Typography>
              <Typography variant="body1" mb={2}>{selected.summary}</Typography>
              <Typography variant="subtitle2" color="primary.main" mb={1}>Services:</Typography>
              <ul style={{ margin: 0, paddingLeft: 18, marginBottom: 8 }}>
                {selected.services.map((srv, idx) => <li key={idx}><Typography variant="body2">{srv}</Typography></li>)}
              </ul>
              <Typography variant="subtitle2" color="primary.main" mb={1}>Contact Info:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><LocalPhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} /><Typography variant="body2">{selected.contact.phone}</Typography></Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} /><Typography variant="body2">{selected.contact.email}</Typography></Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LanguageIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <a href={selected.contact.website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}>
                    {selected.contact.website.replace('https://', '')}
                  </a>
                  <Chip label="Official" color="success" size="small" sx={{ ml: 1 }} />
                </Box>
              </Box>
              <Typography variant="subtitle2" color="primary.main" mb={1}>Location Map:</Typography>
              {selected.map ? (
                <Box sx={{ textAlign: 'center', mb: 1 }}>
                  <img src={selected.map} alt="Map preview" style={{ width: '100%', maxWidth: 300, borderRadius: 8, border: '1px solid #eee' }} />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">No map available.</Typography>
              )}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <a href="#" style={{ color: '#d32f2f', fontSize: 13, textDecoration: 'underline' }}>Report incorrect info</a>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar Feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', mt: 4 }}>
        Links provided are for informational purposes. Always verify with the official institution.
      </Typography>
    </Box>
  );
}

const Investments = () => {
  const [tab, setTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [opportunities, setOpportunities] = useState(mockOpportunities);
  const [form, setForm] = useState({ type: '', title: '', location: '', summary: '', image: '', owner: '', role: '' });

  const handleFormChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFormSubmit = e => {
    e.preventDefault();
    setOpportunities([
      ...opportunities,
      { ...form, id: Date.now(), image: form.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' }
    ]);
    setForm({ type: '', title: '', location: '', summary: '', image: '', owner: '', role: '' });
    setModalOpen(false);
  };

  return (
    <Box sx={{ background: 'linear-gradient(120deg, #f3e5f5 0%, #e8f5e9 100%)', minHeight: '100vh', pb: 8 }}>
      {/* Decorative Header Section (Community style) */}
      <Box sx={{
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden',
        mb: 8,
        boxShadow: '0 10px 30px rgba(76, 175, 80, 0.1)',
        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
      }}>
        {/* Decorative circles */}
        <Box sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76,175,80,0.15) 0%, rgba(76,175,80,0) 70%)',
          top: '-100px',
          right: '-50px',
          zIndex: 0,
        }} />
        <Box sx={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,193,7,0.1) 0%, rgba(255,193,7,0) 70%)',
          bottom: '-80px',
          left: '10%',
          zIndex: 0,
        }} />
        {/* SVG illustration */}
        <Box sx={{
          position: 'absolute',
          right: { xs: '-80px', sm: '-60px', md: '-20px', lg: '30px' },
          bottom: { xs: '-40px', sm: '-30px', md: '0px' },
          width: { xs: '180px', sm: '200px', md: '250px' },
          height: { xs: '180px', sm: '200px', md: '250px' },
          opacity: { xs: 0.15, sm: 0.15, md: 0.2 },
          zIndex: 1,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 512' fill='%234caf50'%3E%3Cpath d='M528 336c-48.6 0-88 39.4-88 88s39.4 88 88 88 88-39.4 88-88-39.4-88-88-88zm0 112c-13.23 0-24-10.77-24-24s10.77-24 24-24 24 10.77 24 24-10.77 24-24 24zm80-288h-64v-40.2c0-14.12 4.7-27.76 13.15-38.84 4.42-5.8 3.55-14.06-1.32-19.49L534.2 37.3c-6.66-7.45-18.32-6.92-24.7.78C490.58 60.9 480 89.81 480 119.8V160H377.67L321.58 29.14A47.914 47.914 0 0 0 277.45 0H144c-26.47 0-48 21.53-48 48v146.52c-8.63-6.73-20.96-6.46-28.89 1.47L36 227.1c-8.59 8.59-8.59 22.52 0 31.11l5.06 5.06c-4.99 9.26-8.96 18.82-11.91 28.72H22c-12.15 0-22 9.85-22 22v44c0 12.15 9.85 22 22 22h7.14c2.96 9.91 6.92 19.46 11.91 28.73l-5.06 5.05c-8.59 8.59-8.59 22.52 0 31.11L67.1 476c8.59 8.59 22.52 8.59 31.11 0l5.06-5.05c9.26 4.99 18.82 8.96 28.72 11.91V490c0 12.15 9.85 22 22 22h44c12.15 0 22-9.85 22-22v-7.14c9.9-2.95 19.46-6.92 28.72-11.91l5.05 5.05c8.59 8.59 22.52 8.59 31.11 0l31.11-31.11c8.59-8.59 8.59-22.52 0-31.11l-5.05-5.05c4.99-9.26 8.96-18.82 11.91-28.72H330c12.15 0 22-9.85 22-22v-6h80.54c21.91-28.99 56.32-48 95.46-48 18.64 0 36.07 4.61 51.8 12.2l50.82-50.82c6-6 9.37-14.14 9.37-22.63V192c.01-17.67-14.32-32-31.99-32zM176 416c-44.18 0-80-35.82-80-80s35.82-80 80-80 80 35.82 80 80-35.82 80-80 80zm22-256h-38V64h106.89l41.15 96H198z'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
        }} />
        {/* Content */}
        <Box sx={{
          position: 'relative',
          zIndex: 2,
          p: { xs: 4, sm: 6, md: 8 },
          display: { md: 'flex' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 4
        }}>
          {/* Left side content */}
          <Box sx={{ maxWidth: { md: '55%' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PaidIcon sx={{ fontSize: 32, color: '#4caf50', mr: 1 }} />
              <Typography component="span" sx={{ fontSize: '1rem', fontWeight: 'medium', color: '#4caf50', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Investments Hub
              </Typography>
            </Box>
            <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 800, color: '#2e7d32', mb: 3, maxWidth: '800px', position: 'relative', '&::after': { content: '""', position: 'absolute', bottom: '-10px', left: 0, width: '80px', height: '4px', background: 'linear-gradient(to right, #4caf50, rgba(76,175,80,0.3))', borderRadius: '2px' } }}>
              Grow Together: Connect, Invest, and Thrive
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, maxWidth: '600px', color: 'text.secondary', lineHeight: 1.6 }}>
              Link land, capital, and expertise for a new era of Ugandan agriculture. Whether you have land, want to invest, or wish to support, this is your platform.
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* End Decorative Header Section */}
      {/* Hero Section */}
      <Box sx={{ px: { xs: 2, md: 8 }, pt: { xs: 4, md: 8 }, pb: { xs: 4, md: 6 }, textAlign: 'center', background: 'linear-gradient(135deg, #e8f5e9 0%, #ede7f6 100%)', borderRadius: 0, mb: 6, boxShadow: 2 }}>
        <Typography variant="h2" fontWeight="bold" color="primary.main" sx={{ mb: 2 }}>
          Grow Together: Connect, Invest, and Thrive
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
          Link land, capital, and expertise for a new era of Ugandan agriculture. Whether you have land, want to invest, or wish to support, this is your platform.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button variant="contained" color="success" size="large" startIcon={<AgricultureIcon />} sx={{ borderRadius: 3, fontWeight: 'bold' }} onClick={() => setTab(0)}>
            I Have Land
          </Button>
          <Button variant="contained" color="primary" size="large" startIcon={<PaidIcon />} sx={{ borderRadius: 3, fontWeight: 'bold' }} onClick={() => setTab(1)}>
            I Want to Invest
          </Button>
          <Button variant="contained" color="secondary" size="large" startIcon={<GroupAddIcon />} sx={{ borderRadius: 3, fontWeight: 'bold' }} onClick={() => setTab(2)}>
            I Want to Support
          </Button>
        </Box>
        <Button variant="outlined" color="primary" size="medium" sx={{ borderRadius: 3, fontWeight: 'bold', mt: 2 }} onClick={() => setTab(0)}>
          Browse Opportunities
        </Button>
      </Box>
      {/* Tabs for Roles */}
      <Box sx={{ px: { xs: 2, md: 8 } }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 4 }}>
          <Tab label="Land Owners" icon={<AgricultureIcon />} iconPosition="start" />
          <Tab label="Investors" icon={<PaidIcon />} iconPosition="start" />
          <Tab label="Supporters" icon={<EmojiPeopleIcon />} iconPosition="start" />
          <Tab label="Banks & Financial Services" icon={<AccountBalanceIcon />} iconPosition="start" />
        </Tabs>
        {/* Tab Panels */}
        <TabPanel value={tab} index={0}>
          <LandOwnersSection opportunities={opportunities} setOpportunities={setOpportunities} />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <InvestorsSection opportunities={opportunities} setOpportunities={setOpportunities} />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <SupportersSection opportunities={opportunities} setOpportunities={setOpportunities} />
        </TabPanel>
        <TabPanel value={tab} index={3}>
          <BanksSection />
        </TabPanel>
      </Box>
      {/* How It Works Section */}
      <Box sx={{ px: { xs: 2, md: 8 }, mt: 8, mb: 6 }}>
        <Typography variant="h4" fontWeight="bold" color="secondary.main" mb={3}>How It Works</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color="primary.main">1</Typography>
              <Typography variant="subtitle1" fontWeight="bold">Choose Your Role</Typography>
              <Typography variant="body2" color="text.secondary">Land owner, investor, or supporter? Select your path.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color="primary.main">2</Typography>
              <Typography variant="subtitle1" fontWeight="bold">Connect with Partners</Typography>
              <Typography variant="body2" color="text.secondary">Find the right match for your needs and goals.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color="primary.main">3</Typography>
              <Typography variant="subtitle1" fontWeight="bold">Invest, Lease, or Support</Typography>
              <Typography variant="body2" color="text.secondary">Take action: invest, lease land, or offer support.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color="primary.main">4</Typography>
              <Typography variant="subtitle1" fontWeight="bold">Track Your Impact</Typography>
              <Typography variant="body2" color="text.secondary">See the difference you make in real time.</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      {/* Success Stories Section */}
      <Box sx={{ px: { xs: 2, md: 8 }, mb: 8 }}>
        <Typography variant="h4" fontWeight="bold" color="primary.main" mb={3}>Success Stories</Typography>
        <Grid container spacing={4}>
          {mockStories.map((story, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center', height: '100%' }}>
                <Avatar src={story.avatar} sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'secondary.main', fontSize: 32 }}>
                  {story.avatar ? '' : story.name[0]}
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>{story.name}</Typography>
                <Typography variant="body2" color="text.secondary">{story.story}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* Post Opportunity Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 3, boxShadow: 24, minWidth: 340, maxWidth: 400 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Post an Opportunity</Typography>
          <form onSubmit={handleFormSubmit}>
            <TextField select label="Type" name="type" value={form.type} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }}>
              <option value="">Select Type</option>
              <option value="Land Lease">Land Lease</option>
              <option value="Agri-Project">Agri-Project</option>
              <option value="Support Request">Support Request</option>
            </TextField>
            <TextField label="Title" name="title" value={form.title} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Location" name="location" value={form.location} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Summary" name="summary" value={form.summary} onChange={handleFormChange} fullWidth required multiline rows={2} sx={{ mb: 2 }} />
            <TextField label="Image URL (optional)" name="image" value={form.image} onChange={handleFormChange} fullWidth sx={{ mb: 2 }} />
            <TextField label="Your Name/Group" name="owner" value={form.owner} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }} />
            <TextField select label="Role" name="role" value={form.role} onChange={handleFormChange} fullWidth required sx={{ mb: 2 }}>
              <option value="">Select Role</option>
              <option value="Land Owner">Land Owner</option>
              <option value="Investor">Investor</option>
              <option value="Supporter">Supporter</option>
            </TextField>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button onClick={() => setModalOpen(false)} color="secondary">Cancel</Button>
              <Button type="submit" variant="contained" color="primary">Submit</Button>
            </Box>
          </form>
        </Box>
      </Modal>
      {/* Floating Action Button */}
      <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 32, right: 32, boxShadow: 6 }} onClick={() => setModalOpen(true)}>
        <AddIcon />
      </Fab>
      <Divider sx={{ my: 6 }} />
      <Typography variant="body2" color="text.secondary" align="center">
        Empowering both farmers and investors for a sustainable future. More features coming soon!
      </Typography>
    </Box>
  );
};

export default Investments; 