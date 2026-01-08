import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../../context/AuthContext';
import { resetPassword } from '../../services/api/authService';

const Login = () => {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetStatus, setResetStatus] = useState({ success: false, message: '' });
  const [pageLoading, setPageLoading] = useState(true);
  const { login, loginWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/dashboard', { replace: true });
      }
      setPageLoading(false);
    }
  }, [user, loading, navigate]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      remember: false
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required')
    }),
    onSubmit: async (values) => {
      setError('');
      setIsSubmitting(true);
      try {
        await login({
          email: values.email,
          password: values.password
        });
        navigate('/dashboard');
      } catch (err) {
        setError(err.message || 'Failed to log in. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      // The redirect will be handled by the OAuth provider
    } catch (err) {
      setError(err.message || 'Failed to log in with Google. Please try again.');
      setIsGoogleSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setResetStatus({ success: false, message: 'Please enter your email address' });
      return;
    }

    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) throw error;
      
      setResetStatus({ 
        success: true, 
        message: 'Password reset instructions have been sent to your email' 
      });
      
      // Close the dialog after 3 seconds on success
      setTimeout(() => {
        setResetDialogOpen(false);
        setResetStatus({ success: false, message: '' });
      }, 3000);
    } catch (error) {
      setResetStatus({ 
        success: false, 
        message: error.message || 'Failed to send reset instructions. Please try again.' 
      });
    }
  };

  const handleResetDialogClose = () => {
    setResetDialogOpen(false);
    setResetStatus({ success: false, message: '' });
    setResetEmail('');
  };

  // Show loading indicator while checking authentication
  if (pageLoading) {
    return (
      <Container component="main" maxWidth="xs" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" fontWeight="bold" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3} textAlign="center">
            Log in to access your account and connect with farmers across Uganda
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Google Sign In Button */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting}
            sx={{ 
              mb: 2, 
              py: 1,
              borderColor: '#DADCE0',
              color: 'text.primary',
              '&:hover': {
                borderColor: '#DADCE0',
                backgroundColor: 'rgba(0, 0, 0, 0.05)'
              }
            }}
          >
            {isGoogleSubmitting ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          <Divider sx={{ width: '100%', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            <FormControlLabel
              control={
                <Checkbox 
                  value="remember" 
                  color="primary" 
                  name="remember"
                  checked={formik.values.remember}
                  onChange={formik.handleChange}
                />
              }
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
            <Grid container>
              <Grid item xs>
                <Link 
                  component="button" 
                  variant="body2"
                  onClick={() => setResetDialogOpen(true)}
                >
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link component={RouterLink} to="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
      
      {/* Password Reset Dialog */}
      <Dialog open={resetDialogOpen} onClose={handleResetDialogClose}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your email address and we'll send you instructions to reset your password.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="resetEmail"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          {resetStatus.message && (
            <Alert 
              severity={resetStatus.success ? "success" : "error"} 
              sx={{ mt: 2 }}
            >
              {resetStatus.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetDialogClose}>Cancel</Button>
          <Button onClick={handleResetPassword}>Send Reset Instructions</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login; 