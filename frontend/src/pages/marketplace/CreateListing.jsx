import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createListing, uploadListingImages } from '../../services/api/marketplaceService';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  Divider,
  Alert,
  IconButton,
  CircularProgress,
  Stack,
  InputAdornment,
  FormHelperText,
  Breadcrumbs,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MobileStepper,
  Chip,
  Avatar,
  Tooltip,
  LinearProgress,
  Backdrop,
  Badge
} from '@mui/material';
import {
  CloudUpload,
  Cancel,
  Close,
  PhotoCamera,
  AddCircleOutline,
  Home,
  NavigateNext,
  CheckCircle,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LocationOn,
  MonetizationOn,
  Description,
  Category,
  StraightenOutlined,
  WaterDrop,
  Terrain,
  NatureOutlined,
  DirectionsCarOutlined,
  Store,
  RequestQuote,
  Info,
  ListAlt,
  CalendarToday,
  GradeOutlined,
  Inventory,
  WorkOutline,
  AccessTime,
  StarBorder
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Motion components for animations
const MotionContainer = motion(Container);
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionCard = motion(Card);
const MotionGrid = motion(Grid);
const MotionStack = motion(Stack);
const MotionTypography = motion(Typography);
const MotionDivider = motion(Divider);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  },
  exit: { 
    y: -20, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Additional variants can be added here as needed

const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState('land');
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Common fields
    title: '',
    price: '',
    location: '',
    description: '',
    features: '',
    images: [],

    // Land specific fields
    size: '',
    listingType: 'Lease', // Lease or Sale
    soilType: '',
    terrain: '',
    waterSource: '',
    previousCrops: '',
    accessRoads: '',
    nearbyMarkets: '',
    leaseTerms: '',

    // Produce specific fields
    quantity: '',
    quality: 'Standard', // Standard, Premium, etc.
    category: 'Crops', // Crops, Livestock, Dairy, etc.
    variety: '',
    harvestDate: '',
    processingMethod: '',
    gradeOrClassification: '',
    certification: '',
    packaging: '',
    
    // Service specific fields
    serviceCategory: 'Equipment', // Equipment, Labor, Transport, etc.
    availability: '',
    experienceYears: '',
    equipmentType: '',
    servicesOffered: '',
    coverage: '',
    priceDetails: '',
    bookingProcess: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Component state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState(null);

  // Steps for the stepper
  const steps = ['Select Type', 'Basic Details', 'Additional Info', 'Images', 'Review'];

  // These functions are used by the stepper navigation buttons
  const goToNextStep = () => {
    // Validate current step before proceeding
    const currentStepErrors = validateStep(activeStep);
    
    if (Object.keys(currentStepErrors).length > 0) {
      setErrors(currentStepErrors);
      return;
    }
    
    setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  };

  const goToPreviousStep = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  // Function to validate specific step
  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 0: // Select Type - nothing to validate
        break;
      case 1: // Basic Details
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.price.trim()) newErrors.price = 'Price is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        break;
      case 2: // Additional Info
        if (activeTab === 'land') {
          if (!formData.size.trim()) newErrors.size = 'Size is required';
        } else if (activeTab === 'produce') {
          if (!formData.quantity.trim()) newErrors.quantity = 'Quantity is required';
          if (!formData.category.trim()) newErrors.category = 'Category is required';
        } else if (activeTab === 'service') {
          if (!formData.serviceCategory.trim()) newErrors.serviceCategory = 'Service category is required';
          if (!formData.availability.trim()) newErrors.availability = 'Availability is required';
        }
        break;
      case 3: // Images
        // Images are now optional, so no validation errors here
        break;
      case 4: {
        // Review - validate all
        // Validate steps 0-3 only to avoid infinite recursion
        const reviewErrors = {};
        for (let i = 0; i < 4; i++) {
          const stepErrors = validateStep(i);
          Object.assign(reviewErrors, stepErrors);
        }
        return reviewErrors;
      }
      default:
        break;
    }
    
    return newErrors;
  };

  // Redirect if not logged in
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Login Required
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You need to be logged in to create a listing.
          </Typography>
          <Button 
            component={Link} 
            to="/login" 
            variant="contained" 
            color="primary"
            size="large"
            sx={{ 
              borderRadius: '28px',
              px: 4, 
              py: 1.5,
              fontWeight: 'bold',
              boxShadow: '0 4px 14px rgba(76, 175, 80, 0.25)',
              background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(76, 175, 80, 0.35)',
              }
            }}
          >
            Login
          </Button>
        </Paper>
      </Container>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Function to validate image files
  const validateImageFile = (file) => {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File "${file.name}" is too large. Maximum size is 5MB.`
      };
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File "${file.name}" has invalid format. Supported formats: JPG, PNG, GIF, WEBP.`
      };
    }
    
    return { valid: true };
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + previewImages.length > 5) {
      setErrors({
        ...errors,
        images: 'Maximum 5 images allowed',
      });
      return;
    }
    
    // Validate each file
    let validFiles = [];
    let invalidFiles = [];
    
    files.forEach(file => {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        invalidFiles.push(validation.error);
      }
    });
    
    // If there are invalid files, show error
    if (invalidFiles.length > 0) {
      setErrors({
        ...errors,
        images: invalidFiles.join(' '),
      });
      
      // If there are no valid files, return early
      if (validFiles.length === 0) {
        return;
      }
    }
    
    // Create preview URLs and store file objects for valid files
    const newPreviewImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    
    setPreviewImages([...previewImages, ...newPreviewImages]);
    
    // Clear image error if all files are valid
    if (errors.images && invalidFiles.length === 0) {
      setErrors({
        ...errors,
        images: '',
      });
    }
  };

  const removeImage = (index) => {
    setPreviewImages(previewImages.filter((_, i) => i !== index));
    
    // Clear image error if it exists
    if (errors.images) {
      setErrors({
        ...errors,
        images: '',
      });
    }
  };

  // Function to validate the entire form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate each step individually (0-3 only to avoid recursion with step 4)
    // Step 0: Select Type
    Object.assign(newErrors, validateStep(0));
    
    // Step 1: Basic Details
    Object.assign(newErrors, validateStep(1));
    
    // Step 2: Additional Info
    Object.assign(newErrors, validateStep(2));
    
    // Step 3: Images
    Object.assign(newErrors, validateStep(3));
    
    return newErrors;
  };

  // Function to open confirmation dialog
  const openConfirmDialog = (e) => {
    if (e) e.preventDefault();
    
    // Validate form first
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      // Find the first step with errors and navigate to it
      for (let i = 0; i < steps.length; i++) {
        const stepErrors = validateStep(i);
        if (Object.keys(stepErrors).length > 0) {
          setActiveStep(i);
          break;
        }
      }
      return;
    }
    
    // Store form data for submission
    setFormDataToSubmit({
      formData,
      activeTab,
      previewImages
    });
    
    // Open confirmation dialog
    setConfirmDialogOpen(true);
  };

  // Function to handle actual submission after confirmation
  const handleConfirmedSubmit = async () => {
    // Close dialog
    setConfirmDialogOpen(false);
    
    if (!formDataToSubmit) return;
    
    setIsSubmitting(true);
    
    try {
      // Upload images if any are provided (now optional)
      let imageUrls = [];
      if (formDataToSubmit.previewImages && formDataToSubmit.previewImages.length > 0) {
        const files = formDataToSubmit.previewImages.map(img => img.file);
        const { data: uploadedImages, error: uploadError } = await uploadListingImages(
          user.id, 
          files, 
          formDataToSubmit.activeTab // Pass the listing type (land, produce, service)
        );
        
        if (uploadError) {
          throw new Error('Failed to upload images: ' + uploadError.message);
        }
        
        if (uploadedImages) {
          imageUrls = uploadedImages;
        }
      }
      // If no images, continue with empty array
      
      // Prepare the base listing data
      const listingData = {
        title: formDataToSubmit.formData.title,
        description: formDataToSubmit.formData.description,
        price: formDataToSubmit.formData.price,
        is_negotiable: true, // Default for now
        type: formDataToSubmit.activeTab, // 'land', 'produce', or 'service'
        status: 'active',
        location: formDataToSubmit.formData.location,
        district: '', // Could be added to the form
        coordinates: null, // Would need geolocation integration
        user_id: user.id,
        images: imageUrls,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Prepare specialized data based on listing type
      let detailsData = {};
      
      if (formDataToSubmit.activeTab === 'land') {
        detailsData = {
          size: formDataToSubmit.formData.size,
          listing_type: formDataToSubmit.formData.listingType,
          soil_type: formDataToSubmit.formData.soilType,
          terrain: formDataToSubmit.formData.terrain,
          water_source: formDataToSubmit.formData.waterSource,
          previous_crops: formDataToSubmit.formData.previousCrops,
          access_roads: formDataToSubmit.formData.accessRoads,
          nearby_markets: formDataToSubmit.formData.nearbyMarkets,
          lease_terms: formDataToSubmit.formData.leaseTerms
        };
      } else if (formDataToSubmit.activeTab === 'produce') {
        detailsData = {
          quantity: formDataToSubmit.formData.quantity,
          quality: formDataToSubmit.formData.quality,
          category: formDataToSubmit.formData.category,
          variety: formDataToSubmit.formData.variety,
          harvest_date: formDataToSubmit.formData.harvestDate,
          processing_method: formDataToSubmit.formData.processingMethod,
          grade: formDataToSubmit.formData.gradeOrClassification,
          certification: formDataToSubmit.formData.certification,
          packaging: formDataToSubmit.formData.packaging
        };
      } else if (formDataToSubmit.activeTab === 'service') {
        detailsData = {
          service_category: formDataToSubmit.formData.serviceCategory,
          availability: formDataToSubmit.formData.availability,
          experience_years: formDataToSubmit.formData.experienceYears,
          equipment_type: formDataToSubmit.formData.equipmentType,
          services_offered: formDataToSubmit.formData.servicesOffered,
          coverage_area: formDataToSubmit.formData.coverage,
          price_details: formDataToSubmit.formData.priceDetails,
          booking_process: formDataToSubmit.formData.bookingProcess
        };
      }
      
      // Call the API to create the listing
      const { data: _createdListing, error } = await createListing(listingData, detailsData);
      
      if (error) {
        throw error;
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Listing created successfully!',
        severity: 'success'
      });
      
      // Navigate after short delay
      setTimeout(() => {
        // Could use createdListing.id to navigate to the detail page in the future
        navigate(`/marketplace/${formDataToSubmit.activeTab}`);
      }, 1500);
    } catch (error) {
      console.error('Error creating listing:', error);
      setIsSubmitting(false);
      
      // Show error message
      setSnackbar({
        open: true,
        message: `Failed to create listing: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Convert features string to array (for display purposes)
  // Removing unused function to fix linter error
  // const getFeaturesList = () => {
  //   return formData.features.split(',').map(feature => feature.trim()).filter(Boolean);
  // };
  
  return (
    <MotionContainer 
      maxWidth="lg" 
      sx={{ py: 4 }}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      {/* Header with Breadcrumbs */}
      <MotionBox 
        sx={{ mb: 5 }}
        variants={itemVariants}
      >
        <Breadcrumbs 
          separator={<NavigateNext fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <Home fontSize="small" sx={{ mr: 0.5 }} />
            Home
          </Link>
          <Link to="/marketplace" style={{ textDecoration: 'none', color: 'text.secondary' }}>
            Marketplace
          </Link>
          <Typography color="primary.main" fontWeight="medium">Create Listing</Typography>
        </Breadcrumbs>
        
        <MotionTypography 
          variant="h3" 
          fontWeight="bold" 
          gutterBottom
          sx={{ 
            background: 'linear-gradient(45deg, #2e7d32, #66bb6a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Create New Listing
        </MotionTypography>
        <Typography variant="subtitle1" color="text.secondary">
          Complete the form below to showcase your agricultural offerings to potential buyers and partners.
        </Typography>
      </MotionBox>
      
      {/* Progress Indicator */}
      <MotionBox 
        variants={itemVariants}
        sx={{ mb: 5 }}
      >
        <Paper 
          elevation={2} 
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          {!isMobile ? (
            <Box sx={{ p: 3 }}>
              <Stepper 
                activeStep={activeStep} 
                alternativeLabel
                sx={{
                  '& .MuiStepConnector-line': {
                    minHeight: 3,
                    borderTopWidth: 3,
                    borderRadius: 3,
                    borderColor: 'rgba(76, 175, 80, 0.2)'
                  },
                  '& .MuiStepConnector-active': {
                    '& .MuiStepConnector-line': {
                      borderColor: 'primary.main'
                    }
                  },
                  '& .MuiStepConnector-completed': {
                    '& .MuiStepConnector-line': {
                      borderColor: 'primary.main'
                    }
                  },
                  '& .MuiStepLabel-label': {
                    mt: 1,
                    fontWeight: 500
                  },
                  '& .MuiStepLabel-active': {
                    color: 'primary.main',
                    fontWeight: 'bold'
                  }
                }}
              >
                {steps.map((label, index) => (
                  <Step 
                    key={label}
                    completed={activeStep > index}
                  >
                    <StepLabel 
                      StepIconProps={{
                        sx: {
                          width: 40,
                          height: 40,
                          bgcolor: activeStep >= index ? 'primary.main' : 'background.paper',
                          color: activeStep >= index ? 'white' : 'text.disabled',
                          borderRadius: '50%',
                          border: '3px solid',
                          borderColor: activeStep >= index ? 'primary.main' : 'rgba(0, 0, 0, 0.12)',
                          zIndex: 1,
                          '& .MuiStepIcon-text': { 
                            fill: activeStep >= index ? 'white' : 'text.disabled',
                            fontWeight: 'bold'
                          }
                        }
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={(activeStep / (steps.length - 1)) * 100} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'primary.main',
                    borderRadius: 5
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Step {activeStep + 1} of {steps.length}
                </Typography>
                <Typography variant="caption" fontWeight="medium" color="primary.main">
                  {steps[activeStep]}
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </MotionBox>
      
      {/* Listing Type Tabs */}
      <MotionBox 
        variants={itemVariants}
        sx={{ mb: 5 }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
          }}
        >
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => {
              setActiveTab(newValue);
              setActiveStep(0); // Reset step when changing listing type
            }}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{ 
              '& .MuiTab-root': {
                py: 3,
                fontSize: { xs: '0.9rem', sm: '1.1rem' },
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(76, 175, 80, 0.04)'
                }
              },
              '& .Mui-selected': {
                color: 'primary.main',
                bgcolor: 'rgba(76, 175, 80, 0.08)'
              },
              '& .MuiTabs-indicator': {
                height: 4,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4
              }
            }}
          >
            <Tab 
              value="land" 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <NatureOutlined sx={{ mr: 1 }} />
                  <span>Land</span>
                </Box>
              } 
            />
            <Tab 
              value="produce" 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Inventory sx={{ mr: 1 }} />
                  <span>Produce</span>
                </Box>
              }
            />
            <Tab 
              value="service" 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WorkOutline sx={{ mr: 1 }} />
                  <span>Service</span>
                </Box>
              }
            />
          </Tabs>
        </Paper>
      </MotionBox>
      
      <form onSubmit={openConfirmDialog}>
        <AnimatePresence mode="wait">
          <MotionBox
            key={`${activeTab}-${activeStep}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Step content based on activeStep */}
            {activeStep === 0 && (
              <MotionGrid container spacing={3}>
                <Grid item xs={12}>
                  <MotionCard 
                    elevation={3} 
                    sx={{ 
                      borderRadius: 3, 
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                    variants={itemVariants}
                  >
                    <Box 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        py: 2.5, 
                        px: 3,
                        borderBottom: '1px solid rgba(0,0,0,0.08)'
                      }}
                    >
                      <Typography variant="h6" color="white" fontWeight="bold">
                        Select Listing Type
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="body1" paragraph>
                        You've selected <Chip 
                          label={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
                          color="primary" 
                          variant="outlined"
                          icon={activeTab === 'land' ? <NatureOutlined /> : 
                                activeTab === 'produce' ? <Inventory /> :
                                <WorkOutline />}
                          sx={{ fontWeight: 'bold' }}
                        />. 
                        Click next to fill in the basic details for your listing.
                      </Typography>
                      
                      <Grid container spacing={3} sx={{ mt: 2 }}>
                        <Grid item xs={12} md={4}>
                          <Paper 
                            elevation={activeTab === 'land' ? 3 : 1}
                            onClick={() => setActiveTab('land')}
                            sx={{ 
                              p: 3, 
                              borderRadius: 3,
                              cursor: 'pointer',
                              border: '2px solid',
                              borderColor: activeTab === 'land' ? 'primary.main' : 'transparent',
                              bgcolor: activeTab === 'land' ? 'rgba(76, 175, 80, 0.05)' : 'background.paper',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                              }
                            }}
                          >
                            <Box sx={{ mb: 2, textAlign: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 60, 
                                  height: 60,
                                  bgcolor: 'rgba(76, 175, 80, 0.15)',
                                  color: 'primary.main',
                                  margin: '0 auto',
                                  mb: 2
                                }}
                              >
                                <NatureOutlined sx={{ fontSize: 30 }} />
                              </Avatar>
                              <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Land Listing
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Lease or sell agricultural land to farmers and investors
                              </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ pl: 1 }}>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <StraightenOutlined sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} /> Size & location
                              </Typography>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <WaterDrop sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} /> Water sources
                              </Typography>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <Terrain sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} /> Soil & terrain details
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Paper 
                            elevation={activeTab === 'produce' ? 3 : 1}
                            onClick={() => setActiveTab('produce')}
                            sx={{ 
                              p: 3, 
                              borderRadius: 3,
                              cursor: 'pointer',
                              border: '2px solid',
                              borderColor: activeTab === 'produce' ? 'primary.main' : 'transparent',
                              bgcolor: activeTab === 'produce' ? 'rgba(76, 175, 80, 0.05)' : 'background.paper',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                              }
                            }}
                          >
                            <Box sx={{ mb: 2, textAlign: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 60, 
                                  height: 60,
                                  bgcolor: 'rgba(76, 175, 80, 0.15)',
                                  color: 'primary.main',
                                  margin: '0 auto',
                                  mb: 2
                                }}
                              >
                                <Inventory sx={{ fontSize: 30 }} />
                              </Avatar>
                              <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Produce Listing
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Sell crops, livestock, and other farm produce
                              </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ pl: 1 }}>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Category sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} /> Categories & varieties
                              </Typography>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <GradeOutlined sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} /> Quality & grading
                              </Typography>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarToday sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} /> Harvest information
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Paper 
                            elevation={activeTab === 'service' ? 3 : 1}
                            onClick={() => setActiveTab('service')}
                            sx={{ 
                              p: 3, 
                              borderRadius: 3,
                              cursor: 'pointer',
                              border: '2px solid',
                              borderColor: activeTab === 'service' ? 'primary.main' : 'transparent',
                              bgcolor: activeTab === 'service' ? 'rgba(76, 175, 80, 0.05)' : 'background.paper',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                              }
                            }}
                          >
                            <Box sx={{ mb: 2, textAlign: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 60, 
                                  height: 60,
                                  bgcolor: 'rgba(76, 175, 80, 0.15)',
                                  color: 'primary.main',
                                  margin: '0 auto',
                                  mb: 2
                                }}
                              >
                                <WorkOutline sx={{ fontSize: 30 }} />
                              </Avatar>
                              <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Service Listing
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Offer equipment rental, labor, or other farm services
                              </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ pl: 1 }}>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <DirectionsCarOutlined sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} /> Equipment & resources
                              </Typography>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <AccessTime sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} /> Availability & scheduling
                              </Typography>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <StarBorder sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} /> Experience & expertise
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </MotionCard>
                </Grid>
              </MotionGrid>
            )}

            {activeStep === 1 && (
              <MotionGrid container spacing={3}>
                <Grid item xs={12}>
                  <MotionCard 
                    elevation={3} 
                    sx={{ 
                      borderRadius: 3, 
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                    variants={itemVariants}
                  >
                    <Box 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        py: 2.5, 
                        px: 3,
                        borderBottom: '1px solid rgba(0,0,0,0.08)'
                      }}
                    >
                      <Typography variant="h6" color="white" fontWeight="bold">
                        Basic Information
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 4 }}>
                      <Grid container spacing={4}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Title *"
                            name="title"
                            variant="outlined"
                            placeholder="Enter a descriptive title"
                            value={formData.title}
                            onChange={handleChange}
                            error={Boolean(errors.title)}
                            helperText={errors.title || "A clear, compelling title helps your listing stand out"}
                            InputProps={{ 
                              sx: { borderRadius: 2 },
                              startAdornment: (
                                <InputAdornment position="start">
                                  <ListAlt color={errors.title ? "error" : "primary"} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Price *"
                            name="price"
                            variant="outlined"
                            placeholder="e.g. 50,000 UGX/month"
                            value={formData.price}
                            onChange={handleChange}
                            error={Boolean(errors.price)}
                            helperText={errors.price || "Include currency and payment frequency if applicable"}
                            InputProps={{ 
                              sx: { borderRadius: 2 },
                              startAdornment: (
                                <InputAdornment position="start">
                                  <MonetizationOn color={errors.price ? "error" : "primary"} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Location *"
                            name="location"
                            variant="outlined"
                            placeholder="e.g. Kampala, Central Region"
                            value={formData.location}
                            onChange={handleChange}
                            error={Boolean(errors.location)}
                            helperText={errors.location || "Specify district, region or nearest town"}
                            InputProps={{ 
                              sx: { borderRadius: 2 },
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LocationOn color={errors.location ? "error" : "primary"} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Description *"
                            name="description"
                            variant="outlined"
                            placeholder="Provide a detailed description of what you're offering..."
                            value={formData.description}
                            onChange={handleChange}
                            error={Boolean(errors.description)}
                            helperText={errors.description || "Include key features, benefits, and any unique selling points"}
                            multiline
                            rows={4}
                            InputProps={{ 
                              sx: { borderRadius: 2 },
                              startAdornment: (
                                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5, mr: 1 }}>
                                  <Description color={errors.description ? "error" : "primary"} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Features"
                            name="features"
                            variant="outlined"
                            placeholder="Comma-separated list of features (e.g. Fertile soil, Water access, Fenced)"
                            value={formData.features}
                            onChange={handleChange}
                            InputProps={{ 
                              sx: { borderRadius: 2 },
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CheckCircle color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                          <FormHelperText sx={{ ml: 4 }}>
                            Separate features with commas (e.g. "Irrigation system, Near market, All-season access")
                          </FormHelperText>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </MotionCard>
                </Grid>
              </MotionGrid>
            )}

            {activeStep === 2 && activeTab === 'land' && (
              <MotionGrid container spacing={3}>
                <Grid item xs={12}>
                  <MotionCard 
                    elevation={3} 
                    sx={{ 
                      borderRadius: 3, 
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                    variants={itemVariants}
                  >
                    <Box 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        py: 2.5, 
                        px: 3,
                        borderBottom: '1px solid rgba(0,0,0,0.08)'
                      }}
                    >
                      <Typography variant="h6" color="white" fontWeight="bold">
                        Land Details
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 4 }}>
                      <Grid container spacing={4}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Land Size *"
                            name="size"
                            variant="outlined"
                            placeholder="e.g. 5 acres, 2 hectares"
                            value={formData.size}
                            onChange={handleChange}
                            error={Boolean(errors.size)}
                            helperText={errors.size || "Specify the unit (acres, hectares, etc.)"}
                            InputProps={{ 
                              sx: { borderRadius: 2 },
                              startAdornment: (
                                <InputAdornment position="start">
                                  <StraightenOutlined color={errors.size ? "error" : "primary"} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel>Listing Type</InputLabel>
                            <Select
                              name="listingType"
                              value={formData.listingType}
                              onChange={handleChange}
                              label="Listing Type"
                              sx={{ borderRadius: 2 }}
                              startAdornment={
                                <InputAdornment position="start" sx={{ ml: 1, mr: -0.5 }}>
                                  <RequestQuote color="primary" />
                                </InputAdornment>
                              }
                            >
                              <MenuItem value="Lease">Lease</MenuItem>
                              <MenuItem value="Sale">Sale</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Soil Type"
                            name="soilType"
                            variant="outlined"
                            placeholder="e.g. Loam, Clay, Sandy"
                            value={formData.soilType}
                            onChange={handleChange}
                            InputProps={{ 
                              sx: { borderRadius: 2 },
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Terrain color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Terrain"
                            name="terrain"
                            variant="outlined"
                            placeholder="e.g. Flat, Hilly, Sloped"
                            value={formData.terrain}
                            onChange={handleChange}
                            InputProps={{ 
                              sx: { borderRadius: 2 },
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Terrain color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Water Source"
                            name="waterSource"
                            variant="outlined"
                            placeholder="e.g. River, Well, Borehole"
                            value={formData.waterSource}
                            onChange={handleChange}
                            InputProps={{ 
                              sx: { borderRadius: 2 },
                              startAdornment: (
                                <InputAdornment position="start">
                                  <WaterDrop color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Previous Crops"
                            name="previousCrops"
                            variant="outlined"
                            placeholder="e.g. Maize, Beans, Coffee"
                            value={formData.previousCrops}
                            onChange={handleChange}
                            InputProps={{ 
                              sx: { borderRadius: 2 },
                              startAdornment: (
                                <InputAdornment position="start">
                                  <NatureOutlined color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Access Roads"
                            name="accessRoads"
                            variant="outlined"
                            placeholder="e.g. Tarmac, Murram, Dirt"
                            value={formData.accessRoads}
                            onChange={handleChange}
                            InputProps={{ 
                              sx: { borderRadius: 2 },
                              startAdornment: (
                                <InputAdornment position="start">
                                  <DirectionsCarOutlined color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Nearby Markets"
                            name="nearbyMarkets"
                            variant="outlined"
                            placeholder="e.g. 5km to Kawempe market"
                            value={formData.nearbyMarkets}
                            onChange={handleChange}
                            InputProps={{ 
                              sx: { borderRadius: 2 },
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Store color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Lease Terms (if applicable)"
                            name="leaseTerms"
                            variant="outlined"
                            placeholder="e.g. 2 year minimum, payment quarterly"
                            value={formData.leaseTerms}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            InputProps={{ 
                              sx: { borderRadius: 2 },
                              startAdornment: (
                                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5, mr: 1 }}>
                                  <Description color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </MotionCard>
                </Grid>
              </MotionGrid>
            )}
            
            {activeStep === 3 && (
              <MotionGrid container spacing={3}>
                <Grid item xs={12}>
                  <MotionCard 
                    elevation={3} 
                    sx={{ 
                      borderRadius: 3, 
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                    variants={itemVariants}
                  >
                    <Box 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        py: 2.5, 
                        px: 3,
                        borderBottom: '1px solid rgba(0,0,0,0.08)'
                      }}
                    >
                      <Typography variant="h6" color="white" fontWeight="bold">
                        Upload Images (Optional)
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 4 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="body1" paragraph>
                              High-quality images can make your listing more attractive to potential buyers.
                            </Typography>
                            <Alert 
                              severity="info" 
                              icon={<Info />}
                              sx={{ 
                                mb: 4, 
                                borderRadius: 2,
                                '& .MuiAlert-message': { my: 1 }
                              }}
                            >
                              <Typography variant="subtitle2">Recommended Image Guidelines:</Typography>
                              <ul style={{ marginBottom: 0, paddingLeft: '1.5rem' }}>
                                <li>Upload clear, well-lit images (optional but recommended)</li>
                                <li>Include images from multiple angles</li>
                                <li>Show key features mentioned in your description</li>
                                <li>Maximum 5 images allowed (JPG, PNG, GIF format)</li>
                              </ul>
                            </Alert>
                          </Box>
                          
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 4, 
                              textAlign: 'center',
                              borderStyle: 'dashed',
                              borderWidth: 2,
                              borderRadius: 3,
                              borderColor: errors.images ? 'error.main' : 'primary.light',
                              bgcolor: 'rgba(76, 175, 80, 0.04)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'rgba(76, 175, 80, 0.08)'
                              }
                            }}
                          >
                            <input
                              type="file"
                              id="images"
                              multiple
                              accept="image/*"
                              onChange={handleImageChange}
                              style={{ display: 'none' }}
                            />
                            <label htmlFor="images">
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  sx={{
                                    width: 100,
                                    height: 100,
                                    bgcolor: 'rgba(76, 175, 80, 0.15)',
                                    color: 'primary.main',
                                    mb: 2
                                  }}
                                >
                                  <CloudUpload sx={{ fontSize: 48 }} />
                                </Avatar>
                                
                                <Typography variant="h6" color="primary.main" fontWeight="bold" gutterBottom>
                                  Drag & drop files here or click to browse
                                </Typography>
                                
                                <Button
                                  variant="contained"
                                  component="span"
                                  startIcon={<PhotoCamera />}
                                  size="large"
                                  sx={{ 
                                    mb: 2,
                                    borderRadius: 28,
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 10px rgba(76, 175, 80, 0.2)',
                                    background: 'linear-gradient(45deg, #2e7d32, #66bb6a)',
                                    '&:hover': {
                                      boxShadow: '0 6px 15px rgba(76, 175, 80, 0.3)',
                                    }
                                  }}
                                >
                                  Upload Images
                                </Button>
                              </Box>
                            </label>
                          </Paper>
                          {errors.images && (
                            <FormHelperText error sx={{ mt: 1, fontSize: '0.9rem' }}>
                              {errors.images}
                            </FormHelperText>
                          )}
                        </Grid>
                        
                        {previewImages.length > 0 && (
                          <Grid item xs={12}>
                            <Box sx={{ mt: 3 }}>
                              <Typography variant="h6" fontWeight="medium" gutterBottom color="primary.dark">
                                Preview Images ({previewImages.length}/5)
                              </Typography>
                              <Grid container spacing={3} sx={{ mt: 1 }}>
                                {previewImages.map((image, index) => (
                                  <Grid item xs={12} sm={6} md={4} key={index}>
                                    <MotionBox 
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ duration: 0.3 }}
                                      sx={{ 
                                        position: 'relative',
                                        borderRadius: 4,
                                        overflow: 'hidden',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                        height: 220,
                                        '&:hover': {
                                          boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
                                          transform: 'translateY(-5px)',
                                          '& .MuiIconButton-root': {
                                            opacity: 1
                                          },
                                          '& .image-overlay': {
                                            opacity: 0.6
                                          }
                                        },
                                        transition: 'all 0.3s ease'
                                      }}
                                    >
                                      <Box
                                        className="image-overlay"
                                        sx={{
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          right: 0,
                                          bottom: 0,
                                          bgcolor: 'black',
                                          opacity: 0,
                                          transition: 'opacity 0.3s ease'
                                        }}
                                      />
                                      <Box
                                        component="img"
                                        src={image.preview}
                                        alt={`Preview ${index + 1}`}
                                        sx={{
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover'
                                        }}
                                      />
                                      <Chip
                                        label={`Image ${index + 1}`}
                                        size="small"
                                        sx={{
                                          position: 'absolute',
                                          bottom: 12,
                                          left: 12,
                                          bgcolor: 'rgba(255,255,255,0.85)',
                                          fontWeight: 'medium'
                                        }}
                                      />
                                      <IconButton
                                        size="medium"
                                        onClick={() => removeImage(index)}
                                        sx={{
                                          position: 'absolute',
                                          top: 12,
                                          right: 12,
                                          bgcolor: 'white',
                                          color: 'error.main',
                                          '&:hover': {
                                            bgcolor: 'error.main',
                                            color: 'white'
                                          },
                                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                          opacity: 0.9,
                                          transition: 'all 0.2s ease'
                                        }}
                                      >
                                        <Cancel />
                                      </IconButton>
                                    </MotionBox>
                                  </Grid>
                                ))}
                                
                                {previewImages.length < 5 && (
                                  <Grid item xs={12} sm={6} md={4}>
                                    <Paper
                                      variant="outlined"
                                      component="label"
                                      htmlFor="add-more-images"
                                      sx={{
                                        height: 220,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderStyle: 'dashed',
                                        borderWidth: 2,
                                        borderColor: 'primary.light',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        bgcolor: 'rgba(76, 175, 80, 0.04)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          borderColor: 'primary.main',
                                          bgcolor: 'rgba(76, 175, 80, 0.08)',
                                          transform: 'translateY(-5px)',
                                          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                                        }
                                      }}
                                    >
                                      <input
                                        type="file"
                                        id="add-more-images"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                      />
                                      <Box sx={{ textAlign: 'center' }}>
                                        <AddCircleOutline color="primary" sx={{ fontSize: 40, mb: 2 }} />
                                        <Typography variant="subtitle1" color="primary.main" fontWeight="medium">
                                          Add More Images
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                          {5 - previewImages.length} more allowed
                                        </Typography>
                                      </Box>
                                    </Paper>
                                  </Grid>
                                )}
                              </Grid>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </MotionCard>
                </Grid>
              </MotionGrid>
            )}

            {activeTab === 'produce' && activeStep === 2 && (
              <Grid item xs={12}>
                <MotionCard 
                  elevation={2} 
                  sx={{ borderRadius: 2, mb: 3 }}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                      Produce Details
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth variant="outlined" error={Boolean(errors.category)}>
                          <InputLabel>Category *</InputLabel>
                          <Select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            label="Category *"
                            sx={{ borderRadius: 1.5 }}
                          >
                            <MenuItem value="Crops">Crops</MenuItem>
                            <MenuItem value="Fruits">Fruits</MenuItem>
                            <MenuItem value="Vegetables">Vegetables</MenuItem>
                            <MenuItem value="Livestock">Livestock</MenuItem>
                            <MenuItem value="Dairy">Dairy</MenuItem>
                            <MenuItem value="Poultry">Poultry</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                          {errors.category && (
                            <FormHelperText>{errors.category}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Quantity *"
                          name="quantity"
                          variant="outlined"
                          placeholder="e.g. 100 kg, 5 crates"
                          value={formData.quantity}
                          onChange={handleChange}
                          error={Boolean(errors.quantity)}
                          helperText={errors.quantity}
                          InputProps={{ sx: { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>Quality</InputLabel>
                          <Select
                            name="quality"
                            value={formData.quality}
                            onChange={handleChange}
                            label="Quality"
                            sx={{ borderRadius: 1.5 }}
                          >
                            <MenuItem value="Standard">Standard</MenuItem>
                            <MenuItem value="Premium">Premium</MenuItem>
                            <MenuItem value="Organic">Organic</MenuItem>
                            <MenuItem value="Export">Export Grade</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Variety/Breed"
                          name="variety"
                          variant="outlined"
                          placeholder="e.g. Arabica SL28, Fresian, Local"
                          value={formData.variety}
                          onChange={handleChange}
                          InputProps={{ sx: { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Harvest Date"
                          name="harvestDate"
                          variant="outlined"
                          type="date"
                          value={formData.harvestDate}
                          onChange={handleChange}
                          InputLabelProps={{ shrink: true }}
                          InputProps={{ sx: { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Processing Method"
                          name="processingMethod"
                          variant="outlined"
                          placeholder="e.g. Sun-dried, Washed, Machine processed"
                          value={formData.processingMethod}
                          onChange={handleChange}
                          InputProps={{ sx: { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Grade/Classification"
                          name="gradeOrClassification"
                          variant="outlined"
                          placeholder="e.g. Grade A, AA, Export quality"
                          value={formData.gradeOrClassification}
                          onChange={handleChange}
                          InputProps={{ sx: { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Certification"
                          name="certification"
                          variant="outlined"
                          placeholder="e.g. Organic, Fair Trade, None"
                          value={formData.certification}
                          onChange={handleChange}
                          InputProps={{ sx: { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Packaging"
                          name="packaging"
                          variant="outlined"
                          placeholder="e.g. 50kg bags, Crates, Bulk"
                          value={formData.packaging}
                          onChange={handleChange}
                          InputProps={{ sx: { borderRadius: 1.5 } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </MotionCard>
              </Grid>
            )}

            {activeTab === 'service' && activeStep === 2 && (
              <Grid item xs={12}>
                <MotionCard 
                  elevation={2} 
                  sx={{ borderRadius: 2, mb: 3 }}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                      Service Details
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined" error={Boolean(errors.serviceCategory)}>
                          <InputLabel>Service Category *</InputLabel>
                          <Select
                            name="serviceCategory"
                            value={formData.serviceCategory}
                            onChange={handleChange}
                            label="Service Category *"
                            sx={{ borderRadius: 1.5 }}
                          >
                            <MenuItem value="Equipment">Equipment Rental</MenuItem>
                            <MenuItem value="Labor">Labor/Workforce</MenuItem>
                            <MenuItem value="Transport">Transportation</MenuItem>
                            <MenuItem value="Processing">Processing Services</MenuItem>
                            <MenuItem value="Consultancy">Consultancy/Expert Services</MenuItem>
                            <MenuItem value="Storage">Storage Services</MenuItem>
                            <MenuItem value="Other">Other Services</MenuItem>
                          </Select>
                          {errors.serviceCategory && (
                            <FormHelperText>{errors.serviceCategory}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Availability *"
                          name="availability"
                          variant="outlined"
                          placeholder="e.g. Weekdays, Seasonal, Year-round"
                          value={formData.availability}
                          onChange={handleChange}
                          error={Boolean(errors.availability)}
                          helperText={errors.availability}
                          InputProps={{ sx: { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Equipment Type (if applicable)"
                          name="equipmentType"
                          variant="outlined"
                          placeholder="e.g. Tractor, Harvester, Irrigation system"
                          value={formData.equipmentType}
                          onChange={handleChange}
                          InputProps={{ sx: { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Years of Experience"
                          name="experienceYears"
                          variant="outlined"
                          type="number"
                          placeholder="e.g. 5"
                          value={formData.experienceYears}
                          onChange={handleChange}
                          InputProps={{ sx: { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Services Offered"
                          name="servicesOffered"
                          variant="outlined"
                          placeholder="e.g. Plowing, harrowing, planting"
                          value={formData.servicesOffered}
                          onChange={handleChange}
                          multiline
                          rows={3}
                          InputProps={{ sx: { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Coverage Area"
                          name="coverage"
                          variant="outlined"
                          placeholder="e.g. Kampala district, 50km radius from Jinja"
                          value={formData.coverage}
                          onChange={handleChange}
                          InputProps={{ sx: { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Price Details"
                          name="priceDetails"
                          variant="outlined"
                          placeholder="e.g. 150,000 UGX per day, includes fuel, transport extra"
                          value={formData.priceDetails}
                          onChange={handleChange}
                          multiline
                          rows={2}
                          InputProps={{ sx: { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Booking Process"
                          name="bookingProcess"
                          variant="outlined"
                          placeholder="e.g. 3 days advance notice, 50% deposit required"
                          value={formData.bookingProcess}
                          onChange={handleChange}
                          multiline
                          rows={2}
                          InputProps={{ sx: { borderRadius: 1.5 } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </MotionCard>
              </Grid>
            )}

            {activeStep === 4 && (
              <MotionGrid container spacing={3}>
                <Grid item xs={12}>
                  <MotionCard 
                    elevation={3} 
                    sx={{ 
                      borderRadius: 3, 
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                    variants={itemVariants}
                  >
                    <Box 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        py: 2.5, 
                        px: 3,
                        borderBottom: '1px solid rgba(0,0,0,0.08)'
                      }}
                    >
                      <Typography variant="h6" color="white" fontWeight="bold">
                        Review Your Listing
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 4 }}>
                      <Alert 
                        severity="success" 
                        icon={<CheckCircle />}
                        sx={{ 
                          mb: 4, 
                          borderRadius: 2,
                          '& .MuiAlert-message': { my: 1 }
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          Almost there! Please review your listing details before submission.
                        </Typography>
                      </Alert>
                      
                      <Grid container spacing={4}>
                        {/* Basic Information Summary */}
                        <Grid item xs={12}>
                          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <ListAlt color="primary" sx={{ mr: 1.5 }} />
                              <Typography variant="h6" fontWeight="bold">Basic Information</Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                                <Typography variant="body1" fontWeight="medium">{formData.title}</Typography>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Price</Typography>
                                <Typography variant="body1" fontWeight="medium">{formData.price}</Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                                <Typography variant="body1" fontWeight="medium">{formData.location}</Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                                <Typography variant="body1">{formData.description}</Typography>
                              </Grid>
                              {formData.features && (
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" color="text.secondary">Features</Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                    {formData.features.split(',').map((feature, index) => (
                                      feature.trim() && (
                                        <Chip 
                                          key={index}
                                          label={feature.trim()} 
                                          size="small"
                                          color="primary"
                                          variant="outlined"
                                        />
                                      )
                                    ))}
                                  </Box>
                                </Grid>
                              )}
                            </Grid>
                          </Paper>
                        </Grid>
                        
                        {/* Listing Type Specific Information */}
                        <Grid item xs={12}>
                          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              {activeTab === 'land' ? (
                                <NatureOutlined color="primary" sx={{ mr: 1.5 }} />
                              ) : activeTab === 'produce' ? (
                                <Inventory color="primary" sx={{ mr: 1.5 }} />
                              ) : (
                                <WorkOutline color="primary" sx={{ mr: 1.5 }} />
                              )}
                              <Typography variant="h6" fontWeight="bold">
                                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Details
                              </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            
                            {activeTab === 'land' && (
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={4}>
                                  <Typography variant="subtitle2" color="text.secondary">Size</Typography>
                                  <Typography variant="body1" fontWeight="medium">{formData.size}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                  <Typography variant="subtitle2" color="text.secondary">Listing Type</Typography>
                                  <Typography variant="body1" fontWeight="medium">{formData.listingType}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                  <Typography variant="subtitle2" color="text.secondary">Soil Type</Typography>
                                  <Typography variant="body1">{formData.soilType || 'Not specified'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                  <Typography variant="subtitle2" color="text.secondary">Terrain</Typography>
                                  <Typography variant="body1">{formData.terrain || 'Not specified'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                  <Typography variant="subtitle2" color="text.secondary">Water Source</Typography>
                                  <Typography variant="body1">{formData.waterSource || 'Not specified'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                  <Typography variant="subtitle2" color="text.secondary">Previous Crops</Typography>
                                  <Typography variant="body1">{formData.previousCrops || 'Not specified'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" color="text.secondary">Access Roads</Typography>
                                  <Typography variant="body1">{formData.accessRoads || 'Not specified'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" color="text.secondary">Nearby Markets</Typography>
                                  <Typography variant="body1">{formData.nearbyMarkets || 'Not specified'}</Typography>
                                </Grid>
                                {formData.leaseTerms && (
                                  <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Lease Terms</Typography>
                                    <Typography variant="body1">{formData.leaseTerms}</Typography>
                                  </Grid>
                                )}
                              </Grid>
                            )}
                          </Paper>
                        </Grid>
                        
                        {/* Images Preview */}
                        <Grid item xs={12}>
                          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <PhotoCamera color="primary" sx={{ mr: 1.5 }} />
                              <Typography variant="h6" fontWeight="bold">Images</Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            
                            {previewImages.length > 0 ? (
                              <Grid container spacing={2}>
                                {previewImages.map((image, index) => (
                                  <Grid item xs={6} sm={4} md={3} lg={2.4} key={index}>
                                    <Box
                                      sx={{ 
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        height: 120,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                      }}
                                    >
                                      <Box
                                        component="img"
                                        src={image.preview}
                                        alt={`Preview ${index + 1}`}
                                        sx={{
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover'
                                        }}
                                      />
                                    </Box>
                                  </Grid>
                                ))}
                              </Grid>
                            ) : (
                              <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                No images uploaded. Your listing will be created without images.
                              </Typography>
                            )}
                          </Paper>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={openConfirmDialog}
                          disabled={isSubmitting}
                          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <AddCircleOutline />}
                          sx={{ 
                            borderRadius: 28,
                            px: 5,
                            py: 1.5,
                            fontWeight: 'bold',
                            boxShadow: '0 4px 14px rgba(76, 175, 80, 0.25)',
                            background: 'linear-gradient(45deg, #2e7d32, #66bb6a)',
                            '&:hover': {
                              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.35)',
                            }
                          }}
                        >
                          {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
                        </Button>
                      </Box>
                    </CardContent>
                  </MotionCard>
                </Grid>
              </MotionGrid>
            )}
          </MotionBox>
        </AnimatePresence>
        
        {/* Navigation Buttons */}
        <MotionBox 
          sx={{ 
            mt: 5, 
            display: 'flex', 
            justifyContent: 'space-between', 
            gap: 2,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -20,
              left: 0,
              right: 0,
              height: 1,
              bgcolor: 'divider'
            }
          }}
          variants={itemVariants}
        >
          <Button
            onClick={() => activeStep === 0 ? navigate('/marketplace') : goToPreviousStep()}
            variant="outlined"
            color="inherit"
            startIcon={activeStep === 0 ? <Cancel /> : <KeyboardArrowLeft />}
            sx={{ 
              borderRadius: 28,
              px: 3,
              py: 1.2,
              fontWeight: 'medium',
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                bgcolor: 'rgba(0,0,0,0.04)'
              }
            }}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          {activeStep < 4 && (
            <MotionBox
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={goToNextStep}
                variant="contained"
                color="primary"
                endIcon={<KeyboardArrowRight />}
                sx={{ 
                  borderRadius: 28,
                  px: 4,
                  py: 1.2,
                  fontWeight: 'bold',
                  boxShadow: '0 4px 14px rgba(76, 175, 80, 0.25)',
                  background: 'linear-gradient(45deg, #2e7d32, #66bb6a)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.35)',
                  }
                }}
              >
                Next
              </Button>
            </MotionBox>
          )}
        </MotionBox>
      </form>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle id="confirm-dialog-title" sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">Confirm Listing Creation</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description" sx={{ mb: 3 }}>
            Are you sure you want to create this listing? Once created, it will be visible to all users.
          </DialogContentText>
          <Box sx={{ p: 2, bgcolor: 'rgba(76, 175, 80, 0.08)', borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {formDataToSubmit?.formData.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <MonetizationOn fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                {formDataToSubmit?.formData.price}
              </Typography>
              <LocationOn fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary">
                {formDataToSubmit?.formData.location}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)} 
            color="inherit"
            disabled={isSubmitting}
            sx={{ borderRadius: 28, px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmedSubmit} 
            color="primary" 
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ 
              borderRadius: 28,
              px: 3,
              py: 1,
              fontWeight: 'medium',
              boxShadow: '0 4px 10px rgba(76, 175, 80, 0.2)',
              background: 'linear-gradient(45deg, #2e7d32, #66bb6a)',
              '&:hover': {
                boxShadow: '0 6px 15px rgba(76, 175, 80, 0.3)',
              }
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create Listing'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSubmitting}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 'medium' }}>
            Creating Your Listing...
          </Typography>
        </Box>
      </Backdrop>
    </MotionContainer>
  );
};

export default CreateListing; 