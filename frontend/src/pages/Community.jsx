import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Divider } from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import EventIcon from '@mui/icons-material/Event';
import HelpIcon from '@mui/icons-material/Help';

const Community = () => (
  <Box sx={{ p: { xs: 2, md: 6 }, background: 'linear-gradient(120deg, #e1f5fe 0%, #fce4ec 100%)', minHeight: '100vh' }}>
    <Typography variant="h3" fontWeight="bold" color="primary.main" gutterBottom>
      <ForumIcon sx={{ fontSize: 40, mr: 1, verticalAlign: 'middle' }} /> Community
    </Typography>
    <Typography variant="h6" color="text.secondary" mb={4}>
      Connect with other farmers and investors. Join discussions, attend events, and ask questions.
    </Typography>
    <Grid container spacing={4}>
      <Grid item xs={12} md={4}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent>
            <ForumIcon color="primary" sx={{ fontSize: 36, mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">Discussions</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Share ideas, tips, and experiences with the community.
            </Typography>
            <Button variant="contained" color="primary">Join Discussion</Button>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent>
            <EventIcon color="success" sx={{ fontSize: 36, mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">Events</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Find and join upcoming agricultural events and webinars.
            </Typography>
            <Button variant="outlined" color="success">View Events</Button>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent>
            <HelpIcon color="secondary" sx={{ fontSize: 36, mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">Q&A</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Ask questions and get answers from experts and peers.
            </Typography>
            <Button variant="outlined" color="secondary">Ask a Question</Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
    <Divider sx={{ my: 6 }} />
    <Typography variant="body2" color="text.secondary" align="center">
      The community is open to all. More interactive features coming soon!
    </Typography>
  </Box>
);

export default Community; 