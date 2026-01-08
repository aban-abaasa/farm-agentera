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
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  Link,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

// Uganda's regions for the dropdown
const ugandaRegions = [
  'Central Region',
  'Eastern Region',
  'Northern Region',
  'Western Region',
  'Kampala',
  'Other'
];

// Farming types for the dropdown
const farmingTypes = [
  'Crop Farming',
  'Livestock Farming',
  'Mixed Farming',
  'Plantation',
  'Aquaculture',
  'Poultry',
  'Other'
];

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { register, user, loading } = useAuth();
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

  const steps = ['Account Information', 'Personal Details', 'Farming Profile'];

  const validationSchemas = [
    // Step 1: Account Information
    Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required')
    }),
    // Step 2: Personal Details
    Yup.object({
      firstName: Yup.string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters'),
      lastName: Yup.string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters'),
      phone: Yup.string()
        .required('Phone number is required'),
      location: Yup.string()
        .required('Location is required')
    }),
    // Step 3: Farming Profile
    Yup.object({
      role: Yup.string()
        .required('Role is required'),
      farmingType: Yup.string()
        .when('role', {
          is: (role) => role === 'farmer',
          then: (schema) => schema.required('Farming type is required'),
          otherwise: (schema) => schema
        }),
      bio: Yup.string()
        .max(300, 'Bio must be 300 characters or less')
    })
  ];

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      location: '',
      role: 'farmer',
      farmingType: '',
      farmSize: '',
      bio: ''
    },
    validationSchema: validationSchemas[activeStep],
          onSubmit: async (values) => {
      if (activeStep < steps.length - 1) {
        setActiveStep(activeStep + 1);
      } else {
        setError('');
        setIsSubmitting(true);
        try {
          // Destructure confirmPassword out as we don't need to send it to the API
          const { confirmPassword: _confirmPassword, ...userData } = values;
          
          // Map form fields to the expected format for the API
          const formattedUserData = {
            ...userData,
            // Convert farmSize to number if it exists
            farmSize: userData.farmSize ? parseFloat(userData.farmSize) : null,
            // Map farmingType to farmer_type for database consistency
            farmingType: userData.farmingType || null
          };
          
          await register(formattedUserData);
          setRegistrationSuccess(true);
          // Navigate to dashboard or show success message
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } catch (err) {
          setError(err.message || 'Registration failed. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  });

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  // Show loading indicator while checking authentication
  if (pageLoading) {
    return (
      <Container component="main" maxWidth="sm" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, my: 8, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" fontWeight="bold" gutterBottom>
            Create Your Account
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4} textAlign="center">
            Join our community of Ugandan farmers and unlock new opportunities
          </Typography>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ width: '100%', mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {registrationSuccess ? (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              Registration successful! Please check your email to verify your account.
              You will be redirected to the login page shortly.
            </Alert>
          ) : (
            <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
              {activeStep === 0 && (
                // Step 1: Account Information
                <>
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
                    autoComplete="new-password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    id="confirmPassword"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  />
                </>
              )}

              {activeStep === 1 && (
                // Step 2: Personal Details
                <>
                  <TextField
                    margin="normal"
                    fullWidth
                    id="firstName"
                    label="First Name"
                    name="firstName"
                    autoComplete="given-name"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                    helperText={formik.touched.firstName && formik.errors.firstName}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                    helperText={formik.touched.lastName && formik.errors.lastName}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    id="phone"
                    label="Phone Number"
                    name="phone"
                    autoComplete="tel"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    id="location"
                    select
                    label="Region"
                    name="location"
                    value={formik.values.location}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.location && Boolean(formik.errors.location)}
                    helperText={formik.touched.location && formik.errors.location}
                  >
                    {ugandaRegions.map((region) => (
                      <MenuItem key={region} value={region}>
                        {region}
                      </MenuItem>
                    ))}
                  </TextField>
                </>
              )}

              {activeStep === 2 && (
                // Step 3: Farming Profile
                <>
                  <FormControl component="fieldset" margin="normal">
                    <FormLabel component="legend">I am a:</FormLabel>
                    <RadioGroup
                      row
                      name="role"
                      value={formik.values.role}
                      onChange={formik.handleChange}
                    >
                      <FormControlLabel value="farmer" control={<Radio />} label="Farmer" />
                      <FormControlLabel value="buyer" control={<Radio />} label="Buyer" />
                      <FormControlLabel value="supplier" control={<Radio />} label="Supplier" />
                      <FormControlLabel value="other" control={<Radio />} label="Other" />
                    </RadioGroup>
                  </FormControl>

                  {formik.values.role === 'farmer' && (
                    <>
                      <TextField
                        margin="normal"
                        fullWidth
                        id="farmingType"
                        select
                        label="Farming Type"
                        name="farmingType"
                        value={formik.values.farmingType}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.farmingType && Boolean(formik.errors.farmingType)}
                        helperText={formik.touched.farmingType && formik.errors.farmingType}
                      >
                        {farmingTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        margin="normal"
                        fullWidth
                        id="farmSize"
                        label="Farm Size (acres)"
                        name="farmSize"
                        type="number"
                        value={formik.values.farmSize}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </>
                  )}

                  <TextField
                    margin="normal"
                    fullWidth
                    id="bio"
                    label="Short Bio"
                    name="bio"
                    multiline
                    rows={4}
                    value={formik.values.bio}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.bio && Boolean(formik.errors.bio)}
                    helperText={
                      (formik.touched.bio && formik.errors.bio) || 
                      `${formik.values.bio.length}/300 characters`
                    }
                  />
                </>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {activeStep === steps.length - 1
                    ? (isSubmitting ? 'Creating Account...' : 'Create Account')
                    : 'Next'}
                </Button>
              </Box>

              {activeStep === 0 && (
                <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                  <Grid item>
                    <Link component={RouterLink} to="/login" variant="body2">
                      Already have an account? Sign in
                    </Link>
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 