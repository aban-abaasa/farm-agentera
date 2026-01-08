import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FormLabel,
  Grid,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Avatar,
  Chip
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

const CompleteProfile = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user, updateProfile, loading, profileStatus, googleMetadata } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if user is not logged in or if profile is already complete
  useEffect(() => {
    if (!loading && !profileStatus.isChecking) {
      if (!user) {
        navigate('/login', { replace: true });
      } else if (profileStatus.isComplete) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, profileStatus, navigate]);

  const steps = ['Personal Details', 'Farming Profile'];

  const validationSchemas = [
    // Step 1: Personal Details
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
    // Step 2: Farming Profile
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
      firstName: user?.first_name || googleMetadata?.first_name || '',
      lastName: user?.last_name || googleMetadata?.last_name || '',
      phone: user?.phone_number || '',
      location: user?.location || '',
      role: user?.role || 'farmer',
      farmingType: user?.farmer_type || '',
      farmSize: user?.farm_size || '',
      bio: user?.bio || ''
    },
    enableReinitialize: true, // This allows the form to reinitialize when initial values change
    validationSchema: validationSchemas[activeStep],
    onSubmit: async (values) => {
      if (activeStep < steps.length - 1) {
        setActiveStep(activeStep + 1);
      } else {
        setError('');
        setIsSubmitting(true);
        try {
          // Map form fields to the expected format for the API
          const profileData = {
            first_name: values.firstName,
            last_name: values.lastName,
            phone_number: values.phone,
            location: values.location,
            role: values.role,
            farmer_type: values.farmingType,
            farm_size: values.farmSize ? parseFloat(values.farmSize) : null,
            bio: values.bio,
            updated_at: new Date().toISOString()
          };
          
          // If user has Google avatar and no existing avatar, use Google avatar
          if (googleMetadata?.avatar_url && !user?.avatar_url) {
            profileData.avatar_url = googleMetadata.avatar_url;
          }
          
          await updateProfile(profileData);
          setSuccess(true);
          
          // Navigate to dashboard after short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } catch (err) {
          setError(err.message || 'Failed to update profile. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  });

  // Update form values when Google metadata becomes available
  useEffect(() => {
    if (googleMetadata) {
      // Force update the fields if they're empty and we have Google data
      if (!formik.values.firstName && googleMetadata.first_name) {
        formik.setFieldValue('firstName', googleMetadata.first_name);
        console.log('Setting firstName to:', googleMetadata.first_name);
      }
      if (!formik.values.lastName && googleMetadata.last_name) {
        formik.setFieldValue('lastName', googleMetadata.last_name);
        console.log('Setting lastName to:', googleMetadata.last_name);
      }
      
      // Also try to reset form values entirely if both fields are empty
      if (!formik.values.firstName && !formik.values.lastName && (googleMetadata.first_name || googleMetadata.last_name)) {
        formik.resetForm({
          values: {
            ...formik.values,
            firstName: googleMetadata.first_name || '',
            lastName: googleMetadata.last_name || ''
          }
        });
        console.log('Reset form with Google data');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleMetadata]);

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  // Debug: Log when Google metadata is available
  useEffect(() => {
    console.log('CompleteProfile - Google metadata:', googleMetadata);
    console.log('CompleteProfile - User data:', user);
    console.log('CompleteProfile - Current form values:', formik.values);
    
    // Show what we expect vs what we got
    if (googleMetadata) {
      console.log('Expected first_name:', googleMetadata.first_name);
      console.log('Expected last_name:', googleMetadata.last_name);
      console.log('Expected avatar_url:', googleMetadata.avatar_url);
    }
  }, [googleMetadata, user, formik.values]);

  // Show loading indicator while checking authentication
  if (loading || profileStatus.isChecking) {
    return (
      <Container component="main" maxWidth="sm" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Don't render anything if user is not logged in or profile is already complete
  if (!user || profileStatus.isComplete) {
    return null;
  }

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, my: 8, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {googleMetadata?.avatar_url && (
            <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar 
                src={googleMetadata.avatar_url} 
                alt="Google Profile Picture"
                sx={{ width: 80, height: 80, mb: 1 }}
              />
              <Chip 
                label="From Google Account" 
                size="small" 
                color="success" 
                variant="outlined"
              />
            </Box>
          )}
          
          <Typography component="h1" variant="h5" fontWeight="bold" gutterBottom>
            Complete Your Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4} textAlign="center">
            Please provide some additional information to complete your profile
            {googleMetadata && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1, color: 'success.dark' }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  ✓ Welcome! We've pre-filled your name from your Google account.
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  You can edit any information as needed.
                </Typography>
              </Box>
            )}
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

          {success ? (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              Profile updated successfully! Redirecting to dashboard...
            </Alert>
          ) : (
            <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
              {activeStep === 0 && (
                // Step 1: Personal Details
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
                    helperText={
                      (formik.touched.firstName && formik.errors.firstName) ||
                      (googleMetadata?.first_name && formik.values.firstName === googleMetadata.first_name ? 
                        '✓ Pre-filled from Google account' : '')
                    }
                    InputProps={{
                      sx: googleMetadata?.first_name && formik.values.firstName === googleMetadata.first_name ? 
                        { '& .MuiOutlinedInput-notchedOutline': { borderColor: 'success.main' } } : {}
                    }}
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
                    helperText={
                      (formik.touched.lastName && formik.errors.lastName) ||
                      (googleMetadata?.last_name && formik.values.lastName === googleMetadata.last_name ? 
                        '✓ Pre-filled from Google account' : '')
                    }
                    InputProps={{
                      sx: googleMetadata?.last_name && formik.values.lastName === googleMetadata.last_name ? 
                        { '& .MuiOutlinedInput-notchedOutline': { borderColor: 'success.main' } } : {}
                    }}
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

              {activeStep === 1 && (
                // Step 2: Farming Profile
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
                    ? (isSubmitting ? 'Saving...' : 'Complete Profile')
                    : 'Next'}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CompleteProfile;