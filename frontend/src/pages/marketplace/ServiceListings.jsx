import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getListings } from '../../services/api/marketplaceService';
import {
  Typography, Box, Paper, TextField, InputAdornment,
  FormControl, Select, MenuItem, Button, Chip,
  Card, CardMedia, CardContent, CardActionArea, Grid,
  InputLabel, Divider, Rating, Avatar, Modal, Fade, Backdrop, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, CircularProgress, Alert
} from '@mui/material';
import { Star as StarIcon, Phone as PhoneIcon, Email as EmailIcon, Edit as EditIcon } from '@mui/icons-material';

const BookingModal = ({ open, onClose, service }) => {
  const [form, setForm] = useState({ name: '', phone: '', date: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 300 }}
    >
      <Fade in={open}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          p: 4,
          minWidth: { xs: 320, sm: 400 },
          maxWidth: '90vw',
        }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Book Service: {service?.title}
          </Typography>
          {submitted ? (
            <Box textAlign="center" py={3}>
              <Typography color="success.main" fontWeight={600}>Booking Sent!</Typography>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                label="Your Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Preferred Date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Message (optional)"
                name="message"
                value={form.message}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Send Booking
              </Button>
            </form>
          )}
        </Box>
      </Fade>
    </Modal>
  );
};

const mockCurrentUser = { id: 1, name: 'Demo Provider' };

const ServiceListings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedId, setExpandedId] = useState(null);
  const [bookingService, setBookingService] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, listing: null });
  const [listings, setListings] = useState([]);
  const [callDialog, setCallDialog] = useState({ open: false, phone: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // Fetch service listings from API
  useEffect(() => {
    const fetchServiceListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: listingsError } = await getListings({
          type: 'service',
          status: 'active',
          limit: 100
        });
        
        if (listingsError) throw listingsError;
        
        setListings(data || []);
        
        // Extract unique categories from listings
        const uniqueCategories = [...new Set((data || []).map(item => item.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Error fetching service listings:', err);
        setError(err.message || 'Failed to load service listings');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceListings();
  }, []);

  // Filter and sort listings
  const filteredListings = listings
    .filter(listing =>
      (searchTerm === '' ||
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterCategory === '' || listing.category === filterCategory)
    )
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      } else if (sortBy === 'priceHigh') {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return priceB - priceA;
      } else if (sortBy === 'priceLow') {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return priceA - priceB;
      }
      return 0;
    });

  // Helper for availability - simplified since we don't have complex provider objects
  const getAvailability = (listing) => 
    listing.status === 'active' ? 
      { label: 'Available', color: 'success' } : 
      { label: 'Unavailable', color: 'error' };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      )}
      
      {/* Error State */}
      {error && (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        </Box>
      )}
      
      {/* Main Content - Only show when not loading */}
      {!loading && (
        <>
          {/* Header section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h3" component="h1" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
              Agricultural Services
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '800px' }}>
              Find specialized agricultural services from equipment rental and labor to consulting and technical expertise.
              Connect with service providers to improve your farming operations.
            </Typography>
          </Box>

          {/* Search and filter section */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          mb: 4,
          p: 3
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      style={{ color: '#9e9e9e' }}
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="sort-label">Sort By</InputLabel>
              <Select
                labelId="sort-label"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="experience">Most Experienced</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/marketplace/create"
              fullWidth
              startIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              }
              sx={{
                borderRadius: 2,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              Offer
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results count */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Showing {filteredListings.length} service {filteredListings.length === 1 ? 'listing' : 'listings'}
        </Typography>
        {searchTerm || filterCategory ? (
          <Button
            variant="outlined"
            size="small"
            onClick={() => { setSearchTerm(''); setFilterCategory(''); setSortBy('newest'); }}
            sx={{
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            Clear Filters
          </Button>
        ) : null}
      </Box>

      {/* Listings grid */}
      <Grid container spacing={4}>
        {filteredListings.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, color: 'text.secondary' }}>
              <Typography variant="h6" fontWeight={600} mb={2}>No services found</Typography>
              <Typography variant="body2">Try adjusting your search or filter criteria.</Typography>
            </Paper>
          </Grid>
        ) : filteredListings.map((listing) => {
          const isExpanded = expandedId === listing.id;
          const availability = getAvailability(listing.provider);
          return (
            <Grid item xs={12} sm={6} lg={4} key={listing.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
                  boxShadow: isExpanded ? 8 : 2,
                  transform: isExpanded ? 'scale(1.03)' : 'none',
                  '&:hover': {
                    boxShadow: 8,
                    transform: 'scale(1.03)'
                  }
                }}
                onClick={() => setExpandedId(isExpanded ? null : listing.id)}
                tabIndex={0}
                aria-expanded={isExpanded}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={listing.image}
                    alt={listing.title}
                  />
                  <Chip
                    label={availability.label}
                    color={availability.color}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      fontWeight: 600,
                      letterSpacing: 0.5
                    }}
                  />
                  <Chip
                    label={listing.category}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: 'rgba(255,255,255,0.9)',
                      fontWeight: 500
                    }}
                  />
                  {listing.featured && (
                    <StarIcon sx={{
                      position: 'absolute',
                      top: 12,
                      left: 48,
                      color: 'warning.main',
                      fontSize: 28,
                      zIndex: 2
                    }} />
                  )}
                  {listing.provider.id === mockCurrentUser.id && (
                    <Tooltip title="Edit Listing" placement="top">
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', top: 12, right: 48, bgcolor: 'background.paper', zIndex: 3 }}
                        onClick={e => { e.stopPropagation(); setEditModal({ open: true, listing }); }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1, pb: 2 }}>
                  <Typography variant="h6" fontWeight={700} mb={0.5} color="text.primary">
                    {listing.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {listing.location}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar src={listing.provider.avatar} sx={{ width: 28, height: 28, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {listing.provider.name}
                    </Typography>
                    <Rating value={listing.provider.rating} precision={0.1} readOnly size="small" sx={{ ml: 1 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                      ({listing.provider.reviews || 0})
                    </Typography>
                  </Box>
                  {/* Always-visible contact buttons */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Tooltip title={`Call ${listing.provider.phone}`} placement="top">
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<PhoneIcon />}
                        onClick={e => { e.stopPropagation(); setCallDialog({ open: true, phone: listing.provider.phone }); }}
                        sx={{ minWidth: 0, px: 1.5 }}
                      >
                        Call
                      </Button>
                    </Tooltip>
                    <Dialog open={callDialog.open} onClose={() => setCallDialog({ open: false, phone: '' })}>
                      <DialogTitle>Confirm Call</DialogTitle>
                      <DialogContent>
                        <Typography>Do you want to call <b>{callDialog.phone}</b>?</Typography>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => setCallDialog({ open: false, phone: '' })}>Cancel</Button>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => { window.location.href = `tel:${callDialog.phone}`; setCallDialog({ open: false, phone: '' }); }}
                        >
                          Call Now
                        </Button>
                      </DialogActions>
                    </Dialog>
                    <Tooltip title={`Email ${listing.provider.email}`} placement="top">
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        startIcon={<EmailIcon />}
                        href={`mailto:${listing.provider.email}?subject=Service%20Request%20for%20${encodeURIComponent(listing.title)}&body=Hello%20${encodeURIComponent(listing.provider.name)},%0A%0AI%20am%20interested%20in%20your%20service%20listing%20%22${encodeURIComponent(listing.title)}%22.%20Please%20provide%20more%20details.%0A%0AThank%20you!`}
                        onClick={e => e.stopPropagation()}
                        sx={{ minWidth: 0, px: 1.5 }}
                      >
                        Email
                      </Button>
                    </Tooltip>
                  </Box>
                  {/* Clickable phone/email in expanded view */}
                  {isExpanded && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        <b>Experience:</b> {listing.provider.completedJobs} jobs completed
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        <b>Contact:</b> 
                        <a href={`tel:${listing.provider.phone}`} style={{ color: '#1976d2', textDecoration: 'none', marginRight: 8 }} onClick={e => e.stopPropagation()}>{listing.provider.phone}</a>
                        |
                        <a href={`mailto:${listing.provider.email}`} style={{ color: '#1976d2', textDecoration: 'none', marginLeft: 8 }} onClick={e => e.stopPropagation()}>{listing.provider.email}</a>
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ mt: 1, borderRadius: 2, fontWeight: 600 }}
                        onClick={e => { e.stopPropagation(); setBookingService(listing); }}
                      >
                        Quick Book
                      </Button>
                    </>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: 36 }}>
                    {isExpanded ? listing.description : `${listing.description.slice(0, 60)}${listing.description.length > 60 ? '...' : ''}`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <BookingModal open={!!bookingService} onClose={() => setBookingService(null)} service={bookingService} />
      {/* Edit Modal */}
      <Dialog open={editModal.open} onClose={() => setEditModal({ open: false, listing: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Service Listing</DialogTitle>
        <DialogContent>
          {editModal.listing && (
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                label="Title"
                fullWidth
                sx={{ mb: 2 }}
                value={editModal.listing.title}
                onChange={e => setEditModal({ ...editModal, listing: { ...editModal.listing, title: e.target.value } })}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={3}
                sx={{ mb: 2 }}
                value={editModal.listing.description}
                onChange={e => setEditModal({ ...editModal, listing: { ...editModal.listing, description: e.target.value } })}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editModal.listing.category}
                  label="Category"
                  onChange={e => setEditModal({ ...editModal, listing: { ...editModal.listing, category: e.target.value } })}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModal({ open: false, listing: null })}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setListings(listings.map(l => l.id === editModal.listing.id ? { ...editModal.listing } : l));
              setEditModal({ open: false, listing: null });
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
        </>
      )}
    </div>
  );
};

export default ServiceListings; 