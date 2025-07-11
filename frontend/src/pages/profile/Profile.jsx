import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../services/api/authService';
import { getUserListings, changeListingStatus } from '../../services/api/marketplaceService';
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
  Skeleton,
  Alert,
  Tooltip,
  useTheme,
  Badge,
  LinearProgress,
  useMediaQuery,
  AvatarGroup,
  CircularProgress
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Add,
  Edit,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  CheckCircle,
  Verified,
  Share,
  Message,
  StarRate,
  Favorite,
  CalendarToday,
  Agriculture,
  Grass,
  KeyboardArrowDown,
  Bookmark,
  BookmarkBorder,
  EmojiEvents,
  ShoppingCart
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Animation variants for staggered animations
const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const ITEM_VARIANTS = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

// Custom scrolling progress indicator component
const ScrollProgressIndicator = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <LinearProgress
      variant="determinate"
      value={scrollProgress}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        '& .MuiLinearProgress-bar': {
          background: 'linear-gradient(90deg, #4caf50, #8bc34a)'
        },
        bgcolor: 'rgba(255,255,255,0.2)'
      }}
    />
  );
};

// MotionBox component for easy animation
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionCard = motion(Card);
const MotionGrid = motion(Grid);

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('listings');
  const [listingFilter, setListingFilter] = useState('all');
  // We're using this state in the UI now
  const [scrolledDown, setScrolledDown] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Removing unused isTablet variable
  const coverRef = useRef(null);
  const profileCardRef = useRef(null);
  // Add a state for tracking status changes
  const [statusChanging, setStatusChanging] = useState({});

  const isOwnProfile = user && (user.id === id || (!id && user));
  const profileId = id || (user ? user.id : null);

  // Track scroll position for parallax and header effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolledDown(scrollPosition > 100);
      
      // Parallax effect for cover photo
      if (coverRef.current) {
        coverRef.current.style.transform = `translateY(${scrollPosition * 0.4}px)`;
      }
      
      // Add subtle rotation to the profile card on scroll
      if (profileCardRef.current && !isMobile) {
        const rect = profileCardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const rotateX = (window.innerHeight / 2 - centerY) / 40;
        const rotateY = (window.innerWidth / 2 - centerX) / 80;
        
        profileCardRef.current.style.transform = 
          `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleScroll);
    };
  }, [isMobile]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!profileId) return;
      
      try {
        setLoading(true);
        const { data, error } = await getUserProfile(profileId);
        
        if (error) throw error;
        
        if (data) {
          // Transform the data to match the expected format
          const transformedData = {
            id: data.id,
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User',
            email: data.email || '',
            phone: data.phone_number || '',
            location: data.location || '',
            role: data.role || 'User',
            bio: data.bio && typeof data.bio === 'string' ? data.bio.replace(/<[^>]*>?/gm, '') : '',
            avatar: data.avatar_url || '',
            coverPhoto: data.cover_photo || 'https://source.unsplash.com/random/1200x300/?farm',
            farmSize: data.farm_size || 'Not specified',
            farmType: data.farmer_type || 'Not specified',
            specialty: data.specialty || 'Not specified',
            certifications: data.certifications || [],
            social: {
              facebook: data.facebook_url || '',
              twitter: data.twitter_url || '',
            },
            stats: {
              listingsCount: 0,
              rating: 0,
              reviewsCount: 0
            }
          };
          
          setProfileData(transformedData);
          // We'll fetch listings separately now
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    // New function to fetch user listings from the database
    const fetchUserListings = async () => {
      if (!profileId) return;
      
      try {
        setListingsLoading(true);
        const { data, error } = await getUserListings(profileId);
        
        if (error) {
          console.error('Error fetching listings:', error);
          return;
        }
        
        if (data && data.length > 0) {
          // Update profile stats with the actual count
          if (profileData) {
            setProfileData(prev => ({
              ...prev,
              stats: {
                ...prev.stats,
                listingsCount: data.length
              }
            }));
          }
          
          // Transform data if necessary to match the expected format
          const transformedListings = data.map(listing => ({
            id: listing.id,
            title: listing.title,
            description: listing.description,
            price: listing.price ? `UGX ${Number(listing.price).toLocaleString()}` : 'Negotiable',
            location: listing.location,
            type: listing.type, // 'land', 'produce', or 'service'
            status: listing.status, // 'active', 'sold', 'inactive', etc.
            image: listing.thumbnail || (listing.images && listing.images.length > 0 
              ? listing.images[0] 
              : 'https://source.unsplash.com/random/300x200/?agriculture'),
            createdAt: listing.created_at
          }));
          
          setListings(transformedListings);
        } else {
          // No listings found, set empty array
          setListings([]);
        }
      } catch (err) {
        console.error('Error fetching user listings:', err);
      } finally {
        setListingsLoading(false);
      }
    };

    fetchProfileData();
    fetchUserListings();
  }, [profileId, profileData?.id]);

  const handleFollow = () => {
    // Simulate following a user
    alert('You are now following this user');
  };

  const handleContact = () => {
    // Simulate contacting a user
    alert('Message sent to the user');
  };

  const getFilteredListings = () => {
    if (listingsLoading) {
      // Return placeholder array for skeleton loading
      return Array(4).fill({});
    }
    
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

  // Handle listing status change
  const handleStatusChange = async (listingId, newStatus) => {
    try {
      // Set loading state for this specific listing
      setStatusChanging(prev => ({ ...prev, [listingId]: true }));
      
      const { success, error } = await changeListingStatus(listingId, newStatus);
      
      if (error) {
        console.error('Error changing listing status:', error);
        return;
      }
      
      if (success) {
        // Update the local state with the new status
        setListings(prevListings => 
          prevListings.map(listing => 
            listing.id === listingId 
              ? { ...listing, status: newStatus } 
              : listing
          )
        );
      }
    } catch (err) {
      console.error('Error updating listing status:', err);
    } finally {
      // Clear loading state
      setStatusChanging(prev => ({ ...prev, [listingId]: false }));
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="rectangular" height={280} sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, mt: { xs: 0, md: -8 }, position: 'relative', zIndex: 1, borderRadius: 2, mb: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={4}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', py: 2, mb: { xs: 3, lg: 0 }, height: '100%' }}>
                    {[1, 2, 3].map((item) => (
                      <Box key={item} sx={{ textAlign: 'center', width: '30%' }}>
                        <Skeleton variant="text" width="60%" height={30} sx={{ mx: 'auto' }} />
                        <Skeleton variant="text" width="80%" height={20} />
                      </Box>
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6} lg={4}>
                  <Box sx={{ mb: 3 }}>
                    <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
                  </Box>
                  
                  <Box sx={{ mb: { xs: 3, lg: 0 } }}>
                    <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6} lg={4}>
                  <Box sx={{ mb: 3 }}>
                    <Skeleton variant="text" width="50%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
                  </Box>
                  
                  <Box>
                    <Skeleton variant="text" width="45%" height={24} sx={{ mb: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                      {[1, 2, 3, 4].map((item) => (
                        <Skeleton key={item} variant="circular" width={40} height={40} />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ borderRadius: 2, mb: 3, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex' }}>
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} variant="rectangular" width="33.33%" height={50} />
                ))}
              </Box>
            </Paper>
            
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton variant="text" width="30%" height={32} />
              <Skeleton variant="rounded" width={120} height={40} sx={{ borderRadius: '28px' }} />
            </Box>
            
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
                  <Skeleton 
                    variant="rounded" 
                    height={300} 
                    sx={{ 
                      borderRadius: 3,
                      boxShadow: '0px 2px 8px rgba(0,0,0,0.08)'
                    }} 
                  />
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
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Typography variant="h4" gutterBottom>
          Could not load profile
        </Typography>
        <Button component={Link} to="/" variant="contained" color="primary">
          Go to Home
        </Button>
      </Container>
    );
  }

  if (!profileData) return null;

  return (
    <>
      {/* Scroll progress indicator */}
      <ScrollProgressIndicator />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Cover photo with parallax effect and overlay gradient */}
        <MotionBox 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          sx={{ 
            height: { xs: 220, md: 320 }, 
            borderRadius: '16px', 
            overflow: 'hidden', 
            mb: 4,
            position: 'relative',
            bgcolor: 'grey.200',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            transform: 'translateZ(0)', // Optimize for performance
          }}
        >
          {profileData.coverPhoto && (
            <Box
              ref={coverRef}
              component="img"
              src={profileData.coverPhoto}
              alt="Cover"
              sx={{
                width: '100%',
                height: '110%', // Extra height for parallax
                objectFit: 'cover',
                transition: 'transform 0.1s',
                transformOrigin: 'center top',
                filter: 'brightness(0.95)'
              }}
            />
          )}
          
          {/* Decorative pattern overlay */}
          <Box 
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath fill='%23ffffff' fill-opacity='0.08' d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z'%3E%3C/path%3E%3C/svg%3E")`,
              zIndex: 1,
            }}
          />
          
          {/* Gradient overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '70%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 100%)',
              display: 'flex',
              alignItems: 'flex-end',
              p: 3,
              zIndex: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-end', width: '100%', gap: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
              {/* Avatar with animated border */}
              <MotionBox
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 100,
                  delay: 0.2,
                  duration: 0.6
                }}
                sx={{ 
                  position: 'relative',
                  mb: { xs: 0, md: 2 }
                }}
              >
                <Box 
                  className="avatar-border"
                  sx={{
                    position: 'absolute',
                    width: { xs: 100, md: 120 },
                    height: { xs: 100, md: 120 },
                    borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, #4caf50, #8bc34a, #cddc39, #4caf50)',
                    animation: 'spin 4s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    },
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 0
                  }}
                />
                <Avatar
                  sx={{ 
                    width: { xs: 90, md: 110 }, 
                    height: { xs: 90, md: 110 }, 
                    bgcolor: 'primary.main',
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    border: '4px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    position: 'relative',
                    zIndex: 1,
                    margin: '5px',
                  }}
                  src={profileData.avatar}
                >
                  {profileData.name.charAt(0)}
                </Avatar>
                
                {profileData.role === 'Verified Farmer' && (
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Tooltip title="Verified Farmer">
                        <Avatar 
                          sx={{ 
                            width: 34, 
                            height: 34, 
                            bgcolor: '#4caf50',
                            border: '2px solid white'
                          }}
                        >
                          <Verified sx={{ fontSize: 20 }} />
                        </Avatar>
                      </Tooltip>
                    }
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      transform: 'translate(10%, 10%)',
                    }}
                  />
                )}
              </MotionBox>
              
              <Box sx={{ color: 'white', flexGrow: 1 }}>
                <MotionBox
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography 
                      variant="h4" 
                      fontWeight="bold" 
                      sx={{ 
                        textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                        mr: 1,
                        fontSize: { xs: '1.75rem', md: '2.25rem' }
                      }}
                    >
                      {profileData.name}
                    </Typography>
                    
                    {profileData.role && (
                      <Chip 
                        label={profileData.role}
                        color="primary"
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(76, 175, 80, 0.9)',
                          borderRadius: '12px',
                          height: 24,
                          mt: { xs: 1, sm: 0 },
                          textShadow: '0 1px 1px rgba(0,0,0,0.2)',
                          fontWeight: 'medium'
                        }}
                      />
                    )}
                  </Box>
                </MotionBox>
                
                <MotionBox
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      textShadow: '1px 1px 3px rgba(0,0,0,0.5)', 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: 1,
                      mt: 0.5
                    }}
                  >
                    <LocationOn fontSize="small" sx={{ mr: 0.5, opacity: 0.9, fontSize: '1rem' }} />
                    {profileData.location || 'Location not specified'}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                      opacity: 0.9,
                      maxWidth: '600px'
                    }}
                  >
                    {profileData.bio ? (
                      profileData.bio.length > 120 ? 
                        `${profileData.bio.substring(0, 120)}...` : 
                        profileData.bio
                    ) : 'No bio provided'}
                  </Typography>
                </MotionBox>
              </Box>
              
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Stack direction={{ xs: 'row', sm: 'row' }} spacing={1} sx={{ mb: { xs: 2, md: 0 } }}>
                  {!isOwnProfile && (
                    <>
                      <Button 
                        variant="contained" 
                        startIcon={<Message />}
                        sx={{
                          bgcolor: 'white',
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'grey.100',
                          },
                          borderRadius: '24px',
                          px: 2,
                          fontWeight: 'medium',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          textTransform: 'none'
                        }}
                        onClick={handleContact}
                      >
                        Message
                      </Button>
                      <Button 
                        variant="contained" 
                        startIcon={<Favorite sx={{ color: '#f44336', fontSize: 20 }} />}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.3)',
                          },
                          borderRadius: '24px',
                          px: 2,
                          fontWeight: 'medium',
                          border: '1px solid rgba(255,255,255,0.3)',
                          textTransform: 'none'
                        }}
                        onClick={handleFollow}
                      >
                        Follow
                      </Button>
                    </>
                  )}
                  {isOwnProfile && (
                    <>
                      <Button 
                        component={Link} 
                        to="/profile/edit" 
                        variant="contained" 
                        startIcon={<Edit />}
                        sx={{
                          bgcolor: 'white',
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'grey.100',
                          },
                          borderRadius: '24px',
                          px: 2,
                          fontWeight: 'medium',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          textTransform: 'none'
                        }}
                      >
                        Edit Profile
                      </Button>
                      
                      <Button 
                        variant="contained" 
                        startIcon={<Share />}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.3)',
                          },
                          borderRadius: '24px',
                          px: 2,
                          fontWeight: 'medium',
                          border: '1px solid rgba(255,255,255,0.3)',
                          textTransform: 'none'
                        }}
                      >
                        Share
                      </Button>
                    </>
                  )}
                </Stack>
              </MotionBox>
            </Box>
          </Box>
        </MotionBox>

        {/* Profile info and content */}
        <Grid container spacing={4}>
          {/* Left sidebar - Profile info */}
          <Grid item xs={12}>
            <MotionPaper 
              ref={profileCardRef}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
              elevation={3} 
              sx={{ 
                p: 3, 
                mt: { xs: 0, md: -8 }, 
                position: 'relative', 
                zIndex: 1,
                borderRadius: 2,
                backgroundImage: 'linear-gradient(to bottom, #ffffff, #fafafa)',
                border: '1px solid',
                borderColor: theme.palette.grey[200],
                mb: 4,
                transition: 'transform 0.3s ease-out',
                transformStyle: 'preserve-3d',
                '&:hover': {
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                }
              }}
            >
              <Grid container spacing={3}>
                {/* Profile stats and quick info */}
                <Grid item xs={12} lg={4}>
                  <MotionBox
                    variants={CONTAINER_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      width: '100%', 
                      py: 2, 
                      mb: { xs: 3, lg: 0 },
                      borderBottom: { xs: 1, lg: 0 },
                      borderRight: { xs: 0, lg: 1 },
                      borderColor: 'divider',
                      height: '100%',
                      alignItems: 'center',
                      pr: { lg: 3 }
                    }}
                  >
                    <MotionBox 
                      variants={ITEM_VARIANTS}
                      sx={{ 
                        textAlign: 'center',
                        p: 2,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'rgba(76, 175, 80, 0.04)',
                          transform: 'translateY(-4px)'
                        }
                      }}
                    >
                      <Typography 
                        variant="h5" 
                        fontWeight="bold" 
                        color="primary.main"
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {profileData.stats.listingsCount || 0}
                        <Box 
                          component="span" 
                          sx={{ 
                            display: 'inline-flex',
                            ml: 0.5,
                            color: theme.palette.grey[400],
                            fontWeight: 'normal',
                            fontSize: '0.7em'
                          }}
                        >
                          <Agriculture fontSize="inherit" />
                        </Box>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight="medium">
                        Listings
                      </Typography>
                    </MotionBox>
                    
                    <Divider orientation="vertical" flexItem />
                    
                    <MotionBox 
                      variants={ITEM_VARIANTS}
                      sx={{ 
                        textAlign: 'center',
                        p: 2,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'rgba(255, 193, 7, 0.04)',
                          transform: 'translateY(-4px)'
                        }
                      }}
                    >
                      <Typography 
                        variant="h5" 
                        fontWeight="bold" 
                        sx={{ 
                          background: 'linear-gradient(45deg, #FF9800 30%, #FFEB3B 90%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {profileData.stats.rating || 0}
                        <Box 
                          component="span" 
                          sx={{ 
                            display: 'inline-flex',
                            ml: 0.5,
                            WebkitTextFillColor: '#FFB300',
                            fontSize: '0.7em'
                          }}
                        >
                          <StarRate fontSize="inherit" />
                        </Box>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight="medium">
                        Rating
                      </Typography>
                    </MotionBox>
                    
                    <Divider orientation="vertical" flexItem />
                    
                    <MotionBox 
                      variants={ITEM_VARIANTS}
                      sx={{ 
                        textAlign: 'center',
                        p: 2,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'rgba(33, 150, 243, 0.04)',
                          transform: 'translateY(-4px)'
                        }
                      }}
                    >
                      <Typography 
                        variant="h5" 
                        fontWeight="bold" 
                        sx={{ 
                          color: theme.palette.info.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {profileData.stats.reviewsCount || 0}
                        <Box 
                          component="span" 
                          sx={{ 
                            display: 'inline-flex',
                            ml: 0.5,
                            color: theme.palette.grey[400],
                            fontWeight: 'normal',
                            fontSize: '0.7em'
                          }}
                        >
                          <Message fontSize="inherit" />
                        </Box>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight="medium">
                        Reviews
                      </Typography>
                    </MotionBox>
                  </MotionBox>
                </Grid>
                
                {/* About and Contact section */}
                <Grid item xs={12} md={6} lg={4}>
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {profileData.bio && (
                      <MotionBox 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        sx={{ mb: 3, flexGrow: 1 }}
                      >
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          About
                        </Typography>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            bgcolor: theme.palette.grey[50], 
                            borderRadius: 2, 
                            borderLeft: '4px solid',
                            borderColor: 'primary.main',
                            height: 'calc(100% - 40px)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              backgroundImage: 'radial-gradient(circle at top right, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0) 70%)',
                              zIndex: 0,
                            }
                          }}
                        >
                                      <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontStyle: 'italic', 
                lineHeight: 1.6,
                position: 'relative',
                zIndex: 1,
                '&::before': {
                  content: '"""',
                  color: 'rgba(76, 175, 80, 0.2)',
                  fontFamily: 'Georgia, serif',
                  fontSize: '3rem',
                  position: 'absolute',
                  left: -10,
                  top: -20,
                  lineHeight: 1
                }
              }}
            >
              {/* Ensure bio is displayed as plaintext only */}
              {typeof profileData.bio === 'string' ? profileData.bio : ''}
            </Typography>
                        </Paper>
                      </MotionBox>
                    )}
                    
                    <MotionBox 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                      sx={{ mb: { xs: 3, lg: 0 } }}
                    >
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Contact Information
                      </Typography>
                      <Card 
                        elevation={0} 
                        sx={{ 
                          borderRadius: 2, 
                          bgcolor: theme.palette.grey[50],
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            bgcolor: 'white'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                          <Stack spacing={2}>
                            {profileData.email && (
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  transition: 'transform 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateX(5px)'
                                  }
                                }}
                              >
                                <Avatar sx={{ 
                                  bgcolor: theme.palette.primary.light, 
                                  width: 32, 
                                  height: 32, 
                                  mr: 2,
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                }}>
                                  <Email fontSize="small" />
                                </Avatar>
                                <Typography variant="body2">
                                  {profileData.email}
                                </Typography>
                              </Box>
                            )}
                            {profileData.phone && (
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  transition: 'transform 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateX(5px)'
                                  }
                                }}
                              >
                                <Avatar sx={{ 
                                  bgcolor: theme.palette.success.light, 
                                  width: 32, 
                                  height: 32, 
                                  mr: 2,
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                }}>
                                  <Phone fontSize="small" />
                                </Avatar>
                                <Typography variant="body2">
                                  {profileData.phone}
                                </Typography>
                              </Box>
                            )}
                            {!profileData.email && !profileData.phone && (
                              <Typography variant="body2" color="text.secondary">
                                No contact information provided
                              </Typography>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </MotionBox>
                  </Box>
                </Grid>
                
                {/* Farming details and social media */}
                <Grid item xs={12} md={6} lg={4}>
                  <MotionBox 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    sx={{ mb: 3 }}
                  >
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Farming Details
                    </Typography>
                    <Card 
                      elevation={0} 
                      sx={{ 
                        borderRadius: 2, 
                        bgcolor: theme.palette.grey[50], 
                        overflow: 'visible',
                        border: '1px solid',
                        borderColor: 'rgba(0,0,0,0.03)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                          borderColor: 'rgba(0,0,0,0)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                        <Stack spacing={2.5}>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              transition: 'all 0.2s ease',
                              borderRadius: 1,
                              p: 0.5,
                              '&:hover': {
                                bgcolor: 'rgba(76, 175, 80, 0.04)',
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 28, 
                                  height: 28, 
                                  bgcolor: 'rgba(76, 175, 80, 0.1)', 
                                  color: 'primary.main',
                                  mr: 1.5,
                                  fontSize: '0.8rem'
                                }}
                              >
                                <Agriculture fontSize="small" />
                              </Avatar>
                              <Typography variant="body2" color="text.secondary">Farm Size</Typography>
                            </Box>
                            <Chip 
                              label={profileData.farmSize} 
                              size="small" 
                              variant="outlined"
                              sx={{
                                fontWeight: 'medium',
                                borderColor: 'primary.light',
                                '& .MuiChip-label': { px: 1.5 }
                              }} 
                            />
                          </Box>
                          
                          <Divider sx={{ borderStyle: 'dashed', borderColor: 'rgba(0, 0, 0, 0.08)' }} />
                          
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              transition: 'all 0.2s ease',
                              borderRadius: 1,
                              p: 0.5,
                              '&:hover': {
                                bgcolor: 'rgba(76, 175, 80, 0.04)',
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 28, 
                                  height: 28, 
                                  bgcolor: 'rgba(255, 152, 0, 0.1)', 
                                  color: 'warning.main',
                                  mr: 1.5,
                                  fontSize: '0.8rem'
                                }}
                              >
                                <Grass fontSize="small" />
                              </Avatar>
                              <Typography variant="body2" color="text.secondary">Farm Type</Typography>
                            </Box>
                            <Chip 
                              label={profileData.farmType} 
                              size="small" 
                              variant="outlined"
                              sx={{
                                fontWeight: 'medium',
                                borderColor: 'warning.light',
                                color: 'warning.dark',
                                '& .MuiChip-label': { px: 1.5 }
                              }} 
                            />
                          </Box>
                          
                          <Divider sx={{ borderStyle: 'dashed', borderColor: 'rgba(0, 0, 0, 0.08)' }} />
                          
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              transition: 'all 0.2s ease',
                              borderRadius: 1,
                              p: 0.5,
                              '&:hover': {
                                bgcolor: 'rgba(76, 175, 80, 0.04)',
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 28, 
                                  height: 28, 
                                  bgcolor: 'rgba(33, 150, 243, 0.1)', 
                                  color: 'info.main',
                                  mr: 1.5,
                                  fontSize: '0.8rem'
                                }}
                              >
                                <StarRate fontSize="small" />
                              </Avatar>
                              <Typography variant="body2" color="text.secondary">Specialty</Typography>
                            </Box>
                            <Chip 
                              label={profileData.specialty} 
                              size="small" 
                              variant="outlined"
                              sx={{
                                fontWeight: 'medium',
                                borderColor: 'info.light',
                                color: 'info.dark',
                                '& .MuiChip-label': { px: 1.5 }
                              }} 
                            />
                          </Box>

                          {profileData.certifications && profileData.certifications.length > 0 && (
                            <>
                              <Divider sx={{ borderStyle: 'dashed', borderColor: 'rgba(0, 0, 0, 0.08)' }} />
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                  <Avatar 
                                    sx={{ 
                                      width: 28, 
                                      height: 28, 
                                      bgcolor: 'rgba(156, 39, 176, 0.1)', 
                                      color: 'secondary.main',
                                      mr: 1.5,
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    <EmojiEvents fontSize="small" />
                                  </Avatar>
                                  <Typography variant="body2" color="text.secondary">
                                    Certifications
                                  </Typography>
                                </Box>
                                <Stack 
                                  direction="row" 
                                  spacing={1} 
                                  flexWrap="wrap" 
                                  sx={{ mt: 1 }}
                                >
                                  {profileData.certifications.map((cert, index) => (
                                    <MotionBox
                                      key={index}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}
                                    >
                                      <Chip 
                                        key={index} 
                                        label={cert} 
                                        size="small" 
                                        color="secondary" 
                                        icon={<CheckCircle fontSize="small" />}
                                        sx={{ 
                                          mb: 1,
                                          fontWeight: 'medium',
                                          borderRadius: '8px',
                                          transition: 'all 0.2s ease',
                                          '&:hover': {
                                            transform: 'translateY(-3px)',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                                          }
                                        }}
                                      />
                                    </MotionBox>
                                  ))}
                                </Stack>
                              </Box>
                            </>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </MotionBox>
                  
                  {(profileData.social?.facebook || profileData.social?.twitter || 
                    profileData.social?.instagram || profileData.social?.linkedin) && (
                    <MotionBox
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1, duration: 0.5 }}
                    >
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Social Media
                      </Typography>
                      <Card 
                        elevation={0} 
                        sx={{ 
                          borderRadius: 2, 
                          bgcolor: theme.palette.grey[50],
                          border: '1px solid',
                          borderColor: 'rgba(0,0,0,0.03)',
                        }}
                      >
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                          <Stack direction="row" spacing={2} justifyContent="center">
                            {profileData.social?.facebook && (
                              <IconButton 
                                href={profileData.social.facebook} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                sx={{ 
                                  bgcolor: '#1877F2', 
                                  color: 'white', 
                                  '&:hover': { 
                                    bgcolor: '#0a66c2',
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 6px 15px rgba(24, 119, 242, 0.4)'
                                  },
                                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                              >
                                <Facebook />
                              </IconButton>
                            )}
                            {profileData.social?.twitter && (
                              <IconButton 
                                href={profileData.social.twitter} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                sx={{ 
                                  bgcolor: '#1DA1F2', 
                                  color: 'white', 
                                  '&:hover': { 
                                    bgcolor: '#0d8ecf',
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 6px 15px rgba(29, 161, 242, 0.4)'
                                  },
                                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                              >
                                <Twitter />
                              </IconButton>
                            )}
                            {profileData.social?.instagram && (
                              <IconButton 
                                href={profileData.social.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                sx={{ 
                                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', 
                                  color: 'white', 
                                  '&:hover': { 
                                    background: 'linear-gradient(45deg, #d8852e 0%, #cf5d36 25%, #c5243c 50%, #b5205b 75%, #a6167a 100%)',
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 6px 15px rgba(225, 48, 108, 0.4)'
                                  },
                                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                              >
                                <Instagram />
                              </IconButton>
                            )}
                            {profileData.social?.linkedin && (
                              <IconButton 
                                href={profileData.social.linkedin} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                sx={{ 
                                  bgcolor: '#0A66C2', 
                                  color: 'white', 
                                  '&:hover': { 
                                    bgcolor: '#084d94',
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 6px 15px rgba(10, 102, 194, 0.4)'
                                  },
                                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                              >
                                <LinkedIn />
                              </IconButton>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </MotionBox>
                  )}
                </Grid>
              </Grid>
            </MotionPaper>
          </Grid>
          
          {/* Right content area with tabs and listings */}
          <Grid item xs={12}>
            {/* Tabs */}
            <MotionPaper 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              elevation={2} 
              sx={{ 
                borderRadius: 2, 
                mb: 3, 
                overflow: 'hidden',
                border: '1px solid',
                borderColor: theme.palette.grey[200],
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                }
              }}
            >
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    py: 2,
                    fontWeight: 'medium',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(76, 175, 80, 0.04)',
                    }
                  }
                }}
              >
                <Tab 
                  value="listings" 
                  label="Listings" 
                  icon={<ShoppingCart sx={{ fontSize: '1.2rem' }} />}
                  iconPosition="start"
                />
                <Tab 
                  value="reviews" 
                  label="Reviews" 
                  icon={<Message sx={{ fontSize: '1.2rem' }} />}
                  iconPosition="start"
                />
                {isOwnProfile && (
                  <Tab 
                    value="saved" 
                    label="Saved" 
                    icon={<Bookmark sx={{ fontSize: '1.2rem' }} />}
                    iconPosition="start"
                  />
                )}
              </Tabs>
            </MotionPaper>
            
            {/* Listings tab content */}
            {activeTab === 'listings' && (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -8,
                        left: 0,
                        width: 40,
                        height: 3,
                        background: 'linear-gradient(90deg, #4caf50, transparent)',
                        borderRadius: 1
                      }
                    }}
                  >
                    {isOwnProfile ? 'Your Listings' : `${profileData.name}'s Listings`}
                  </Typography>
                  
                  {isOwnProfile && (
                    <MotionBox
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        component={Link} 
                        to="/marketplace/create" 
                        variant="contained" 
                        color="primary"
                        startIcon={<Add />}
                        sx={{
                          borderRadius: '28px',
                          px: 3,
                          py: 1.2,
                          textTransform: 'none',
                          boxShadow: '0 4px 14px rgba(76, 175, 80, 0.25)',
                          background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                          fontWeight: 'bold',
                          '&:hover': {
                            boxShadow: '0 6px 20px rgba(76, 175, 80, 0.35)',
                          }
                        }}
                      >
                        New Listing
                      </Button>
                    </MotionBox>
                  )}
                </Box>
                
                {isOwnProfile && (
                  <MotionPaper 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    elevation={1} 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      bgcolor: theme.palette.background.paper,
                      border: '1px solid',
                      borderColor: theme.palette.grey[200]
                    }}
                  >
                    <Tabs 
                      value={listingFilter}
                      onChange={(e, newValue) => setListingFilter(newValue)}
                      indicatorColor="primary"
                      textColor="primary"
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={{
                        px: 2,
                        '& .MuiTab-root': {
                          textTransform: 'none',
                          minWidth: 0,
                          px: 3,
                          fontWeight: 'medium',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: 'rgba(76, 175, 80, 0.04)',
                          }
                        }
                      }}
                    >
                      <Tab value="all" label="All" />
                      <Tab 
                        value="active" 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                bgcolor: 'success.main', 
                                borderRadius: '50%' 
                              }} 
                            />
                            Active
                          </Box>
                        }
                      />
                      <Tab 
                        value="sold" 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                bgcolor: 'primary.main', 
                                borderRadius: '50%' 
                              }} 
                            />
                            Sold
                          </Box>
                        }
                      />
                      <Tab 
                        value="inactive" 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                bgcolor: 'grey.400', 
                                borderRadius: '50%' 
                              }} 
                            />
                            Inactive
                          </Box>
                        }
                      />
                    </Tabs>
                  </MotionPaper>
                )}
                
                {listingsLoading ? (
                  <Grid container spacing={3}>
                    {Array(4).fill(0).map((_, index) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Card 
                          elevation={2} 
                          sx={{ 
                            height: '100%', 
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                          }}
                        >
                          <Skeleton variant="rectangular" height={160} />
                          <CardContent sx={{ p: 2 }}>
                            <Skeleton variant="text" height={32} width="80%" />
                            <Skeleton variant="text" height={20} width="60%" sx={{ mb: 2 }} />
                            <Skeleton variant="text" height={24} width="40%" />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : getFilteredListings().length > 0 ? (
                  <MotionBox
                    variants={CONTAINER_VARIANTS}
                    initial="hidden"
                    animate="visible"
                  >
                    <Grid container spacing={3}>
                      {getFilteredListings().map((listing) => (
                        <MotionGrid
                          key={listing.id}
                          item xs={12} sm={6} md={4} lg={3}
                          variants={ITEM_VARIANTS}
                          whileHover={{ 
                            scale: 1.02,
                            transition: { duration: 0.2 }
                          }}
                        >
                          <Card 
                            elevation={scrolledDown ? 2 : 1} 
                            sx={{ 
                              height: '100%', 
                              display: 'flex', 
                              flexDirection: 'column',
                              borderRadius: 3,
                              transition: 'all 0.3s ease',
                              position: 'relative',
                              overflow: 'visible',
                              bgcolor: 'background.paper',
                              border: '1px solid',
                              borderColor: 'grey.100',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                inset: 0,
                                borderRadius: 3,
                                padding: '1px',
                                background: `linear-gradient(145deg, ${theme.palette.primary.light}20, transparent)`,
                                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                maskComposite: 'exclude',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                              },
                              '&:hover': {
                                boxShadow: `0 15px 40px ${theme.palette.mode === 'dark' 
                                  ? 'rgba(0,0,0,0.3)' 
                                  : 'rgba(0,0,0,0.12)'}`,
                                '&::after': {
                                  opacity: 1,
                                }
                              }
                            }}
                          >
                            <Box 
                              sx={{ 
                                position: 'relative',
                                overflow: 'hidden',
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12,
                              }}
                            >
                              <CardMedia
                                component="img"
                                height="160"
                                image={listing.image}
                                alt={listing.title}
                                sx={{ 
                                  transition: 'all 0.5s ease',
                                  '&:hover': {
                                    transform: 'scale(1.05)'
                                  }
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
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                  backdropFilter: 'blur(4px)',
                                  bgcolor: 'rgba(76, 175, 80, 0.85)',
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
                                    fontWeight: 'bold',
                                    backdropFilter: 'blur(4px)',
                                  }}
                                />
                              )}
                            </Box>
                            <CardContent 
                              sx={{ 
                                flexGrow: 1, 
                                p: { xs: 2, md: 3 },
                                pb: '16px !important', // Override MUI default
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              <Typography 
                                variant="h6" 
                                component={Link} 
                                to={`/marketplace/listing/${listing.id}`} 
                                sx={{ 
                                  textDecoration: 'none', 
                                  color: 'text.primary',
                                  display: '-webkit-box',
                                  mb: 1,
                                  fontWeight: 'bold',
                                  fontSize: { xs: '0.95rem', md: '1.1rem' },
                                  transition: 'color 0.2s ease',
                                  '&:hover': {
                                    color: 'primary.main',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '3px',
                                    textDecorationThickness: '1px',
                                    textDecorationColor: 'primary.light',
                                  },
                                  height: '2.5em',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical'
                                }}
                              >
                                {listing.title}
                              </Typography>
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  mb: 2,
                                  pb: 2,
                                  borderBottom: '1px solid',
                                  borderColor: 'grey.100'
                                }}
                              >
                                <LocationOn fontSize="small" color="action" sx={{ mr: 0.5, opacity: 0.7, fontSize: '1rem' }} />
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: 'calc(100% - 20px)'
                                  }}
                                >
                                  {listing.location}
                                </Typography>
                              </Box>
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center', 
                                  mb: 1.5,
                                  mt: 'auto', // Push to bottom
                                }}
                              >
                                <Typography 
                                  variant="h6" 
                                  fontWeight="bold"
                                  sx={{
                                    fontSize: '1.1rem',
                                    background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                  }}
                                >
                                  {listing.price}
                                </Typography>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    bgcolor: 'grey.50',
                                    py: 0.5,
                                    px: 1,
                                    borderRadius: 5,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      bgcolor: listing.status === 'active' ? 'success.main' : 
                                              listing.status === 'sold' ? 'primary.main' : 'grey.400'
                                    }}
                                  />
                                  <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{
                                      fontSize: '0.7rem',
                                      fontWeight: 'medium'
                                    }}
                                  >
                                    {new Date(listing.createdAt).toLocaleDateString()}
                                  </Typography>
                                </Box>
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
                                      borderRadius: 2,
                                      py: 0.75,
                                      transition: 'all 0.2s ease',
                                      fontWeight: 'medium',
                                      '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                                      }
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  {listing.status === 'active' ? (
                                    <Button 
                                      variant="outlined"
                                      size="small"
                                      color="primary"
                                      disabled={statusChanging[listing.id]}
                                      onClick={() => handleStatusChange(listing.id, 'sold')}
                                      fullWidth
                                      sx={{ 
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        py: 0.75,
                                        transition: 'all 0.2s ease',
                                        fontWeight: 'medium',
                                        '&:hover': {
                                          transform: 'translateY(-2px)',
                                          boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                                        }
                                      }}
                                    >
                                      {statusChanging[listing.id] ? (
                                        <CircularProgress size={16} color="inherit" />
                                      ) : (
                                        'Mark Sold'
                                      )}
                                    </Button>
                                  ) : listing.status === 'inactive' ? (
                                    <Button 
                                      variant="contained"
                                      size="small"
                                      color="success"
                                      disabled={statusChanging[listing.id]}
                                      onClick={() => handleStatusChange(listing.id, 'active')}
                                      fullWidth
                                      sx={{ 
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        py: 0.75,
                                        transition: 'all 0.2s ease',
                                        fontWeight: 'medium',
                                        '&:hover': {
                                          transform: 'translateY(-2px)',
                                          boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                                        }
                                      }}
                                    >
                                      {statusChanging[listing.id] ? (
                                        <CircularProgress size={16} color="inherit" />
                                      ) : (
                                        'Activate'
                                      )}
                                    </Button>
                                  ) : listing.status === 'sold' ? (
                                    <Button 
                                      variant="outlined"
                                      size="small" 
                                      color="warning"
                                      disabled={statusChanging[listing.id]}
                                      onClick={() => handleStatusChange(listing.id, 'inactive')}
                                      fullWidth
                                      sx={{ 
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        py: 0.75,
                                        transition: 'all 0.2s ease',
                                        fontWeight: 'medium',
                                        '&:hover': {
                                          transform: 'translateY(-2px)',
                                          boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                                        }
                                      }}
                                    >
                                      {statusChanging[listing.id] ? (
                                        <CircularProgress size={16} color="inherit" />
                                      ) : (
                                        'Archive'
                                      )}
                                    </Button>
                                  ) : null}
                                </Stack>
                              )}
                            </CardContent>
                          </Card>
                        </MotionGrid>
                      ))}
                    </Grid>
                  </MotionBox>
                ) : (
                  <MotionPaper 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    elevation={1} 
                    sx={{ 
                      p: 4, 
                      textAlign: 'center',
                      borderRadius: 3,
                      bgcolor: theme.palette.grey[50],
                      border: '1px dashed',
                      borderColor: theme.palette.grey[300],
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(to right, #4caf50, transparent)',
                      }
                    }}
                  >
                    <Typography variant="body1" color="text.secondary" paragraph>
                      No listings found
                    </Typography>
                    {isOwnProfile && (
                      <MotionBox
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          component={Link} 
                          to="/marketplace/create" 
                          variant="contained" 
                          color="primary"
                          startIcon={<Add />}
                          sx={{
                            borderRadius: '28px',
                            px: 3,
                            py: 1.2,
                            textTransform: 'none',
                            fontWeight: 'medium',
                            background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                            boxShadow: '0 4px 14px rgba(76, 175, 80, 0.25)',
                            '&:hover': {
                              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.35)',
                            }
                          }}
                        >
                          Create Your First Listing
                        </Button>
                      </MotionBox>
                    )}
                  </MotionPaper>
                )}
              </MotionBox>
            )}
            
            {/* Reviews tab content */}
            {activeTab === 'reviews' && (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -8,
                        left: 0,
                        width: 40,
                        height: 3,
                        background: 'linear-gradient(90deg, #2196f3, transparent)',
                        borderRadius: 1
                      }
                    }}
                  >
                    Reviews ({profileData.stats.reviewsCount || 0})
                  </Typography>
                </Box>
                
                <MotionPaper 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  elevation={2} 
                  sx={{ 
                    p: { xs: 3, md: 5 }, 
                    textAlign: 'center',
                    borderRadius: 3,
                    bgcolor: theme.palette.grey[50],
                    border: '1px dashed',
                    borderColor: theme.palette.grey[300],
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Decorative elements */}
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: 4,
                      background: 'linear-gradient(to right, #2196f3, transparent)'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0) 70%)'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 20,
                      left: 20,
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0) 70%)'
                    }}
                  />
                  
                  {/* Content */}
                  <Box 
                    sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 3,
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    <Box
                      component="img"
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMSAxNy41QzExIDE3Ljc3NjEgMTEuMjIzOSAxOCAxMS41IDE4SDEyLjVDMTIuNzc2MSAxOCAxMyAxNy43NzYxIDEzIDE3LjVWMTdIMTFWMTcuNVpNOS41IDRDOS41IDMuNzIzODYgOS43MjM4NiAzLjUgMTAgMy41SDEwLjc1QzEwLjc1IDMuNSAxMCAzIDE0IDNDMTggMyAxNy4yNSAzLjUgMTcuMjUgMy41SDE4QzE4LjI3NjEgMy41IDE4LjUgMy43MjM4NiAxOC41IDRDMTguNSA0LjI3NjE0IDE4LjI3NjEgNC41IDE4IDQuNUgxOEMxNi41IDcuNSAxNCA3LjUgMTQgNy41VjEwLjc1QzE1Ljc1NCAxMS4zMjA0IDE3IDEyLjk2NDIgMTcgMTVDMTcgMTUuNDc1NCAxNi45MzUyIDE1LjkzNDQgMTYuODEyOCAxNi4zNzIxQzE3LjAwNDkgMTYuNjA0NSAxNy4yNzgyIDE2Ljc1IDE3LjUgMTYuNzVDMTcuOTExMiAxNi43NSAxOC4yNSAxNi40MTEyIDE4LjI1IDE2QzE4LjI1IDE1LjY4MjQgMTguMDY4OCAxNS40MDU5IDE3Ljc5ODEgMTUuMjY0MUMxNy45Mjc0IDE0Ljg4MzQgMTggMTQuNDYxNSAxOCAxNC4wNEMxOCAxMy4wNTQzIDE3LjYzMDUgMTIuMDI5IDE2Ljg0MTIgMTEuMjM5OEMxNi4wNTE5IDEwLjQ1MDUgMTUuMDI2NiAxMC4wOCAxNC4wNCAxMC4wOEgxNEgxMy45MlYxMC4wOFY3LjVDMTMuOTIgNy41IDExLjUgNy41IDEwIDQuNUgxMEM5LjcyMzg2IDQuNSA5LjUgNC4yNzYxNCA5LjUgNEM5LjUgMy43MjM4NiA5LjcyMzg2IDMuNSAxMCAzLjVIOVpNMTEgMTJIMTNDMTUgMTIgMTUgMTUgMTUgMTVIMTUuMDI1QzE1LjAxNSAxNS44MjkxIDE0Ljc4MzkgMTYuMTQzMyAxNC41IDE2LjVDMTMuNzUgMTcuNSAxMi41IDE3LjUgMTIuNSAxNy41SDExLjVDMTEuNSAxNy41IDEwLjI1IDE3LjUgOS41IDE2LjVDOS4yMTYxNSAxNi4xNDMzIDguOTg1MDUgMTUuODI5MSA4Ljk3NTAzIDE1SDlDOSAxNSA5IDE1IDkgMTRDOSAxMyAxMCAxMiAxMSAxMloiIGZpbGw9InJnYmEoMzMsIDE1MCwgMjQzLCAwLjYpIi8+PC9zdmc+"
                      alt="Reviews coming soon"
                      sx={{
                        width: 80,
                        height: 80,
                        opacity: 0.8,
                        mb: 2
                      }}
                    />
                    
                    <Typography 
                      variant="h5" 
                      color="primary" 
                      fontWeight="bold"
                      sx={{ mb: 1 }}
                    >
                      Reviews Coming Soon
                    </Typography>
                    
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}
                    >
                      We're working on a comprehensive review system for farmers to share their experiences.
                      This feature will help build trust and reputation within our community.
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        mt: 2 
                      }}
                    >
                      {isOwnProfile ? (
                        <MotionBox
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outlined"
                            color="primary"
                            sx={{
                              borderRadius: 8,
                              px: 3,
                              py: 1,
                              fontWeight: 'medium',
                              borderWidth: 2,
                              '&:hover': {
                                borderWidth: 2,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                              }
                            }}
                          >
                            Get Notified When Available
                          </Button>
                        </MotionBox>
                      ) : (
                        <MotionBox
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            sx={{
                              borderRadius: 8,
                              px: 3,
                              py: 1,
                              fontWeight: 'medium',
                              boxShadow: '0 4px 14px rgba(33, 150, 243, 0.3)',
                              background: 'linear-gradient(45deg, #2196f3, #03a9f4)',
                              '&:hover': {
                                boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
                              }
                            }}
                          >
                            Return to Listings
                          </Button>
                        </MotionBox>
                      )}
                    </Box>
                  </Box>
                </MotionPaper>
              </MotionBox>
            )}
            
            {/* Saved tab content (only for own profile) */}
            {isOwnProfile && activeTab === 'saved' && (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -8,
                        left: 0,
                        width: 40,
                        height: 3,
                        background: 'linear-gradient(90deg, #9c27b0, transparent)',
                        borderRadius: 1
                      }
                    }}
                  >
                    Saved Listings
                  </Typography>
                </Box>
                
                <MotionPaper 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  elevation={2} 
                  sx={{ 
                    p: { xs: 3, md: 5 }, 
                    textAlign: 'center',
                    borderRadius: 3,
                    bgcolor: theme.palette.grey[50],
                    border: '1px dashed',
                    borderColor: theme.palette.grey[300],
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Decorative elements */}
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: 4,
                      background: 'linear-gradient(to right, #9c27b0, transparent)'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0) 70%)'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 20,
                      left: 20,
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(156, 39, 176, 0.05) 0%, rgba(156, 39, 176, 0) 70%)'
                    }}
                  />
                  
                  {/* Content */}
                  <Box 
                    sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 3,
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    <Box
                      component="img"
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNyAzSDcuMDAwMDFDNS45MDAwMSAzIDUuMDEwMDEgMy45IDUuMDEwMDEgNVYyMUwxMiAxOEwxOSAyMVY1QzE5IDQuNCAxOC42IDMuOSAxOC4xIDMuNUMxNy44IDMuMiAxNy40IDMgMTcgM1oiIGZpbGw9InJnYmEoMTU2LCAzOSwgMTc2LCAwLjYpIi8+PC9zdmc+"
                      alt="Saved listings coming soon"
                      sx={{
                        width: 80,
                        height: 80,
                        opacity: 0.8,
                        mb: 2
                      }}
                    />
                    
                    <Typography 
                      variant="h5" 
                      color="secondary" 
                      fontWeight="bold"
                      sx={{ mb: 1 }}
                    >
                      Saved Listings Coming Soon
                    </Typography>
                    
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}
                    >
                      Soon you'll be able to save and organize your favorite listings here.
                      This will help you keep track of interesting opportunities and make comparisons easily.
                    </Typography>
                    
                    <MotionBox
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outlined"
                        color="secondary"
                        sx={{
                          borderRadius: 8,
                          px: 3,
                          py: 1,
                          fontWeight: 'medium',
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          }
                        }}
                      >
                        Browse Marketplace
                      </Button>
                    </MotionBox>
                  </Box>
                </MotionPaper>
              </MotionBox>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Profile;