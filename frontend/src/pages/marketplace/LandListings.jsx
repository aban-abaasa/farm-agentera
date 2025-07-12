import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getListings } from '../../services/api/marketplaceService';
import { 
  getListingImageUrl, 
  formatPrice, 
  formatDate, 
  getListingFeatures 
} from '../../utils/marketplaceHelpers';
import { 
  Typography, Box, Paper, TextField, InputAdornment, 
  FormControl, Select, MenuItem, Button, Chip,
  Card, CardMedia, CardContent, CardActionArea, Grid,
  InputLabel, Divider, Rating, CircularProgress, Alert
} from '@mui/material';

const LandListings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to extract size from text (simple regex)
  const extractSizeFromText = (text) => {
    const match = text.match(/(\d+(?:\.\d+)?)\s*(?:acres?|ha|hectares?)/i);
    return match ? parseFloat(match[1]) : 0;
  };

  // Fetch land listings from API
  useEffect(() => {
    const fetchLandListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: listingsError } = await getListings({
          type: 'land',
          status: 'active',
          limit: 100
        });
        
        if (listingsError) throw listingsError;
        
        setListings(data || []);
      } catch (err) {
        console.error('Error fetching land listings:', err);
        setError(err.message || 'Failed to load land listings');
      } finally {
        setLoading(false);
      }
    };

    fetchLandListings();
  }, []);

  // Filter and sort listings
  const filteredListings = listings
    .filter(listing => 
      (searchTerm === '' || 
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterType === '' || 
        (filterType === 'Lease' && !listing.details?.is_for_sale) ||
        (filterType === 'Sale' && listing.details?.is_for_sale) ||
        (filterType === 'Partnership' && listing.title.toLowerCase().includes('partnership')))
    )
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      } else if (sortBy === 'priceHigh') {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return priceB - priceA;
      } else if (sortBy === 'priceLow') {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return priceA - priceB;
      } else if (sortBy === 'sizeLarge') {
        // Access size from details object, fallback to parsing from title/description
        const sizeA = a.details?.size_acres || extractSizeFromText(a.title + ' ' + a.description) || 0;
        const sizeB = b.details?.size_acres || extractSizeFromText(b.title + ' ' + b.description) || 0;
        return sizeB - sizeA;
      } else if (sortBy === 'sizeSmall') {
        const sizeA = a.details?.size_acres || extractSizeFromText(a.title + ' ' + a.description) || 0;
        const sizeB = b.details?.size_acres || extractSizeFromText(b.title + ' ' + b.description) || 0;
        return sizeA - sizeB;
      }
      return 0;
    });

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
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
          {/* Header section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h3" component="h1" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
          Land Listings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '800px' }}>
          Browse available farmland for lease, purchase, or partnership across Uganda. 
          Connect directly with landowners to find the perfect land for your agricultural needs.
        </Typography>
      </Box>

      {/* Search and filter section */}
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          mb: 4,
          p: 3
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              placeholder="Search by location, title, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                      style={{ color: '#9e9e9e' }}
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="type-label">Property Type</InputLabel>
              <Select
                labelId="type-label"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Property Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Lease">Lease</MenuItem>
                <MenuItem value="Sale">Sale</MenuItem>
                <MenuItem value="Partnership">Partnership</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="sort-label">Sort By</InputLabel>
              <Select
                labelId="sort-label"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="priceLow">Price: Low to High</MenuItem>
                <MenuItem value="priceHigh">Price: High to Low</MenuItem>
                <MenuItem value="sizeSmall">Size: Small to Large</MenuItem>
                <MenuItem value="sizeLarge">Size: Large to Small</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1}>
            <Button 
              variant="contained" 
              color="primary"
              component={Link}
              to="/marketplace/create"
              fullWidth
              startIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              }
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
              List Land
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results count */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Showing {filteredListings.length} land {filteredListings.length === 1 ? 'listing' : 'listings'}
        </Typography>
        {searchTerm || filterType ? (
          <Button 
            variant="outlined"
            size="small"
            onClick={() => { setSearchTerm(''); setFilterType(''); setSortBy('newest'); }}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            Clear Filters
          </Button>
        ) : null}
      </Box>

      {/* Listings grid */}
      <Grid container spacing={4}>
        {filteredListings.map((listing) => (
          <Grid item xs={12} sm={6} lg={4} key={listing.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6
                }
              }}
            >
              <CardActionArea component={Link} to={`/marketplace/listing/${listing.id}`}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={getListingImageUrl(listing)}
                    alt={listing.title}
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
                    Land
                  </Box>
                </Box>
              </CardActionArea>
              
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {listing.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {listing.location}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    {formatPrice(listing)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {listing.details?.size_acres ? `${listing.details.size_acres} acres` : 'Size not specified'}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {listing.description}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {getListingFeatures(listing).slice(0, 3).map((feature, index) => (
                    <Chip 
                      key={index} 
                      label={feature} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ borderRadius: 1 }}
                    />
                  ))}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={listing.owner?.rating || 0} readOnly size="small" precision={0.5} sx={{ mr: 1 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {listing.owner?.name || 'Owner not specified'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(listing.created_at)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredListings.length === 0 && (
        <Paper 
          elevation={0} 
          sx={{ 
            textAlign: 'center', 
            py: 8, 
            px: 3, 
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px dashed rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="h5" component="h3" fontWeight="medium" color="text.primary" sx={{ mb: 2 }}>
            No land listings found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Try adjusting your search or filters
          </Typography>
          <Button 
            variant="contained"
            color="primary"
            onClick={() => { setSearchTerm(''); setFilterType(''); setSortBy('newest'); }}
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Clear All Filters
          </Button>
        </Paper>
      )}
        </>
      )}
    </div>
  );
};

export default LandListings; 