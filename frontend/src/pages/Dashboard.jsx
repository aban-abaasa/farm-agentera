import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Tooltip,
  Stack,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Apartment as ApartmentIcon,
  ShowChart as ShowChartIcon,
  ShoppingCart as ShoppingCartIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Message as MessageIcon,
  Info as InfoIcon,
  WbSunny as SunnyIcon,
  Opacity as OpacityIcon,
  Air as WindIcon,
  ThumbUp as ThumbUpIcon,
  TrendingUp as TrendingUpIcon,
  WavingHand as WavingHandIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getUserListings, getListings } from '../services/api/marketplaceService';
import { getUserProfile } from '../services/api/authService';
import { getConversations, getUnreadMessageCount } from '../services/api/messageService';
import { mockCommunityActivity } from '../mocks/dashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [recommendedListings, setRecommendedListings] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [stats, setStats] = useState({
    activeListings: 0,
    purchases: 5, // Mock data for now
    connections: 10, // Mock data for now
    newMessages: 0 
  });
  
  const [weatherData] = useState({
    location: 'Kampala, Uganda',
    temperature: '24°C',
    condition: 'Partly Cloudy',
    forecast: 'Light rain expected tomorrow',
    humidity: '78%',
    wind: '8 km/h',
    rainfall: '20%'
  });
  
  // Fetch user's listings and stats
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setMessagesLoading(true);
      try {
        // Get user profile
        const { data: profile, error: profileError } = await getUserProfile(user.id);
        if (profileError) throw profileError;
        setUserProfile(profile);
        
        // Get user's active listings
        const { data: userListings, error: listingsError } = await getUserListings(user.id, {
          limit: 5,
          status: 'active'
        });
        
        if (listingsError) throw listingsError;
        setListings(userListings || []);
        
        // Get recommended listings (for now just fetch recent listings not by this user)
        const { data: recommendations, error: recsError } = await getListings({
          limit: 3
        });
        
        if (recsError) throw recsError;
        
        // Filter out any listings that belong to the current user
        const filteredRecs = recommendations?.filter(listing => listing.user_id !== user.id) || [];
        setRecommendedListings(filteredRecs);
        
        // Fetch conversations/messages
        const { data: conversationsData, error: conversationsError } = await getConversations({ limit: 5 });
        if (conversationsError) throw conversationsError;
        
        // Get unread message count
        const { count: unreadCount, error: unreadError } = await getUnreadMessageCount();
        if (unreadError) throw unreadError;
        
        // Transform conversations data to match the messages format for the UI
        const formattedMessages = (conversationsData || []).map(conv => {
          // Find the other participant in direct conversations
          let sender = 'Unknown';
          let avatar = null;
          
          if (conv.conversation_participants) {
            const otherParticipant = conv.conversation_participants.find(
              p => p.user_id !== user.id && p.profiles
            );
            
            if (otherParticipant?.profiles) {
              const profile = otherParticipant.profiles;
              sender = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
              avatar = profile.avatar_url;
            } else if (conv.is_group && conv.title) {
              sender = conv.title;
            }
          }
          
          return {
            id: conv.conversation_id,
            sender: sender,
            avatar: avatar,
            message: conv.last_message || 'Started a conversation',
            date: new Date(conv.last_message_at || conv.created_at).toLocaleDateString(),
            unread: conv.unread_count > 0
          };
        });
        
        setMessages(formattedMessages);
        
        // Update stats based on real data
        setStats({
          activeListings: userListings?.length || 0,
          purchases: 5, // Mock data for now
          connections: 10, // Mock data for now
          newMessages: unreadCount || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
        setMessagesLoading(false);
      }
    };
    
    fetchUserData();
  }, [user?.id]);
  
  // Stats array for display
  const statsArray = [
    { 
      icon: <ApartmentIcon sx={{ fontSize: 40 }} color="primary" />, 
      value: stats.activeListings.toString(), 
      label: 'Active Listings',
      color: theme.palette.primary.light,
      bgColor: alpha(theme.palette.primary.light, 0.12)
    },
    { 
      icon: <ShoppingCartIcon sx={{ fontSize: 40 }} color="secondary" />, 
      value: stats.purchases.toString(), 
      label: 'Purchases',
      color: theme.palette.secondary.light,
      bgColor: alpha(theme.palette.secondary.light, 0.12)
    },
    { 
      icon: <ShowChartIcon sx={{ fontSize: 40 }} style={{ color: '#4caf50' }} />, 
      value: stats.connections.toString(), 
      label: 'Connections',
      color: '#4caf50',
      bgColor: alpha('#4caf50', 0.12)
    },
    { 
      icon: <MessageIcon sx={{ fontSize: 40 }} style={{ color: '#ff9800' }} />, 
      value: stats.newMessages.toString(), 
      label: 'New Messages',
      color: '#ff9800',
      bgColor: alpha('#ff9800', 0.12)
    }
  ];

  return (
    <Box sx={{ 
      pb: 5,
      background: 'linear-gradient(to bottom, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0) 200px)'
    }}>
      <Container maxWidth="xl">
        {/* Welcome Section */}
        <Box 
          sx={{ 
            py: 4, 
            mb: 2,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative element */}
          <Box 
            sx={{ 
              position: 'absolute',
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0) 70%)',
              zIndex: 0
            }} 
          />
          
          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
              <Typography 
                variant="h3" 
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <WavingHandIcon sx={{ color: '#FFD700', fontSize: { xs: '1.8rem', md: '2.2rem' } }} />
                Welcome back, {userProfile ? 
                  userProfile.first_name ? 
                    (userProfile.last_name ? `${userProfile.first_name} ${userProfile.last_name}` : userProfile.first_name) 
                    : 'Farmer'
                  : 'Farmer'}
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ 
                  fontWeight: 'normal',
                  maxWidth: 600,
                  mb: 2
                }}
              >
                Here's what's happening with your farming activities today
              </Typography>
              
              {/* Quick action buttons */}
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                sx={{ 
                  mt: 3, 
                  display: { xs: 'none', md: 'flex' },
                  '& .MuiButton-root': {
                    borderRadius: 2,
                    py: 1
                  }
                }}
              >
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<AddIcon />}
                  component={RouterLink}
                  to="/marketplace/create"
                >
                  New Listing
                </Button>
                <Button 
                  variant="outlined"
                  startIcon={<MessageIcon />}
                  component={RouterLink}
                  to="/messages"
                >
                  Messages
                </Button>
                <Button 
                  variant="outlined"
                  startIcon={<ShoppingCartIcon />}
                  component={RouterLink}
                  to="/marketplace"
                >
                  Marketplace
                </Button>
              </Stack>
            </Box>
            
            {/* Date & Weather Quick view */}
            <Box sx={{ 
              mt: { xs: 3, sm: 0 },
              ml: { sm: 4 },
              py: 2,
              px: 3,
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              minWidth: { sm: 220 }
            }}>
              <Typography variant="subtitle2" color="text.secondary">
                Today's Weather
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <SunnyIcon sx={{ color: '#FFB74D', mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  {weatherData.temperature}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {weatherData.condition}, {weatherData.location}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle2" color="text.secondary">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsArray.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 3,
                  p: 3,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                {/* Background decorative shape */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -24,
                    right: -24,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    backgroundColor: stat.bgColor,
                    zIndex: 0
                  }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 1 }}>
                  <Box>
                    <Typography variant="h3" component="div" fontWeight="bold" sx={{ mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight="medium">
                      {stat.label}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: stat.bgColor,
                      color: stat.color,
                      width: 56,
                      height: 56,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Box>
                
                {/* Trend indicator */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 'auto', 
                    pt: 2,
                    zIndex: 1
                  }}
                >
                  <Chip
                    icon={<TrendingUpIcon fontSize="small" />}
                    label={`${[10, 5, 8, 15][index]}% this week`}
                    size="small"
                    sx={{ 
                      bgcolor: alpha(stat.color, 0.1),
                      color: stat.color,
                      fontWeight: 'medium',
                      '& .MuiChip-icon': {
                        color: stat.color
                      }
                    }}
                  />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            {/* My Listings */}
            <Paper 
              sx={{ 
                p: 0, 
                mb: 4, 
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  bgcolor: 'background.default',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  px: 3,
                  py: 2
                }}
              >
                <Typography variant="h6" fontWeight="bold">My Listings</Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  component={RouterLink}
                  to="/marketplace/create"
                  sx={{ 
                    borderRadius: 2,
                    boxShadow: 2
                  }}
                >
                  Create New
                </Button>
              </Box>
              
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : listings.length > 0 ? (
                <Box>
                  {listings.map((listing, index) => (
                    <Box 
                      key={listing.id}
                      sx={{ 
                        p: 2, 
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.02)'
                        },
                        borderBottom: index < listings.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                      }}
                    >
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={12} sm={7}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{ 
                                bgcolor: listing.type === 'land' ? 'primary.light' : 'secondary.light',
                                color: 'white',
                                mr: 2
                              }}
                            >
                              {listing.type === 'land' ? <ApartmentIcon /> : <ShoppingCartIcon />}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {listing.title}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                  {typeof listing.price === 'number' ? `${listing.price.toLocaleString()} UGX` : listing.price}
                                </Typography>
                                <Chip 
                                  label={listing.status.charAt(0).toUpperCase() + listing.status.slice(1)} 
                                  size="small"
                                  sx={{ 
                                    borderRadius: 1,
                                    height: 22,
                                    bgcolor: listing.status === 'active' ? 'success.light' : 'warning.light',
                                    color: listing.status === 'active' ? 'success.dark' : 'warning.dark',
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6} sm={3}>
                          <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', sm: 'center' }}>
                            <Tooltip title="Views">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {listing.views || 0}
                                </Typography>
                              </Box>
                            </Tooltip>
                            <Tooltip title="Inquiries">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <MessageIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                  0
                                </Typography>
                              </Box>
                            </Tooltip>
                          </Stack>
                        </Grid>
                        
                        <Grid item xs={6} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            component={RouterLink}
                            to={`/marketplace/listing/${listing.id}`}
                            endIcon={<ArrowForwardIcon />}
                            sx={{ 
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 'medium'
                            }}
                          >
                            View
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.light',
                      width: 60,
                      height: 60,
                      margin: '0 auto 16px'
                    }}
                  >
                    <AddIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    No Listings Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                    Start showcasing your agricultural offerings to farmers across Uganda.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    component={RouterLink}
                    to="/marketplace/create"
                    sx={{ borderRadius: 2 }}
                  >
                    Create Your First Listing
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Weather Card */}
            <Paper 
              sx={{ 
                mb: 4,
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}
            >
              <Box 
                sx={{ 
                  bgcolor: 'primary.main',
                  color: 'white',
                  px: 3,
                  py: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="h6" fontWeight="bold">Weather Forecast</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  component={RouterLink}
                  to="/weather"
                  sx={{ 
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  View Details
                </Button>
              </Box>
              
              <Grid container sx={{ p: 3 }}>
                <Grid item xs={12} sm={7}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box 
                      sx={{ 
                        mr: 3,
                        bgcolor: 'primary.light',
                        color: 'white',
                        width: 70,
                        height: 70,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <SunnyIcon sx={{ fontSize: 40 }} />
                    </Box>
                    <Box>
                      <Typography variant="h3" fontWeight="bold">{weatherData.temperature}</Typography>
                      <Typography variant="subtitle1">{weatherData.location}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {weatherData.condition}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    {weatherData.forecast}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={5}>
                  <Box 
                    sx={{ 
                      bgcolor: 'background.default',
                      borderRadius: 2,
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-around'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <OpacityIcon sx={{ color: 'primary.main', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        Precipitation:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {weatherData.rainfall}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <OpacityIcon sx={{ color: 'primary.main', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        Humidity:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {weatherData.humidity}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WindIcon sx={{ color: 'primary.main', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        Wind:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {weatherData.wind}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Recent Community Activity */}
            <Paper 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}
            >
              <Box 
                sx={{ 
                  bgcolor: 'background.default',
                  px: 3,
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="h6" fontWeight="bold">Community Activity</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  component={RouterLink}
                  to="/community"
                  sx={{ borderRadius: 2 }}
                >
                  View All
                </Button>
              </Box>
              
              <List sx={{ width: '100%', p: 0 }}>
                {mockCommunityActivity.map((activity, index) => (
                  <ListItem 
                    key={activity.id}
                    alignItems="flex-start" 
                    sx={{ 
                      px: 3, 
                      py: 2.5,
                      borderBottom: index < mockCommunityActivity.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.02)'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: ['#4caf50', '#ff9800', '#2196f3'][index % 3] }}>
                        {activity.avatar || activity.user.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ mb: 1 }}>
                          <Typography component="span" fontWeight="bold">
                            {activity.user}
                          </Typography>
                          {` ${activity.action} `}
                          <Typography 
                            component="span" 
                            color="primary" 
                            sx={{ 
                              fontWeight: 'medium',
                              cursor: 'pointer', 
                              '&:hover': { 
                                textDecoration: 'underline' 
                              } 
                            }}
                          >
                            {activity.target}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.primary" sx={{ mb: 1.5 }}>
                            {activity.content}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              sx={{ mr: 2 }}
                            >
                              {activity.date}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                              <ThumbUpIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
                              <Typography variant="caption" color="text.secondary">
                                {activity.likes}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <MessageIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
                              <Typography variant="caption" color="text.secondary">
                                {activity.replies}
                              </Typography>
                            </Box>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Messages */}
            <Paper 
              sx={{ 
                mb: 4, 
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}
            >
              <Box 
                sx={{ 
                  bgcolor: 'background.default',
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  px: 3,
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">
                    Messages
                  </Typography>
                  {messages.filter(m => m.unread).length > 0 && (
                    <Badge
                      badgeContent={messages.filter(m => m.unread).length}
                      color="error"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              </Box>
              
              <List sx={{ width: '100%', p: 0 }}>
                {messagesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : messages.length > 0 ? (
                  messages.map((message, index) => (
                    <ListItem
                      key={message.id}
                      alignItems="flex-start"
                      sx={{
                        px: 3,
                        py: 2,
                        borderBottom: index < messages.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        bgcolor: message.unread ? alpha(theme.palette.primary.light, 0.08) : 'transparent',
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          bgcolor: message.unread ? alpha(theme.palette.primary.light, 0.12) : 'rgba(0,0,0,0.02)'
                        }
                      }}
                      button
                      component={RouterLink}
                      to="/messages"
                    >
                      <ListItemAvatar>
                        <Badge
                          variant="dot"
                          color="error"
                          invisible={!message.unread}
                          anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                          }}
                          sx={{
                            '& .MuiBadge-badge': {
                              top: 8,
                              right: 8,
                            },
                          }}
                        >
                          <Avatar sx={{ bgcolor: message.unread ? 'primary.main' : 'grey.400' }}>
                            {message.avatar || message.sender.charAt(0)}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography fontWeight={message.unread ? 'bold' : 'medium'}>
                              {message.sender}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {message.date}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            color={message.unread ? 'text.primary' : 'text.secondary'}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: 1.4,
                              fontWeight: message.unread ? 'medium' : 'normal'
                            }}
                          >
                            {message.message}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.light', mx: 'auto', mb: 2 }}>
                      <MessageIcon />
                    </Avatar>
                    <Typography variant="body1" gutterBottom>
                      No messages yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Start a conversation with other farmers
                    </Typography>
                  </Box>
                )}
              </List>
              
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                  fullWidth
                  variant="contained"
                  component={RouterLink}
                  to="/messages"
                  startIcon={<MessageIcon />}
                  sx={{ 
                    borderRadius: 2,
                    py: 1,
                    boxShadow: 2
                  }}
                >
                  View All Messages
                </Button>
              </Box>
            </Paper>

            {/* Recommendations */}
            <Paper 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}
            >
              <Box 
                sx={{ 
                  bgcolor: 'background.default',
                  px: 3,
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Recommended for You
                </Typography>
              </Box>
              
              <Box sx={{ p: 2 }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : recommendedListings.length > 0 ? (
                  recommendedListings.map((rec) => (
                    <Card 
                      key={rec.id} 
                      sx={{ 
                        mb: 2, 
                        borderRadius: 2,
                        boxShadow: 'none',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <CardActionArea 
                        component={RouterLink} 
                        to={`/marketplace/listing/${rec.id}`}
                        sx={{ p: 2 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <Avatar 
                            sx={{ 
                              mr: 2, 
                              bgcolor: rec.type === 'land' 
                                ? 'primary.light' 
                                : rec.type === 'partner' 
                                  ? '#9c27b0' 
                                  : 'secondary.light',
                              width: 50,
                              height: 50
                            }}
                          >
                            {rec.type === 'land' && <ApartmentIcon />}
                            {rec.type === 'service' && <ShoppingCartIcon />}
                            {rec.type !== 'land' && rec.type !== 'service' && <GroupIcon />}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography variant="subtitle1" fontWeight="bold" component="div">
                                {rec.title}
                              </Typography>
                              <Chip 
                                label="Recommended" 
                                size="small"
                                sx={{ 
                                  bgcolor: alpha('#4caf50', 0.1),
                                  color: '#2e7d32',
                                  fontWeight: 'medium',
                                  fontSize: '0.7rem',
                                  height: 24
                                }}
                              />
                            </Box>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                mb: 1.5,
                                mt: 0.5,
                                lineHeight: 1.4
                              }}
                            >
                              {rec.description}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                          <Chip
                            icon={rec.type === 'land' 
                              ? <ApartmentIcon fontSize="small" /> 
                              : rec.type === 'service' 
                                ? <ShoppingCartIcon fontSize="small" />
                                : <GroupIcon fontSize="small" />}
                            label={rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                            size="small"
                            sx={{ 
                              bgcolor: 'background.default',
                              fontWeight: 'medium'
                            }}
                          />
                          <Typography 
                            variant="body2" 
                            color="primary.main"
                            fontWeight="medium"
                          >
                            {rec.price || rec.location || ''}
                          </Typography>
                        </Box>
                      </CardActionArea>
                    </Card>
                  ))
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      No recommendations available at this time
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button 
                  fullWidth
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  component={RouterLink}
                  to="/marketplace"
                  sx={{ borderRadius: 2, py: 1 }}
                >
                  Browse More
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard; 