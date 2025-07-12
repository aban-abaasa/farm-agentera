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
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Avatar,
  Badge
} from '@mui/material';
import {
  HelpOutline as HelpIcon,
  TipsAndUpdates as TipsIcon,
  Star as StarIcon,
  LocalOffer as TagIcon,
  LocationOn as LocationIcon,
  Agriculture as CropIcon,
  Pets as LivestockIcon,
  Person as ExpertIcon,
  MonetizationOn as BountyIcon,
  Send as SendIcon,
  Close as CloseIcon,
  AutoAwesome as MagicIcon
} from '@mui/icons-material';

import { createQuestion, getForumCategories, getPopularTags } from '../../services/api/communityService';

const AskQuestion = ({ open, onClose, onQuestionCreated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    question_type: 'general',
    priority: 'medium',
    crop_type: '',
    livestock_type: '',
    location: '',
    expert_requested: false,
    bounty_amount: 0
  });
  
  const [selectedTags, setSelectedTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  // Enhanced steps with beautiful icons and descriptions
  const steps = [
    {
      label: 'Question Basics',
      icon: <HelpIcon />,
      description: 'Tell us what you need help with',
      color: '#4CAF50'
    },
    {
      label: 'Categorization',
      icon: <TagIcon />,
      description: 'Help others find your question',
      color: '#2196F3'
    },
    {
      label: 'Enhancement',
      icon: <MagicIcon />,
      description: 'Make your question stand out',
      color: '#FF9800'
    }
  ];

  // Question types with beautiful icons and enhanced descriptions
  const questionTypes = [
    { 
      value: 'general', 
      label: 'General Question', 
      description: 'General farming knowledge and advice',
      icon: <HelpIcon />,
      color: '#4CAF50'
    },
    { 
      value: 'urgent', 
      label: 'Urgent Help', 
      description: 'Time-sensitive issues needing immediate assistance',
      icon: <StarIcon />,
      color: '#F44336'
    },
    { 
      value: 'technical', 
      label: 'Technical Issue', 
      description: 'Equipment, technology, or scientific problems',
      icon: <TipsIcon />,
      color: '#FF9800'
    },
    { 
      value: 'business', 
      label: 'Business Advice', 
      description: 'Market strategies, finance, and business guidance',
      icon: <BountyIcon />,
      color: '#9C27B0'
    }
  ];

  // Priority levels
  const priorityLevels = [
    { value: 'low', label: 'Low', color: '#4CAF50' },
    { value: 'medium', label: 'Medium', color: '#FF9800' },
    { value: 'high', label: 'High', color: '#f44336' },
    { value: 'urgent', label: 'Urgent', color: '#d32f2f' }
  ];

  // Common crop types
  const cropTypes = [
    'Maize', 'Beans', 'Coffee', 'Bananas', 'Rice', 'Cassava', 'Sweet Potatoes',
    'Irish Potatoes', 'Tomatoes', 'Onions', 'Cabbage', 'Groundnuts', 'Sunflower',
    'Soybeans', 'Millet', 'Sorghum', 'Pineapples', 'Passion Fruits', 'Avocados'
  ];

  // Common livestock types
  const livestockTypes = [
    'Cattle', 'Goats', 'Sheep', 'Pigs', 'Poultry', 'Rabbits', 'Fish', 'Bees'
  ];

  // Load categories and tags on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories
        const { data: categoriesData, error: categoriesError } = await getForumCategories();
        if (categoriesError) {
          console.error('Error loading categories:', categoriesError);
        } else {
          setCategories(categoriesData || []);
        }

        // Load popular tags
        const { data: tagsData, error: tagsError } = await getPopularTags(20);
        if (tagsError) {
          console.error('Error loading tags:', tagsError);
        } else {
          setAvailableTags(tagsData || []);
        }
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };

    if (open) {
      loadData();
    }
  }, [open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        title: '',
        content: '',
        category_id: '',
        question_type: 'general',
        priority: 'medium',
        crop_type: '',
        livestock_type: '',
        location: '',
        expert_requested: false,
        bounty_amount: 0
      });
      setSelectedTags([]);
      setError('');
      setSuccess(false);
      setActiveStep(0);
    }
  }, [open]);

  // Calculate form completion progress
  useEffect(() => {
    let completed = 0;
    const total = 8;
    
    if (formData.title.trim()) completed++;
    if (formData.content.trim()) completed++;
    if (formData.category_id) completed++;
    if (selectedTags.length > 0) completed++;
    if (formData.location.trim()) completed++;
    if (formData.expert_requested) completed++;
    if (formData.bounty_amount > 0) completed++;
    if (activeStep > 0) completed++;

    setProgress((completed / total) * 100);
  }, [formData, selectedTags, activeStep]);

  // Step navigation handlers
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // Basic validation
      if (!formData.title.trim()) {
        setError('Please enter a question title');
        setLoading(false);
        return;
      }

      if (!formData.content.trim()) {
        setError('Please provide question details');
        setLoading(false);
        return;
      }

      if (formData.title.length < 10) {
        setError('Question title should be at least 10 characters long');
        setLoading(false);
        return;
      }

      if (formData.content.length < 20) {
        setError('Question details should be at least 20 characters long');
        setLoading(false);
        return;
      }

      // Prepare question data
      const questionData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        question_type: formData.question_type,
        priority: formData.priority,
        expert_requested: formData.expert_requested,
        bounty_amount: formData.bounty_amount || 0,
        bounty_currency: 'UGX'
      };

      // Add optional fields if provided
      if (formData.category_id) {
        questionData.category_id = formData.category_id;
      }
      if (formData.crop_type) {
        questionData.crop_type = formData.crop_type;
      }
      if (formData.livestock_type) {
        questionData.livestock_type = formData.livestock_type;
      }
      if (formData.location) {
        questionData.location = formData.location;
      }

      // Get tag IDs for selected tags
      const tagIds = selectedTags
        .map(tagName => availableTags.find(tag => tag.name === tagName)?.id)
        .filter(Boolean);

      // Create the question
      const { data: newQuestion, error } = await createQuestion(questionData, tagIds);

      if (error) {
        setError('Failed to create question. Please try again.');
        console.error('Error creating question:', error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onQuestionCreated?.(newQuestion);
          onClose();
        }, 1500);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error submitting question:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f8fffe 0%, #f3f9f8 100%)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.12), 0 12px 24px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header with gradient background */}
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
        {/* Decorative background pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(50%, -50%)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(-30%, 30%)'
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                backdropFilter: 'blur(10px)'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </Box>
            <Box>
              <Typography variant="h4" component="h2" fontWeight="700" sx={{ mb: 0.5 }}>
                Ask Your Question
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Connect with Uganda's farming community and get expert advice
              </Typography>
            </Box>
          </Box>
          
          {/* Progress indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[1, 2, 3].map((step) => (
                <Box
                  key={step}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: step === 1 ? 'white' : 'rgba(255,255,255,0.3)',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Box>
            <Typography variant="caption" sx={{ ml: 1, opacity: 0.8 }}>
              Step 1 of 3: Question Details
            </Typography>
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0, background: 'transparent' }}>
        {/* Alert messages with improved styling */}
        {(error || success) && (
          <Box sx={{ px: 4, pt: 3 }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                  '& .MuiAlert-icon': { fontSize: 20 },
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.15)'
                }}
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                  '& .MuiAlert-icon': { fontSize: 20 },
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
                }}
              >
                Question posted successfully! Redirecting...
              </Alert>
            )}
          </Box>
        )}

        {/* Main form content with cards */}
        <Box sx={{ px: 4, pb: 2 }}>
          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            {/* Section 1: Core Question */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(76, 175, 80, 0.1)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  '&:hover': {
                    boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box
                  sx={{
                    background: 'linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%)',
                    color: 'white',
                    py: 2,
                    px: 3
                  }}
                >
                  <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      component="span"
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      1
                    </Box>
                    Your Question
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Question Title"
                        fullWidth
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="What's your farming question? Be specific and clear..."
                        helperText={`${formData.title.length}/150 characters`}
                        inputProps={{ maxLength: 150 }}
                        disabled={loading || success}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.25)'
                            }
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Question Details"
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.content}
                        onChange={(e) => handleInputChange('content', e.target.value)}
                        placeholder="Provide detailed information about your question. Include any relevant context, what you've tried, and what specific help you need..."
                        helperText={`${formData.content.length}/1000 characters`}
                        inputProps={{ maxLength: 1000 }}
                        disabled={loading || success}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.25)'
                            }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Section 2: Classification */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(255, 152, 0, 0.1)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  '&:hover': {
                    boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box
                  sx={{
                    background: 'linear-gradient(90deg, #FF9800 0%, #FFB74D 100%)',
                    color: 'white',
                    py: 2,
                    px: 3
                  }}
                >
                  <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      component="span"
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      2
                    </Box>
                    Categorization & Priority
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth disabled={loading || success}>
                        <InputLabel>Category (Optional)</InputLabel>
                        <Select
                          value={formData.category_id}
                          onChange={(e) => handleInputChange('category_id', e.target.value)}
                          label="Category (Optional)"
                          sx={{
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)'
                            }
                          }}
                        >
                          <MenuItem value="">
                            <em>Select a category</em>
                          </MenuItem>
                          {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth disabled={loading || success}>
                        <InputLabel>Question Type</InputLabel>
                        <Select
                          value={formData.question_type}
                          onChange={(e) => handleInputChange('question_type', e.target.value)}
                          label="Question Type"
                          sx={{
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)'
                            }
                          }}
                        >
                          {questionTypes.map((type) => (
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
                      <FormControl fullWidth disabled={loading || success}>
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={formData.priority}
                          onChange={(e) => handleInputChange('priority', e.target.value)}
                          label="Priority"
                          sx={{
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)'
                            }
                          }}
                        >
                          {priorityLevels.map((priority) => (
                            <MenuItem key={priority.value} value={priority.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: priority.color,
                                    mr: 1,
                                    boxShadow: `0 2px 8px ${priority.color}40`
                                  }}
                                />
                                <Typography fontWeight="500">{priority.label}</Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Location (Optional)"
                        fullWidth
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., Kampala, Mbarara, etc."
                        disabled={loading || success}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)'
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.25)'
                            }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Section 3: Agricultural Details */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(33, 150, 243, 0.1)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  '&:hover': {
                    boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box
                  sx={{
                    background: 'linear-gradient(90deg, #2196F3 0%, #64B5F6 100%)',
                    color: 'white',
                    py: 2,
                    px: 3
                  }}
                >
                  <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      component="span"
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      3
                    </Box>
                    Agricultural Context
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        options={cropTypes}
                        value={formData.crop_type}
                        onChange={(event, newValue) => handleInputChange('crop_type', newValue || '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Crop Type (Optional)"
                            placeholder="Select or type crop name"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)'
                                },
                                '&.Mui-focused': {
                                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)'
                                }
                              }
                            }}
                          />
                        )}
                        freeSolo
                        disabled={loading || success}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        options={livestockTypes}
                        value={formData.livestock_type}
                        onChange={(event, newValue) => handleInputChange('livestock_type', newValue || '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Livestock Type (Optional)"
                            placeholder="Select or type livestock"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)'
                                },
                                '&.Mui-focused': {
                                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)'
                                }
                              }
                            }}
                          />
                        )}
                        freeSolo
                        disabled={loading || success}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Autocomplete
                        multiple
                        options={availableTags.map(tag => tag.name)}
                        value={selectedTags}
                        onChange={(event, newValue) => setSelectedTags(newValue)}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option}
                              size="small"
                              {...getTagProps({ index })}
                              key={option}
                              sx={{
                                borderRadius: 2,
                                borderColor: '#2196F3',
                                color: '#2196F3',
                                '&:hover': {
                                  backgroundColor: 'rgba(33, 150, 243, 0.08)'
                                }
                              }}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Tags (Optional)"
                            placeholder="Add relevant tags to help categorize your question"
                            helperText="Select up to 5 tags that describe your question"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)'
                                },
                                '&.Mui-focused': {
                                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)'
                                }
                              }
                            }}
                          />
                        )}
                        limitTags={5}
                        disabled={loading || success}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Section 4: Expert Request */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  border: formData.expert_requested ? '2px solid #9C27B0' : '1px solid rgba(156, 39, 176, 0.1)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  background: formData.expert_requested ? 'linear-gradient(135deg, rgba(156, 39, 176, 0.02) 0%, rgba(156, 39, 176, 0.05) 100%)' : 'white',
                  '&:hover': {
                    boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box
                  sx={{
                    background: 'linear-gradient(90deg, #9C27B0 0%, #BA68C8 100%)',
                    color: 'white',
                    py: 2,
                    px: 3
                  }}
                >
                  <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      component="span"
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      ★
                    </Box>
                    Expert Assistance
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.expert_requested}
                        onChange={(e) => handleInputChange('expert_requested', e.target.checked)}
                        disabled={loading || success}
                        sx={{
                          '& .MuiSwitch-thumb': {
                            boxShadow: formData.expert_requested ? '0 4px 12px rgba(156, 39, 176, 0.4)' : undefined
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="500">Request Expert Attention</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Flag this question for priority review by our agricultural specialists
                        </Typography>
                      </Box>
                    }
                  />

                  {formData.expert_requested && (
                    <Box
                      sx={{
                        mt: 3,
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(156, 39, 176, 0.1) 100%)',
                        border: '1px dashed rgba(156, 39, 176, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Typography variant="body2" color="primary" fontWeight="500" sx={{ mb: 2 }}>
                        💰 Offer a Bounty (Optional)
                      </Typography>
                      <TextField
                        label="Bounty Amount (UGX)"
                        type="number"
                        value={formData.bounty_amount}
                        onChange={(e) => handleInputChange('bounty_amount', Number(e.target.value))}
                        placeholder="0"
                        helperText="Offer a reward to incentivize quality expert answers"
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                              <Typography sx={{ fontWeight: 'bold', color: 'primary.main' }}>UGX</Typography>
                            </Box>
                          ),
                        }}
                        disabled={loading || success}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            background: 'white',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(156, 39, 176, 0.15)'
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(156, 39, 176, 0.25)'
                            }
                          }
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{ textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || success || !formData.title.trim() || !formData.content.trim()}
          startIcon={loading && <CircularProgress size={20} />}
          sx={{ textTransform: 'none', minWidth: 120 }}
        >
          {loading ? 'Posting...' : 'Post Question'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AskQuestion;
