import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Box, Typography, Button, Divider, Avatar, 
  Card, CardContent, TextField, Chip, Paper,
  IconButton, Alert, CircularProgress, Grid,
  Tooltip
} from '@mui/material';
import {
  ThumbUp as LikeIcon,
  ThumbUpOutlined as LikeOutlineIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkOutlineIcon,
  Share as ShareIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { 
  getPostById, 
  addComment, 
  togglePostLike,
  toggleCommentLike,
  togglePostBookmark 
} from '../../services/api/communityService';

const PostDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Fetch post data from database
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data: postData, error } = await getPostById(id);
        
        if (error) {
          setError('Failed to load post. Please try again.');
          console.error('Error fetching post:', error);
        } else if (postData) {
          setPost(postData);
          setComments(postData.comments || []);
          setLikesCount(postData.likes_count || 0);
          
          // Check if current user has liked or bookmarked this post
          // This would typically come from the API response
          setIsLiked(false); // TODO: Implement user like status check
          setIsBookmarked(false); // TODO: Implement user bookmark status check
        } else {
          setError('Post not found.');
        }
      } catch (err) {
        setError('An unexpected error occurred.');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    if (!user) {
      setError('You must be logged in to comment');
      return;
    }
    
    try {
      setCommentLoading(true);
      
      const commentData = {
        post_id: parseInt(id),
        user_id: user.id,
        content: newComment.trim()
      };
      
      const { data: newCommentData, error } = await addComment(commentData);
      
      if (error) {
        setError('Failed to add comment. Please try again.');
        console.error('Error adding comment:', error);
      } else {
        // Add the new comment to the list with user info
        const commentWithUser = {
          ...newCommentData,
          user: {
            id: user.id,
            first_name: user.first_name || 'Unknown',
            last_name: user.last_name || 'User',
            avatar_url: user.avatar_url || null
          }
        };
        
        setComments(prevComments => [...prevComments, commentWithUser]);
        setNewComment('');
        
        // Update post comment count
        if (post) {
          setPost(prevPost => ({
            ...prevPost,
            comments_count: (prevPost.comments_count || 0) + 1
          }));
        }
      }
    } catch (err) {
      setError('An unexpected error occurred while adding comment.');
      console.error('Error submitting comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  // Handle post like/unlike
  const handleLikePost = async () => {
    if (!user) {
      setError('You must be logged in to like posts');
      return;
    }

    try {
      const { error } = await togglePostLike(id, user.id);
      
      if (error) {
        console.error('Error toggling like:', error);
      } else {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (err) {
      console.error('Error handling like:', err);
    }
  };

  // Handle post bookmark/unbookmark
  const handleBookmarkPost = async () => {
    if (!user) {
      setError('You must be logged in to bookmark posts');
      return;
    }

    try {
      const { error } = await togglePostBookmark(id, user.id);
      
      if (error) {
        console.error('Error toggling bookmark:', error);
      } else {
        setIsBookmarked(!isBookmarked);
      }
    } catch (err) {
      console.error('Error handling bookmark:', err);
    }
  };

  // Handle comment like/unlike
  const handleLikeComment = async (commentId, currentLikes = 0) => {
    if (!user) {
      setError('You must be logged in to like comments');
      return;
    }

    try {
      const { error } = await toggleCommentLike(commentId, user.id);
      
      if (error) {
        console.error('Error toggling comment like:', error);
      } else {
        // Update the comment likes in the state
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? { ...comment, likes: currentLikes + 1 }
              : comment
          )
        );
      }
    } catch (err) {
      console.error('Error handling comment like:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button component={Link} to="/community" variant="outlined">
          Back to Community
        </Button>
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Post not found
        </Alert>
        <Button component={Link} to="/community" variant="outlined">
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
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.08)', bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                height: 60, 
                width: 60, 
                mr: 2,
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              src={post.user?.avatar_url}
            >
              {post.user ? 
                `${post.user.first_name?.charAt(0) || ''}${post.user.last_name?.charAt(0) || ''}` :
                'U'
              }
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="600">
                {post.user ? 
                  `${post.user.first_name || ''} ${post.user.last_name || ''}`.trim() || 'Unknown User' :
                  'Unknown User'
                }
              </Typography>
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
                {formatDate(post.created_at)}
              </Box>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              {post.category && (
                <Chip 
                  label={post.category.name}
                  size="small"
                  sx={{ 
                    bgcolor: post.category.color_hex || 'primary.main',
                    color: 'white',
                    fontWeight: 500
                  }}
                />
              )}
            </Box>
          </Box>
          
          <Typography variant="h4" component="h1" fontWeight="bold">
            {post.title}
          </Typography>
        </Box>
        
        {/* Post content */}
        <Box sx={{ p: 3, bgcolor: 'white' }}>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
            {post.content}
          </Typography>
          
          {/* Post tags */}
          {post.tags && post.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 3 }}>
              {post.tags.map((tag, index) => (
                <Chip 
                  key={tag.id || index} 
                  label={tag.name || tag}
                  size="medium"
                  sx={{ 
                    bgcolor: tag.color_hex || 'primary.light', 
                    color: 'white',
                    fontWeight: 500,
                    '&:hover': { 
                      bgcolor: tag.color_hex ? `${tag.color_hex}CC` : 'primary.main', 
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </Box>
          )}

          {/* Post images */}
          {post.images && post.images.length > 0 && (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {post.images.map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box
                    component="img"
                    src={image}
                    alt={`Post image ${index + 1}`}
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.02)'
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
        
        {/* Post actions */}
        <Box sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.08)', bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={handleLikePost}
                sx={{ 
                  color: isLiked ? 'primary.main' : 'text.secondary',
                  '&:hover': { 
                    bgcolor: isLiked ? 'primary.light' : 'grey.100',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {isLiked ? <LikeIcon /> : <LikeOutlineIcon />}
              </IconButton>
              <Typography 
                variant="body2" 
                sx={{ 
                  alignSelf: 'center', 
                  color: isLiked ? 'primary.main' : 'text.secondary',
                  fontWeight: isLiked ? 600 : 400
                }}
              >
                {likesCount}
              </Typography>

              <IconButton
                onClick={handleBookmarkPost}
                sx={{ 
                  color: isBookmarked ? 'warning.main' : 'text.secondary',
                  ml: 2,
                  '&:hover': { 
                    bgcolor: isBookmarked ? 'warning.light' : 'grey.100',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {isBookmarked ? <BookmarkIcon /> : <BookmarkOutlineIcon />}
              </IconButton>

              <Tooltip title="Share this post">
                <IconButton
                  sx={{ 
                    color: 'text.secondary',
                    ml: 1,
                    '&:hover': { 
                      bgcolor: 'grey.100',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <Typography variant="caption">
                  {post.views || 0} views
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <Typography variant="caption">
                  {post.comments_count || comments.length} comments
                </Typography>
              </Box>
            </Box>
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
            disabled={commentLoading}
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
              disabled={!newComment.trim() || commentLoading}
              startIcon={commentLoading && <CircularProgress size={20} />}
              sx={{ 
                borderRadius: 2,
                px: 4
              }}
            >
              {commentLoading ? 'Posting...' : 'Post Comment'}
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        height: 40, 
                        width: 40, 
                        mr: 2,
                        border: '2px solid white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      src={comment.user?.avatar_url}
                    >
                      {comment.user ? 
                        `${comment.user.first_name?.charAt(0) || ''}${comment.user.last_name?.charAt(0) || ''}` :
                        'U'
                      }
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        {comment.user ? 
                          `${comment.user.first_name || ''} ${comment.user.last_name || ''}`.trim() || 'Unknown User' :
                          'Unknown User'
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(comment.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleLikeComment(comment.id, comment.likes || 0)}
                      sx={{ 
                        color: 'text.secondary',
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      <LikeOutlineIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" color="text.secondary">
                      {comment.likes || 0}
                    </Typography>
                    
                    {user && user.id === comment.user_id && (
                      <>
                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
              
              <CardContent>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {comment.content}
                </Typography>
                
                {/* Display comment images if any */}
                {comment.images && comment.images.length > 0 && (
                  <Grid container spacing={1} sx={{ mt: 2 }}>
                    {comment.images.map((image, index) => (
                      <Grid item xs={6} sm={4} key={index}>
                        <Box
                          component="img"
                          src={image}
                          alt={`Comment image ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: 120,
                            objectFit: 'cover',
                            borderRadius: 1,
                            cursor: 'pointer'
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
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