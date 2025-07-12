import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Button, Grid, 
  Chip, TextField, InputAdornment, Paper, Divider, 
  IconButton, CardMedia, CardActions, Avatar, CardHeader,
  CircularProgress, useMediaQuery, useTheme
} from '@mui/material';

import { getUpcomingEvents } from '../../services/api/communityService';
import AddEvent from './AddEvent';
import EventRegistrationButton from '../../components/EventRegistrationButton';

const CommunityEvents = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState(() => isMobile ? 'list' : 'grid'); // Default to list on mobile
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addEventOpen, setAddEventOpen] = useState(false);

  // Update view mode when screen size changes
  useEffect(() => {
    if (isMobile && viewMode === 'grid') {
      setViewMode('list');
    }
  }, [isMobile, viewMode]);

  // Event categories - will be calculated from real events data
  const [eventCategories, setEventCategories] = useState([
    { id: 'all', name: 'All Events', count: 0 },
    { id: 'workshop', name: 'Workshops', count: 0 },
    { id: 'webinar', name: 'Webinars', count: 0 },
    { id: 'field_visit', name: 'Field Visits', count: 0 },
    { id: 'conference', name: 'Conferences', count: 0 },
    { id: 'market_day', name: 'Market Days', count: 0 },
    { id: 'competition', name: 'Competitions', count: 0 }
  ]);

  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await getUpcomingEvents(50); // Get more events for better filtering
        
        if (error) {
          console.error('Error fetching events:', error);
          setEvents([]);
        } else {
          // Transform database events to match component expectations
          const transformedEvents = (data || []).map(event => ({
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.start_datetime,
            time: `${new Date(event.start_datetime).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })} - ${new Date(event.end_datetime).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}`,
            location: event.location || 'Online',
            organizer: event.organizer ? 
              `${event.organizer.first_name || ''} ${event.organizer.last_name || ''}`.trim() || 'Unknown Organizer' :
              'Unknown Organizer',
            imageUrl: event.image_url || 'https://images.unsplash.com/photo-1599270606289-c6af89bf034d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            attendees: event.participants_count || 0,
            category: event.event_type || 'Workshop',
            tags: event.tags || [], // Ensure tags is always an array
            price: event.price || 0,
            currency: event.currency || 'UGX',
            max_participants: event.max_participants,
            contact_info: event.contact_info,
            virtual_link: event.virtual_link,
            requirements: event.requirements
          }));

          setEvents(transformedEvents);

          // Update event categories with counts
          const categoryCounts = {
            all: transformedEvents.length,
            workshop: transformedEvents.filter(e => e.category.toLowerCase() === 'workshop').length,
            webinar: transformedEvents.filter(e => e.category.toLowerCase() === 'webinar').length,
            field_visit: transformedEvents.filter(e => e.category.toLowerCase() === 'field_visit').length,
            conference: transformedEvents.filter(e => e.category.toLowerCase() === 'conference').length,
            market_day: transformedEvents.filter(e => e.category.toLowerCase() === 'market_day').length,
            competition: transformedEvents.filter(e => e.category.toLowerCase() === 'competition').length
          };

          setEventCategories([
            { id: 'all', name: 'All Events', count: categoryCounts.all },
            { id: 'workshop', name: 'Workshops', count: categoryCounts.workshop },
            { id: 'webinar', name: 'Webinars', count: categoryCounts.webinar },
            { id: 'field_visit', name: 'Field Visits', count: categoryCounts.field_visit },
            { id: 'conference', name: 'Conferences', count: categoryCounts.conference },
            { id: 'market_day', name: 'Market Days', count: categoryCounts.market_day },
            { id: 'competition', name: 'Competitions', count: categoryCounts.competition }
          ]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on search term and category
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.tags && event.tags.length > 0 && event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      event.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Handle new event creation
  const handleEventCreated = (newEvent) => {
    // Transform the new event to match component expectations
    const transformedNewEvent = {
      id: newEvent.id,
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.start_datetime,
      time: `${new Date(newEvent.start_datetime).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })} - ${new Date(newEvent.end_datetime).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`,
      location: newEvent.location || 'Online',
      organizer: newEvent.organizer ? 
        `${newEvent.organizer.first_name || ''} ${newEvent.organizer.last_name || ''}`.trim() || 'Unknown Organizer' :
        'Unknown Organizer',
      imageUrl: newEvent.image_url || 'https://images.unsplash.com/photo-1599270606289-c6af89bf034d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      attendees: newEvent.participants_count || 0,
      category: newEvent.event_type || 'Workshop',
      tags: newEvent.tags || [], // Ensure tags is always an array
      price: newEvent.price || 0,
      currency: newEvent.currency || 'UGX',
      max_participants: newEvent.max_participants,
      contact_info: newEvent.contact_info,
      virtual_link: newEvent.virtual_link,
      requirements: newEvent.requirements
    };

    // Add the new event to the events list
    setEvents(prevEvents => [transformedNewEvent, ...prevEvents]);
    
    // Update category counts
    const newCategoryCounts = eventCategories.map(category => {
      if (category.id === 'all') {
        return { ...category, count: category.count + 1 };
      } else if (category.id === newEvent.event_type) {
        return { ...category, count: category.count + 1 };
      }
      return category;
    });
    setEventCategories(newCategoryCounts);
  };

  const handleAddEventClose = () => {
    setAddEventOpen(false);
  };

  return (
    <div className="container">
      {/* Header and filters section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" component="h2" fontWeight="bold">
            Upcoming Farming Events
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Button 
              variant={viewMode === 'grid' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('grid')}
              sx={{ mr: 1 }}
              disabled={isMobile}
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredEvents.length} of {events.length} events
            {selectedCategory !== 'all' && ` in ${eventCategories.find(c => c.id === selectedCategory)?.name}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </Typography>
          {isMobile && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              📱 Mobile optimized view - showing as list for better readability
            </Typography>
          )}
        </Box>
        
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => setAddEventOpen(true)}
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

      {/* Event Grid View */}
      {viewMode === 'grid' && !isMobile && (
        <>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={40} />
            </Box>
          ) : filteredEvents.length > 0 ? (
            <Grid container spacing={3}>
              {filteredEvents.map(event => (
                <Grid item xs={12} sm={6} lg={4} key={event.id}>
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
                        {event.tags && event.tags.length > 0 && event.tags.map((tag, index) => (
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
                      <EventRegistrationButton 
                        eventId={event.id}
                        size="small" 
                        variant="contained" 
                        color="primary"
                        onRegistrationChange={(action, eventId) => {
                          // Update attendees count locally for immediate UI feedback
                          setEvents(prevEvents => 
                            prevEvents.map(e => 
                              e.id === eventId 
                                ? { ...e, attendees: action === 'registered' ? e.attendees + 1 : Math.max(0, e.attendees - 1) }
                                : e
                            )
                          );
                        }}
                      />
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
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No events found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria or category filter
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* Event List View */}
      {(viewMode === 'list' || isMobile) && (
        <>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={40} />
            </Box>
          ) : filteredEvents.length > 0 ? (
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
                        {event.tags && event.tags.length > 0 && event.tags.map((tag, index) => (
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
                        <EventRegistrationButton 
                          eventId={event.id}
                          variant="contained" 
                          color="primary"
                          onRegistrationChange={(action, eventId) => {
                            // Update attendees count locally for immediate UI feedback
                            setEvents(prevEvents => 
                              prevEvents.map(e => 
                                e.id === eventId 
                                  ? { ...e, attendees: action === 'registered' ? e.attendees + 1 : Math.max(0, e.attendees - 1) }
                                  : e
                              )
                            );
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              {index < filteredEvents.length - 1 && <Divider sx={{ my: 2 }} />}
            </React.Fragment>
          ))}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No events found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria or category filter
              </Typography>
            </Box>
          )}
        </>
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
                onClick={() => setAddEventOpen(true)}
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

      {/* Add Event Dialog */}
      <AddEvent
        open={addEventOpen}
        onClose={handleAddEventClose}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
};

export default CommunityEvents; 