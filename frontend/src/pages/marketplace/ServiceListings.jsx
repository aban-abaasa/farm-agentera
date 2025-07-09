import { useState } from 'react';
import { Link } from 'react-router-dom';
import { serviceListingsMockData } from '../../mocks/serviceListings';
import { 
  Typography, Box, Paper, TextField, InputAdornment, 
  FormControl, Select, MenuItem, Button, Chip,
  Card, CardMedia, CardContent, CardActionArea, Grid,
  InputLabel, Divider, Rating, Avatar
} from '@mui/material';

const ServiceListings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Filter and sort listings
  const filteredListings = serviceListingsMockData
    .filter(listing => 
      (searchTerm === '' || 
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterCategory === '' || listing.category === filterCategory)
    )
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.postedDate) - new Date(a.postedDate);
      } else if (sortBy === 'oldest') {
        return new Date(a.postedDate) - new Date(b.postedDate);
      } else if (sortBy === 'rating') {
        return b.provider.rating - a.provider.rating;
      } else if (sortBy === 'experience') {
        return b.provider.completedJobs - a.provider.completedJobs;
      }
      return 0;
    });

  // Get unique categories for filter
  const categories = [...new Set(serviceListingsMockData.map(item => item.category))];

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Header section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" component="h1" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
          Agricultural Services
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '800px' }}>
          Find specialized agricultural services from equipment rental and labor to consulting and technical expertise. 
          Connect with service providers to improve your farming operations.
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
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search services..."
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
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
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
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="experience">Most Experienced</MenuItem>
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
              Offer
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results count */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Showing {filteredListings.length} service {filteredListings.length === 1 ? 'listing' : 'listings'}
        </Typography>
        {searchTerm || filterCategory ? (
          <Button 
            variant="outlined"
            size="small"
            onClick={() => { setSearchTerm(''); setFilterCategory(''); setSortBy('newest'); }}
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
              <CardActionArea component={Link} to={`/marketplace/listing/${listing.id}`} sx={{ flexGrow: 0 }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={listing.image}
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
                    {listing.category}
                  </Box>
                </Box>
              </CardActionArea>
              
              <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mb: 'auto' }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {listing.title}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      {listing.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {listing.location}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {listing.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    <Chip 
                      label={listing.availability} 
                      size="small" 
                      color="secondary"
                      sx={{ borderRadius: 1 }}
                    />
                    {listing.features.slice(0, 2).map((feature, index) => (
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
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: 'grey.200', 
                        color: 'text.primary',
                        fontSize: '0.875rem',
                        fontWeight: 'medium',
                        mr: 1.5
                      }}
                    >
                      {listing.provider.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {listing.provider.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={listing.provider.rating} readOnly size="small" precision={0.5} />
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {listing.provider.completedJobs} jobs completed
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(listing.postedDate).toLocaleDateString()}
                    </Typography>
                  </Box>
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
            No service listings found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Try adjusting your search or filters
          </Typography>
          <Button 
            variant="contained"
            color="primary"
            onClick={() => { setSearchTerm(''); setFilterCategory(''); setSortBy('newest'); }}
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
    </div>
  );
};

export default ServiceListings; 