import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Card, CardContent, Typography, Box, Badge, 
  Divider, Button, Avatar, CardHeader, CardActions,
  TextField, InputAdornment, IconButton, Paper, Tabs, Tab,
  FormControl, Select, MenuItem, InputLabel, Grid, Container,
  Chip, CircularProgress, Alert
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  Person as PersonIcon
} from '@mui/icons-material';

// Import API services
import { getListings } from '../../services/api/marketplaceService';
import { marketplaceCategories } from '../../mocks/marketplace_categories'

// Add region and crop lists for selectors
const regions = [
  'Central', 'Eastern', 'Northern', 'Western', 'West Nile', 'Karamoja', 'Elgon', 'Southwestern', 'Lango', 'Acholi', 'Teso', 'Bukedi', 'Bunyoro', 'Bugisu', 'Busoga', 'Kigezi', 'Toro', 'Ankole'
];
const crops = [
  'Maize', 'Beans', 'Coffee', 'Banana', 'Cassava', 'Rice', 'Groundnuts', 'Sorghum', 'Millet', 'Sunflower', 'Soybean', 'Sweet Potato', 'Cotton', 'Sugarcane', 'Tea', 'Horticulture'
];
// Mock suppliers data
const suppliers = [
  {
    name: 'NASECO Seeds',
    region: 'Central',
    crops: ['Maize', 'Beans', 'Rice'],
    address: 'Kampala, Uganda',
    contact: '+256 700 123456',
    website: 'https://nasecoseeds.com',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    rating: 4.7
  },
  {
    name: 'East African Seed Co.',
    region: 'Eastern',
    crops: ['Maize', 'Sorghum', 'Sunflower'],
    address: 'Mbale, Uganda',
    contact: '+256 701 234567',
    website: 'https://eastafricanseed.com',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    rating: 4.5
  },
  {
    name: 'Bukoola Chemical Industries',
    region: 'Western',
    crops: ['Coffee', 'Banana', 'Tea'],
    address: 'Mbarara, Uganda',
    contact: '+256 702 345678',
    website: 'https://bukoolachemicals.com',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=400&q=80',
    rating: 4.8
  },
  {
    name: 'AgroMax Uganda',
    region: 'Northern',
    crops: ['Cassava', 'Groundnuts', 'Soybean'],
    address: 'Gulu, Uganda',
    contact: '+256 703 456789',
    website: 'https://agromaxug.com',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    rating: 4.6
  },
];

// Helper function to get image URL
const getImageUrl = (listing) => {
  // Handle both thumbnail and images array
  if (listing.thumbnail) {
    return listing.thumbnail;
  }
  
  if (listing.images && listing.images.length > 0) {
    // If it's a string URL, return it
    if (typeof listing.images[0] === 'string') {
      return listing.images[0];
    }
    // If it's an imported image, return it as is
    return listing.images[0];
  }
  
  // Fallback to placeholder image based on type
  return `https://source.unsplash.com/400x300/?${listing.type},agriculture`;
};

// Helper function to format price
const formatPrice = (listing) => {
  if (listing.is_negotiable) {
    return 'Negotiable';
  }
  
  if (!listing.price) {
    return 'Contact for price';
  }
  
  // Format price with UGX currency
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0
  }).format(listing.price);
};

// Get featured listings from mock data
// Helper function to check if a listing matches selected region/crop
const matchesRegionAndCrop = (listing, selectedRegion, selectedCrop) => {
  // Check region in location string (case-insensitive)
  const regionMatch = selectedRegion ? (listing.location && listing.location.toLowerCase().includes(selectedRegion.toLowerCase())) : true;
  // Check crop in title/type/crop fields (case-insensitive)
  const cropMatch = selectedCrop ? (
    (listing.title && listing.title.toLowerCase().includes(selectedCrop.toLowerCase())) ||
    (listing.type && listing.type.toLowerCase().includes(selectedCrop.toLowerCase())) ||
    (listing.crop && listing.crop.toLowerCase().includes(selectedCrop.toLowerCase()))
  ) : true;
  return regionMatch && cropMatch;
};

const Marketplace = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [region, setRegion] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  // Add selectors for personalization
  const [selectedRegion, setSelectedRegion] = useState('Central');
  const [selectedCrop, setSelectedCrop] = useState('Maize');
  
  // State for API data
  const [listings, setListings] = useState([]);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch listings from API
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all active listings
        const { data: allListings, error: listingsError } = await getListings({
          status: 'active',
          limit: 100
        });
        
        if (listingsError) throw listingsError;
        
        setListings(allListings || []);
        
        // Set featured listings (first few listings with featured flag or recent ones)
        const featured = (allListings || [])
          .filter(listing => listing.featured)
          .slice(0, 4);
        
        // If not enough featured listings, fill with recent ones
        if (featured.length < 4) {
          const recent = (allListings || [])
            .filter(listing => !listing.featured)
            .slice(0, 4 - featured.length);
          featured.push(...recent);
        }
        
        setFeaturedListings(featured);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError(err.message || 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Filter listings by type
  const landListings = listings.filter(listing => listing.type === 'land');
  const produceListings = listings.filter(listing => listing.type === 'produce');
  const serviceListings = listings.filter(listing => listing.type === 'service');

  // Filter featured listings
  const filteredFeaturedListings = featuredListings.filter(listing => 
    matchesRegionAndCrop(listing, selectedRegion, selectedCrop)
  );

  // Filter listings by region and crop
  const filteredLandListings = landListings.filter(listing => 
    matchesRegionAndCrop(listing, selectedRegion, selectedCrop)
  );
  const filteredProduceListings = produceListings.filter(listing => 
    matchesRegionAndCrop(listing, selectedRegion, selectedCrop)
  );
  const filteredServiceListings = serviceListings.filter(listing => 
    matchesRegionAndCrop(listing, selectedRegion, selectedCrop)
  );

  return (
    <Box>
      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      )}
      
      {/* Error State */}
      {error && (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        </Box>
      )}
      
      {/* Main Content - Only show when not loading */}
      {!loading && (
        <>
          {/* Region & Crop Selectors */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center', mt: 3, ml: 2 }}>
            <TextField
              select
              label="Region"
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              size="small"
              sx={{ minWidth: 160 }}
            >
              {regions.map(region => (
                <MenuItem key={region} value={region}>{region}</MenuItem>
              ))}
            </TextField>
        <TextField
          select
          label="Crop"
          value={selectedCrop}
          onChange={e => setSelectedCrop(e.target.value)}
          size="small"
          sx={{ minWidth: 160 }}
        >
          {crops.map(crop => (
            <MenuItem key={crop} value={crop}>{crop}</MenuItem>
          ))}
        </TextField>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          <b>Selected Region:</b> {selectedRegion} &nbsp; | &nbsp; <b>Crop:</b> {selectedCrop}
        </Typography>
      </Box>
      {/* Header section */}
      <Box 
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.primary.main}30 100%)`,
          borderRadius: 4,
          boxShadow: (theme) => `0 10px 30px ${theme.palette.primary.main}20`,
          mb: 6,
        }}
      >
        {/* Decorative elements */}
        <Box 
          sx={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: (theme) => `radial-gradient(circle, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}00 70%)`,
            top: '-100px',
            right: '-50px',
            zIndex: 0,
          }}
        />
        
        <Box 
          sx={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: (theme) => `radial-gradient(circle, ${theme.palette.secondary.main}10 0%, ${theme.palette.secondary.main}00 70%)`,
            bottom: '-80px',
            left: '10%',
            zIndex: 0,
          }}
        />
        
        {/* Marketplace illustration */}
        <Box 
          sx={{
            position: 'absolute',
            right: { xs: '-100px', sm: '-80px', md: '2%' },
            bottom: 0,
            width: { xs: '200px', sm: '220px', md: '280px' },
            height: { xs: '200px', sm: '220px', md: '280px' },
            opacity: 0.2,
            backgroundImage: (theme) => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 512'%3E%3Cpath fill='${encodeURIComponent(theme.palette.primary.main)}' d='M423.3 440.7c0 25.3-20.3 45.6-45.6 45.6s-45.8-20.3-45.8-45.6 20.6-45.8 45.8-45.8c25.4 0 45.6 20.5 45.6 45.8zm-253.9 0c0 25.3-20.4 45.6-45.6 45.6s-45.6-20.3-45.6-45.6 20.3-45.8 45.6-45.8 45.6 20.5 45.6 45.8zm291.7-270C158.9 109.1 81.9 112.1 0 51.7V384c83.2 60.2 156.7 56 256.3 56 100.5 0 215.6 6.3 328.7-56V51.7c-74.8 53.9-167.6 112-324.9 119z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            zIndex: 0,
          }}
        />
        
        <Box sx={{ 
          position: 'relative', 
          zIndex: 2, 
          p: { xs: 4, sm: 6, md: 8 },
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }}>
          <Box sx={{ 
            display: { md: 'flex' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 4
          }}>
            <Box sx={{ maxWidth: { md: '60%' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StoreIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    textTransform: 'uppercase', 
                    fontWeight: 600, 
                    letterSpacing: 1, 
                    color: 'primary.main'
                  }}
                >
                  Agricultural Trading Hub
                </Typography>
              </Box>
              
              <Typography 
                component="h1" 
                variant="h2" 
                fontWeight={800}
                sx={{ 
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3.75rem' },
                  textShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  position: 'relative',
                  color: 'primary.dark',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-16px',
                    left: 0,
                    width: '80px',
                    height: '4px',
                    background: (theme) => `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.main}30)`,
                    borderRadius: '2px',
                  }
                }}
              >
                Marketplace
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 4, 
                  mt: 4,
                  maxWidth: '600px',
                  color: 'text.secondary',
                  lineHeight: 1.6
                }}
              >
                Connect with farmers across Uganda to buy, sell, or exchange land, produce, 
                livestock, equipment, and agricultural services. Empowering rural communities 
                through direct market access.
              </Typography>
            </Box>

            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              alignItems: 'center',
              justifyContent: 'center',
              mt: { xs: 4, md: 0 }
            }}>
              <Button
                variant="contained"
                component={Link}
                to="/marketplace/create"
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  boxShadow: (theme) => `0 4px 14px ${theme.palette.primary.main}40`
                }}
              >
                Create Listing
              </Button>
            </Box>
          </Box>
          
          {/* Search box in header */}
          <Box 
            component="form" 
            sx={{ 
              display: 'flex', 
              maxWidth: '800px',
              position: 'relative',
              boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
              borderRadius: 3,
              overflow: 'hidden',
              mt: 2,
              mb: 2
            }}
          >
            <TextField
              fullWidth
              placeholder="Search for land, produce, services..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                sx: { 
                  bgcolor: 'background.paper', 
                  py: 0.5,
                  '& fieldset': {
                    border: 'none'
                  }
                }
              }}
            />
            <Button 
              color="primary"
              variant="contained"
              sx={{ 
                borderRadius: 0, 
                px: 3,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
                bgcolor: 'primary.main',
              }}
            >
              Search
            </Button>
          </Box>
          
          {/* Quick filter badges */}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 1.5,
            mt: { xs: 2, sm: 0 }
          }}>
            <Chip 
              label="All Listings" 
              clickable
              onClick={() => setCategory('')}
              color={category === '' ? 'primary' : 'default'}
              variant={category === '' ? 'filled' : 'outlined'}
              sx={{ 
                fontWeight: 'medium', 
                px: 1,
                bgcolor: (theme) => category === '' ? `${theme.palette.primary.main}E6` : 'rgba(255,255,255,0.9)',
              }}
            />
            <Chip 
              label="Land" 
              clickable
              onClick={() => setCategory('land')}
              color={category === 'land' ? 'primary' : 'default'}
              variant={category === 'land' ? 'filled' : 'outlined'}
              sx={{ 
                fontWeight: 'medium', 
                px: 1,
                bgcolor: (theme) => category === 'land' ? `${theme.palette.primary.main}E6` : 'rgba(255,255,255,0.9)',
              }}
            />
            <Chip 
              label="Produce" 
              clickable
              onClick={() => setCategory('produce')}
              color={category === 'produce' ? 'primary' : 'default'}
              variant={category === 'produce' ? 'filled' : 'outlined'}
              sx={{ 
                fontWeight: 'medium', 
                px: 1,
                bgcolor: (theme) => category === 'produce' ? `${theme.palette.primary.main}E6` : 'rgba(255,255,255,0.9)',
              }}
            />
            <Chip 
              label="Services" 
              clickable
              onClick={() => setCategory('services')}
              color={category === 'services' ? 'primary' : 'default'}
              variant={category === 'services' ? 'filled' : 'outlined'}
              sx={{ 
                fontWeight: 'medium', 
                px: 1,
                bgcolor: (theme) => category === 'services' ? `${theme.palette.primary.main}E6` : 'rgba(255,255,255,0.9)',
              }}
            />
            {user && (
              <Chip 
                label="My Listings" 
                clickable
                icon={<PersonIcon />}
                color="secondary"
                variant="outlined"
                sx={{ 
                  fontWeight: 'medium', 
                  px: 1,
                  bgcolor: 'rgba(255,255,255,0.9)',
                  ml: 'auto'
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Advanced filter section */}
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          mb: 6
        }}
      >
        <Box sx={{ 
          p: 3,
          background: (theme) => `linear-gradient(to bottom, ${theme.palette.primary.main}0D, rgba(255, 255, 255, 0))`
        }}>
          <Typography 
            variant="subtitle1" 
            fontWeight="medium" 
            color="text.primary" 
            sx={{ mb: 2 }}
          >
            Advanced Filters
          </Typography>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                border: '1px solid rgba(0, 0, 0, 0.12)', 
                borderRadius: 1, 
                p: 1, 
                bgcolor: 'background.paper'
              }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 1, fontWeight: 'medium' }}
                >
                  Region:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    label="All Regions"
                    size="small"
                    onClick={() => setRegion('')}
                    color={region === '' ? 'primary' : 'default'}
                    variant={region === '' ? 'filled' : 'outlined'}
                    sx={{ 
                      fontWeight: region === '' ? 'bold' : 'normal',
                      bgcolor: (theme) => region === '' ? `${theme.palette.primary.main}E6` : 'transparent',
                      color: region === '' ? 'white' : 'text.primary',
                    }}
                  />
                  <Chip
                    label="Central"
                    size="small"
                    onClick={() => setRegion('central')}
                    color={region === 'central' ? 'primary' : 'default'}
                    variant={region === 'central' ? 'filled' : 'outlined'}
                    sx={{ 
                      fontWeight: region === 'central' ? 'bold' : 'normal',
                      bgcolor: (theme) => region === 'central' ? `${theme.palette.primary.main}E6` : 'transparent',
                      color: region === 'central' ? 'white' : 'text.primary',
                    }}
                  />
                  <Chip
                    label="Eastern"
                    size="small"
                    onClick={() => setRegion('eastern')}
                    color={region === 'eastern' ? 'primary' : 'default'}
                    variant={region === 'eastern' ? 'filled' : 'outlined'}
                    sx={{ 
                      fontWeight: region === 'eastern' ? 'bold' : 'normal',
                      bgcolor: (theme) => region === 'eastern' ? `${theme.palette.primary.main}E6` : 'transparent',
                      color: region === 'eastern' ? 'white' : 'text.primary',
                    }}
                  />
                  <Chip
                    label="Northern"
                    size="small"
                    onClick={() => setRegion('northern')}
                    color={region === 'northern' ? 'primary' : 'default'}
                    variant={region === 'northern' ? 'filled' : 'outlined'}
                    sx={{ 
                      fontWeight: region === 'northern' ? 'bold' : 'normal',
                      bgcolor: (theme) => region === 'northern' ? `${theme.palette.primary.main}E6` : 'transparent',
                      color: region === 'northern' ? 'white' : 'text.primary',
                    }}
                  />
                  <Chip
                    label="Western"
                    size="small"
                    onClick={() => setRegion('western')}
                    color={region === 'western' ? 'primary' : 'default'}
                    variant={region === 'western' ? 'filled' : 'outlined'}
                    sx={{ 
                      fontWeight: region === 'western' ? 'bold' : 'normal',
                      bgcolor: (theme) => region === 'western' ? `${theme.palette.primary.main}E6` : 'transparent',
                      color: region === 'western' ? 'white' : 'text.primary',
                    }}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                border: '1px solid rgba(0, 0, 0, 0.12)', 
                borderRadius: 1, 
                p: 1, 
                bgcolor: 'background.paper'
              }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 1, fontWeight: 'medium' }}
                >
                  Price Range:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    label="Any Price"
                    size="small"
                    onClick={() => setPriceRange('')}
                    color={priceRange === '' ? 'primary' : 'default'}
                    variant={priceRange === '' ? 'filled' : 'outlined'}
                    sx={{ 
                      fontWeight: priceRange === '' ? 'bold' : 'normal',
                      bgcolor: (theme) => priceRange === '' ? `${theme.palette.primary.main}E6` : 'transparent',
                      color: priceRange === '' ? 'white' : 'text.primary',
                    }}
                  />
                  <Chip
                    label="Under 50,000 UGX"
                    size="small"
                    onClick={() => setPriceRange('0-50000')}
                    color={priceRange === '0-50000' ? 'primary' : 'default'}
                    variant={priceRange === '0-50000' ? 'filled' : 'outlined'}
                    sx={{ 
                      fontWeight: priceRange === '0-50000' ? 'bold' : 'normal',
                      bgcolor: (theme) => priceRange === '0-50000' ? `${theme.palette.primary.main}E6` : 'transparent',
                      color: priceRange === '0-50000' ? 'white' : 'text.primary',
                    }}
                  />
                  <Chip
                    label="50,000 - 250,000 UGX"
                    size="small"
                    onClick={() => setPriceRange('50000-250000')}
                    color={priceRange === '50000-250000' ? 'primary' : 'default'}
                    variant={priceRange === '50000-250000' ? 'filled' : 'outlined'}
                    sx={{ 
                      fontWeight: priceRange === '50000-250000' ? 'bold' : 'normal',
                      bgcolor: (theme) => priceRange === '50000-250000' ? `${theme.palette.primary.main}E6` : 'transparent',
                      color: priceRange === '50000-250000' ? 'white' : 'text.primary',
                    }}
                  />
                  <Chip
                    label="250,000 - 1,000,000 UGX"
                    size="small"
                    onClick={() => setPriceRange('250000-1000000')}
                    color={priceRange === '250000-1000000' ? 'primary' : 'default'}
                    variant={priceRange === '250000-1000000' ? 'filled' : 'outlined'}
                    sx={{ 
                      fontWeight: priceRange === '250000-1000000' ? 'bold' : 'normal',
                      bgcolor: (theme) => priceRange === '250000-1000000' ? `${theme.palette.primary.main}E6` : 'transparent',
                      color: priceRange === '250000-1000000' ? 'white' : 'text.primary',
                    }}
                  />
                  <Chip
                    label="Over 1,000,000 UGX"
                    size="small"
                    onClick={() => setPriceRange('1000000+')}
                    color={priceRange === '1000000+' ? 'primary' : 'default'}
                    variant={priceRange === '1000000+' ? 'filled' : 'outlined'}
                    sx={{ 
                      fontWeight: priceRange === '1000000+' ? 'bold' : 'normal',
                      bgcolor: (theme) => priceRange === '1000000+' ? `${theme.palette.primary.main}E6` : 'transparent',
                      color: priceRange === '1000000+' ? 'white' : 'text.primary',
                    }}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                border: '1px solid rgba(0, 0, 0, 0.12)', 
                borderRadius: 1, 
                p: 1, 
                bgcolor: 'background.paper'
              }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 1, fontWeight: 'medium' }}
                >
                  Sort By:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    label="Newest"
                    size="small"
                    onClick={() => setSortBy('newest')}
                    color={sortBy === 'newest' ? 'primary' : 'default'}
                    variant={sortBy === 'newest' ? 'filled' : 'outlined'}
                    sx={{ 
                      fontWeight: sortBy === 'newest' ? 'bold' : 'normal',
                      bgcolor: (theme) => sortBy === 'newest' ? `${theme.palette.primary.main}E6` : 'transparent',
                      color: sortBy === 'newest' ? 'white' : 'text.primary',
                    }}
                  />
                  <Chip
                    label="Price: Low to High"
                    size="small"
                    onClick={() => setSortBy('price-low')}
                    color={sortBy === 'price-low' ? 'primary' : 'default'}
                    variant={sortBy === 'price-low' ? 'filled' : 'outlined'}
                    sx={{ 
                      fontWeight: sortBy === 'price-low' ? 'bold' : 'normal',
                      bgcolor: (theme) => sortBy === 'price-low' ? `${theme.palette.primary.main}E6` : 'transparent',
                      color: sortBy === 'price-low' ? 'white' : 'text.primary',
                    }}
                  />
                  <Chip
                    label="Price: High to Low"
                    size="small"
                    onClick={() => setSortBy('price-high')}
                    color={sortBy === 'price-high' ? 'primary' : 'default'}
                    variant={sortBy === 'price-high' ? 'filled' : 'outlined'}
                    sx={{ 
                      fontWeight: sortBy === 'price-high' ? 'bold' : 'normal',
                      bgcolor: (theme) => sortBy === 'price-high' ? `${theme.palette.primary.main}E6` : 'transparent',
                      color: sortBy === 'price-high' ? 'white' : 'text.primary',
                    }}
                  />
                  <Chip
                    label="Most Popular"
                    size="small"
                    onClick={() => setSortBy('popular')}
                    color={sortBy === 'popular' ? 'primary' : 'default'}
                    variant={sortBy === 'popular' ? 'filled' : 'outlined'}
                    sx={{ 
                      fontWeight: sortBy === 'popular' ? 'bold' : 'normal',
                      bgcolor: (theme) => sortBy === 'popular' ? `${theme.palette.primary.main}E6` : 'transparent',
                      color: sortBy === 'popular' ? 'white' : 'text.primary',
                    }}
                  />
                </Box>
              </Box>
            </Grid>
            {user && (
              <Grid item xs={12} md={12} sx={{ display: { xs: 'block', md: 'none' } }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  fullWidth
                  component={Link}
                  to="/marketplace/create"
                  startIcon={<AddIcon />}
                  sx={{ 
                    borderRadius: 2,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4
                    }
                  }}
                >
                  Create Listing
                </Button>
              </Grid>
            )}
          </Grid>
          
          {/* Active filters display */}
          {(region || priceRange || sortBy !== 'newest') && (
            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Active filters:
              </Typography>
              
              {region && (
                <Chip
                  label={`Region: ${region.charAt(0).toUpperCase() + region.slice(1)}`}
                  size="small"
                  onDelete={() => setRegion('')}
                  sx={{ bgcolor: (theme) => `${theme.palette.primary.main}1A` }}
                />
              )}
              
              {priceRange && (
                <Chip
                  label={`Price: ${priceRange === '0-50000' 
                    ? 'Under 50,000 UGX' 
                    : priceRange === '50000-250000' 
                      ? '50,000 - 250,000 UGX' 
                      : priceRange === '250000-1000000' 
                        ? '250,000 - 1,000,000 UGX' 
                        : 'Over 1,000,000 UGX'}`}
                  size="small"
                  onDelete={() => setPriceRange('')}
                  sx={{ bgcolor: (theme) => `${theme.palette.primary.main}1A` }}
                />
              )}
              
              {sortBy !== 'newest' && (
                <Chip
                  label={`Sort: ${sortBy === 'price-low' 
                    ? 'Price: Low to High' 
                    : sortBy === 'price-high' 
                      ? 'Price: High to Low' 
                      : 'Most Popular'}`}
                  size="small"
                  onDelete={() => setSortBy('newest')}
                  sx={{ bgcolor: (theme) => `${theme.palette.primary.main}1A` }}
                />
              )}
              
              <Button 
                variant="text" 
                size="small" 
                onClick={() => {
                  setRegion('');
                  setPriceRange('');
                  setSortBy('newest');
                }}
                sx={{ ml: 'auto', textTransform: 'none', fontSize: '0.8rem' }}
              >
                Clear All Filters
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Categories section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" fontWeight="bold" color="text.primary" sx={{ mb: 4 }}>
          Browse Categories
        </Typography>
        <Grid container spacing={3}>
          {marketplaceCategories.map((category) => (
            <Grid item xs={12} md={4} key={category.id}>
              <Link to={category.link} style={{ textDecoration: 'none' }}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    borderRadius: 3, 
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', height: 200 }}>
                    <Box
                      component="img"
                      src={category.image}
                      alt={category.title}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="h4" component="h3" fontWeight="bold" color="white">
                        {category.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {category.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Badge 
                        badgeContent={category.count} 
                        color="primary"
                        sx={{ 
                          '& .MuiBadge-badge': { 
                            fontSize: '0.8rem', 
                            fontWeight: 'bold',
                            minWidth: '28px',
                            height: '22px'
                          } 
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Listings
                        </Typography>
                      </Badge>
                      <Button 
                        variant="text" 
                        color="primary" 
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      >
                        View All
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Featured listings section */}
      <section className="mb-16">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h2" fontWeight="bold" color="text.primary">
            Featured Listings
          </Typography>
          <Link to="/marketplace/featured" className="flex items-center text-primary font-medium">
            View All
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </Box>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredFeaturedListings.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ gridColumn: '1/-1', textAlign: 'center', py: 4 }}>
              No featured listings found for {selectedCrop} in {selectedRegion}.
            </Typography>
          ) : (
            filteredFeaturedListings.map((listing) => (
              <Link to={`/marketplace/listing/${listing.id}`} key={listing.id} className="block">
                <Paper 
                  elevation={2} 
                  sx={{ 
                    borderRadius: 3, 
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <img 
                      src={getImageUrl(listing)} 
                      alt={listing.title} 
                      className="w-full h-48 object-cover"
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        right: 0, 
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderBottomLeftRadius: 8,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    >
                      {listing.type}
                    </Box>
                    {listing.featured && (
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          bgcolor: 'secondary.main',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderBottomRightRadius: 8,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}
                      >
                        Featured
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {listing.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {listing.location}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="body1" fontWeight="bold" color="primary.main">
                        {listing.price}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          {listing.owner ? listing.owner.rating : listing.seller ? listing.seller.rating : listing.provider.rating} 
                          ({listing.type === 'service' 
                            ? (listing.provider.completedJobs || 0)
                            : (listing.reviews || (listing.owner ? listing.owner.listings : listing.seller.listings))})
                        </Typography>
                      </Box>
                    </Box>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      fullWidth
                      sx={{ 
                        mt: 'auto',
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 'medium'
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </Paper>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Land Listings Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" fontWeight="bold" color="text.primary" sx={{ mb: 4 }}>
          Land Listings
        </Typography>
        <Grid container spacing={3}>
          {filteredLandListings.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                No land listings found for {selectedCrop} in {selectedRegion}.
              </Typography>
            </Grid>
          ) : (
            filteredLandListings.map(listing => (
              <Grid item xs={12} md={6} lg={4} key={listing.id}>
                <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.3s', '&:hover': { boxShadow: 6, transform: 'scale(1.03)' } }}>
                  <Box sx={{ position: 'relative', height: 180 }}>
                    <img src={getImageUrl(listing)} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>{listing.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{listing.location}</Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary.main" sx={{ mb: 1 }}>{listing.price}</Typography>
                    <Button variant="outlined" color="primary" fullWidth component={Link} to={`/marketplace/listing/${listing.id}`}>View Details</Button>
                  </CardContent>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
      {/* Produce Listings Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" fontWeight="bold" color="text.primary" sx={{ mb: 4 }}>
          Produce Listings
        </Typography>
        <Grid container spacing={3}>
          {filteredProduceListings.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                No produce listings found for {selectedCrop} in {selectedRegion}.
              </Typography>
            </Grid>
          ) : (
            filteredProduceListings.map(listing => (
              <Grid item xs={12} md={6} lg={4} key={listing.id}>
                <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.3s', '&:hover': { boxShadow: 6, transform: 'scale(1.03)' } }}>
                  <Box sx={{ position: 'relative', height: 180 }}>
                    <img src={getImageUrl(listing)} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>{listing.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{listing.location}</Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary.main" sx={{ mb: 1 }}>{listing.price}</Typography>
                    <Button variant="outlined" color="primary" fullWidth component={Link} to={`/marketplace/listing/${listing.id}`}>View Details</Button>
                  </CardContent>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
      {/* Service Listings Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" fontWeight="bold" color="text.primary" sx={{ mb: 4 }}>
          Service Listings
        </Typography>
        <Grid container spacing={3}>
          {filteredServiceListings.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                No service listings found for {selectedCrop} in {selectedRegion}.
              </Typography>
            </Grid>
          ) : (
            filteredServiceListings.map(listing => (
              <Grid item xs={12} md={6} lg={4} key={listing.id}>
                <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.3s', '&:hover': { boxShadow: 6, transform: 'scale(1.03)' } }}>
                  <Box sx={{ position: 'relative', height: 180 }}>
                    <img src={getImageUrl(listing)} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>{listing.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{listing.location}</Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary.main" sx={{ mb: 1 }}>{listing.price}</Typography>
                    <Button variant="outlined" color="primary" fullWidth component={Link} to={`/marketplace/listing/${listing.id}`}>View Details</Button>
                  </CardContent>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      </Box>

      {/* Where to Get Seeds & Farm Inputs Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" fontWeight="bold" color="primary.main" sx={{ mb: 4 }}>
          Where to Get Seeds & Farm Inputs
        </Typography>
        <Grid container spacing={3}>
          {suppliers
            .filter(s => (selectedRegion ? s.region === selectedRegion : true) && (selectedCrop ? s.crops.includes(selectedCrop) : true))
            .map(supplier => (
              <Grid item xs={12} md={6} lg={3} key={supplier.name}>
                <Card elevation={4} sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { boxShadow: 8, transform: 'scale(1.03)' } }}>
                  <Box sx={{ position: 'relative', height: 160 }}>
                    <img src={supplier.image} alt={supplier.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
                    <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'primary.main', color: 'white', px: 1.5, py: 0.5, borderRadius: 2, fontWeight: 'bold', fontSize: 14 }}>
                      {supplier.rating} ★
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>{supplier.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{supplier.address}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><b>Region:</b> {supplier.region}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><b>Crops:</b> {supplier.crops.join(', ')}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><b>Contact:</b> {supplier.contact}</Typography>
                    <Button variant="outlined" color="primary" href={supplier.website} target="_blank" sx={{ mt: 1 }}>
                      Visit Website
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Box>

      {/* Call to action */}
      <Paper 
        elevation={3}
        sx={{ 
          borderRadius: 3,
          bgcolor: 'primary.main',
          color: 'white',
          p: 6,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
            Have something to sell or offer?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
            Join thousands of Ugandan farmers already using our marketplace to buy, sell, and exchange 
            agricultural goods and services.
          </Typography>
          {user ? (
            <Button 
              variant="contained" 
              component={Link}
              to="/marketplace/create"
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              Create Your Listing
            </Button>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained"
                component={Link}
                to="/login"
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                Sign In
              </Button>
              <Button 
                variant="contained"
                component={Link}
                to="/register"
                sx={{ 
                  bgcolor: 'secondary.main', 
                  color: 'white',
                  '&:hover': { bgcolor: 'secondary.dark' },
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                Create Account
              </Button>
            </Box>
          )}
        </Box>
        {/* Background pattern */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle, #ffffff 10%, transparent 10.5%)',
          backgroundSize: '20px 20px'
        }} />
      </Paper>
        </>
      )}
    </Box>
  );
};

export default Marketplace; 