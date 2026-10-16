import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Link,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../../context/AuthContext';
import { BrandMark, Wordmark } from '../../components/classic/Brand';

const validationSchema = Yup.object({
  firstName: Yup.string().trim().required('Your first name, please'),
  lastName: Yup.string().trim().required('Your last name, please'),
  email: Yup.string().email('That email does not look right').required('We need your email'),
  password: Yup.string().min(8, 'At least 8 characters').required('Choose a password')
});

/**
 * Sign-up is deliberately short: name, email, password (or Google). Every
 * new account is a customer. Phone, location and anything about farming,
 * supplying or specialist work is asked later, from the customer page.
 */
const Register = () => {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { register, loginWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/account', { replace: true });
      }
      setPageLoading(false);
    }
  }, [user, loading, navigate]);

  const formik = useFormik({
    initialValues: { firstName: '', lastName: '', email: '', password: '' },
    validationSchema,
    onSubmit: async (values) => {
      setError('');
      setIsSubmitting(true);
      try {
        await register({
          email: values.email.trim(),
          password: values.password,
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          role: 'buyer' // every account starts as a customer
        });
        setRegistrationSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setError(err.message || 'Registration failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const handleGoogleSignUp = async () => {
    setError('');
    setIsGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      // The redirect is handled by the OAuth provider
    } catch (err) {
      setError(err.message || 'Could not continue with Google. Please try again.');
      setIsGoogleSubmitting(false);
    }
  };

  // Show loading indicator while checking authentication
  if (pageLoading) {
    return (
      <Container component="main" maxWidth="sm" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const field = (name) => ({
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.touched[name] && Boolean(formik.errors[name]),
    helperText: formik.touched[name] && formik.errors[name]
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box component={RouterLink} to="/" aria-label="AgriBone home" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, textDecoration: 'none', color: 'text.primary', mt: 6, mb: -4 }}>
        <BrandMark size={40} />
        <Wordmark size="1.4rem" />
      </Box>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, my: 8, borderRadius: 2 }}>
        <Typography component="h1" variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
          Create your account
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3} textAlign="center">
          It takes a minute. You can add the rest later.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {registrationSuccess ? (
          <Alert severity="success">
            You&apos;re in! Please check your email to confirm your account. Taking you to sign in…
          </Alert>
        ) : (
          <>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignUp}
              disabled={isGoogleSubmitting || isSubmitting}
            >
              {isGoogleSubmitting ? 'Opening Google…' : 'Continue with Google'}
            </Button>

            <Divider sx={{ my: 2.5 }}>
              <Typography variant="caption" color="text.secondary">or with email</Typography>
            </Divider>

            <Box component="form" onSubmit={formik.handleSubmit} noValidate>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField margin="dense" fullWidth required autoComplete="given-name" label="First name" {...field('firstName')} />
                <TextField margin="dense" fullWidth required autoComplete="family-name" label="Last name" {...field('lastName')} />
              </Box>
              <TextField margin="dense" fullWidth required type="email" autoComplete="email" label="Email" {...field('email')} />
              <TextField margin="dense" fullWidth required type="password" autoComplete="new-password" label="Password" {...field('password')} />

              <Button type="submit" fullWidth variant="contained" size="large" disabled={isSubmitting || isGoogleSubmitting} sx={{ mt: 2.5 }}>
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </Button>
            </Box>

            <Typography variant="body2" textAlign="center" sx={{ mt: 2.5 }}>
              Already have an account?{' '}
              <Link component={RouterLink} to="/login">Sign in</Link>
            </Typography>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Register;
