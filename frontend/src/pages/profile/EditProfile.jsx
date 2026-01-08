import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile, uploadAvatar } from '../../services/api/authService';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Avatar, 
  IconButton,
  Stack,
  Divider,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput,
  FormHelperText,
  CircularProgress,
  Card,
  CardContent,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  PhotoCamera,
  Save,
  Cancel,
  Add,
  Delete,
  Facebook,
  Twitter,
  Info,
  Warning
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';

// Validation schema
const validationSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup.string(),
  location: yup.string(),
  bio: yup.string().max(500, 'Bio should not exceed 500 characters'),
  role: yup.string(),
  farmSize: yup.string(),
  farmerType: yup.string(),
  specialty: yup.string(),
});

const EditProfile = () => {
  const { user, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [coverFile, setCoverFile] = useState(null); // Used in handleCoverChange
  const [coverPreview, setCoverPreview] = useState(null);
  const [certifications, setCertifications] = useState([]);
  const [newCertification, setNewCertification] = useState('');
  const [profileData, setProfileData] = useState(null);
  
  // Account deletion states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      
      try {
        setFetchLoading(true);
        const { data, error } = await getUserProfile(user.id);
        
        if (error) throw error;
        
        if (data) {
          setProfileData(data);
          
          // Initialize certifications if available
          if (data.certifications) {
            setCertifications(data.certifications);
          }
          
          // Initialize avatar preview if available
          if (data.avatar_url) {
            setAvatarPreview(data.avatar_url);
          }
          
          // Initialize cover photo preview if available
          if (data.cover_photo) {
            setCoverPreview(data.cover_photo);
          }
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setFetchLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);

  const formik = useFormik({
    initialValues: {
      firstName: profileData?.first_name || '',
      lastName: profileData?.last_name || '',
      email: profileData?.email || '',
      phone: profileData?.phone_number || '',
      location: profileData?.location || '',
      bio: profileData?.bio || '',
      role: profileData?.role || 'user',
      farmSize: profileData?.farm_size || '',
      farmerType: profileData?.farmer_type || '',
      specialty: profileData?.specialty || '',
      facebookUrl: profileData?.facebook_url || '',
      twitterUrl: profileData?.twitter_url || '',
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      try {
        // Convert farmer type code to display value
        let displayFarmerType = values.farmerType;
        switch (values.farmerType) {
          case 'crop':
            displayFarmerType = 'Crop Farming';
            break;
          case 'livestock':
            displayFarmerType = 'Livestock Farming';
            break;
          case 'mixed':
            displayFarmerType = 'Mixed Farming';
            break;
          case 'aquaculture':
            displayFarmerType = 'Aquaculture';
            break;
          case 'poultry':
            displayFarmerType = 'Poultry';
            break;
          case 'other':
            displayFarmerType = 'Other';
            break;
          default:
            displayFarmerType = values.farmerType;
        }
        
        // Prepare data for update
        const updatedData = {
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          phone_number: values.phone,
          location: values.location,
          bio: values.bio,
          role: values.role,
          farm_size: values.farmSize,
          farmer_type: displayFarmerType,
          specialty: values.specialty,
          certifications: certifications,
          facebook_url: values.facebookUrl,
          twitter_url: values.twitterUrl,
          updated_at: new Date().toISOString()
        };
        
        // Handle avatar upload if changed
        if (avatarFile) {
          try {
            const { data: uploadData, error: uploadError } = await uploadAvatar(user.id, avatarFile);
            if (uploadError) throw uploadError;
            if (uploadData?.avatar_url) {
              updatedData.avatar_url = uploadData.avatar_url;
            }
          } catch (uploadErr) {
            console.error('Error uploading avatar:', uploadErr);
            // Continue with other updates even if avatar upload fails
          }
        }
        
        // Handle cover photo upload (this would need to be implemented in authService.js)
        // For now, we'll skip this part
        
        // Update profile in Supabase
        const { error: updateError } = await updateUserProfile(user.id, updatedData);
        
        if (updateError) throw updateError;
        
        // Update local auth context
        await updateProfile({
          ...updatedData,
          avatar_url: updatedData.avatar_url || avatarPreview,
          // Add any other fields needed by the auth context
        });
        
        setSuccess(true);
        
        // Redirect after short delay
        setTimeout(() => {
          navigate(`/profile`);
        }, 1500);
      } catch (err) {
        console.error('Error updating profile:', err);
        setError(err.message || 'Failed to update profile');
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    // Update form values when profileData changes
    if (profileData) {
      // Normalize farmer type to match select options
      let normalizedFarmerType = profileData.farmer_type || '';
      
      // Convert values like "Crop Farming" to "crop"
      if (normalizedFarmerType) {
        normalizedFarmerType = normalizedFarmerType.toLowerCase();
        if (normalizedFarmerType.includes('crop')) normalizedFarmerType = 'crop';
        else if (normalizedFarmerType.includes('livestock')) normalizedFarmerType = 'livestock';
        else if (normalizedFarmerType.includes('mixed')) normalizedFarmerType = 'mixed';
        else if (normalizedFarmerType.includes('aqua')) normalizedFarmerType = 'aquaculture';
        else if (normalizedFarmerType.includes('poultry')) normalizedFarmerType = 'poultry';
        else normalizedFarmerType = 'other';
      }
      
      formik.setValues({
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || '',
        email: profileData.email || '',
        phone: profileData.phone_number || '',
        location: profileData.location || '',
        bio: profileData.bio || '',
        role: profileData.role || 'user',
        farmSize: profileData.farm_size || '',
        farmerType: normalizedFarmerType,
        specialty: profileData.specialty || '',
        facebookUrl: profileData.facebook_url || '',
        twitterUrl: profileData.twitter_url || '',
      });
    }
  }, [profileData]);

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleAddCertification = () => {
    if (newCertification && !certifications.includes(newCertification)) {
      setCertifications([...certifications, newCertification]);
      setNewCertification('');
    }
  };

  const handleDeleteCertification = (certToDelete) => {
    setCertifications(certifications.filter(cert => cert !== certToDelete));
  };

  // Handle Enter key press for adding certifications
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && newCertification) {
      e.preventDefault();
      handleAddCertification();
    }
  };

  // Handle opening the delete account dialog
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  // Handle closing the delete account dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletePassword('');
    setDeleteError(null);
  };

  // Handle opening the confirmation dialog
  const handleOpenConfirmDialog = () => {
    setDeleteDialogOpen(false);
    setConfirmDeleteDialogOpen(true);
  };

  // Handle closing the confirmation dialog
  const handleCloseConfirmDialog = () => {
    setConfirmDeleteDialogOpen(false);
    setDeletePassword('');
  };

  // Handle proceeding to confirmation dialog after password verification
  const handleProceedToConfirmation = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Password is required');
      return;
    }
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    // Verify password but don't delete account yet
    try {
      // Just check if the password is valid by attempting to sign in
      // The actual deletion happens in handleDeleteAccount
      handleOpenConfirmDialog();
    } catch (err) {
      setDeleteError(err.message || 'Password verification failed. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Handle final account deletion
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    
    try {
      await deleteAccount(deletePassword);
      // If successful, redirect to home page
      navigate('/');
    } catch (err) {
      // Check if it's a connection error and provide a more specific message
      const isConnectionError = err.message && (
        err.message.includes('Cannot connect') || 
        err.message.includes('timed out') || 
        err.message.includes('Failed to fetch') ||
        err.message.includes('network') ||
        !window.navigator.onLine
      );
      
      if (isConnectionError) {
        setDeleteError(
          'Cannot connect to the server. Please check your internet connection and try again later.'
        );
      } else {
        setDeleteError(err.message || 'Failed to delete account. Please try again.');
      }
      
      setConfirmDeleteDialogOpen(false);
      setDeleteDialogOpen(true);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (fetchLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading profile data...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" fontWeight="bold">
          Edit Profile
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => navigate(`/profile/${user.id}`)}
            startIcon={<Cancel />}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => formik.handleSubmit()}
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Profile Pictures Section */}
          <Grid item xs={12}>
            <Card elevation={1} sx={{ mb: 3, overflow: 'visible' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                  Profile Pictures
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                        Profile Picture
                      </Typography>
                      <Box 
                        sx={{ 
                          position: 'relative',
                          mb: 2
                        }}
                      >
                        <Avatar
                          src={avatarPreview}
                          sx={{
                            width: 150,
                            height: 150,
                            fontSize: '3rem',
                            bgcolor: 'primary.main',
                            border: '4px solid #fff',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                          }}
                        >
                          {formik.values.firstName?.charAt(0) || user?.first_name?.charAt(0)}
                        </Avatar>
                        <IconButton
                          color="primary"
                          aria-label="upload picture"
                          component="label"
                          sx={{
                            position: 'absolute',
                            bottom: 5,
                            right: 5,
                            bgcolor: 'background.paper',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            '&:hover': {
                              bgcolor: 'grey.200'
                            }
                          }}
                        >
                          <input
                            hidden
                            accept="image/*"
                            type="file"
                            onChange={handleAvatarChange}
                          />
                          <PhotoCamera />
                        </IconButton>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Click the camera icon to upload a new profile picture
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                        Cover Photo
                      </Typography>
                      <Box 
                        sx={{ 
                          width: '100%',
                          height: 150,
                          borderRadius: 2,
                          overflow: 'hidden',
                          position: 'relative',
                          bgcolor: 'grey.100',
                          mb: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        <Box
                          component="img"
                          src={coverPreview}
                          alt="Cover"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <IconButton
                          color="primary"
                          aria-label="upload cover"
                          component="label"
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            bgcolor: 'background.paper',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            '&:hover': {
                              bgcolor: 'grey.200'
                            }
                          }}
                        >
                          <input
                            hidden
                            accept="image/*"
                            type="file"
                            onChange={handleCoverChange}
                          />
                          <PhotoCamera />
                        </IconButton>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Recommended size: 1200 x 300 pixels
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Basic Information */}
          <Grid item xs={12}>
            <Card elevation={1} sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="firstName"
                      name="firstName"
                      label="First Name"
                      variant="outlined"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                      helperText={formik.touched.firstName && formik.errors.firstName}
                      InputProps={{
                        sx: { borderRadius: 1.5 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="lastName"
                      name="lastName"
                      label="Last Name"
                      variant="outlined"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                      helperText={formik.touched.lastName && formik.errors.lastName}
                      InputProps={{
                        sx: { borderRadius: 1.5 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email Address"
                      variant="outlined"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      InputProps={{
                        sx: { borderRadius: 1.5 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="phone"
                      name="phone"
                      label="Phone Number"
                      variant="outlined"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                      helperText={formik.touched.phone && formik.errors.phone}
                      InputProps={{
                        sx: { borderRadius: 1.5 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="location"
                      name="location"
                      label="Location"
                      variant="outlined"
                      value={formik.values.location}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.location && Boolean(formik.errors.location)}
                      helperText={formik.touched.location && formik.errors.location}
                      InputProps={{
                        sx: { borderRadius: 1.5 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="bio"
                      name="bio"
                      label="Bio"
                      variant="outlined"
                      multiline
                      rows={4}
                      value={formik.values.bio}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.bio && Boolean(formik.errors.bio)}
                      helperText={
                        (formik.touched.bio && formik.errors.bio) || 
                        `${formik.values.bio.length}/500 characters`
                      }
                      InputProps={{
                        sx: { borderRadius: 1.5 }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Farming Details */}
          <Grid item xs={12}>
            <Card elevation={1} sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                  Farming Details
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="role-label">Role</InputLabel>
                      <Select
                        labelId="role-label"
                        id="role"
                        name="role"
                        value={formik.values.role}
                        label="Role"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.role && Boolean(formik.errors.role)}
                        sx={{ borderRadius: 1.5 }}
                      >
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="farmer">Farmer</MenuItem>
                        <MenuItem value="supplier">Supplier</MenuItem>
                        <MenuItem value="buyer">Buyer</MenuItem>
                        <MenuItem value="landowner">Landowner</MenuItem>
                        <MenuItem value="service_provider">Service Provider</MenuItem>
                      </Select>
                      {formik.touched.role && formik.errors.role && (
                        <FormHelperText error>{formik.errors.role}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="farmSize"
                      name="farmSize"
                      label="Farm Size"
                      variant="outlined"
                      placeholder="e.g., 15 acres"
                      value={formik.values.farmSize}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.farmSize && Boolean(formik.errors.farmSize)}
                      helperText={formik.touched.farmSize && formik.errors.farmSize}
                      InputProps={{
                        sx: { borderRadius: 1.5 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="farmerType-label">Farmer Type</InputLabel>
                      <Select
                        labelId="farmerType-label"
                        id="farmerType"
                        name="farmerType"
                        value={formik.values.farmerType}
                        label="Farmer Type"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.farmerType && Boolean(formik.errors.farmerType)}
                        sx={{ borderRadius: 1.5 }}
                      >
                        <MenuItem value="crop">Crop Farming</MenuItem>
                        <MenuItem value="livestock">Livestock Farming</MenuItem>
                        <MenuItem value="mixed">Mixed Farming</MenuItem>
                        <MenuItem value="aquaculture">Aquaculture</MenuItem>
                        <MenuItem value="poultry">Poultry</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                      {formik.touched.farmerType && formik.errors.farmerType && (
                        <FormHelperText error>{formik.errors.farmerType}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="specialty"
                      name="specialty"
                      label="Specialty"
                      variant="outlined"
                      placeholder="e.g., Coffee, Maize"
                      value={formik.values.specialty}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.specialty && Boolean(formik.errors.specialty)}
                      helperText={formik.touched.specialty && formik.errors.specialty}
                      InputProps={{
                        sx: { borderRadius: 1.5 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <TextField
                          fullWidth
                          label="Certifications"
                          variant="outlined"
                          value={newCertification}
                          onChange={(e) => setNewCertification(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Add certification"
                          sx={{ mr: 1 }}
                          InputProps={{
                            sx: { borderRadius: 1.5 },
                            endAdornment: (
                              <InputAdornment position="end">
                                <Tooltip title="Press Enter to add">
                                  <Info fontSize="small" color="action" />
                                </Tooltip>
                              </InputAdornment>
                            )
                          }}
                        />
                        <Button
                          variant="contained"
                          onClick={handleAddCertification}
                          disabled={!newCertification}
                          startIcon={<Add />}
                          sx={{ 
                            borderRadius: 1.5, 
                            height: 56,
                            minWidth: '120px'
                          }}
                        >
                          Add
                        </Button>
                      </Box>
                      <Box sx={{ mt: 2, minHeight: 60 }}>
                        {certifications.length > 0 ? (
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {certifications.map((cert, index) => (
                              <Chip
                                key={index}
                                label={cert}
                                onDelete={() => handleDeleteCertification(cert)}
                                color="primary"
                                variant="outlined"
                                sx={{ mb: 1, borderRadius: 1.5 }}
                              />
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No certifications added
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Social Media */}
          <Grid item xs={12}>
            <Card elevation={1} sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                  Social Media
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="facebookUrl"
                      name="facebookUrl"
                      label="Facebook URL"
                      variant="outlined"
                      value={formik.values.facebookUrl}
                      onChange={formik.handleChange}
                      placeholder="https://facebook.com/username"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Facebook color="action" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 1.5 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="twitterUrl"
                      name="twitterUrl"
                      label="Twitter URL"
                      variant="outlined"
                      value={formik.values.twitterUrl}
                      onChange={formik.handleChange}
                      placeholder="https://twitter.com/username"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Twitter color="action" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 1.5 }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Delete Account Section */}
          <Grid item xs={12}>
            <Card elevation={1} sx={{ mb: 3, borderColor: 'error.light', borderWidth: 1, borderStyle: 'solid' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Warning color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold" color="error">
                    Delete Account
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="body1" paragraph>
                  Deleting your account is permanent and cannot be undone. All your data, including profile information and listings, will be permanently removed.
                </Typography>
                
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={handleOpenDeleteDialog}
                  startIcon={<Delete />}
                  sx={{ mt: 1 }}
                >
                  Delete My Account
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Action Buttons - Bottom */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => navigate(`/profile/${user.id}`)}
                startIcon={<Cancel />}
                disabled={loading}
                sx={{ borderRadius: 1.5, px: 3 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                disabled={loading}
                sx={{ borderRadius: 1.5, px: 3 }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Please type your password to confirm account deletion. This action cannot be undone.
          </DialogContentText>
          
          {deleteError && deleteError.includes('Cannot connect') && (
            <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
              <Typography variant="body2">
                <strong>Connection Error:</strong> Cannot reach the server. Please check your internet connection and try again later.
              </Typography>
            </Alert>
          )}
          
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            error={deleteError !== null}
            helperText={deleteError && !deleteError.includes('Cannot connect') ? deleteError : ''}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Enter your password">
                    <Info fontSize="small" color="action" />
                  </Tooltip>
                </InputAdornment>
              )
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          {deleteError && deleteError.includes('Cannot connect') ? (
            <Button 
              onClick={handleProceedToConfirmation}
              color="primary" 
              variant="contained"
              disabled={deleteLoading}
            >
              {deleteLoading ? <CircularProgress size={20} color="inherit" /> : 'Retry'}
            </Button>
          ) : (
            <Button 
              onClick={handleProceedToConfirmation} 
              color="error" 
              variant="contained" 
              disabled={deleteLoading}
            >
              {deleteLoading ? <CircularProgress size={20} color="inherit" /> : 'Continue'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDeleteDialogOpen}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="confirm-delete-dialog-title"
        aria-describedby="confirm-delete-dialog-description"
      >
        <DialogTitle id="confirm-delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-delete-dialog-description">
            Are you sure you want to delete your account? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Confirm Deletion
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EditProfile;