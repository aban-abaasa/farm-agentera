import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  FormHelperText
} from '@mui/material';
import {
  CloudUpload,
  Cancel,
  Close,
  PhotoCamera,
  AddCircleOutline
} from '@mui/icons-material';

const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('land');
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

  // Redirect if not logged in
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + previewImages.length > 5) {
      setErrors({
        ...errors,
        images: 'Maximum 5 images allowed',
      });
      return;
    }
    
    // Create preview URLs
    const newPreviewImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    
    setPreviewImages([...previewImages, ...newPreviewImages]);
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

  const validateForm = () => {
    const newErrors = {};
    
    // Validate common fields
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.price.trim()) newErrors.price = 'Price is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (previewImages.length === 0) newErrors.images = 'At least one image is required';

    // Validate fields based on listing type
    if (activeTab === 'land') {
      if (!formData.size.trim()) newErrors.size = 'Size is required';
    } else if (activeTab === 'produce') {
      if (!formData.quantity.trim()) newErrors.quantity = 'Quantity is required';
      if (!formData.category.trim()) newErrors.category = 'Category is required';
    } else if (activeTab === 'service') {
      if (!formData.serviceCategory.trim()) newErrors.serviceCategory = 'Service category is required';
      if (!formData.availability.trim()) newErrors.availability = 'Availability is required';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real app, we'd upload images and submit the form data to an API
    // For now, we'll simulate a successful submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Listing created successfully!');
      navigate(`/marketplace/${activeTab}`);
    }, 1500);
  };

  // Convert features string to array (for display purposes)
  const getFeaturesList = () => {
    return formData.features.split(',').map(feature => feature.trim()).filter(Boolean);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Create New Listing
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Fill out the form below to create your listing. Fields marked with * are required.
        </Typography>
      </Box>
      
      {/* Listing Type Tabs */}
      <Paper elevation={2} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              py: 2,
              fontSize: '1rem',
              fontWeight: 'medium'
            }
          }}
        >
          <Tab value="land" label="Land" />
          <Tab value="produce" label="Produce" />
          <Tab value="service" label="Service" />
        </Tabs>
      </Paper>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Common Fields */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
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
                      helperText={errors.title}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
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
                      helperText={errors.price}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
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
                      helperText={errors.location}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description *"
                      name="description"
                      variant="outlined"
                      placeholder="Provide a detailed description..."
                      value={formData.description}
                      onChange={handleChange}
                      error={Boolean(errors.description)}
                      helperText={errors.description}
                      multiline
                      rows={4}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Features"
                      name="features"
                      variant="outlined"
                      placeholder="Comma-separated list of features (e.g. Fertile soil, Water access)"
                      value={formData.features}
                      onChange={handleChange}
                      InputProps={{ sx: { borderRadius: 1.5 } }}
                    />
                    <FormHelperText>Separate features with commas</FormHelperText>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Images *
                    </Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 3, 
                        textAlign: 'center',
                        borderStyle: 'dashed',
                        borderRadius: 2,
                        borderColor: errors.images ? 'error.main' : 'divider',
                        bgcolor: 'background.default'
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
                        <Button
                          variant="contained"
                          component="span"
                          startIcon={<CloudUpload />}
                          sx={{ mb: 2 }}
                        >
                          Upload Images
                        </Button>
                      </label>
                      <Typography variant="body2" color="text.secondary">
                        Click to upload images (maximum 5)
                      </Typography>
                    </Paper>
                    {errors.images && (
                      <FormHelperText error>{errors.images}</FormHelperText>
                    )}
                    
                    {previewImages.length > 0 && (
                      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {previewImages.map((image, index) => (
                          <Box 
                            key={index} 
                            sx={{ 
                              position: 'relative',
                              width: 100,
                              height: 100,
                              borderRadius: 1,
                              overflow: 'hidden'
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
                            <IconButton
                              size="small"
                              onClick={() => removeImage(index)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(0, 0, 0, 0.5)',
                                color: 'white',
                                '&:hover': {
                                  bgcolor: 'rgba(0, 0, 0, 0.7)'
                                },
                                p: 0.5
                              }}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Land Specific Fields */}
          {activeTab === 'land' && (
            <Grid item xs={12}>
              <Card elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                    Land Details
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Size *"
                        name="size"
                        variant="outlined"
                        placeholder="e.g. 5 acres"
                        value={formData.size}
                        onChange={handleChange}
                        error={Boolean(errors.size)}
                        helperText={errors.size}
                        InputProps={{ sx: { borderRadius: 1.5 } }}
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
                          sx={{ borderRadius: 1.5 }}
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
                        InputProps={{ sx: { borderRadius: 1.5 } }}
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
                        InputProps={{ sx: { borderRadius: 1.5 } }}
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
                        InputProps={{ sx: { borderRadius: 1.5 } }}
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
                        InputProps={{ sx: { borderRadius: 1.5 } }}
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
                        InputProps={{ sx: { borderRadius: 1.5 } }}
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
                        InputProps={{ sx: { borderRadius: 1.5 } }}
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
                        InputProps={{ sx: { borderRadius: 1.5 } }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Produce Specific Fields */}
          {activeTab === 'produce' && (
            <Grid item xs={12}>
              <Card elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
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
              </Card>
            </Grid>
          )}

          {/* Service Specific Fields */}
          {activeTab === 'service' && (
            <Grid item xs={12}>
              <Card elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
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
              </Card>
            </Grid>
          )}
        </Grid>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            component={Link}
            to="/marketplace"
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 1.5, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <AddCircleOutline />}
            sx={{ borderRadius: 1.5, px: 3 }}
          >
            {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default CreateListing; 