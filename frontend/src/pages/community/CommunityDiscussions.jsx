import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, Typography, TextField, Button, InputAdornment, 
  IconButton, Paper, Card, CardContent, Chip, Avatar,
  CircularProgress, FormControl, InputLabel, Select, MenuItem,
  Collapse, Fade, useTheme
} from '@mui/material';
import { useAppTheme } from '../../context/ThemeContext';

import { getPosts, getForumCategories, getPopularTags } from '../../services/api/communityService';

const CommunityDiscussions = ({ 
  searchTerm, 
  selectedCategory,
  formatDate,
  user,
  setSearchTerm,
  handleOpenPostModal,
  forumCategories: propForumCategories,
  popularTags: propPopularTags
}) => {
  const theme = useTheme();
  const { themeMode } = useAppTheme();
  const isDark = themeMode === 'dark';
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forumCategories, setForumCategories] = useState(propForumCategories || []);
  const [popularTags, setPopularTags] = useState(propPopularTags || []);
  const [showFilters, setShowFilters] = useState(false);
  const [localSelectedCategory, setLocalSelectedCategory] = useState(selectedCategory || 'all');
  const [selectedTag, setSelectedTag] = useState('');

  // Update state when props change
  useEffect(() => {
    if (propForumCategories) {
      setForumCategories(propForumCategories);
    }
    if (propPopularTags) {
      setPopularTags(propPopularTags);
    }
  }, [propForumCategories, propPopularTags]);

  // Fetch categories and tags only if not provided via props
  useEffect(() => {
    const fetchData = async () => {
      if (!propForumCategories || !propPopularTags) {
        try {
          const promises = [];
          
          if (!propForumCategories) {
            promises.push(getForumCategories());
          }
          
          if (!propPopularTags) {
            promises.push(getPopularTags(15));
          }
          
          const results = await Promise.all(promises);
          
          let categoriesIndex = 0;
          let tagsIndex = !propForumCategories ? 1 : 0;
          
          if (!propForumCategories && results[categoriesIndex]?.data) {
            setForumCategories(results[categoriesIndex].data);
          }

          if (!propPopularTags && results[tagsIndex]?.data) {
            setPopularTags(results[tagsIndex].data);
          }
        } catch (error) {
          console.error('Error fetching filter data:', error);
        }
      }
    };

    fetchData();
  }, [propForumCategories, propPopularTags]);

  // Fetch posts from the database
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const options = {
          limit: 20
        };
        
        // Add category filter if not 'all'
        if (localSelectedCategory && localSelectedCategory !== 'all') {
          options.category_id = localSelectedCategory;
        }
        
        const { data, error } = await getPosts(options);
        
        if (error) {
          console.error('Error fetching posts:', error);
          setPosts([]);
        } else {
          // Transform the data to match component expectations
          const transformedPosts = (data || []).map(post => ({
            ...post,
            author: {
              id: post.user?.id,
              name: `${post.user?.first_name || ''} ${post.user?.last_name || ''}`.trim() || 'Unknown User',
              avatar: post.user?.avatar_url
            },
            date: post.created_at,
            comments: post.comments_count || 0,
            likes: post.likes_count || post.likes || 0
          }));
          setPosts(transformedPosts);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [localSelectedCategory]);

  // Filter posts based on search term and selected tag
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags?.some(tag => tag.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTag = !selectedTag || 
      post.tags?.some(tag => tag.name?.toLowerCase() === selectedTag.toLowerCase());

    return matchesSearch && matchesTag;
  });

  const handleCategoryChange = (categoryId) => {
    setLocalSelectedCategory(categoryId);
  };

  const handleTagSelect = (tagName) => {
    setSelectedTag(selectedTag === tagName ? '' : tagName);
  };
    
  return (
    <div className="w-full">
      <div className="flex flex-col xl:flex-row xl:gap-6 mb-8">
        <div className="flex-1 xl:flex-[3]">
        {/* Search bar */}
        <Paper
          elevation={2}
          sx={{
            p: 0,
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: theme.palette.background.paper,
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: isDark 
                ? `0 4px 20px ${theme.palette.grey[900]}40`
                : `0 4px 20px ${theme.palette.grey[400]}30`
            }
          }}
        >
          <TextField
            fullWidth
            placeholder="Search discussions, topics, or keywords..."
            value={searchTerm}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: 'none',
                },
              },
              '& .MuiInputBase-input': {
                py: 2,
                px: 3,
              }
            }}
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
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton 
                    edge="end" 
                    onClick={() => setSearchTerm('')}
                    sx={{ mr: 1 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      style={{ color: '#9e9e9e' }}
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
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
              py: 2, 
              px: 3,
              height: '100%',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              }
            }}
          >
            Search
          </Button>
        </Paper>

        {/* Filters Section */}
        <Paper
          elevation={1}
          sx={{
            mb: 3,
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          {/* Filter Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: isDark 
                ? `${theme.palette.primary.dark}20`
                : `${theme.palette.primary.light}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderBottom: showFilters ? `1px solid ${theme.palette.divider}` : 'none'
            }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                Filter & Browse
              </Typography>
              <Box sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                px: 1.5, 
                py: 0.5, 
                borderRadius: '12px', 
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {filteredPosts.length} posts
              </Box>
            </Box>
            <IconButton
              sx={{
                transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </IconButton>
          </Box>

          {/* Filter Content */}
          <Collapse in={showFilters}>
            <Box sx={{ p: 3 }}>
              {/* Categories Filter */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Categories
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {/* All Categories */}
                  <Chip
                    label={`All (${forumCategories.reduce((sum, cat) => sum + (cat.post_count || 0), 0)})`}
                    onClick={() => handleCategoryChange('all')}
                    color={localSelectedCategory === 'all' ? 'primary' : 'default'}
                    variant={localSelectedCategory === 'all' ? 'filled' : 'outlined'}
                    sx={{ 
                      fontWeight: localSelectedCategory === 'all' ? 'bold' : 'normal',
                      borderRadius: 2,
                      '&:hover': { transform: 'translateY(-2px)' },
                      transition: 'all 0.2s ease'
                    }}
                  />
                  {forumCategories.map((category) => (
                    <Chip
                      key={category.id}
                      label={`${category.name} (${category.post_count || 0})`}
                      onClick={() => handleCategoryChange(category.id)}
                      color={localSelectedCategory === category.id ? 'primary' : 'default'}
                      variant={localSelectedCategory === category.id ? 'filled' : 'outlined'}
                      sx={{ 
                        fontWeight: localSelectedCategory === category.id ? 'bold' : 'normal',
                        borderRadius: 2,
                        '&:hover': { transform: 'translateY(-2px)' },
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Popular Tags Filter */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Popular Tags
                  {selectedTag && (
                    <Button
                      size="small"
                      onClick={() => setSelectedTag('')}
                      sx={{ 
                        ml: 1, 
                        minWidth: 'auto',
                        fontSize: '0.75rem',
                        textTransform: 'none'
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {popularTags.slice(0, 12).map((tag, index) => (
                    <Chip
                      key={tag.id || index}
                      label={`${tag.name} (${tag.usage_count || tag.count || 0})`}
                      onClick={() => handleTagSelect(tag.name)}
                      color={selectedTag === tag.name ? 'secondary' : 'default'}
                      variant={selectedTag === tag.name ? 'filled' : 'outlined'}
                      size="small"
                      sx={{ 
                        fontWeight: selectedTag === tag.name ? 'bold' : 'normal',
                        borderRadius: 2,
                        '&:hover': { transform: 'translateY(-2px)' },
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Active Filters Summary */}
              {(localSelectedCategory !== 'all' || selectedTag) && (
                <Box sx={{ 
                  mt: 3, 
                  pt: 2, 
                  borderTop: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary">
                      Active filters:
                    </Typography>
                    {localSelectedCategory !== 'all' && (
                      <Chip
                        label={forumCategories.find(cat => cat.id === localSelectedCategory)?.name || 'Category'}
                        onDelete={() => handleCategoryChange('all')}
                        size="small"
                        color="primary"
                      />
                    )}
                    {selectedTag && (
                      <Chip
                        label={selectedTag}
                        onDelete={() => setSelectedTag('')}
                        size="small"
                        color="secondary"
                      />
                    )}
                  </Box>
                  <Button
                    size="small"
                    onClick={() => {
                      setLocalSelectedCategory('all');
                      setSelectedTag('');
                    }}
                    sx={{ textTransform: 'none' }}
                  >
                    Clear All
                  </Button>
                </Box>
              )}
            </Box>
          </Collapse>
        </Paper>

        {/* Create post button - only show for logged in users */}
        {user && (
          <Card 
            elevation={2}
            sx={{
              mb: 8,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              overflow: 'hidden',
              bgcolor: theme.palette.background.paper,
              '&:hover': {
                boxShadow: 6
              }
            }}
          >
            <Box sx={{ 
              p: 0, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'stretch'
            }}>
              <Box sx={{
                p: 3,
                background: isDark 
                  ? `linear-gradient(to right, ${theme.palette.primary.dark}30, ${theme.palette.primary.dark}15)`
                  : `linear-gradient(to right, ${theme.palette.primary.light}20, ${theme.palette.primary.light}10)`,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  Share with the Community
                </Typography>
                {user && (
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    boxShadow: isDark 
                      ? `0 2px 10px ${theme.palette.grey[900]}40`
                      : `0 2px 10px ${theme.palette.grey[400]}40`
                  }}>
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </Box>
                )}
              </Box>
              
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <TextField
                  placeholder="What's on your mind?"
                  fullWidth
                  variant="outlined"
                  onClick={handleOpenPostModal}
                  sx={{
                    mb: 3,
                    cursor: 'pointer',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: isDark ? theme.palette.grey[800] : theme.palette.grey[100],
                      '&:hover': {
                        bgcolor: isDark ? theme.palette.grey[700] : theme.palette.grey[200],
                      }
                    }
                  }}
                  InputProps={{
                    readOnly: true,
                    startAdornment: user && (
                      <InputAdornment position="start">
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1
                        }}>
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </Box>
                      </InputAdornment>
                    )
                  }}
                />
                <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={handleOpenPostModal}
                    startIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4a.5.5 0 01-.5-.5v-6.5a.5.5 0 01.5-.5h12a.5.5 0 01.5.5V15a.5.5 0 01-.5.5zM4 4.5V6h12V4.5a.5.5 0 00-.5-.5H4.5a.5.5 0 00-.5.5z" clipRule="evenodd" />
                      </svg>
                    }
                    sx={{
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                    }}
                  >
                    Photo
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    fullWidth
                    onClick={handleOpenPostModal}
                    startIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                      </svg>
                    }
                    sx={{
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                    }}
                  >
                    Discussion
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={handleOpenPostModal}
                    startIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    }
                    sx={{
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                    }}
                  >
                    Question
                  </Button>
                </Box>
              </Box>
            </Box>
          </Card>
        )}

        {/* Section Title */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" fontWeight="bold" color="text.primary">
            Recent Discussions
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Join the conversation with fellow farmers across Uganda
          </Typography>
        </Box>

        {/* Discussion posts */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={40} />
            </Box>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
            <Card 
              key={post.id} 
              elevation={2}
              sx={{ 
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              {/* Card Header with Author info */}
              <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      height: 56, 
                      width: 56, 
                      borderRadius: '50%', 
                      bgcolor: 'grey.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'text.secondary',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      mr: 2,
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {post.author.avatar ? (
                      <img src={post.author.avatar} alt={post.author.name} style={{ height: '100%', width: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      post.author.name.charAt(0)
                    )}
                  </Box>
                  <Box>
                    <Link 
                      to={`/profile/${post.author.id}`} 
                      style={{ 
                        fontWeight: 600, 
                        color: '#1a1a1a', 
                        fontSize: '1.125rem',
                        textDecoration: 'none'
                      }}
                      sx={{ '&:hover': { color: 'primary.main' } }}
                    >
                      {post.author.name}
                    </Link>
                    <Box sx={{ 
                      color: 'text.secondary', 
                      fontSize: '0.875rem', 
                      display: 'flex', 
                      alignItems: 'center',
                      mt: 0.5
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDate(post.date)}
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              {/* Card Content */}
              <Box sx={{ p: 3, flexGrow: 1 }}>
                <Link to={`/community/post/${post.id}`} style={{ textDecoration: 'none' }}>
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    fontWeight="bold" 
                    color="text.primary" 
                    sx={{ 
                      mb: 2,
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    {post.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {post.content}
                  </Typography>
                </Link>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3, mb: 1 }}>
                  {post.tags.map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag}
                      size="small"
                      sx={{ 
                        bgcolor: 'primary.light', 
                        color: 'primary.dark',
                        fontWeight: 500,
                        '&:hover': { bgcolor: 'primary.main', color: 'white' }
                      }}
                    />
                  ))}
                </Box>
              </Box>
              
              {/* Card Footer with actions */}
              <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: isDark ? theme.palette.grey[900] : theme.palette.grey[50] }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
                  <Button 
                    startIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                    }
                    sx={{ 
                      color: 'text.secondary', 
                      '&:hover': { color: 'primary.main' } 
                    }}
                  >
                    {post.likes}
                  </Button>
                  <Button 
                    component={Link} 
                    to={`/community/post/${post.id}`}
                    startIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                      </svg>
                    }
                    sx={{ 
                      color: 'text.secondary', 
                      '&:hover': { color: 'primary.main' } 
                    }}
                  >
                    {post.comments}
                  </Button>
                  <Button 
                    startIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                      </svg>
                    }
                    sx={{ 
                      color: 'text.secondary', 
                      '&:hover': { color: 'primary.main' } 
                    }}
                  >
                    Share
                  </Button>
                </Box>
              </Box>
              
              {/* Card Action */}
              <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
                <Button 
                  component={Link}
                  to={`/community/post/${post.id}`}
                  variant="outlined" 
                  color="primary"
                  fullWidth
                  sx={{ 
                    borderRadius: 2,
                    '&:hover': { 
                      bgcolor: 'primary.main', 
                      color: 'white' 
                    }
                  }}
                >
                  Read Full Discussion
                </Button>
              </Box>
            </Card>
          ))
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              px: 4,
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No discussions found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm 
                  ? `No discussions match "${searchTerm}". Try different keywords.`
                  : selectedCategory !== 'all' 
                    ? 'No discussions in this category yet. Be the first to start one!'
                    : 'No discussions yet. Start the conversation!'
                }
              </Typography>
              {user && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenPostModal}
                  sx={{ mt: 3, borderRadius: 2 }}
                  startIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  Start a Discussion
                </Button>
              )}
            </Box>
          )}
        </div>
        
        {/* Pagination */}
        <div className="mt-10 flex justify-center">
          <nav aria-label="Pagination" className="inline-flex shadow-sm rounded-md overflow-hidden">
            <Box 
              component="a" 
              href="#" 
              sx={{ 
                py: 2, 
                px: 4, 
                bgcolor: theme.palette.background.paper, 
                border: `1px solid ${theme.palette.divider}`, 
                color: theme.palette.text.secondary,
                '&:hover': { 
                  bgcolor: isDark ? theme.palette.grey[700] : theme.palette.grey[50], 
                  color: theme.palette.primary.main 
                },
                transition: 'colors 0.2s ease'
              }}
            >
              <span className="sr-only">Previous</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
            </Box>
            <Box 
              component="a" 
              href="#" 
              aria-current="page" 
              sx={{ 
                py: 2, 
                px: 4, 
                bgcolor: theme.palette.primary.main, 
                color: 'white', 
                fontWeight: 'medium', 
                border: `1px solid ${theme.palette.primary.main}` 
              }}
            >
              1
            </Box>
            <Box 
              component="a" 
              href="#" 
              sx={{ 
                py: 2, 
                px: 4, 
                bgcolor: theme.palette.background.paper, 
                border: `1px solid ${theme.palette.divider}`, 
                color: theme.palette.text.secondary,
                '&:hover': { 
                  bgcolor: isDark ? theme.palette.grey[700] : theme.palette.grey[50], 
                  color: theme.palette.primary.main 
                },
                transition: 'colors 0.2s ease'
              }}
            >
              2
            </Box>
            <Box 
              component="a" 
              href="#" 
              sx={{ 
                py: 2, 
                px: 4, 
                bgcolor: theme.palette.background.paper, 
                border: `1px solid ${theme.palette.divider}`, 
                color: theme.palette.text.secondary,
                '&:hover': { 
                  bgcolor: isDark ? theme.palette.grey[700] : theme.palette.grey[50], 
                  color: theme.palette.primary.main 
                },
                transition: 'colors 0.2s ease'
              }}
            >
              3
            </Box>
            <Box 
              component="a" 
              href="#" 
              sx={{ 
                py: 2, 
                px: 4, 
                bgcolor: theme.palette.background.paper, 
                border: `1px solid ${theme.palette.divider}`, 
                color: theme.palette.text.secondary,
                '&:hover': { 
                  bgcolor: isDark ? theme.palette.grey[700] : theme.palette.grey[50], 
                  color: theme.palette.primary.main 
                },
                transition: 'colors 0.2s ease'
              }}
            >
              <span className="sr-only">Next</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
            </Box>
          </nav>
        </div>
      </div>
      
      {/* Right sidebar - only visible on xl screens and above */}
      <div className="hidden xl:block xl:flex-[1]">
        <Box 
          sx={{ 
            position: 'sticky',
            top: '20px',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {/* Active members */}
          <Card elevation={2} sx={{ bgcolor: theme.palette.background.paper }}>
            <CardContent sx={{ bgcolor: theme.palette.warning.main, color: 'white', py: 1.5, textAlign: 'center' }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                Active Discussants
              </Typography>
            </CardContent>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                These members are actively participating in discussions:
              </Typography>
              
              {/* Active members list with full names */}
              <Box 
                sx={{ 
                  maxHeight: '220px', 
                  overflowY: 'auto',
                  mb: 2,
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f1f1',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.warning.main,
                    borderRadius: '10px',
                  }
                }}
              >
                {[
                  { initials: 'JM', name: 'John Muwanga', posts: 12 },
                  { initials: 'SA', name: 'Sarah Adeke', posts: 8 },
                  { initials: 'RO', name: 'Robert Okello', posts: 15 },
                  { initials: 'DN', name: 'David Namanya', posts: 7 },
                  { initials: 'AE', name: 'Alice Ejoku', posts: 10 },
                  { initials: 'PT', name: 'Peter Tusiime', posts: 6 },
                  { initials: 'MK', name: 'Mary Karungi', posts: 9 }
                ].map((member, i) => (
                  <Box 
                    key={i} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 1.5,
                      pb: 1.5,
                      borderBottom: i < 6 ? `1px solid ${theme.palette.divider}` : 'none'
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: '50%', 
                        bgcolor: theme.palette.warning.main, 
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        flexShrink: 0
                      }}
                    >
                      {member.initials}
                    </Box>
                    <Box sx={{ ml: 1.5, flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {member.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.posts} posts this week
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ 
                  borderColor: theme.palette.warning.main, 
                  color: theme.palette.warning.main,
                  '&:hover': {
                    backgroundColor: isDark ? `${theme.palette.warning.dark}20` : `${theme.palette.warning.light}20`,
                    borderColor: theme.palette.warning.main
                  }
                }}
              >
                Join Discussion
              </Button>
            </Box>
          </Card>

          {/* Popular discussions */}
          <Card elevation={2} sx={{ bgcolor: theme.palette.background.paper }}>
            <CardContent sx={{ bgcolor: theme.palette.success.main, color: 'white', py: 1.5, textAlign: 'center' }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                Trending Topics
              </Typography>
            </CardContent>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Hot discussions in the community:
              </Typography>
              <Box 
                sx={{ 
                  maxHeight: '220px', 
                  overflowY: 'auto',
                  mb: 2,
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f1f1',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.success.main,
                    borderRadius: '10px',
                  }
                }}
              >
                {[
                  { 
                    title: 'Best fertilizers for maize in Central Uganda',
                    author: 'Robert Okello',
                    replies: 24,
                    lastActive: '2 hours ago'
                  },
                  { 
                    title: 'How to manage coffee berry disease',
                    author: 'Sarah Adeke',
                    replies: 18,
                    lastActive: '5 hours ago'
                  },
                  { 
                    title: 'Water conservation techniques for dry season',
                    author: 'David Namanya',
                    replies: 32,
                    lastActive: '1 day ago'
                  },
                  { 
                    title: 'Market prices for organic produce',
                    author: 'Mary Karungi',
                    replies: 15,
                    lastActive: '2 days ago'
                  },
                  { 
                    title: 'Effective pest control for tomatoes',
                    author: 'John Muwanga',
                    replies: 27,
                    lastActive: '3 days ago'
                  },
                  { 
                    title: 'Best practices for poultry farming',
                    author: 'Alice Ejoku',
                    replies: 21,
                    lastActive: '3 days ago'
                  }
                ].map((topic, i) => (
                  <Box 
                    key={i} 
                    sx={{ 
                      mb: 2,
                      pb: 2,
                      borderBottom: i < 5 ? `1px solid ${theme.palette.divider}` : 'none',
                      '&:hover': { 
                        '& .topic-title': { color: theme.palette.success.main }
                      },
                      cursor: 'pointer'
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      fontWeight="medium"
                      className="topic-title"
                      sx={{ 
                        mb: 0.5,
                        transition: 'color 0.2s ease'
                      }}
                    >
                      {topic.title}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        by {topic.author}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                          </svg>
                          {topic.replies}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {topic.lastActive}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ 
                  borderColor: theme.palette.success.main, 
                  color: theme.palette.success.main,
                  '&:hover': {
                    backgroundColor: isDark ? `${theme.palette.success.dark}20` : `${theme.palette.success.light}20`,
                    borderColor: theme.palette.success.main
                  }
                }}
              >
                View All Topics
              </Button>
            </Box>
          </Card>
        </Box>
      </div>
      </div>
    </div>
  );
};

export default CommunityDiscussions; 