import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Card, CardContent, Typography, Box, Badge, 
  Divider, List, ListItem, ListItemText, ListItemButton,
  Avatar, Button, ListItemAvatar, CardHeader, CardActions,
  TextField, InputAdornment, IconButton, Paper, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, FormHelperText, Chip,
  Fade, Zoom
} from '@mui/material';
import CommunityDiscussions from './CommunityDiscussions';
import CommunityEvents from './CommunityEvents';
import CommunityQA from './CommunityQA';
import { forumCategories } from '../../mocks/forum_categories';
import { popularTags } from '../../mocks/popular_tags';


const Community = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('discussions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [postContent, setPostContent] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [openPostModal, setOpenPostModal] = useState(false);
  const [newPostCategory, setNewPostCategory] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const handleCreatePost = (e) => {
    e.preventDefault();
    
    const errors = {};
    if (!postTitle.trim()) errors.title = 'Title is required';
    if (!postContent.trim()) errors.content = 'Content is required';
    if (!newPostCategory) errors.category = 'Category is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // In a real app, we would send this to an API
    alert('Post created successfully!');
    setPostTitle('');
    setPostContent('');
    setNewPostCategory('');
    setNewPostTags('');
    setFormErrors({});
    setOpenPostModal(false);
  };

  const handleOpenPostModal = () => {
    setOpenPostModal(true);
  };

  const handleClosePostModal = () => {
    setOpenPostModal(false);
    setPostTitle('');
    setPostContent('');
    setNewPostCategory('');
    setNewPostTags('');
    setFormErrors({});
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Render the appropriate content based on activeTab
  const renderContent = () => {
    switch(activeTab) {
      case 'discussions':
        return (
          <CommunityDiscussions 
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            formatDate={formatDate}
            user={user}
            setSearchTerm={setSearchTerm}
            handleOpenPostModal={handleOpenPostModal}
          />
        );
      case 'events':
        return <CommunityEvents />;
      case 'questions':
        return <CommunityQA />;
      default:
        return <CommunityDiscussions />;
    }
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Enhanced Header section */}
      <Box 
        sx={{
          position: 'relative',
          borderRadius: 4,
          overflow: 'hidden',
          mb: 12,
          boxShadow: '0 10px 30px rgba(76, 175, 80, 0.1)',
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
        }}
      >
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
        
        {/* Farmer illustration */}
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                style={{ width: '28px', height: '28px', marginRight: '12px', color: '#4caf50' }}>
                <path d="M6,3A3,3 0 0,1 9,6C9,7.31 8.17,8.42 7,8.83V15.17C8.17,15.58 9,16.69 9,18A3,3 0 0,1 6,21A3,3 0 0,1 3,18C3,16.69 3.83,15.58 5,15.17V8.83C3.83,8.42 3,7.31 3,6A3,3 0 0,1 6,3M6,5A1,1 0 0,0 5,6A1,1 0 0,0 6,7A1,1 0 0,0 7,6A1,1 0 0,0 6,5M6,17A1,1 0 0,0 5,18A1,1 0 0,0 6,19A1,1 0 0,0 7,18A1,1 0 0,0 6,17M21,18A3,3 0 0,1 18,21A3,3 0 0,1 15,18C15,16.69 15.83,15.58 17,15.17V7H15V10.25L10.75,6L15,1.75V5H17A2,2 0 0,1 19,7V15.17C20.17,15.58 21,16.69 21,18M18,17A1,1 0 0,0 17,18A1,1 0 0,0 18,19A1,1 0 0,0 19,18A1,1 0 0,0 18,17Z" />
              </svg>
              <Typography 
                component="span" 
                sx={{ 
                  fontSize: '1rem', 
                  fontWeight: 'medium', 
                  color: '#4caf50', 
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Community Hub
              </Typography>
            </Box>
            
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', md: '3.5rem' }, 
                fontWeight: 800, 
                color: '#2e7d32',
                mb: 3,
                maxWidth: '800px',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-10px',
                  left: 0,
                  width: '80px',
                  height: '4px',
                  background: 'linear-gradient(to right, #4caf50, rgba(76,175,80,0.3))',
                  borderRadius: '2px',
                }
              }}
            >
              Grow Together with Ugandan Farmers
            </Typography>
            
            <Typography variant="subtitle1" color="text.secondary" sx={{ 
              mt: 4, 
              maxWidth: '600px', 
              display: { xs: 'block', md: 'none' } 
            }}>
              Join our thriving community of farmers across Uganda to share knowledge, 
              discover solutions to farming challenges, and connect with other local farmers.
            </Typography>
          </Box>
          
          {/* Right side features */}
          <Box sx={{ 
            mt: { xs: 6, md: 0 }, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3.5,
            maxWidth: { md: '40%' },
            bgcolor: 'rgba(255,255,255,0.4)',
            p: 3,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            backdropFilter: 'blur(10px)',
          }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ 
              fontWeight: 'medium',
              display: { xs: 'none', md: 'block' } 
            }}>
              Join our thriving community of farmers across Uganda to share knowledge, 
              discover solutions to farming challenges, and connect with other local farmers.
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                width: 45, 
                height: 45, 
                borderRadius: '12px', 
                bgcolor: 'rgba(76,175,80,0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 2,
                flexShrink: 0
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                  style={{ width: '24px', height: '24px', color: '#4caf50' }}>
                  <path d="M12,23A1,1 0 0,1 11,22V19H7A2,2 0 0,1 5,17V7A2,2 0 0,1 7,5H21A2,2 0 0,1 23,7V17A2,2 0 0,1 21,19H16.9L13.2,22.71C13,22.89 12.76,23 12.5,23H12M3,15H1V3A2,2 0 0,1 3,1H19V3H3V15Z" />
                </svg>
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                  Share Knowledge
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Exchange farming practices and experiences with other farmers
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                width: 45, 
                height: 45, 
                borderRadius: '12px', 
                bgcolor: 'rgba(76,175,80,0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 2,
                flexShrink: 0
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                  style={{ width: '24px', height: '24px', color: '#4caf50' }}>
                  <path d="M17.9,17.39C17.64,16.59 16.89,16 16,16H15V13A1,1 0 0,0 14,12H8V10H10A1,1 0 0,0 11,9V7H13A2,2 0 0,0 15,5V4.59C17.93,5.77 20,8.64 20,12C20,14.08 19.2,15.97 17.9,17.39M11,19.93C7.05,19.44 4,16.08 4,12C4,11.38 4.08,10.78 4.21,10.21L9,15V16A2,2 0 0,0 11,18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                </svg>
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                  Discover Solutions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Find answers to common farming challenges and issues
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                width: 45, 
                height: 45, 
                borderRadius: '12px', 
                bgcolor: 'rgba(76,175,80,0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 2,
                flexShrink: 0
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                  style={{ width: '24px', height: '24px', color: '#4caf50' }}>
                  <path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z" />
                </svg>
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                  Connect With Locals
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Build relationships with farmers in your region
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <div className="mb-10">
        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden',
            mb: 2
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1 },
              bgcolor: 'white',
              borderBottom: '1px solid rgba(0,0,0,0.08)'
            }}
          >
            <Tabs 
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ 
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  px: 4,
                  py: 2,
                  minWidth: 120,
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: 'primary.main'
                  }
                }
              }}
            >
              <Tab 
                value="discussions" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                    </svg>
                    Discussions
                  </Box>
                } 
              />
              <Tab 
                value="events" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Events
                  </Box>
                } 
              />
              <Tab 
                value="questions" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Q&A
                  </Box>
                } 
              />
            </Tabs>
            
            {user && (
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleOpenPostModal}
                startIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                }
                sx={{ 
                  borderRadius: 2,
                  px: 4, 
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4
                  }
                }}
              >
                New Post
              </Button>
            )}
          </Box>
          
          <Box 
            sx={{ 
              px: 3, 
              py: 2,
              bgcolor: 'rgba(0,0,0,0.02)',
              borderTop: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <Typography variant="body1" color="text.secondary">
              {activeTab === 'discussions' && 'Browse community discussions about farming practices, challenges, and innovations.'}
              {activeTab === 'events' && 'Discover upcoming farming workshops, training, and community events.'}
              {activeTab === 'questions' && 'Ask questions and get answers from experienced farmers in the community.'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="caption" color="text.secondary" mr={2}>
                {activeTab === 'discussions' && '842 discussions'}
                {activeTab === 'events' && '57 upcoming events'}
                {activeTab === 'questions' && '310 questions'}
              </Typography>
              <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 16 }} />
              <Typography variant="caption" color="text.secondary">
                {activeTab === 'discussions' && '135 new this week'}
                {activeTab === 'events' && '12 this month'}
                {activeTab === 'questions' && '48 unanswered'}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </div>

      {/* Main layout with sidebar */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar - Categories */}
        <div className="lg:w-1/4 xl:w-1/5">
          <Box 
            sx={{ 
              position: { lg: 'sticky' },
              top: { lg: '20px' },
              maxHeight: { lg: 'calc(100vh - 40px)' },
              overflowY: 'auto'
            }}
          >
            <div className="flex flex-col gap-4">
              {/* Categories Card */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="bg-primary px-5 py-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Categories
                  </h2>
                </div>
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar p-3">
                  {/* All Categories Card */}
                  <Card 
                    sx={{ 
                      mb: 2, 
                      cursor: 'pointer',
                      borderLeft: selectedCategory === 'all' ? '4px solid #4CAF50' : '4px solid transparent',
                      backgroundColor: selectedCategory === 'all' ? '#E8F5E9' : 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                    onClick={() => setSelectedCategory('all')}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight={selectedCategory === 'all' ? 'bold' : 'medium'} color={selectedCategory === 'all' ? 'primary.main' : 'text.primary'}>
                          All Categories
                        </Typography>
                        <Badge 
                          badgeContent={forumCategories.reduce((sum, cat) => sum + cat.count, 0)} 
                          color={selectedCategory === 'all' ? 'primary' : 'default'}
                          sx={{ 
                            '& .MuiBadge-badge': { 
                              fontSize: '0.7rem', 
                              fontWeight: 'bold',
                              minWidth: '24px',
                              height: '20px'
                            } 
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Category Cards */}
                  {forumCategories.map((category, index) => {
                    // Array of category colors (primary color objects)
                    const categoryColors = [
                      { main: '#E91E63', light: '#FCE4EC', dark: '#C2185B' }, // Pink
                      { main: '#FF9800', light: '#FFF3E0', dark: '#F57C00' }, // Orange
                      { main: '#4CAF50', light: '#E8F5E9', dark: '#388E3C' }, // Green
                      { main: '#00BCD4', light: '#E0F7FA', dark: '#0097A7' }, // Cyan
                      { main: '#673AB7', light: '#EDE7F6', dark: '#512DA8' }, // Deep Purple
                      { main: '#9C27B0', light: '#F3E5F5', dark: '#7B1FA2' }, // Purple
                      { main: '#2196F3', light: '#E3F2FD', dark: '#1976D2' }, // Blue
                      { main: '#FF5722', light: '#FBE9E7', dark: '#E64A19' }  // Deep Orange
                    ];
                    
                    const colorIndex = index % categoryColors.length;
                    const color = categoryColors[colorIndex];
                    const isSelected = selectedCategory === category.id;
                    
                    return (
                      <Card 
                        key={category.id}
                        sx={{ 
                          mb: 2, 
                          cursor: 'pointer',
                          borderLeft: isSelected ? `4px solid ${color.main}` : '4px solid transparent',
                          backgroundColor: isSelected ? color.light : 'white',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            transform: 'translateY(-2px)',
                            backgroundColor: isSelected ? color.light : '#f5f5f5'
                          }
                        }}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography 
                              variant="body1" 
                              fontWeight={isSelected ? 'bold' : 'medium'} 
                              color={isSelected ? color.dark : 'text.primary'}
                            >
                              {category.name}
                            </Typography>
                            <Badge 
                              badgeContent={category.count} 
                              sx={{ 
                                '& .MuiBadge-badge': { 
                                  backgroundColor: isSelected ? color.main : '#9e9e9e',
                                  color: 'white',
                                  fontSize: '0.7rem', 
                                  fontWeight: 'bold',
                                  minWidth: '24px',
                                  height: '20px'
                                } 
                              }}
                            />
                          </Box>
                          {isSelected && (
                            <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', color: color.dark }}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                              </svg>
                              <Typography variant="caption" fontWeight="medium" color="inherit">
                                View posts in this category
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Popular tags */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="bg-green-600 px-5 py-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Popular Tags
                  </h2>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag, index) => (
                      <button 
                        key={index} 
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
                      >
                        {tag.name} <span className="text-primary font-semibold">({tag.count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Community stats - condensed */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-blue-600 px-5 py-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Community Stats
                  </h2>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-primary">1,245</div>
                      <div className="text-gray-600 text-xs">Members</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-primary">842</div>
                      <div className="text-gray-600 text-xs">Discussions</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-primary">3,517</div>
                      <div className="text-gray-600 text-xs">Comments</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-primary">42</div>
                      <div className="text-gray-600 text-xs">Active Now</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Box>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4 xl:w-4/5">
          {renderContent()}
        </div>
      </div>

      {/* New Post Modal */}
      <Dialog 
        open={openPostModal} 
        onClose={handleClosePostModal}
        fullWidth
        maxWidth="md"
        TransitionComponent={Zoom}
        transitionDuration={300}
        PaperProps={{
          sx: { borderRadius: 2, maxHeight: '90vh' }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.5rem',
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create New Post
        </DialogTitle>
        <DialogContent sx={{ py: 3, px: 3 }}>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Post Title"
              fullWidth
              variant="outlined"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              error={Boolean(formErrors.title)}
              helperText={formErrors.title || "A clear, descriptive title will attract more responses"}
              sx={{ mb: 3 }}
              InputProps={{ 
                sx: { borderRadius: 1.5 },
                startAdornment: (
                  <InputAdornment position="start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 5a1 1 0 00-1-1H3a1 1 0 00-1 1v10a1 1 0 001 1h14a1 1 0 001-1V5zM3 4h14a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2z" clipRule="evenodd" />
                    </svg>
                  </InputAdornment>
                )
              }}
            />
            
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth variant="outlined" error={Boolean(formErrors.category)}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                  label="Category"
                  sx={{ borderRadius: 1.5 }}
                  startAdornment={
                    <InputAdornment position="start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </InputAdornment>
                  }
                >
                  {forumCategories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category ? (
                  <FormHelperText error>{formErrors.category}</FormHelperText>
                ) : (
                  <FormHelperText>Select the most relevant category for your post</FormHelperText>
                )}
              </FormControl>
              
              {/* Visual category selector */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {forumCategories.slice(0, 6).map(category => (
                  <Chip
                    key={category.id}
                    label={category.name}
                    onClick={() => setNewPostCategory(category.id)}
                    sx={{
                      bgcolor: newPostCategory === category.id ? 'primary.light' : 'grey.100',
                      color: newPostCategory === category.id ? 'primary.dark' : 'text.primary',
                      fontWeight: newPostCategory === category.id ? 'bold' : 'normal',
                      borderRadius: 1.5,
                      '&:hover': {
                        bgcolor: newPostCategory === category.id ? 'primary.light' : 'grey.200',
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
            
            <TextField
              label="Tags (comma separated)"
              fullWidth
              variant="outlined"
              value={newPostTags}
              onChange={(e) => setNewPostTags(e.target.value)}
              placeholder="e.g. coffee, farming, eastern region"
              sx={{ mb: 2 }}
              InputProps={{ 
                sx: { borderRadius: 1.5 },
                startAdornment: (
                  <InputAdornment position="start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </InputAdornment>
                )
              }}
              helperText="Add tags to help others find your post"
            />
            
            {/* Tag suggestions */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ width: '100%', mb: 1 }}>
                Popular tags:
              </Typography>
              {popularTags.slice(0, 8).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag.name}
                  size="small"
                  onClick={() => {
                    const currentTags = newPostTags ? newPostTags.split(',').map(t => t.trim()) : [];
                    if (!currentTags.includes(tag.name)) {
                      const updatedTags = [...currentTags, tag.name].join(', ');
                      setNewPostTags(updatedTags);
                    }
                  }}
                  sx={{
                    fontSize: '0.75rem',
                    height: 24,
                    bgcolor: 'grey.100',
                    '&:hover': {
                      bgcolor: 'grey.200',
                    }
                  }}
                />
              ))}
            </Box>
            
            <TextField
              label="Post Content"
              multiline
              rows={8}
              fullWidth
              variant="outlined"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              error={Boolean(formErrors.content)}
              helperText={formErrors.content || "Share your thoughts, questions, or insights with the community"}
              placeholder="Share your thoughts, questions, or insights with the community..."
              sx={{ mb: 2 }}
              InputProps={{ sx: { borderRadius: 1.5 } }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, mb: 1, flexWrap: 'wrap', gap: 2 }}>
              <Button 
                variant="outlined" 
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none'
                }}
                startIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4a.5.5 0 01-.5-.5v-6.5a.5.5 0 01.5-.5h12a.5.5 0 01.5.5V15a.5.5 0 01-.5.5zM4 4.5V6h12V4.5a.5.5 0 00-.5-.5H4.5a.5.5 0 00-.5.5z" clipRule="evenodd" />
                  </svg>
                }
              >
                Add Image
              </Button>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <Typography variant="body2" color="text.secondary">
                  Your post will be visible to all community members
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            onClick={handleClosePostModal} 
            variant="outlined"
            sx={{ borderRadius: 1.5, px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreatePost} 
            variant="contained"
            color="primary"
            sx={{ borderRadius: 1.5, px: 4, py: 1 }}
            startIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
          >
            Publish Post
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Community; 