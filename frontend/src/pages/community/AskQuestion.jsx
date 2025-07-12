import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
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
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Help as HelpIcon
} from '@mui/icons-material';

import { createQuestion, getForumCategories, getPopularTags } from '../../services/api/communityService';

const AskQuestion = ({ open, onClose, onQuestionCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    priority: 'medium',
    location: ''
  });
  
  const [selectedTags, setSelectedTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Simplified priority levels
  const priorityLevels = [
    { value: 'low', label: 'Low Priority', color: '#4CAF50' },
    { value: 'medium', label: 'Medium Priority', color: '#FF9800' },
    { value: 'high', label: 'High Priority', color: '#f44336' }
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
        priority: 'medium',
        location: ''
      });
      setSelectedTags([]);
      setError('');
      setSuccess(false);
    }
  }, [open]);

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
        priority: formData.priority
      };

      // Add optional fields if provided
      if (formData.category_id) {
        questionData.category_id = formData.category_id;
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
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      {/* Simple Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
          color: 'white',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <HelpIcon />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Ask a Question
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Get help from the farming community
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* Alert messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            Question posted successfully! Redirecting...
          </Alert>
        )}

        {/* Simple Form */}
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Question Title */}
          <TextField
            label="What's your question?"
            placeholder="Be specific and clear about what you need help with..."
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            disabled={loading || success}
            required
            inputProps={{ maxLength: 150 }}
            helperText={`${formData.title.length}/150 characters`}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />

          {/* Question Details */}
          <TextField
            label="Provide more details"
            placeholder="Describe your situation, what you've tried, and what specific help you need..."
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            disabled={loading || success}
            required
            multiline
            rows={4}
            inputProps={{ maxLength: 1000 }}
            helperText={`${formData.content.length}/1000 characters`}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />

          {/* Row with Category and Priority */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 200, flex: 1 }} disabled={loading || success}>
              <InputLabel>Category (Optional)</InputLabel>
              <Select
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                label="Category (Optional)"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">
                  <em>No category</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150, flex: 1 }} disabled={loading || success}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                label="Priority"
                sx={{ borderRadius: 2 }}
              >
                {priorityLevels.map((priority) => (
                  <MenuItem key={priority.value} value={priority.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: priority.color
                        }}
                      />
                      {priority.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Location */}
          <TextField
            label="Your location (Optional)"
            placeholder="e.g., Kampala, Mbarara..."
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            disabled={loading || success}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  📍
                </InputAdornment>
              )
            }}
          />

          {/* Tags */}
          <Autocomplete
            multiple
            options={availableTags.map(tag => tag.name)}
            value={selectedTags}
            onChange={(event, newValue) => setSelectedTags(newValue.slice(0, 5))}
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
                    borderColor: '#4CAF50',
                    color: '#4CAF50'
                  }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add tags (Optional)"
                placeholder="Select up to 5 relevant tags..."
                helperText="Tags help others find and answer your question"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            )}
            disabled={loading || success}
            limitTags={5}
          />
        </Box>
      </DialogContent>

      {/* Simple Footer */}
      <Box sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || success || !formData.title.trim() || !formData.content.trim()}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          sx={{ 
            textTransform: 'none', 
            minWidth: 120,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)'
            }
          }}
        >
          {loading ? 'Posting...' : 'Post Question'}
        </Button>
      </Box>
    </Dialog>
  );
};

export default AskQuestion;
