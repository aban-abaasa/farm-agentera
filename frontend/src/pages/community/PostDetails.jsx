import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Box, Typography, Button, Divider, Avatar, 
  Card, CardContent, TextField, Chip, Paper
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { mockPosts } from '../../mocks/posts';
import { mockCommentsData } from '../../mocks/comments';

const PostDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      const foundPost = mockPosts.find(p => p.id === parseInt(id));
      setPost(foundPost || null);
      setComments(mockCommentsData[id] || []);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

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

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    // Create a new comment object
    const newCommentObj = {
      id: Date.now(), // Simple unique ID for demo
      postId: parseInt(id),
      author: {
        id: user.id || 'current-user',
        name: user.name || 'Current User',
        avatar: user.avatar || null
      },
      content: newComment,
      date: new Date().toISOString(),
      likes: 0
    };
    
    // Add the new comment to the list
    setComments(prevComments => [...prevComments, newCommentObj]);
    setNewComment('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <Typography variant="h5">Loading post...</Typography>
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h5" gutterBottom>Post not found</Typography>
        <Button component={Link} to="/community" variant="contained" color="primary" sx={{ mt: 2 }}>
          Back to Community
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Navigation breadcrumb */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
        <Link to="/community" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Community
        </Link>
      </Box>

      {/* Main post card */}
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          mb: 5
        }}
      >
        {/* Post header with author info */}
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.08)', bgcolor: 'primary.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box 
              sx={{ 
                height: 60, 
                width: 60, 
                borderRadius: '50%', 
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
                fontSize: '1.5rem',
                fontWeight: 600,
                mr: 2,
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
                  fontSize: '1.25rem',
                  textDecoration: 'none'
                }}
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
          
          <Typography variant="h4" component="h1" fontWeight="bold">
            {post.title}
          </Typography>
        </Box>
        
        {/* Post content */}
        <Box sx={{ p: 3, bgcolor: 'white' }}>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
            {post.content.length > 100 
              ? post.content + " Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur quis tincidunt ex, at placerat libero. Nulla facilisi. Morbi tincidunt, neque vel tincidunt vehicula, sapien libero fermentum purus, at rhoncus nibh eros id dolor. Donec malesuada lectus eget nisl iaculis commodo. Quisque tristique malesuada placerat. Praesent fringilla ante id ex iaculis, vel luctus erat bibendum. Ut vel vehicula velit, a tincidunt sapien. Aenean vulputate dui non libero ullamcorper, vel iaculis dui maximus. Vestibulum quis lacus maximus, aliquam nisl in, rutrum justo. Nullam posuere quam sit amet tortor efficitur, non lacinia ex facilisis. Donec pellentesque vehicula risus eget gravida. Ut ultricies, nunc ut iaculis vehicula, purus metus ultrices ex, id imperdiet eros ex id justo."
              : post.content
            }
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 3 }}>
            {post.tags.map((tag, index) => (
              <Chip 
                key={index} 
                label={tag}
                size="medium"
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
        
        {/* Post actions */}
        <Box sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.08)', bgcolor: 'grey.50' }}>
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
              Like ({post.likes})
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
            
            <Button 
              startIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                </svg>
              }
              sx={{ 
                color: 'text.secondary', 
                '&:hover': { color: 'primary.main' } 
              }}
            >
              Report
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Comments section */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Comments ({comments.length})
      </Typography>
      
      {/* Add comment form */}
      {user && (
        <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 5 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Share your thoughts on this post..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={!newComment.trim()}
              sx={{ 
                borderRadius: 2,
                px: 4
              }}
            >
              Post Comment
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Comments list */}
      {comments.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {comments.map(comment => (
            <Card 
              key={comment.id} 
              elevation={1}
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.05)', bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      height: 40, 
                      width: 40, 
                      borderRadius: '50%', 
                      bgcolor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'text.secondary',
                      fontSize: '1rem',
                      fontWeight: 600,
                      mr: 2,
                      border: '2px solid white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    {comment.author.avatar ? (
                      <img src={comment.author.avatar} alt={comment.author.name} style={{ height: '100%', width: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      comment.author.name.charAt(0)
                    )}
                  </Box>
                  <Box>
                    <Link 
                      to={`/profile/${comment.author.id}`} 
                      style={{ 
                        fontWeight: 600, 
                        color: '#1a1a1a', 
                        fontSize: '0.95rem',
                        textDecoration: 'none'
                      }}
                    >
                      {comment.author.name}
                    </Link>
                    <Box sx={{ 
                      color: 'text.secondary', 
                      fontSize: '0.75rem', 
                      display: 'flex', 
                      alignItems: 'center',
                      mt: 0.25
                    }}>
                      {formatDate(comment.date)}
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              <CardContent>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {comment.content}
                </Typography>
              </CardContent>
              
              <Box sx={{ px: 2, py: 1, borderTop: '1px solid rgba(0,0,0,0.05)', bgcolor: 'grey.50' }}>
                <Button 
                  size="small"
                  startIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                  }
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  Like ({comment.likes})
                </Button>
                
                <Button 
                  size="small"
                  startIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                    </svg>
                  }
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  Reply
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      ) : (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 5, 
            bgcolor: 'grey.50', 
            borderRadius: 2,
            border: '1px dashed rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Be the first to comment on this post!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PostDetails;