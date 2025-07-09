import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Button, Grid, 
  Chip, TextField, InputAdornment, Paper, Divider, 
  IconButton, CardMedia, CardActions, Avatar, CardHeader
} from '@mui/material';

import { mockEvents } from '../../mocks/events';

// Event categories
const eventCategories = [
  { id: 'all', name: 'All Events', count: mockEvents.length },
  { id: 'workshop', name: 'Workshops', count: mockEvents.filter(e => e.category === 'Workshop').length },
  { id: 'expo', name: 'Expos', count: mockEvents.filter(e => e.category === 'Expo').length },
  { id: 'seminar', name: 'Seminars', count: mockEvents.filter(e => e.category === 'Seminar').length },
  { id: 'market', name: 'Market Days', count: mockEvents.filter(e => e.category === 'Market').length },
  { id: 'conference', name: 'Conferences', count: mockEvents.filter(e => e.category === 'Conference').length },
  { id: 'showcase', name: 'Showcases', count: mockEvents.filter(e => e.category === 'Showcase').length },
  { id: 'competition', name: 'Competitions', count: mockEvents.filter(e => e.category === 'Competition').length }
];

const CommunityEvents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Calculate time remaining until AYuTe deadline
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const deadlineDate = new Date('June 30, 2025 23:59:59').getTime();
      const now = new Date().getTime();
      const difference = deadlineDate - now;
      
      if (difference > 0) {
        setTimeRemaining({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };
    
    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Filter events based on search term and category
  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = 
      searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      event.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="container">
      {/* Header and filters section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" fontWeight="bold">
            Upcoming Farming Events
          </Typography>
          <Box>
            <Button 
              variant={viewMode === 'grid' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('grid')}
              sx={{ mr: 1 }}
            >
              Grid View
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('list')}
            >
              List View
            </Button>
          </Box>
        </Box>

        {/* Search and filter */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper
              elevation={2}
              sx={{
                p: 0,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 2,
                overflow: 'hidden',
                mb: { xs: 2, md: 0 }
              }}
            >
              <TextField
                fullWidth
                placeholder="Search events by title, description, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { border: 'none' },
                    '&:hover fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: 'none' },
                  },
                  '& .MuiInputBase-input': { py: 1.5, px: 3 }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#9e9e9e' }}>
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={() => setSearchTerm('')} sx={{ mr: 1 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#9e9e9e' }}>
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button
                variant="contained"
                color="primary"
                sx={{ 
                  borderRadius: 0, 
                  py: 1.5,
                  px: 3,
                  height: '100%',
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 'none' }
                }}
              >
                Search
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', overflowX: 'auto', pb: 1 }}>
              {eventCategories.map(category => (
                <Chip
                  key={category.id}
                  label={`${category.name} (${category.count})`}
                  onClick={() => setSelectedCategory(category.id)}
                  color={selectedCategory === category.id ? 'primary' : 'default'}
                  variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                  sx={{ mr: 1, mb: 1, borderRadius: 1 }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Results info */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredEvents.length} of {mockEvents.length} events
          {selectedCategory !== 'all' && ` in ${eventCategories.find(c => c.id === selectedCategory)?.name}`}
          {searchTerm && ` matching "${searchTerm}"`}
        </Typography>
        
        <Button 
          variant="outlined" 
          color="primary"
          startIcon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          }
          sx={{ textTransform: 'none' }}
        >
          Submit Event
        </Button>
      </Box>

      {/* No results message */}
      {filteredEvents.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No events found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      )}

      {/* Featured Event - AYuTe Africa Challenge */}
      {(selectedCategory === 'all' || selectedCategory === 'competition') && 
       (searchTerm === '' || 'ayute'.includes(searchTerm.toLowerCase()) || 'challenge'.includes(searchTerm.toLowerCase())) && (
        <Box sx={{ mb: 4 }}>
          <Paper
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative',
              background: 'linear-gradient(to right, #f5f5f5, #ffffff)',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
              <Chip
                label="FEATURED EVENT"
                color="primary"
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                  boxShadow: '0 4px 10px rgba(76, 175, 80, 0.3)',
                }}
              />
            </Box>
            <Grid container>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    height: '100%',
                    minHeight: 280,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1599270606289-c6af89bf034d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    alt="AYuTe Africa Challenge"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'brightness(0.85)',
                      transition: 'transform 0.5s',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      p: 2,
                      color: 'white'
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      UGX 222 Million in Grants
                    </Typography>
                    <Typography variant="body2">
                      For young agritech innovators
                    </Typography>
                  </Box>
                  
                  {/* Countdown Timer */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      p: 2,
                      color: 'white',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="overline" sx={{ fontSize: '0.7rem', letterSpacing: 1.5, opacity: 0.8 }}>
                      APPLICATION DEADLINE
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-around', 
                      mt: 0.5,
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: 2,
                      py: 1
                    }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: '#66bb6a' }}>
                          {timeRemaining.days}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                          Days
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: '#66bb6a' }}>
                          {timeRemaining.hours}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                          Hours
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: '#66bb6a' }}>
                          {timeRemaining.minutes}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                          Mins
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: '#66bb6a' }}>
                          {timeRemaining.seconds}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                          Secs
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip
                      size="small"
                      label="AgriTech"
                      sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: 'primary.main' }}
                    />
                    <Chip
                      size="small"
                      label="Youth Innovation"
                      sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: 'primary.main' }}
                    />
                    <Chip
                      size="small"
                      label="Entrepreneurship"
                      sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: 'primary.main' }}
                    />
                  </Box>
                  
                  <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                    AYuTe Africa Challenge Uganda 2025
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 3, mb: 1 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20, marginRight: 8, color: '#4caf50' }}>
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <Typography variant="body2">
                        Launch: May 27, 2025
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 3, mb: 1 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20, marginRight: 8, color: '#f44336' }}>
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <Typography variant="body2" fontWeight="medium" color="error">
                        Deadline: June 30, 2025
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20, marginRight: 8, color: '#4caf50' }}>
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <Typography variant="body2">
                        Nationwide, Uganda
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" paragraph>
                    Calling all young innovators with bold ideas in agritech or agribusiness! The AYuTe Africa Challenge offers UGX 222 million in cash grants, mentorship, and incubation for young Ugandans who are shaping the future of agriculture.
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Two competition tracks:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Paper sx={{ p: 1.5, flex: '1 1 45%', minWidth: 200, bgcolor: 'rgba(76, 175, 80, 0.05)' }}>
                        <Typography variant="subtitle2" fontWeight="bold" color="primary">
                          AgriTech Innovation
                        </Typography>
                        <Typography variant="body2">
                          National competition for tech-based solutions
                        </Typography>
                      </Paper>
                      <Paper sx={{ p: 1.5, flex: '1 1 45%', minWidth: 200, bgcolor: 'rgba(76, 175, 80, 0.05)' }}>
                        <Typography variant="subtitle2" fontWeight="bold" color="primary">
                          Agribusiness Entrepreneurship
                        </Typography>
                        <Typography variant="body2">
                          For Busoga Region entrepreneurs
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src="https://images.unsplash.com/photo-1607703703520-bb638e84caf2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                        alt="Heifer International"
                        sx={{ width: 36, height: 36, mr: 1 }}
                      />
                      <Box>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                          Powered by
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          Heifer International Uganda
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Button 
                      variant="contained" 
                      color="primary"
                      size="large"
                      href="https://ayute.africa/uganda"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        px: 4, 
                        py: 1.5, 
                        background: 'linear-gradient(45deg, #2e7d32, #4caf50)',
                        boxShadow: '0 4px 10px rgba(76, 175, 80, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #2e7d32, #4caf50)',
                          boxShadow: '0 6px 15px rgba(76, 175, 80, 0.4)',
                        }
                      }}
                    >
                      Apply Now
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Event Grid View */}
      {viewMode === 'grid' && filteredEvents.length > 0 && (
        <Grid container spacing={3}>
          {filteredEvents.map(event => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 20px -10px rgba(0, 0, 0, 0.2)'
                }
              }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={event.imageUrl}
                  alt={event.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Chip 
                    size="small" 
                    label={event.category} 
                    color="primary" 
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="h6" component="h2" gutterBottom>
                    {event.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <Typography variant="body2" component="span">
                      {formatDate(event.date)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <Typography variant="body2" component="span">
                      {event.time}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <Typography variant="body2" component="span" noWrap>
                      {event.location}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {event.description.substring(0, 120)}
                    {event.description.length > 120 ? '...' : ''}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {event.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(76, 175, 80, 0.1)', 
                          color: 'primary.main',
                          fontSize: '0.7rem'
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.08)', px: 2 }}>
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="primary"
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 6,
                      px: 2
                    }}
                  >
                    Register
                  </Button>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        bgcolor: 'primary.main',
                        fontSize: '0.75rem',
                        mr: 1
                      }}
                    >
                      {event.attendees > 99 ? '99+' : event.attendees}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      attending
                    </Typography>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Event List View */}
      {viewMode === 'list' && filteredEvents.length > 0 && (
        <Box>
          {filteredEvents.map((event, index) => (
            <React.Fragment key={event.id}>
              <Card 
                sx={{ 
                  mb: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 15px -5px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {event.category.charAt(0)}
                    </Avatar>
                  }
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h6" component="div" sx={{ mr: 1 }}>
                        {event.title}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={event.category} 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                  }
                  subheader={
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#757575' }}>
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(event.date)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#757575' }}>
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <Typography variant="body2" color="text.secondary">
                          {event.time}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#757575' }}>
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <Typography variant="body2" color="text.secondary">
                          {event.location}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <CardContent sx={{ pt: 0 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {event.description}
                      </Typography>
                      <Typography variant="body2" color="text.primary" sx={{ mb: 1.5 }}>
                        <strong>Organizer:</strong> {event.organizer}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {event.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            sx={{ 
                              bgcolor: 'rgba(76, 175, 80, 0.1)', 
                              color: 'primary.main',
                              fontSize: '0.7rem'
                            }}
                          />
                        ))}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box 
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          alignItems: 'flex-end'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: 'primary.main',
                              fontSize: '0.875rem',
                              mr: 1
                            }}
                          >
                            {event.attendees > 99 ? '99+' : event.attendees}
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            people attending
                          </Typography>
                        </Box>
                        <Button 
                          variant="contained" 
                          color="primary"
                          sx={{ 
                            textTransform: 'none',
                            borderRadius: 6,
                            px: 3
                          }}
                        >
                          Register Now
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              {index < filteredEvents.length - 1 && <Divider sx={{ my: 2 }} />}
            </React.Fragment>
          ))}
        </Box>
      )}

      {/* Pagination and load more */}
      {filteredEvents.length > 0 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            color="primary"
            endIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            }
            sx={{ textTransform: 'none', px: 3 }}
          >
            Load More Events
          </Button>
        </Box>
      )}

      {/* Add Event Panel */}
      <Card sx={{ mt: 5, bgcolor: 'rgba(76, 175, 80, 0.05)', borderRadius: 3 }}>
        <CardContent sx={{ py: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" component="h3" gutterBottom>
                Organizing a farming event?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Share your workshops, field days, or exhibitions with the farming community across Uganda. Submit your event details to reach thousands of farmers.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                }
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                  py: 1.2
                }}
              >
                Submit Your Event
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityEvents; 