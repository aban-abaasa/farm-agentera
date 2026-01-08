import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * A wrapper component that protects routes requiring authentication
 * Redirects to login if user is not authenticated
 * Redirects to profile completion if profile is incomplete
 */
const ProtectedRoute = () => {
  const { user, loading, profileStatus } = useAuth();

  // Show loading state while checking authentication or profile completion
  if (loading || profileStatus.isChecking) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          {loading ? 'Checking authentication...' : 'Loading profile...'}
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to profile completion if profile is incomplete
  if (!profileStatus.isComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  // Render the child routes if authenticated and profile is complete
  return <Outlet />;
};

export default ProtectedRoute; 