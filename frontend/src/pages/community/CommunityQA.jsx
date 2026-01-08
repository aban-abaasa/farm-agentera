import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Button, TextField, 
  InputAdornment, IconButton, Paper, Divider, Avatar, Chip, 
  Grid, List, ListItem, ListItemText, ListItemAvatar,
  CircularProgress
} from '@mui/material';

import { getQuestions, getForumCategories } from '../../services/api/communityService';
import AskQuestion from './AskQuestion';

// Expert users for Q&A section
const experts = [
  { id: "exp1", name: "Dr. Samuel Muwonge", role: "Agricultural Scientist", answers: 47 },
  { id: "exp2", name: "Jane Nakato", role: "Extension Officer", answers: 36 },
  { id: "exp3", name: "Prof. Robert Mukasa", role: "Livestock Specialist", answers: 28 }
];

const CommunityQA = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [askQuestionOpen, setAskQuestionOpen] = useState(false);
  // const [categories, setCategories] = useState([]); // TODO: Use for advanced filtering
  
  // Popular categories for Q&A - will be calculated from real data
  const [qaCategories, setQaCategories] = useState([
    { id: "all", name: "All Questions", count: 0 },
    { id: "unanswered", name: "Unanswered", count: 0 },
    { id: "open", name: "Open", count: 0 },
    { id: "answered", name: "Answered", count: 0 },
    { id: "closed", name: "Closed", count: 0 }
  ]);

  // Fetch questions and categories from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch questions
        const { data: questionsData, error: questionsError } = await getQuestions({ limit: 50 });
        
        if (questionsError) {
          console.error('Error fetching questions:', questionsError);
          setQuestions([]);
        } else {
          // Transform database questions to match component expectations
          const transformedQuestions = (questionsData || []).map(question => ({
            id: question.id,
            title: question.title,
            content: question.content,
            author: question.user ? 
              `${question.user.first_name || ''} ${question.user.last_name || ''}`.trim() || 'Anonymous' :
              'Anonymous',
            authorAvatar: question.user?.avatar_url || '',
            date: question.created_at,
            status: question.status || 'open', // 'open', 'answered', 'closed'
            priority: question.priority || 'medium',
            views: question.views || 0,
            votes: 0, // TODO: Calculate from answer_votes table
            answers: 0, // TODO: Get actual count from question_answers table
            tags: question.tags?.map(tag => tag.name) || [],
            category: question.category?.name || 'General',
            question_type: question.question_type || 'general',
            bounty_amount: question.bounty_amount || 0,
            expert_requested: question.expert_requested || false,
            crop_type: question.crop_type,
            livestock_type: question.livestock_type,
            location: question.location
          }));

          setQuestions(transformedQuestions);

          // Update categories with counts
          const categoryCounts = {
            all: transformedQuestions.length,
            unanswered: transformedQuestions.filter(q => q.status === 'open' && q.answers === 0).length,
            open: transformedQuestions.filter(q => q.status === 'open').length,
            answered: transformedQuestions.filter(q => q.status === 'answered').length,
            closed: transformedQuestions.filter(q => q.status === 'closed').length
          };

          setQaCategories([
            { id: "all", name: "All Questions", count: categoryCounts.all },
            { id: "unanswered", name: "Unanswered", count: categoryCounts.unanswered },
            { id: "open", name: "Open", count: categoryCounts.open },
            { id: "answered", name: "Answered", count: categoryCounts.answered },
            { id: "closed", name: "Closed", count: categoryCounts.closed }
          ]);
        }

        // Fetch forum categories (TODO: Use for advanced filtering)
        const { error: categoriesError } = await getForumCategories();
        
        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
        }
        
      } catch (error) {
        console.error('Error fetching Q&A data:', error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle new question creation
  const handleQuestionCreated = (newQuestion) => {
    // Transform the new question to match our format
    const transformedQuestion = {
      id: newQuestion.id,
      title: newQuestion.title,
      content: newQuestion.content,
      author: 'You', // Current user
      authorAvatar: '',
      date: newQuestion.created_at,
      status: newQuestion.status || 'open',
      priority: newQuestion.priority || 'medium',
      views: 0,
      votes: 0,
      answers: 0,
      tags: [], // Tags will be loaded separately
      category: 'General',
      question_type: newQuestion.question_type || 'general',
      bounty_amount: newQuestion.bounty_amount || 0,
      expert_requested: newQuestion.expert_requested || false,
      crop_type: newQuestion.crop_type,
      livestock_type: newQuestion.livestock_type,
      location: newQuestion.location
    };

    // Add to the beginning of the questions list
    setQuestions(prev => [transformedQuestion, ...prev]);
    
    // Update category counts
    setQaCategories(prev => prev.map(cat => {
      if (cat.id === 'all') {
        return { ...cat, count: cat.count + 1 };
      } else if (cat.id === 'open') {
        return { ...cat, count: cat.count + 1 };
      } else if (cat.id === 'unanswered') {
        return { ...cat, count: cat.count + 1 };
      }
      return cat;
    }));
  };

  // Filter and sort questions
  const filteredQuestions = questions
    .filter(question => {
      const matchesSearch = 
        searchTerm === '' || 
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = 
        selectedCategory === 'all' || 
        (selectedCategory === 'unanswered' && question.status === 'open' && question.answers === 0) ||
        (selectedCategory === 'open' && question.status === 'open') ||
        (selectedCategory === 'answered' && question.status === 'answered') ||
        (selectedCategory === 'closed' && question.status === 'closed') ||
        question.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()));
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'votes') {
        return b.votes - a.votes;
      } else if (sortBy === 'answers') {
        return b.answers - a.answers;
      } else if (sortBy === 'views') {
        return b.views - a.views;
      }
      return 0;
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else {
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={9} xl={10}>
          {/* Header and filter controls */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2" fontWeight="bold">
              Questions & Answers
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              }
              sx={{ borderRadius: 2, textTransform: 'none' }}
              onClick={() => setAskQuestionOpen(true)}
            >
              Ask a Question
            </Button>
          </Box>

          {/* Search Bar */}
          <Paper
            elevation={2}
            sx={{
              p: 0,
              display: 'flex',
              alignItems: 'center',
              mb: 3,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <TextField
              fullWidth
              placeholder="Search for questions or topics..."
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

          {/* Category Chips */}
          <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {qaCategories.map(category => (
              <Chip
                key={category.id}
                label={`${category.name} (${category.count})`}
                onClick={() => setSelectedCategory(category.id)}
                color={selectedCategory === category.id ? 'primary' : 'default'}
                variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Box>

          {/* Sort controls */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* <Typography variant="body2" color="text.secondary">
              Showing {filteredQuestions.length} questions
              {selectedCategory !== 'all' && ` in ${qaCategories.find(c => c.id === selectedCategory)?.name}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </Typography> */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Sort by:
              </Typography>
              <Button 
                size="small" 
                variant={sortBy === 'newest' ? 'contained' : 'outlined'}
                onClick={() => setSortBy('newest')}
                sx={{ minWidth: 0, mr: 1, borderRadius: 1, textTransform: 'none' }}
              >
                Newest
              </Button>
              <Button 
                size="small" 
                variant={sortBy === 'votes' ? 'contained' : 'outlined'}
                onClick={() => setSortBy('votes')}
                sx={{ minWidth: 0, mr: 1, borderRadius: 1, textTransform: 'none' }}
              >
                Votes
              </Button>
              <Button 
                size="small" 
                variant={sortBy === 'answers' ? 'contained' : 'outlined'}
                onClick={() => setSortBy('answers')}
                sx={{ minWidth: 0, mr: 1, borderRadius: 1, textTransform: 'none' }}
              >
                Answers
              </Button>
              <Button 
                size="small" 
                variant={sortBy === 'views' ? 'contained' : 'outlined'}
                onClick={() => setSortBy('views')}
                sx={{ minWidth: 0, borderRadius: 1, textTransform: 'none' }}
              >
                Views
              </Button>
            </Box>
          </Box>

          {/* Questions list */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={40} />
            </Box>
          ) : filteredQuestions.length > 0 ? (
            <>
              {filteredQuestions.map((question) => (
                <Card 
                  key={question.id} 
                  sx={{ 
                    mb: 2, 
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                    }
                  }}
                >
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={9}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <Avatar 
                        sx={{ width: 40, height: 40, bgcolor: 'primary.main', mr: 1.5 }}
                      >
                        {question.authorAvatar || question.author.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Asked by <span style={{ fontWeight: 'bold' }}>{question.author}</span> · {formatDate(question.date)}
                        </Typography>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                          {question.title}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {question.content.length > 180 
                        ? `${question.content.substring(0, 180)}...` 
                        : question.content}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {question.tags.map((tag, tagIndex) => (
                        <Chip
                          key={tagIndex}
                          label={tag}
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(76, 175, 80, 0.1)', 
                            color: 'primary.main',
                            borderRadius: 1,
                            fontSize: '0.7rem'
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                      <Box>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                              {question.votes}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              votes
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 'bold',
                                color: question.answers > 0 ? 'success.main' : 'text.secondary' 
                              }}
                            >
                              {question.answers}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              answers
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                              {question.views}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              views
                            </Typography>
                          </Box>
                        </Box>
                        {(question.status === 'open' && question.answers === 0) && (
                          <Chip 
                            label="Unanswered" 
                            color="warning" 
                            size="small"
                            sx={{ 
                              display: 'block', 
                              mx: 'auto',
                              mb: 1,
                              fontWeight: 'bold'
                            }}
                          />
                        )}
                        {question.status === 'answered' && (
                          <Chip 
                            label="Answered" 
                            color="success" 
                            size="small"
                            sx={{ 
                              display: 'block', 
                              mx: 'auto',
                              mb: 1,
                              fontWeight: 'bold'
                            }}
                          />
                        )}
                        {question.status === 'closed' && (
                          <Chip 
                            label="Closed" 
                            color="default" 
                            size="small"
                            sx={{ 
                              display: 'block', 
                              mx: 'auto',
                              mb: 1,
                              fontWeight: 'bold'
                            }}
                          />
                        )}
                      </Box>
                      <Button 
                        variant="outlined" 
                        color="primary"
                        fullWidth
                        sx={{ 
                          mt: 1,
                          borderRadius: 1,
                          textTransform: 'none'
                        }}
                        // TODO: Implement navigation to question detail view with getQuestionById API
                      >
                        View Question
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
              ))}
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No questions found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Try adjusting your search criteria or category filter
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ textTransform: 'none' }}
                onClick={() => setAskQuestionOpen(true)}
              >
                Ask the First Question
              </Button>
            </Box>
          )}

          {/* Pagination */}
          {filteredQuestions.length > 0 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                color="primary"
                sx={{ textTransform: 'none', px: 3, mr: 1 }}
              >
                Previous
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                sx={{ minWidth: 40, mx: 0.5 }}
              >
                1
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                sx={{ minWidth: 40, mx: 0.5 }}
              >
                2
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                sx={{ minWidth: 40, mx: 0.5 }}
              >
                3
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                sx={{ textTransform: 'none', px: 3, ml: 1 }}
              >
                Next
              </Button>
            </Box>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={3} xl={2}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            {/* Ask Question Card */}
            <Card sx={{ mb: 3, borderRadius: 2, bgcolor: 'primary.light' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" component="h3" gutterBottom sx={{ color: 'primary.dark' }}>
                  Have a farming question?
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Get answers from experienced farmers and agricultural experts across Uganda
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  fullWidth
                  startIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  }
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                  onClick={() => setAskQuestionOpen(true)}
                >
                  Ask Your Question
                </Button>
              </CardContent>
            </Card>

            {/* Farming Experts */}
            <Card sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent sx={{ bgcolor: 'secondary.main', color: 'white', py: 1.5 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  Top Farming Experts
                </Typography>
              </CardContent>
              <List sx={{ pt: 0 }}>
                {experts.map((expert, index) => (
                  <ListItem 
                    key={expert.id}
                    divider={index < experts.length - 1}
                    sx={{ px: 2, py: 1.5 }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.light' }}>
                        {expert.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={expert.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">{expert.role}</Typography>
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium' }}>
                            {expert.answers} answers provided
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  fullWidth
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  View All Experts
                </Button>
              </Box>
            </Card>

            {/* Hot Questions */}
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ bgcolor: '#FF9800', color: 'white', py: 1.5 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  Hot Questions
                </Typography>
              </CardContent>
              <List sx={{ pt: 0 }}>
                {questions.slice(0, 3).map((question, index) => (
                  <ListItem 
                    key={question.id}
                    divider={index < 2}
                    sx={{ px: 2, py: 1.5 }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                          {question.title}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {question.answers} answers • {question.views} views
                          </Typography>
                          {question.tags && question.tags.length > 0 && (
                            <Chip 
                              size="small" 
                              label={question.tags[0]} 
                              sx={{ 
                                height: 20, 
                                fontSize: '0.6rem',
                                bgcolor: 'rgba(76, 175, 80, 0.1)', 
                                color: 'primary.main',
                              }} 
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none',
                    borderColor: '#FF9800',
                    color: '#FF9800',
                    '&:hover': {
                      borderColor: '#F57C00',
                      backgroundColor: 'rgba(255, 152, 0, 0.04)'
                    }
                  }}
                >
                  View All Hot Questions
                </Button>
              </Box>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Ask Question Dialog */}
      <AskQuestion
        open={askQuestionOpen}
        onClose={() => setAskQuestionOpen(false)}
        onQuestionCreated={handleQuestionCreated}
      />
    </Box>
  );
};

export default CommunityQA; 