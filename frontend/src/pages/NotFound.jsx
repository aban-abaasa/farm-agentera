import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Typography variant="h1" color="primary" sx={{ fontSize: { xs: '6rem', md: '10rem' }, fontWeight: 'bold' }}>
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mb: 4 }}>
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<HomeIcon />}
          component={RouterLink}
          to="/"
          size="large"
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound; 