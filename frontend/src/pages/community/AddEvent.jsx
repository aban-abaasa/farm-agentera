import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Autocomplete,
  FormControlLabel,
  Switch,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  MonetizationOn as MoneyIcon,
  Group as GroupIcon,
  Link as LinkIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

import { createEvent } from '../../services/api/communityService';

const AddEvent = ({ open, onClose, onEventCreated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'workshop',
    start_datetime: '',
    end_datetime: '',
    location: '',
    virtual_link: '',
    max_participants: '',
    price: 0,
    currency: 'UGX',
    requirements: '',
    contact_info: '',
    is_virtual: false,
    is_free: true,
    image_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const steps = [
    {
      label: 'Event Details',
      description: 'Basic information about your event',
      icon: <EventIcon />
    },
    {
      label: 'Schedule & Location',
      description: 'When and where it will happen',
      icon: <ScheduleIcon />
    },
    {
      label: 'Registration & Pricing',
      description: 'Attendee limits and costs',
      icon: <GroupIcon />
    }
  ];

  const eventTypes = [
    { value: 'workshop', label: 'Workshop', description: 'Hands-on learning sessions' },
    { value: 'webinar', label: 'Webinar', description: 'Online presentation or discussion' },
    { value: 'field_visit', label: 'Field Visit', description: 'Farm tours and demonstrations' },
    { value: 'conference', label: 'Conference', description: 'Large educational gatherings' },
    { value: 'market_day', label: 'Market Day', description: 'Trading and networking events' },
    { value: 'competition', label: 'Competition', description: 'Contests and challenges' },
    { value: 'training', label: 'Training', description: 'Skills development sessions' },
    { value: 'exhibition', label: 'Exhibition', description: 'Product and technology showcases' }
  ];

  const ugandanDistricts = [
    'Kampala', 'Wakiso', 'Mukono', 'Jinja', 'Mbale', 'Gulu', 'Lira', 'Mbarara',
    'Masaka', 'Fort Portal', 'Kabale', 'Soroti', 'Arua', 'Kasese', 'Hoima',
    'Mityana', 'Iganga', 'Tororo', 'Busia', 'Kitgum', 'Adjumani', 'Nebbi'
  ];

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        title: '',
        description: '',
        event_type: 'workshop',
        start_datetime: '',
        end_datetime: '',
        location: '',
        virtual_link: '',
        max_participants: '',
        price: 0,
        currency: 'UGX',
        requirements: '',
        contact_info: '',
        is_virtual: false,
        is_free: true,
        image_url: ''
      });
      setError('');
      setSuccess(false);
      setActiveStep(0);
    }
  }, [open]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-toggle is_free when price changes
    if (field === 'price') {
      setFormData(prev => ({
        ...prev,
        price: value,
        is_free: value === 0
      }));
    }

    // Auto-clear virtual_link when not virtual
    if (field === 'is_virtual' && !value) {
      setFormData(prev => ({
        ...prev,
        virtual_link: ''
      }));
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.title.trim()) errors.push('Event title is required');
    if (!formData.description.trim()) errors.push('Event description is required');
    if (!formData.start_datetime) errors.push('Start date and time is required');
    if (!formData.end_datetime) errors.push('End date and time is required');
    if (!formData.location.trim() && !formData.is_virtual) errors.push('Location is required for physical events');
    if (formData.is_virtual && !formData.virtual_link.trim()) errors.push('Virtual meeting link is required for online events');
    if (!formData.contact_info.trim()) errors.push('Contact information is required');

    // Validate dates
    const startDate = new Date(formData.start_datetime);
    const endDate = new Date(formData.end_datetime);
    const now = new Date();

    if (startDate <= now) errors.push('Start date must be in the future');
    if (endDate <= startDate) errors.push('End date must be after start date');

    // Validate max participants
    if (formData.max_participants && formData.max_participants < 1) {
      errors.push('Maximum participants must be at least 1');
    }

    return errors;
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // Validate form
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        setLoading(false);
        return;
      }

      // Prepare event data
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        event_type: formData.event_type,
        start_datetime: formData.start_datetime,
        end_datetime: formData.end_datetime,
        location: formData.is_virtual ? 'Online' : formData.location.trim(),
        virtual_link: formData.is_virtual ? formData.virtual_link.trim() : null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        price: formData.is_free ? 0 : parseFloat(formData.price),
        currency: formData.currency,
        requirements: formData.requirements.trim() || null,
        contact_info: formData.contact_info.trim(),
        image_url: formData.image_url.trim() || null
      };

      // Create the event
      const { data: newEvent, error } = await createEvent(eventData);

      if (error) {
        setError('Failed to create event. Please check your details and try again.');
        console.error('Error creating event:', error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onEventCreated?.(newEvent);
          onClose();
        }, 1500);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error submitting event:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Event Title"
                fullWidth
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Modern Poultry Farming Workshop"
                helperText={`${formData.title.length}/100 characters`}
                inputProps={{ maxLength: 100 }}
                disabled={loading || success}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Event Description"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what attendees will learn, who should attend, and what to expect..."
                helperText={`${formData.description.length}/500 characters`}
                inputProps={{ maxLength: 500 }}
                disabled={loading || success}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={loading || success}>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={formData.event_type}
                  onChange={(e) => handleInputChange('event_type', e.target.value)}
                  label="Event Type"
                  sx={{ borderRadius: 2 }}
                >
                  {eventTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box>
                        <Typography variant="body2" fontWeight="500">{type.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Image URL (Optional)"
                fullWidth
                value={formData.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="https://example.com/event-image.jpg"
                disabled={loading || success}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_virtual}
                    onChange={(e) => handleInputChange('is_virtual', e.target.checked)}
                    disabled={loading || success}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">Virtual Event</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Check if this is an online event
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date & Time"
                type="datetime-local"
                fullWidth
                value={formData.start_datetime}
                onChange={(e) => handleInputChange('start_datetime', e.target.value)}
                disabled={loading || success}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date & Time"
                type="datetime-local"
                fullWidth
                value={formData.end_datetime}
                onChange={(e) => handleInputChange('end_datetime', e.target.value)}
                disabled={loading || success}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>

            {!formData.is_virtual ? (
              <Grid item xs={12}>
                <Autocomplete
                  options={ugandanDistricts}
                  value={formData.location}
                  onChange={(event, newValue) => handleInputChange('location', newValue || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Event Location"
                      placeholder="Select district or enter specific venue"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  )}
                  freeSolo
                  disabled={loading || success}
                />
              </Grid>
            ) : (
              <Grid item xs={12}>
                <TextField
                  label="Virtual Meeting Link"
                  fullWidth
                  value={formData.virtual_link}
                  onChange={(e) => handleInputChange('virtual_link', e.target.value)}
                  placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                  disabled={loading || success}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                label="Requirements/Prerequisites (Optional)"
                fullWidth
                multiline
                rows={3}
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="Any skills, tools, or materials participants should have or bring..."
                disabled={loading || success}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Maximum Participants (Optional)"
                type="number"
                fullWidth
                value={formData.max_participants}
                onChange={(e) => handleInputChange('max_participants', e.target.value)}
                placeholder="Leave empty for unlimited"
                disabled={loading || success}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_free}
                    onChange={(e) => handleInputChange('is_free', e.target.checked)}
                    disabled={loading || success}
                  />
                }
                label="Free Event"
              />
            </Grid>

            {!formData.is_free && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Event Price"
                    type="number"
                    fullWidth
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', Number(e.target.value))}
                    disabled={loading || success}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MoneyIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={loading || success}>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      label="Currency"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="UGX">UGX (Ugandan Shilling)</MenuItem>
                      <MenuItem value="USD">USD (US Dollar)</MenuItem>
                      <MenuItem value="EUR">EUR (Euro)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <TextField
                label="Contact Information"
                fullWidth
                multiline
                rows={2}
                value={formData.contact_info}
                onChange={(e) => handleInputChange('contact_info', e.target.value)}
                placeholder="Phone number, email, or other contact details for registration/inquiries"
                disabled={loading || success}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f8fffe 0%, #f3f9f8 100%)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.12), 0 12px 24px rgba(0,0,0,0.08)'
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
          color: 'white',
          pt: 4,
          pb: 3,
          px: 4,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(30%, -30%)'
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" component="h2" fontWeight="700" gutterBottom>
            Create New Event
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
            Share your agricultural event with the farming community
          </Typography>
          
          {/* Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ 
            '& .MuiStepLabel-root .Mui-completed': { color: 'rgba(255,255,255,0.8)' },
            '& .MuiStepLabel-root .Mui-active': { color: 'white' },
            '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.7)' },
            '& .MuiStepLabel-label.Mui-active': { color: 'white' },
            '& .MuiStepConnector-line': { borderColor: 'rgba(255,255,255,0.3)' }
          }}>
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography variant="body2" fontWeight="500">
                    {step.label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            Event created successfully! Redirecting...
          </Alert>
        )}

        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                {steps[activeStep].icon}
                <Box sx={{ ml: 1 }}>
                  {steps[activeStep].label}
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {steps[activeStep].description}
              </Typography>
            </Box>

            {renderStepContent(activeStep)}
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 4 }}>
        <Button 
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        
        <Box sx={{ flex: '1 1 auto' }} />
        
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || success}
            startIcon={loading && <CircularProgress size={20} />}
            sx={{ 
              ml: 1,
              background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
              '&:hover': {
                background: 'linear-gradient(45deg, #45a049, #5cb85c)'
              }
            }}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ 
              ml: 1,
              background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
              '&:hover': {
                background: 'linear-gradient(45deg, #45a049, #5cb85c)'
              }
            }}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddEvent;
