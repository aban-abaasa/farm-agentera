import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Container } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const AuthCallback = () => {
  const [error, setError] = useState(null);
  const { user, profileStatus, loading, googleMetadata } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only proceed once we've checked auth status and profile completion
    if (!loading && !profileStatus.isChecking) {
      if (!user) {
        // If no user, something went wrong with the OAuth flow
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      } else if (!profileStatus.isComplete) {
        // If profile is incomplete, redirect to profile completion page
        navigate('/complete-profile');
      } else {
        // If everything is good, redirect to dashboard
        navigate('/dashboard');
      }
    }
  }, [user, loading, profileStatus, navigate]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
        }}
      >
        {error ? (
          <Typography variant="h6" color="error" align="center">
            {error}
          </Typography>
        ) : (
          <>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3 }}>
              {googleMetadata ? 'Completing Google sign-in...' : 'Completing sign-in...'}
            </Typography>
            {googleMetadata && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Preparing your profile information
              </Typography>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default AuthCallback; 