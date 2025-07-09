import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  Tooltip
} from '@mui/material';
import {
  PhotoCamera,
  Save,
  Cancel,
  Add,
  Delete,
  Facebook,
  Twitter,
  Info
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';

// Validation schema
const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  location: yup.string().required('Location is required'),
  bio: yup.string().max(500, 'Bio should not exceed 500 characters'),
  role: yup.string().required('Role is required'),
  farmSize: yup.string(),
  specialty: yup.string(),
});

const EditProfile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [certifications, setCertifications] = useState([]);
  const [newCertification, setNewCertification] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Initialize certifications from user data
    if (user && user.certifications) {
      setCertifications(user.certifications);
    }
  }, [user]);

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || '',
      role: user?.role || 'Farmer',
      farmSize: user?.farmSize || '',
      specialty: user?.specialty || '',
      facebook: user?.social?.facebook || '',
      twitter: user?.social?.twitter || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      try {
        // Prepare data for update
        const updatedData = {
          ...values,
          certifications,
          social: {
            facebook: values.facebook,
            twitter: values.twitter
          }
        };
        
        // Handle avatar and cover photo uploads
        // In a real app, you would upload these to a server and get back URLs
        if (avatarFile) {
          // Simulate file upload and getting back a URL
          updatedData.avatar = URL.createObjectURL(avatarFile);
        }
        
        if (coverFile) {
          // Simulate file upload and getting back a URL
          updatedData.coverPhoto = URL.createObjectURL(coverFile);
        }
        
        // Update profile
        await updateProfile(updatedData);
        setSuccess(true);
        
        // Redirect after short delay
        setTimeout(() => {
          navigate(`/profile/${user.id}`);
        }, 1500);
      } catch (err) {
        setError(err.message || 'Failed to update profile');
      } finally {
        setLoading(false);
      }
    },
  });

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

  if (!user) {
    return null; // Will redirect in useEffect
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
                          src={avatarPreview || user?.avatar}
                          sx={{
                            width: 150,
                            height: 150,
                            fontSize: '3rem',
                            bgcolor: 'primary.main',
                            border: '4px solid #fff',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                          }}
                        >
                          {user?.name?.charAt(0)}
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
                          src={coverPreview || user?.coverPhoto}
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
                      id="name"
                      name="name"
                      label="Full Name"
                      variant="outlined"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
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
                        <MenuItem value="Farmer">Farmer</MenuItem>
                        <MenuItem value="Supplier">Supplier</MenuItem>
                        <MenuItem value="Buyer">Buyer</MenuItem>
                        <MenuItem value="Landowner">Landowner</MenuItem>
                        <MenuItem value="Service Provider">Service Provider</MenuItem>
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
                      id="facebook"
                      name="facebook"
                      label="Facebook URL"
                      variant="outlined"
                      value={formik.values.facebook}
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
                      id="twitter"
                      name="twitter"
                      label="Twitter URL"
                      variant="outlined"
                      value={formik.values.twitter}
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
    </Container>
  );
};

export default EditProfile;