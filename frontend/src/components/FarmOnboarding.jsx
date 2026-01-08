import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Slider,
  Alert,
  CircularProgress,
  useTheme,
  Fade,
  LinearProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// Icons
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NatureIcon from '@mui/icons-material/Nature';
import PetsIcon from '@mui/icons-material/Pets';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GrassIcon from '@mui/icons-material/Grass';

// Import farm service
import { farmService } from '../services/api/farmService';

const FARM_TYPES = [
  { value: 'crops', label: 'Crop Farming', icon: <GrassIcon /> },
  { value: 'livestock', label: 'Livestock Farming', icon: <PetsIcon /> },
  { value: 'mixed', label: 'Mixed Farming', icon: <AgricultureIcon /> },
  { value: 'dairy', label: 'Dairy Farming', icon: <PetsIcon /> },
  { value: 'poultry', label: 'Poultry Farming', icon: <PetsIcon /> },
  { value: 'aquaculture', label: 'Fish Farming', icon: <NatureIcon /> },
  { value: 'horticulture', label: 'Horticulture', icon: <GrassIcon /> },
  { value: 'agroforestry', label: 'Agroforestry', icon: <NatureIcon /> }
];

const COMMON_CROPS = [
  'Maize (Corn)', 'Rice', 'Coffee', 'Tea', 'Bananas', 'Beans', 'Cassava', 
  'Sweet Potatoes', 'Irish Potatoes', 'Tomatoes', 'Onions', 'Cabbage',
  'Groundnuts (Peanuts)', 'Sunflower', 'Cotton', 'Sugarcane', 'Wheat',
  'Barley', 'Sorghum', 'Millet', 'Peas', 'Carrots', 'Lettuce', 'Spinach'
];

const COMMON_LIVESTOCK = [
  'Cattle', 'Goats', 'Sheep', 'Pigs', 'Chickens', 'Ducks', 'Turkeys',
  'Rabbits', 'Fish', 'Bees'
];

const UGANDA_DISTRICTS = [
  'Kampala', 'Wakiso', 'Mukono', 'Mbarara', 'Gulu', 'Lira', 'Jinja',
  'Mbale', 'Fort Portal', 'Masaka', 'Soroti', 'Arua', 'Kasese',
  'Kabale', 'Hoima', 'Moroto', 'Kitgum', 'Iganga', 'Tororo', 'Busia'
];

const FARM_GOALS = [
  'Increase productivity',
  'Improve profitability',
  'Sustainable farming',
  'Expand operations',
  'Better animal health',
  'Crop diversification',
  'Water conservation',
  'Reduce costs',
  'Market access',
  'Technology adoption'
];

const FarmOnboarding = ({ onComplete, userId }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [setupProgress, setSetupProgress] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    farmName: '',
    location: '',
    address: '',
    totalArea: '',
    establishedDate: null,
    farmType: '',
    description: '',
    
    // Crops and Livestock
    primaryCrops: [],
    livestock: [],
    
    // Farm Goals and Preferences
    goals: [],
    experience: 'beginner',
    budget: 'low',
    technology: 'basic',
    
    // Contact Information
    contactPhone: '',
    contactEmail: '',
    
    // Preferences
    measurementSystem: 'metric',
    currency: 'UGX'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadSetupProgress = async () => {
      if (!userId) return;
      
      try {
        const result = await farmService.getFarmSetupProgress();
        if (result.data) {
          setSetupProgress(result.data);
          // If setup is already started, load existing data
          if (result.data.form_data) {
            setFormData(prev => ({ ...prev, ...result.data.form_data }));
          }
          // Set active step based on progress
          const stepMap = {
            'basic_info': 0,
            'farm_details': 1,
            'crops_livestock': 2,
            'goals_preferences': 3,
            'contact_preferences': 4,
            'review': 5
          };
          setActiveStep(stepMap[result.data.current_step] || 0);
        }
      } catch (error) {
        console.error('Error loading setup progress:', error);
      }
    };

    loadSetupProgress();
  }, [userId]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Basic Information
        if (!formData.farmName) newErrors.farmName = 'Farm name is required';
        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.totalArea) newErrors.totalArea = 'Total area is required';
        if (!formData.farmType) newErrors.farmType = 'Farm type is required';
        break;
        
      case 1: // Farm Details
        if (!formData.description) newErrors.description = 'Farm description is required';
        break;
        
      case 2: // Crops and Livestock
        if (formData.farmType === 'crops' && formData.primaryCrops.length === 0) {
          newErrors.primaryCrops = 'Select at least one crop';
        }
        if (formData.farmType === 'livestock' && formData.livestock.length === 0) {
          newErrors.livestock = 'Select at least one livestock type';
        }
        if (formData.farmType === 'mixed' && formData.primaryCrops.length === 0 && formData.livestock.length === 0) {
          newErrors.mixed = 'Select at least one crop or livestock type';
        }
        break;
        
      case 3: // Goals and Preferences
        if (formData.goals.length === 0) newErrors.goals = 'Select at least one goal';
        break;
        
      case 4: // Contact and Preferences
        if (!formData.contactPhone && !formData.contactEmail) {
          newErrors.contact = 'Provide at least one contact method';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProgress = async (stepName, stepNumber) => {
    if (!userId) return;
    
    try {
      const completionPercentage = Math.round(((stepNumber + 1) / 6) * 100);
      
      await farmService.updateFarmSetupProgress({
        current_step: stepName,
        completion_percentage: completionPercentage,
        form_data: formData,
        last_completed_step: stepNumber
      });
      
      setSetupProgress(prev => ({
        ...prev,
        current_step: stepName,
        completion_percentage: completionPercentage,
        form_data: formData
      }));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleNext = async () => {
    if (!validateStep(activeStep)) return;
    
    const stepNames = ['basic_info', 'farm_details', 'crops_livestock', 'goals_preferences', 'contact_preferences', 'review'];
    await saveProgress(stepNames[activeStep + 1] || 'complete', activeStep + 1);
    
    if (activeStep === 5) {
      // Final step - complete onboarding
      await handleComplete();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      // Create the farm record
      const farmData = {
        name: formData.farmName,
        description: formData.description,
        location: formData.location,
        address: formData.address,
        total_area_hectares: parseFloat(formData.totalArea),
        established_date: formData.establishedDate ? dayjs(formData.establishedDate).format('YYYY-MM-DD') : null,
        farm_type: formData.farmType,
        primary_crops: formData.primaryCrops,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
        measurement_system: formData.measurementSystem,
        currency: formData.currency,
        status: 'active'
      };
      
      const result = await farmService.createFarm(farmData);
      
      if (result.error) {
        throw result.error;
      }else{
        console.log("Farm created successfully:", result.data);
      }
      
      // Save farm goals and preferences
      if (formData.goals.length > 0) {
        await farmService.saveFarmGoals(result.data.id, formData.goals);
      }
      
      // Mark setup as complete
      await farmService.completeFarmSetup();
      
      // Call the completion callback
      onComplete(result.data);
      
    } catch (error) {
      console.error('Error completing farm setup:', error);
      setErrors({ submit: 'Failed to create farm. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      label: 'Basic Information',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Farm Name"
              value={formData.farmName}
              onChange={(e) => updateFormData('farmName', e.target.value)}
              error={!!errors.farmName}
              helperText={errors.farmName}
              placeholder="e.g., Green Valley Farm"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={UGANDA_DISTRICTS}
              value={formData.location}
              onChange={(e, value) => updateFormData('location', value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="District/Location"
                  error={!!errors.location}
                  helperText={errors.location}
                />
              )}
              freeSolo
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Farm Size (hectares)"
              type="number"
              value={formData.totalArea}
              onChange={(e) => updateFormData('totalArea', e.target.value)}
              error={!!errors.totalArea}
              helperText={errors.totalArea}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address (Optional)"
              value={formData.address}
              onChange={(e) => updateFormData('address', e.target.value)}
              placeholder="Detailed address or directions to your farm"
              multiline
              rows={2}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Farm Established"
                value={formData.establishedDate}
                onChange={(date) => updateFormData('establishedDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                maxDate={dayjs()}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.farmType}>
              <InputLabel>Farm Type</InputLabel>
              <Select
                value={formData.farmType}
                onChange={(e) => updateFormData('farmType', e.target.value)}
                label="Farm Type"
              >
                {FARM_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {type.icon}
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.farmType && <Typography variant="caption" color="error">{errors.farmType}</Typography>}
            </FormControl>
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Farm Details',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Farm Description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              error={!!errors.description}
              helperText={errors.description || 'Describe your farm, its current state, and what you focus on'}
              multiline
              rows={4}
              placeholder="Tell us about your farm, what you currently grow or raise, your farming methods, and any special features..."
            />
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Crops & Livestock',
      content: (
        <Grid container spacing={3}>
          {(formData.farmType === 'crops' || formData.farmType === 'mixed' || formData.farmType === 'horticulture') && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Primary Crops</Typography>
              <Autocomplete
                multiple
                options={COMMON_CROPS}
                value={formData.primaryCrops}
                onChange={(e, value) => updateFormData('primaryCrops', value)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select your main crops"
                    error={!!errors.primaryCrops}
                    helperText={errors.primaryCrops}
                  />
                )}
                freeSolo
              />
            </Grid>
          )}
          
          {(formData.farmType === 'livestock' || formData.farmType === 'mixed' || formData.farmType === 'dairy' || formData.farmType === 'poultry') && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Livestock</Typography>
              <Autocomplete
                multiple
                options={COMMON_LIVESTOCK}
                value={formData.livestock}
                onChange={(e, value) => updateFormData('livestock', value)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select your livestock"
                    error={!!errors.livestock}
                    helperText={errors.livestock}
                  />
                )}
                freeSolo
              />
            </Grid>
          )}
          
          {errors.mixed && (
            <Grid item xs={12}>
              <Alert severity="error">{errors.mixed}</Alert>
            </Grid>
          )}
        </Grid>
      )
    },
    {
      label: 'Goals & Experience',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Farm Goals</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              What do you want to achieve with your farm? (Select all that apply)
            </Typography>
            <Autocomplete
              multiple
              options={FARM_GOALS}
              value={formData.goals}
              onChange={(e, value) => updateFormData('goals', value)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select your goals"
                  error={!!errors.goals}
                  helperText={errors.goals}
                />
              )}
              freeSolo
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Experience Level</InputLabel>
              <Select
                value={formData.experience}
                onChange={(e) => updateFormData('experience', e.target.value)}
                label="Experience Level"
              >
                <MenuItem value="beginner">Beginner (0-2 years)</MenuItem>
                <MenuItem value="intermediate">Intermediate (3-10 years)</MenuItem>
                <MenuItem value="experienced">Experienced (10+ years)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Budget Range</InputLabel>
              <Select
                value={formData.budget}
                onChange={(e) => updateFormData('budget', e.target.value)}
                label="Budget Range"
              >
                <MenuItem value="low">Low (&lt; 2M UGX/year)</MenuItem>
                <MenuItem value="medium">Medium (2M - 10M UGX/year)</MenuItem>
                <MenuItem value="high">High (&gt; 10M UGX/year)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Technology Level</InputLabel>
              <Select
                value={formData.technology}
                onChange={(e) => updateFormData('technology', e.target.value)}
                label="Technology Level"
              >
                <MenuItem value="basic">Basic (Traditional methods)</MenuItem>
                <MenuItem value="intermediate">Intermediate (Some modern tools)</MenuItem>
                <MenuItem value="advanced">Advanced (IoT, automation)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Contact & Preferences',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.contactPhone}
              onChange={(e) => updateFormData('contactPhone', e.target.value)}
              placeholder="+256 xxx xxx xxx"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => updateFormData('contactEmail', e.target.value)}
              placeholder="your.email@example.com"
            />
          </Grid>
          
          {errors.contact && (
            <Grid item xs={12}>
              <Alert severity="error">{errors.contact}</Alert>
            </Grid>
          )}
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Measurement System</InputLabel>
              <Select
                value={formData.measurementSystem}
                onChange={(e) => updateFormData('measurementSystem', e.target.value)}
                label="Measurement System"
              >
                <MenuItem value="metric">Metric (kg, liters, hectares)</MenuItem>
                <MenuItem value="imperial">Imperial (lbs, gallons, acres)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={formData.currency}
                onChange={(e) => updateFormData('currency', e.target.value)}
                label="Currency"
              >
                <MenuItem value="UGX">Ugandan Shilling (UGX)</MenuItem>
                <MenuItem value="USD">US Dollar (USD)</MenuItem>
                <MenuItem value="EUR">Euro (EUR)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )
    },
    {
      label: 'Review & Complete',
      content: (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Review Your Farm Information</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  {formData.farmName}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2"><strong>Location:</strong> {formData.location}</Typography>
                    <Typography variant="body2"><strong>Size:</strong> {formData.totalArea} hectares</Typography>
                    <Typography variant="body2"><strong>Type:</strong> {FARM_TYPES.find(t => t.value === formData.farmType)?.label}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2"><strong>Established:</strong> {formData.establishedDate ? dayjs(formData.establishedDate).format('YYYY') : 'Not specified'}</Typography>
                    <Typography variant="body2"><strong>Experience:</strong> {formData.experience}</Typography>
                    <Typography variant="body2"><strong>Currency:</strong> {formData.currency}</Typography>
                  </Grid>
                </Grid>
                
                {formData.primaryCrops.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2"><strong>Primary Crops:</strong></Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {formData.primaryCrops.map((crop, index) => (
                        <Chip key={index} label={crop} size="small" />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {formData.livestock.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2"><strong>Livestock:</strong></Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {formData.livestock.map((animal, index) => (
                        <Chip key={index} label={animal} size="small" />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {formData.goals.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2"><strong>Goals:</strong></Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {formData.goals.map((goal, index) => (
                        <Chip key={index} label={goal} size="small" color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {errors.submit && (
            <Grid item xs={12}>
              <Alert severity="error">{errors.submit}</Alert>
            </Grid>
          )}
        </Grid>
      )
    }
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AgricultureIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to Farm Agent
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Let's set up your farm profile to get you started with personalized farm management
          </Typography>
          
          {setupProgress && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Setup Progress: {setupProgress.completion_percentage}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={setupProgress.completion_percentage} 
                sx={{ borderRadius: 1, height: 8 }}
              />
            </Box>
          )}
        </Box>

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="h6">{step.label}</Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mt: 2, mb: 3 }}>
                  {step.content}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    variant="outlined"
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : (index === steps.length - 1 ? <CheckCircleIcon /> : null)}
                  >
                    {loading ? 'Setting up...' : (index === steps.length - 1 ? 'Complete Setup' : 'Next')}
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Box>
  );
};

export default FarmOnboarding;
