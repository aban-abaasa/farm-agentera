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
  Tab
} from '@mui/material';
import { Message as MessageIcon, Send as SendIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getConversations } from '../services/api/messageService';

const Messages = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Messages
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect with farmers and agricultural experts through our messaging system.
        </Typography>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '70vh', borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="fullWidth"
              >
                <Tab value="all" label="All" />
                <Tab value="unread" label="Unread" />
              </Tabs>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <CircularProgress />
              </Box>
            ) : conversations.length > 0 ? (
              <List sx={{ overflow: 'auto', flexGrow: 1 }}>
                {conversations.map((conversation) => (
                  <ListItem 
                    key={conversation.conversation_id} 
                    button
                    sx={{ 
                      borderLeft: conversation.unread_count > 0 ? '4px solid' : '4px solid transparent', 
                      borderColor: 'primary.main',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        {/* Find the other participant and show their avatar */}
                        {conversation.conversation_participants && 
                          conversation.conversation_participants.find(p => p.user_id !== user?.id)?.profiles?.first_name?.charAt(0) || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={
                        conversation.is_group 
                          ? conversation.title 
                          : conversation.conversation_participants && 
                            conversation.conversation_participants.find(p => p.user_id !== user?.id)?.profiles ? 
                              `${conversation.conversation_participants.find(p => p.user_id !== user?.id)?.profiles?.first_name || ''} ${conversation.conversation_participants.find(p => p.user_id !== user?.id)?.profiles?.last_name || ''}`.trim() || 'User'
                              : 'User'
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
                            fontWeight: conversation.unread_count > 0 ? 'medium' : 'normal'
                          }}
                        >
                          {conversation.last_message || 'No messages yet'}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, p: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.light', width: 60, height: 60, mb: 2 }}>
                  <MessageIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h6" gutterBottom textAlign="center">
                  No conversations yet
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Start a conversation with farmers or agricultural experts to connect and collaborate.
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 3 }}
                >
                  New Conversation
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Message Detail View */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '70vh', borderRadius: 2, display: 'flex', flexDirection: 'column', p: 0, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, p: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80, mx: 'auto', mb: 3 }}>
                  <MessageIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  Select a conversation
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Choose a conversation from the list to view messages
                </Typography>
              </Box>
            </Box>
            
            {/* Message input - hidden until a conversation is selected */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'none' }}>
              <Box sx={{ display: 'flex' }}>
                <TextField
                  fullWidth
                  placeholder="Type your message..."
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Button 
                  variant="contained" 
                  endIcon={<SendIcon />}
                >
                  Send
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Messages; 