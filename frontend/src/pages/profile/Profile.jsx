import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Avatar, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  Divider, 
  Tabs, 
  Tab, 
  Paper, 
  Chip, 
  Stack,
  IconButton,
  Skeleton
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Add,
  Edit,
  Facebook,
  Twitter,
  CheckCircle
} from '@mui/icons-material';

import { mockUserData, mockUserListings } from '../../mocks/profile';

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [activeTab, setActiveTab] = useState('listings');
  const [listingFilter, setListingFilter] = useState('all');

  const isOwnProfile = user && user.id === id;

  useEffect(() => {
    // Simulate API call to fetch profile data
    setTimeout(() => {
      // In a real app, we would fetch the profile data from an API
      setProfileData(mockUserData);
      setListings(mockUserListings);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleFollow = () => {
    // Simulate following a user
    alert('You are now following this user');
  };

  const handleContact = () => {
    // Simulate contacting a user
    alert('Message sent to the user');
  };

  const getFilteredListings = () => {
    if (listingFilter === 'all') {
      return listings;
    }
    return listings.filter(listing => listing.status === listingFilter);
  };

  // Status chip color mapping
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'success';
      case 'sold': return 'primary';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, mt: { xs: 0, md: -8 }, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Skeleton variant="circular" width={120} height={120} />
                <Skeleton variant="text" width="60%" height={30} sx={{ mt: 2 }} />
                <Skeleton variant="text" width="40%" height={20} />
              </Box>
              <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={150} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Skeleton variant="rectangular" height={50} />
            </Paper>
            <Box sx={{ mb: 2 }}>
              <Skeleton variant="text" width="30%" height={30} />
            </Box>
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} key={item}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" color="error" gutterBottom>
          Error
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {error}
        </Typography>
        <Button component={Link} to="/" variant="contained" color="primary">
          Go to Home
        </Button>
      </Container>
    );
  }

  if (!profileData) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Cover photo */}
      <Box 
        sx={{ 
          height: 250, 
          borderRadius: 2, 
          overflow: 'hidden', 
          mb: 4,
          position: 'relative'
        }}
      >
        <Box
          component="img"
          src={profileData.coverPhoto}
          alt="Cover"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </Box>

      {/* Profile info and content */}
      <Grid container spacing={4}>
        {/* Left sidebar - Profile info */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mt: { xs: 0, md: -8 }, 
              position: 'relative', 
              zIndex: 1,
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 3 }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                  mb: 2,
                  border: '4px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
                src={profileData.avatar}
              >
                {profileData.name.charAt(0)}
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {profileData.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {profileData.role}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {profileData.location}
                </Typography>
              </Box>
              
              {!isOwnProfile && (
                <Stack direction="row" spacing={2} sx={{ width: '100%', mb: 3 }}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={handleFollow}
                  >
                    Follow
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={handleContact}
                  >
                    Contact
                  </Button>
                </Stack>
              )}
              
              {isOwnProfile && (
                <Button 
                  component={Link} 
                  to="/profile/edit" 
                  variant="outlined" 
                  startIcon={<Edit />}
                  fullWidth
                  sx={{ mb: 3 }}
                >
                  Edit Profile
                </Button>
              )}
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  width: '100%', 
                  py: 2, 
                  borderTop: 1, 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  mb: 3
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">
                    {profileData.stats.listingsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Listings
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">
                    {profileData.stats.rating}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rating
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">
                    {profileData.stats.reviewsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reviews
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                About
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profileData.bio}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Contact Information
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Email fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {profileData.email}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Phone fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {profileData.phone}
                  </Typography>
                </Box>
              </Stack>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Farming Details
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  <Box component="span" fontWeight="medium">Farm Size:</Box> {profileData.farmSize}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <Box component="span" fontWeight="medium">Specialty:</Box> {profileData.specialty}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <Box component="span" fontWeight="medium">Certifications:</Box>
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {profileData.certifications.map((cert, index) => (
                    <Chip 
                      key={index} 
                      label={cert} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                      icon={<CheckCircle fontSize="small" />}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              </Stack>
            </Box>
            
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Social Media
              </Typography>
              <Stack direction="row" spacing={2}>
                {profileData.social.facebook && (
                  <IconButton 
                    href={profileData.social.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    color="primary"
                  >
                    <Facebook />
                  </IconButton>
                )}
                {profileData.social.twitter && (
                  <IconButton 
                    href={profileData.social.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    color="info"
                  >
                    <Twitter />
                  </IconButton>
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid>
        
        {/* Right content area */}
        <Grid item xs={12} md={8}>
          {/* Tabs */}
          <Paper elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab value="listings" label="Listings" />
              <Tab value="reviews" label="Reviews" />
              {isOwnProfile && <Tab value="saved" label="Saved" />}
            </Tabs>
          </Paper>
          
          {/* Listings tab content */}
          {activeTab === 'listings' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                  {isOwnProfile ? 'Your Listings' : `${profileData.name}'s Listings`}
                </Typography>
                
                {isOwnProfile && (
                  <Button 
                    component={Link} 
                    to="/marketplace/create" 
                    variant="contained" 
                    color="primary"
                    startIcon={<Add />}
                  >
                    New Listing
                  </Button>
                )}
              </Box>
              
              {isOwnProfile && (
                <Paper elevation={1} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                  <Tabs 
                    value={listingFilter}
                    onChange={(e, newValue) => setListingFilter(newValue)}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab value="all" label="All" />
                    <Tab value="active" label="Active" />
                    <Tab value="sold" label="Sold" />
                    <Tab value="inactive" label="Inactive" />
                  </Tabs>
                </Paper>
              )}
              
              {getFilteredListings().length > 0 ? (
                <Grid container spacing={3}>
                  {getFilteredListings().map((listing) => (
                    <Grid item xs={12} sm={6} key={listing.id}>
                      <Card 
                        elevation={2} 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          borderRadius: 2,
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 6
                          },
                          position: 'relative',
                          overflow: 'visible'
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height="180"
                            image={listing.image}
                            alt={listing.title}
                            sx={{ 
                              borderTopLeftRadius: 8,
                              borderTopRightRadius: 8
                            }}
                          />
                          <Chip
                            label={listing.type.toUpperCase()}
                            color="primary"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              fontWeight: 'bold',
                              borderRadius: '16px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          />
                          {isOwnProfile && listing.status !== 'active' && (
                            <Chip
                              label={listing.status.toUpperCase()}
                              color={getStatusColor(listing.status)}
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                        </Box>
                        <CardContent sx={{ flexGrow: 1, pt: 2, pb: 1 }}>
                          <Typography 
                            variant="h6" 
                            component={Link} 
                            to={`/marketplace/listing/${listing.id}`} 
                            sx={{ 
                              textDecoration: 'none', 
                              color: 'text.primary',
                              display: 'block',
                              mb: 1,
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                              '&:hover': {
                                color: 'primary.main'
                              }
                            }}
                          >
                            {listing.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOn fontSize="small" color="action" sx={{ mr: 0.5, opacity: 0.7, fontSize: '1rem' }} />
                            <Typography variant="body2" color="text.secondary">
                              {listing.location}
                            </Typography>
                          </Box>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              mb: 1.5,
                              mt: 1.5
                            }}
                          >
                            <Typography 
                              variant="h6" 
                              color="primary.main" 
                              fontWeight="bold"
                              sx={{
                                fontSize: '1.1rem',
                                color: 'primary.main'
                              }}
                            >
                              {listing.price}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{
                                bgcolor: 'grey.100',
                                py: 0.5,
                                px: 1,
                                borderRadius: 1,
                                fontSize: '0.7rem'
                              }}
                            >
                              {new Date(listing.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          
                          {isOwnProfile && (
                            <Stack 
                              direction="row" 
                              spacing={1}
                              sx={{ mt: 2 }}
                            >
                              <Button 
                                component={Link} 
                                to={`/marketplace/edit/${listing.id}`} 
                                variant="outlined" 
                                size="small"
                                startIcon={<Edit sx={{ fontSize: '0.9rem' }} />}
                                fullWidth
                                sx={{ 
                                  textTransform: 'none',
                                  borderRadius: 2
                                }}
                              >
                                Edit
                              </Button>
                              {listing.status === 'active' ? (
                                <Button 
                                  variant="outlined" 
                                  size="small" 
                                  color="success"
                                  fullWidth
                                  sx={{ 
                                    textTransform: 'none',
                                    borderRadius: 2
                                  }}
                                >
                                  Mark Sold
                                </Button>
                              ) : listing.status === 'inactive' ? (
                                <Button 
                                  variant="contained" 
                                  size="small" 
                                  color="success"
                                  fullWidth
                                  sx={{ 
                                    textTransform: 'none',
                                    borderRadius: 2
                                  }}
                                >
                                  Activate
                                </Button>
                              ) : null}
                            </Stack>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body1" color="text.secondary" paragraph>
                    No listings found
                  </Typography>
                  {isOwnProfile && (
                    <Button 
                      component={Link} 
                      to="/marketplace/create" 
                      variant="contained" 
                      color="primary"
                      startIcon={<Add />}
                    >
                      Create Your First Listing
                    </Button>
                  )}
                </Paper>
              )}
            </Box>
          )}
          
          {/* Reviews tab content */}
          {activeTab === 'reviews' && (
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Reviews ({profileData.stats.reviewsCount})
              </Typography>
              
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 2
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Reviews functionality coming soon
                </Typography>
              </Paper>
            </Box>
          )}
          
          {/* Saved tab content (only for own profile) */}
          {isOwnProfile && activeTab === 'saved' && (
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Saved Listings
              </Typography>
              
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 2
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Saved listings functionality coming soon
                </Typography>
              </Paper>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;