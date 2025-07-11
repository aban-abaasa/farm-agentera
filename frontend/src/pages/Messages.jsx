import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  TextField,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  Chip,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  useTheme,
  alpha,
  Fade,
  Slide,
  Zoom
} from '@mui/material';
import { 
  Message as MessageIcon, 
  Send as SendIcon,
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Circle as CircleIcon,
  ChatBubbleOutline as ChatIcon,
  Agriculture as AgricultureIcon,
  Science as ScienceIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getConversations } from '../services/api/messageService';

const Messages = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const { data, error } = await getConversations();
        if (error) throw error;
        
        setConversations(data || []);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
  }, [user?.id]);

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = !searchTerm || 
      conversation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.last_message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'unread' && conversation.unread_count > 0);
    
    return matchesSearch && matchesTab;
  });

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Fade in timeout={600}>
        <Card 
          sx={{ 
            mb: 4, 
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            overflow: 'visible'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  mr: 3,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <MessageIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  Messages
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                  Connect with farmers and agricultural experts through our messaging system
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.4)}`,
                  '&:hover': {
                    boxShadow: `0 12px 32px ${alpha(theme.palette.secondary.main, 0.6)}`,
                  }
                }}
              >
                New Message
              </Button>
            </Box>
            
            {/* Quick Stats */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), mr: 1.5, width: 40, height: 40 }}>
                    <ChatIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {conversations.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Chats
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), mr: 1.5, width: 40, height: 40 }}>
                    <CircleIcon sx={{ color: theme.palette.warning.main, fontSize: 12 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {conversations.filter(c => c.unread_count > 0).length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Unread
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), mr: 1.5, width: 40, height: 40 }}>
                    <AgricultureIcon sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {Math.floor(conversations.length * 0.7)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Farmers
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), mr: 1.5, width: 40, height: 40 }}>
                    <ScienceIcon sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {Math.floor(conversations.length * 0.3)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Experts
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Fade>
      
      <Grid container spacing={3}>
        {/* Conversations List */}
        <Grid item xs={12} lg={5}>
          <Slide direction="right" in timeout={800}>
            <Card 
              sx={{ 
                height: '75vh', 
                borderRadius: 3, 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column',
                boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.1)}`,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`
              }}
            >
              {/* Search and Tabs Header */}
              <Box sx={{ 
                p: 3, 
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
              }}>
                <TextField
                  fullWidth
                  placeholder="Search conversations..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.paper, 0.7),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.background.paper, 0.9),
                      },
                      '&.Mui-focused': {
                        backgroundColor: theme.palette.background.paper,
                      }
                    }
                  }}
                />
                
                <Tabs 
                  value={activeTab} 
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': {
                      borderRadius: 2,
                      mx: 0.5,
                      minHeight: 40,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }
                    },
                    '& .MuiTabs-indicator': {
                      display: 'none'
                    }
                  }}
                >
                  <Tab 
                    value="all" 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        All
                        <Chip 
                          label={conversations.length} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontSize: '0.75rem',
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main
                          }} 
                        />
                      </Box>
                    } 
                  />
                  <Tab 
                    value="unread" 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Unread
                        <Chip 
                          label={conversations.filter(c => c.unread_count > 0).length} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontSize: '0.75rem',
                            backgroundColor: alpha(theme.palette.warning.main, 0.1),
                            color: theme.palette.warning.main
                          }} 
                        />
                      </Box>
                    } 
                  />
                </Tabs>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                  <CircularProgress size={40} thickness={4} />
                </Box>
              ) : filteredConversations.length > 0 ? (
                <List sx={{ overflow: 'auto', flexGrow: 1, p: 0 }}>
                  {filteredConversations.map((conversation, index) => (
                    <Zoom in timeout={600 + index * 100} key={conversation.conversation_id}>
                      <ListItem 
                        button
                        onClick={() => setSelectedConversation(conversation)}
                        sx={{ 
                          py: 2,
                          px: 3,
                          borderLeft: conversation.unread_count > 0 ? '4px solid' : '4px solid transparent', 
                          borderColor: theme.palette.primary.main,
                          backgroundColor: selectedConversation?.conversation_id === conversation.conversation_id 
                            ? alpha(theme.palette.primary.main, 0.08)
                            : 'transparent',
                          '&:hover': { 
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            transform: 'translateX(4px)',
                            transition: 'all 0.2s ease-in-out'
                          },
                          transition: 'all 0.2s ease-in-out',
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: '3px',
                            backgroundColor: selectedConversation?.conversation_id === conversation.conversation_id 
                              ? theme.palette.primary.main
                              : 'transparent',
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            badgeContent={conversation.unread_count > 0 ? conversation.unread_count : null}
                            color="primary"
                            sx={{
                              '& .MuiBadge-badge': {
                                backgroundColor: theme.palette.primary.main,
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }
                            }}
                          >
                            <Avatar 
                              sx={{ 
                                width: 48, 
                                height: 48,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                fontSize: '1.2rem',
                                fontWeight: 600
                              }}
                            >
                              {conversation.conversation_participants && 
                                conversation.conversation_participants.find(p => p.user_id !== user?.id)?.profiles?.first_name?.charAt(0) || 'U'}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  fontWeight: conversation.unread_count > 0 ? 700 : 600,
                                  color: conversation.unread_count > 0 ? theme.palette.text.primary : theme.palette.text.primary,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '70%'
                                }}
                              >
                                {conversation.is_group 
                                  ? conversation.title 
                                  : conversation.conversation_participants && 
                                    conversation.conversation_participants.find(p => p.user_id !== user?.id)?.profiles ? 
                                      `${conversation.conversation_participants.find(p => p.user_id !== user?.id)?.profiles?.first_name || ''} ${conversation.conversation_participants.find(p => p.user_id !== user?.id)?.profiles?.last_name || ''}`.trim() || 'User'
                                      : 'User'}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                  {formatTimestamp(conversation.updated_at)}
                                </Typography>
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100%',
                                fontWeight: conversation.unread_count > 0 ? 500 : 400,
                                fontSize: '0.875rem'
                              }}
                            >
                              {conversation.last_message || 'No messages yet'}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </Zoom>
                  ))}
                </List>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, p: 4 }}>
                  <Zoom in timeout={800}>
                    <Avatar 
                      sx={{ 
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                        width: 80, 
                        height: 80, 
                        mb: 3,
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
                      }}
                    >
                      <MessageIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                    </Avatar>
                  </Zoom>
                  <Typography variant="h5" gutterBottom textAlign="center" sx={{ fontWeight: 600, mb: 1 }}>
                    {searchTerm ? 'No conversations found' : 'No conversations yet'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 3, maxWidth: 300 }}>
                    {searchTerm 
                      ? 'Try adjusting your search terms or clear the search to see all conversations.'
                      : 'Start a conversation with farmers or agricultural experts to connect and collaborate.'
                    }
                  </Typography>
                  {!searchTerm && (
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />}
                      sx={{ 
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                        '&:hover': {
                          boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.6)}`,
                        }
                      }}
                    >
                      Start New Conversation
                    </Button>
                  )}
                </Box>
              )}
            </Card>
          </Slide>
        </Grid>
        
        {/* Message Detail View */}
        <Grid item xs={12} lg={7}>
          <Slide direction="left" in timeout={1000}>
            <Card 
              sx={{ 
                height: '75vh', 
                borderRadius: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden',
                boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.1)}`,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`
              }}
            >
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <Box sx={{ 
                    p: 3, 
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          mr: 2,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          fontSize: '1.2rem',
                          fontWeight: 600
                        }}
                      >
                        {selectedConversation.conversation_participants && 
                          selectedConversation.conversation_participants.find(p => p.user_id !== user?.id)?.profiles?.first_name?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {selectedConversation.is_group 
                            ? selectedConversation.title 
                            : selectedConversation.conversation_participants && 
                              selectedConversation.conversation_participants.find(p => p.user_id !== user?.id)?.profiles ? 
                                `${selectedConversation.conversation_participants.find(p => p.user_id !== user?.id)?.profiles?.first_name || ''} ${selectedConversation.conversation_participants.find(p => p.user_id !== user?.id)?.profiles?.last_name || ''}`.trim() || 'User'
                                : 'User'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircleIcon sx={{ fontSize: 8, color: theme.palette.success.main }} />
                          <Typography variant="caption" color="text.secondary">
                            Active now
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <IconButton>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  {/* Messages Area */}
                  <Box sx={{ flexGrow: 1, p: 3, backgroundColor: alpha(theme.palette.background.default, 0.3) }}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        Messages will appear here when implemented
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Message Input */}
                  <Box sx={{ 
                    p: 3, 
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    background: theme.palette.background.paper
                  }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'end' }}>
                      <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="Type your message..."
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: alpha(theme.palette.background.default, 0.5),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.background.default, 0.7),
                            },
                            '&.Mui-focused': {
                              backgroundColor: theme.palette.background.default,
                            }
                          }
                        }}
                      />
                      <IconButton 
                        color="primary"
                        sx={{
                          p: 1.5,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                          color: 'white',
                          borderRadius: 2,
                          boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                          '&:hover': {
                            boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                            transform: 'translateY(-1px)'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <SendIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, p: 4 }}>
                  <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
                    <Zoom in timeout={1200}>
                      <Avatar 
                        sx={{ 
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                          width: 120, 
                          height: 120, 
                          mx: 'auto', 
                          mb: 4,
                          border: `3px solid ${alpha(theme.palette.primary.main, 0.1)}`
                        }}
                      >
                        <MessageIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />
                      </Avatar>
                    </Zoom>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                      Select a conversation
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                      Choose a conversation from the list to view and send messages. Connect with farmers, agricultural experts, and community members to share knowledge and grow together.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Card>
          </Slide>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Messages; 