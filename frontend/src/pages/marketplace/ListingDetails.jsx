import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getListingById, getListings, incrementListingView, saveListing, unsaveListing } from '../../services/api/marketplaceService';
import { formatPrice, getListingImageUrl, formatDate, getListingFeatures, formatLocation } from '../../utils/marketplaceHelpers';
import { 
  Box, Typography, Button, Chip, Paper, Avatar, 
  Divider, TextField, IconButton, Grid, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert
} from '@mui/material';

const ListingDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [showAllImages, setShowAllImages] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarListings, setSimilarListings] = useState([]);

  useEffect(() => {
    const fetchListingDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, get the basic listing info to determine type
        const { data: basicListing, error: basicError } = await getListingById(id);
        
        if (basicError) throw basicError;
        if (!basicListing) throw new Error('Listing not found');
        
        // Get detailed listing with type-specific information
        const { data: detailedListing, error: detailError } = await getListingById(id, basicListing.type);
        
        if (detailError) throw detailError;
        
        setListing(detailedListing);
        
        // Increment view count
        await incrementListingView(id);
        
        // Fetch similar listings of the same type and region
        const { data: allListings, error: listingsError } = await getListings({
          type: detailedListing.type,
          status: 'active',
          limit: 20
        });
        
        if (!listingsError && allListings) {
          // Find similar listings based on type and location
          const locationKeyword = detailedListing.location.split(',')[0];
          const related = allListings
            .filter(item => 
              item.id !== parseInt(id) && 
              item.location.toLowerCase().includes(locationKeyword.toLowerCase())
            )
            .slice(0, 3);
          
          // If not enough location-based matches, add more of the same type
          if (related.length < 3) {
            const additional = allListings
              .filter(item => 
                item.id !== parseInt(id) &&
                !related.some(rel => rel.id === item.id)
              )
              .slice(0, 3 - related.length);
            
            setSimilarListings([...related, ...additional]);
          } else {
            setSimilarListings(related);
          }
        }
        
      } catch (err) {
        console.error('Error fetching listing details:', err);
        setError(err.message || 'Failed to load listing details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListingDetails();
    }
  }, [id]);

  const handleSendMessage = () => {
    // TODO: Implement real message sending via API
    alert('Message sent! The owner will contact you soon.');
    setContactModalOpen(false);
    setMessage('');
  };

  const handleToggleFavorite = async () => {
    if (!user) return;
    
    try {
      if (isFavorite) {
        await unsaveListing(listing.id, user.id);
        setIsFavorite(false);
      } else {
        await saveListing(listing.id, user.id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleSaveListing = () => {
    // Simulate saving a listing
    setIsFavorite(!isFavorite);
    alert(isFavorite ? 'Listing removed from your favorites!' : 'Listing saved to your favorites!');
  };

  const handleReport = () => {
    // Simulate reporting a listing
    alert('Thank you for your report. We will review this listing.');
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', px: 4, py: 8, maxWidth: '7xl', mx: 'auto' }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 8
        }}>
          <Box sx={{ 
            width: 60, 
            height: 60, 
            borderRadius: '50%', 
            bgcolor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </Box>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
            Loading listing details...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please wait while we fetch the information
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        width: '100%', 
        px: 4, 
        py: 8, 
        textAlign: 'center',
        maxWidth: '7xl', 
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '70vh'
      }}>
        <Box sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'error.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 4
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-error" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </Box>
        <Typography variant="h4" component="h2" sx={{ mb: 2, fontWeight: 'bold', color: 'error.main' }}>
          Error
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
          {error}
        </Typography>
        <Button 
          component={Link} 
          to="/marketplace" 
          variant="contained" 
          size="large"
          sx={{ 
            px: 6, 
            py: 1.5, 
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark'
            }
          }}
        >
          Back to Marketplace
        </Button>
      </Box>
    );
  }

  if (!listing) return null;

  const listingOwner = listing.owner || listing.seller || listing.provider;
  const listingImages = listing.images && listing.images.length > 0 ? listing.images : [getListingImageUrl(listing)];
  
  // Helper function to check if an image is a local import or a URL
  const getImageSrc = (image) => {
    // If it's a string (URL), return it directly
    if (typeof image === 'string') {
      return image;
    }
    // If it's an import (object), use it directly
    return image;
  };
  
  // Determine the listing type label for better UX
  const listingTypeLabel = 
    listing.type === 'land' ? 'Land' : 
    listing.type === 'produce' ? 'Produce' : 'Service';
  
  // Determine the owner type label
  const ownerTypeLabel = 
    listing.type === 'land' ? 'Owner' : 
    listing.type === 'produce' ? 'Seller' : 'Provider';
  
  return (
    <Box sx={{ width: '100%', bgcolor: 'grey.50' }}>
      {/* Hero section with main image and gradient overlay */}
      <Box sx={{ 
        position: 'relative',
        height: { xs: '300px', sm: '400px', md: '500px' },
        overflow: 'hidden',
        bgcolor: 'grey.900'
      }}>
        {/* Background image with gradient overlay */}
        <Box sx={{ position: 'absolute', inset: 0 }}>
          <Box component="img" 
            src={getImageSrc(listingImages[activeImage])} 
            alt={listing.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.7
            }}
          />
          <Box sx={{ 
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.2) 100%)',
            zIndex: 1
          }} />
        </Box>
        
        {/* Decorative elements */}
        <Box sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76,175,80,0.15) 0%, rgba(76,175,80,0) 70%)',
          top: '-100px',
          right: '-50px',
          zIndex: 0,
        }} />
        
        <Box sx={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,193,7,0.1) 0%, rgba(255,193,7,0) 70%)',
          bottom: '-80px',
          left: '10%',
          zIndex: 0,
        }} />
        
        {/* Content */}
        <Box sx={{ 
          position: 'relative', 
          maxWidth: '7xl', 
          mx: 'auto', 
          px: 4, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-end', 
          pb: 8,
          zIndex: 2
        }}>
          {/* Breadcrumb */}
          <Box sx={{ mb: 4 }}>
            <nav aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3 text-sm">
                <li className="inline-flex items-center">
                  <Link to="/" className="text-gray-300 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <svg className="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <Link to="/marketplace" className="text-gray-300 hover:text-white">
                      Marketplace
                    </Link>
                  </Box>
                </li>
                <li>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <svg className="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <Link to={`/marketplace/${listing.type}`} className="text-gray-300 hover:text-white">
                      {listingTypeLabel}
                    </Link>
                  </Box>
                </li>
              </ol>
            </nav>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Box sx={{ mb: { xs: 3, md: 0 } }}>
              <Chip 
                label={listingTypeLabel}
                size="small"
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  fontWeight: 'medium',
                  mb: 3,
                  fontSize: '0.75rem'
                }}
              />
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 800,
                  color: 'white',
                  mb: 2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {listing.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'grey.300' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <Typography variant="body1">{formatLocation(listing)}</Typography>
              </Box>
            </Box>
            <Box sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              px: 4,
              py: 2,
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
            }}>
              <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: 'white' }}>
                {formatPrice(listing)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.200' }}>
                {listing.type === 'land' && listing.size ? listing.size : ''}
                {listing.type === 'produce' && listing.quantity ? listing.quantity : ''}
                {listing.type === 'service' && listing.availability ? listing.availability : ''}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ maxWidth: '7xl', mx: 'auto', px: 4, py: 8 }}>
        <Grid container spacing={4}>
          {/* Left column - Images and details */}
          <Grid size={{ xs: 12, lg: 8 }}>
            {/* Image gallery */}
            <Paper 
              elevation={3} 
              sx={{ 
                mb: 6, 
                borderRadius: 3, 
                overflow: 'hidden', 
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: theme => theme.shadows[6]
                }
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Box 
                  component="img"
                  src={getImageSrc(listingImages[activeImage])} 
                  alt={listing.title}
                  sx={{ 
                    width: '100%', 
                    height: { xs: '300px', sm: '400px', md: '500px' },
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                
                {listingImages.length > 1 && (
                  <>
                    <IconButton 
                      aria-label="Previous image"
                      onClick={() => setActiveImage((prev) => (prev === 0 ? listingImages.length - 1 : prev - 1))}
                      sx={{
                        position: 'absolute',
                        left: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255,255,255,0.8)',
                        '&:hover': {
                          bgcolor: 'white',
                          transform: 'translateY(-50%) scale(1.1)',
                        },
                        transition: 'all 0.2s ease',
                        boxShadow: 2
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </IconButton>
                    <IconButton 
                      aria-label="Next image"
                      onClick={() => setActiveImage((prev) => (prev === listingImages.length - 1 ? 0 : prev + 1))}
                      sx={{
                        position: 'absolute',
                        right: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255,255,255,0.8)',
                        '&:hover': {
                          bgcolor: 'white',
                          transform: 'translateY(-50%) scale(1.1)',
                        },
                        transition: 'all 0.2s ease',
                        boxShadow: 2
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </IconButton>
                  </>
                )}
                
                {/* Image count indicator */}
                <Box sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.875rem'
                }}>
                  {activeImage + 1} / {listingImages.length}
                </Box>
                
                {/* Show all images button */}
                {listingImages.length > 3 && (
                  <Button
                    onClick={() => setShowAllImages(true)}
                    startIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    }
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      left: 16,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.8)',
                      },
                      borderRadius: 2,
                      textTransform: 'none'
                    }}
                  >
                    View All
                  </Button>
                )}
              </Box>
              
              {listingImages.length > 1 && (
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  p: 2, 
                  overflowX: 'auto',
                  '&::-webkit-scrollbar': {
                    height: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f1f1',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#888',
                    borderRadius: '10px',
                  }
                }}>
                  {listingImages.slice(0, showAllImages ? listingImages.length : 5).map((image, index) => (
                    <Box 
                      key={index} 
                      onClick={() => setActiveImage(index)}
                      sx={{
                        height: 80,
                        width: 120,
                        borderRadius: 2,
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: activeImage === index ? '2px solid' : '1px solid',
                        borderColor: activeImage === index ? 'primary.main' : 'grey.300',
                        transform: activeImage === index ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: activeImage === index ? 2 : 0,
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: 'primary.main',
                        }
                      }}
                    >
                      <Box 
                        component="img"
                        src={getImageSrc(image)}
                        alt={`Thumbnail ${index + 1}`}
                        sx={{ 
                          height: '100%',
                          width: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  ))}
                  
                  {!showAllImages && listingImages.length > 5 && (
                    <Box
                      onClick={() => setShowAllImages(true)}
                      sx={{
                        height: 80,
                        width: 120,
                        borderRadius: 2,
                        flexShrink: 0,
                        bgcolor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'grey.200',
                        }
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        +{listingImages.length - 5} more
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>

            {/* Listing details */}
            <Paper
              elevation={3}
              sx={{
                borderRadius: 3,
                mb: 6,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: theme => theme.shadows[6]
                }
              }}
            >
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'grey.100' }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: listing.type === 'land' ? 'success.main' : listing.type === 'produce' ? 'warning.main' : 'info.main',
                        mr: 1.5
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'medium' }}>
                      {listingTypeLabel}
                    </Typography>
                    
                    <Box component="span" sx={{ mx: 1.5, color: 'grey.400' }}>•</Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <Typography variant="body2">
                        Posted {formatDate(listing.created_at || listing.postedDate)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="h4" component="h2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.primary' }}>
                    {listing.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <Typography variant="body1">
                      {formatLocation(listing)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                    {formatPrice(listing)}
                  </Typography>
                  
                  {listing.type === 'land' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: 'text.secondary', mt: 1 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                      </svg>
                      <Typography variant="body2">{listing.size || 'Size not specified'}</Typography>
                    </Box>
                  )}
                  
                  {listing.type === 'produce' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: 'text.secondary', mt: 1 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                      <Typography variant="body2">{listing.quantity || 'Quantity not specified'}</Typography>
                    </Box>
                  )}
                  
                  {listing.type === 'service' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: 'text.secondary', mt: 1 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <Typography variant="body2">{listing.availability || 'Availability not specified'}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ 
                    mb: 2, 
                    fontWeight: 'bold', 
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    About This {listingTypeLabel}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                    {listing.description}
                  </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ 
                    mb: 2, 
                    fontWeight: 'bold', 
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                    </svg>
                    Key Features
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {getListingFeatures(listing).map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        sx={{ 
                          bgcolor: 'primary.light',
                          color: 'primary.dark',
                          fontWeight: 'medium',
                          py: 2.5,
                          '&:hover': {
                            bgcolor: 'primary.main',
                            color: 'white'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Additional details */}
                {listing.details && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ 
                      mb: 2, 
                      fontWeight: 'bold', 
                      color: 'text.primary',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      Detailed Information
                    </Typography>
                    <Paper 
                      variant="outlined"
                      sx={{
                        p: 3,
                        bgcolor: 'grey.50',
                        borderRadius: 2
                      }}
                    >
                      <Grid container spacing={3}>
                        {Object.entries(listing.details).filter(([, value]) => value != null && value !== '').map(([key, value]) => (
                          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={key}>
                            <Typography variant="body2" color="text.secondary" sx={{ 
                              fontWeight: 'medium',
                              mb: 0.5,
                              textTransform: 'capitalize'
                            }}>
                              {key.replace(/([A-Z])/g, ' $1').replace(/([A-Z][a-z])/g, ' $1').trim()}
                            </Typography>
                            <Typography variant="body1" color="text.primary">
                              {String(value)}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Right sidebar with info cards - on large screens these will be in a row */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Grid 
              container 
              spacing={3} 
              sx={{ 
                height: '100%',
                flexWrap: { xs: 'wrap', lg: 'wrap', xl: 'nowrap' }
              }}
            >
              {/* Owner/Seller card */}
              <Grid 
                item 
                xs={12} 
                sm={6}
                lg={4} 
                xl={4} 
                sx={{ 
                  width: { sm: '50%', lg: '33.33%', xl: '33.33%' },
                  flexGrow: 1,
                  flexBasis: { xs: '100%', sm: '50%', lg: '33.33%', xl: 0 }
                }}
              >
                <Paper 
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    height: '100%',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: theme => theme.shadows[6]
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: { xl: '550px' }
                  }}
                >
                  <Box sx={{ 
                    bgcolor: 'primary.main',
                    px: 3,
                    py: 2,
                    color: 'white'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Listing {ownerTypeLabel}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {/* Owner info section */}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        {listingOwner?.avatar ? (
                          <Avatar 
                            src={listingOwner?.avatar} 
                            alt={listingOwner?.name || 'User'}
                            sx={{ 
                              width: 70, 
                              height: 70, 
                              mr: 3,
                              boxShadow: 2,
                              border: '2px solid white'
                            }}
                          />
                        ) : (
                          <Avatar
                            sx={{ 
                              width: 70, 
                              height: 70, 
                              mr: 3, 
                              bgcolor: 'primary.light',
                              color: 'primary.dark',
                              fontSize: '1.5rem',
                              fontWeight: 'bold',
                              boxShadow: 2,
                              border: '2px solid white'
                            }}
                          >
                            {(listingOwner?.name || 'User').charAt(0).toUpperCase()}
                          </Avatar>
                        )}
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            {listingOwner?.name || 'User'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Box sx={{ display: 'flex', color: 'warning.main', mr: 1 }}>
                              {[...Array(5)].map((_, i) => (
                                <svg 
                                  key={i}
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-4 w-4" 
                                  viewBox="0 0 20 20" 
                                  fill="currentColor"
                                  style={{ opacity: i < Math.floor(listingOwner?.rating || 0) ? 1 : 0.3 }}
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {listingOwner?.rating?.toFixed(1) || '0.0'}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {listing.type === 'service' 
                              ? `${listingOwner?.completedJobs || 0} jobs completed` 
                              : `${listingOwner?.listings || 0} active listings`}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Member since {formatDate(listingOwner?.created_at || listingOwner?.memberSince)}
                      </Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, color: 'text.secondary' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <Typography variant="body2">
                            {listingOwner?.phone || "Phone number available after contact"}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <Typography variant="body2">
                            {listingOwner?.email || "Email available after contact"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* Action buttons */}
                    <Box>
                      <Button 
                        variant="contained" 
                        color="primary"
                        fullWidth 
                        onClick={() => setContactModalOpen(true)}
                        startIcon={
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        }
                        sx={{ 
                          py: 1.5, 
                          mb: 2, 
                          borderRadius: 2,
                          fontWeight: 'bold',
                          boxShadow: 2,
                          '&:hover': {
                            boxShadow: 4
                          }
                        }}
                      >
                        Contact {ownerTypeLabel}
                      </Button>
                      
                      {user ? (
                        <Grid container spacing={2}>
                          <Grid size={6}>
                            <Button 
                              variant={isFavorite ? "contained" : "outlined"}
                              color={isFavorite ? "secondary" : "primary"}
                              fullWidth
                              onClick={handleSaveListing}
                              startIcon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                </svg>
                              }
                              sx={{ 
                                py: 1.5, 
                                borderRadius: 2,
                                fontWeight: 'medium'
                              }}
                            >
                              {isFavorite ? 'Saved' : 'Save'}
                            </Button>
                          </Grid>
                          <Grid size={6}>
                            <Button
                              variant="outlined"
                              color="primary"
                              fullWidth
                              onClick={handleReport}
                              startIcon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              }
                              sx={{ 
                                py: 1.5, 
                                borderRadius: 2,
                                fontWeight: 'medium'
                              }}
                            >
                              Report
                            </Button>
                          </Grid>
                        </Grid>
                      ) : (
                        <Button
                          component={Link}
                          to="/login"
                          variant="outlined"
                          color="primary"
                          fullWidth
                          startIcon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                          }
                          sx={{ 
                            py: 1.5, 
                            borderRadius: 2,
                            fontWeight: 'medium'
                          }}
                        >
                          Log in to interact
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              
              {/* Similar listings */}
              <Grid 
                item 
                xs={12} 
                sm={6}
                lg={4} 
                xl={4} 
                sx={{ 
                  width: { sm: '50%', lg: '33.33%', xl: '33.33%' },
                  flexGrow: 1,
                  flexBasis: { xs: '100%', sm: '50%', lg: '33.33%', xl: 0 }
                }}
              >
                <Paper 
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    height: '100%',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: theme => theme.shadows[6]
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: { xl: '550px' }
                  }}
                >
                  <Box sx={{ 
                    bgcolor: 'success.main',
                    px: 3,
                    py: 2,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Similar Listings
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1, mb: 2, overflowY: 'auto' }}>
                      {similarListings.length > 0 ? (
                        similarListings.map((item) => (
                          <Box 
                            component={Link} 
                            to={`/marketplace/listing/${item.id}`} 
                            key={item.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              p: 1.5,
                              mb: 1.5,
                              borderRadius: 2,
                              textDecoration: 'none',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: 'grey.100',
                                transform: 'translateY(-2px)',
                              },
                              '&:not(:last-child)': {
                                borderBottom: '1px solid',
                                borderColor: 'grey.100',
                                pb: 2
                              }
                            }}
                          >
                            <Box
                              sx={{
                                width: 70,
                                height: 56,
                                borderRadius: 2,
                                flexShrink: 0,
                                mr: 2,
                                overflow: 'hidden',
                                boxShadow: 1
                              }}
                            >
                              <Box 
                                component="img"
                                src={getImageSrc(getListingImageUrl(item))} 
                                alt={item.title}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  fontWeight: 'bold',
                                  color: 'text.primary',
                                  mb: 0.5,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {item.title}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: 'text.secondary',
                                  display: 'block',
                                  mb: 0.5
                                }}
                              >
                                {item.location.split(',')[0]}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: 'primary.main',
                                  fontWeight: 'bold'
                                }}
                              >
                                {formatPrice(item)}
                              </Typography>
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ py: 3, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No similar listings found.
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Button
                      component={Link}
                      to={`/marketplace/${listing.type}`}
                      variant="outlined"
                      color="success"
                      fullWidth
                      startIcon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      }
                      sx={{ 
                        py: 1.5, 
                        borderRadius: 2,
                        fontWeight: 'medium'
                      }}
                    >
                      View More {listingTypeLabel}s
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              
              {/* Listing Information */}
              <Grid 
                item 
                xs={12} 
                sm={12}
                lg={4} 
                xl={4} 
                sx={{ 
                  width: { sm: '100%', lg: '33.33%', xl: '33.33%' },
                  flexGrow: 1,
                  flexBasis: { xs: '100%', sm: '100%', lg: '33.33%', xl: 0 }
                }}
              >
                <Paper 
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    height: '100%',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: theme => theme.shadows[6]
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: { xl: '550px' }
                  }}
                >
                  <Box sx={{ 
                    bgcolor: 'info.main',
                    px: 3,
                    py: 2,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Listing Information
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                      <Box 
                        component="li" 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          py: 2.5,
                          borderBottom: '1px solid',
                          borderColor: 'grey.100'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">Listing ID</Typography>
                        <Typography variant="body2" fontWeight="medium">#{listing.id}</Typography>
                      </Box>
                      <Box 
                        component="li" 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          py: 2.5,
                          borderBottom: '1px solid',
                          borderColor: 'grey.100'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">Posted On</Typography>
                        <Typography variant="body2" fontWeight="medium">{formatDate(listing.created_at || listing.postedDate)}</Typography>
                      </Box>
                      <Box 
                        component="li" 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          py: 2.5,
                          borderBottom: '1px solid',
                          borderColor: 'grey.100'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">Expires</Typography>
                        <Typography variant="body2" fontWeight="medium">{formatDate(listing.expiry_date || listing.expiryDate)}</Typography>
                      </Box>
                      <Box 
                        component="li" 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          py: 2.5,
                          borderBottom: '1px solid',
                          borderColor: 'grey.100'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">Views</Typography>
                        <Typography variant="body2" fontWeight="medium">{Math.floor(Math.random() * 200) + 50}</Typography>
                      </Box>
                      <Box 
                        component="li" 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          py: 2.5
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">Category</Typography>
                        <Chip 
                          label={listingTypeLabel} 
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 'medium' }}
                        />
                      </Box>
                    </Box>
                    
                    {/* Additional information to fill space */}
                    <Box sx={{ mt: 4 }}>
                      <Divider sx={{ mb: 3 }} />
                      <Typography variant="subtitle2" color="text.primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Listing Quality
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">Completeness</Typography>
                          <Typography variant="caption" color="success.main">Excellent</Typography>
                        </Box>
                        <Box sx={{ 
                          height: 6, 
                          bgcolor: 'grey.200', 
                          borderRadius: 3,
                          overflow: 'hidden'
                        }}>
                          <Box sx={{ 
                            width: '90%', 
                            height: '100%', 
                            bgcolor: 'success.main' 
                          }} />
                        </Box>
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">Popularity</Typography>
                          <Typography variant="caption" color="primary.main">High</Typography>
                        </Box>
                        <Box sx={{ 
                          height: 6, 
                          bgcolor: 'grey.200', 
                          borderRadius: 3,
                          overflow: 'hidden'
                        }}>
                          <Box sx={{ 
                            width: '75%', 
                            height: '100%', 
                            bgcolor: 'primary.main' 
                          }} />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Contact modal */}
      <Dialog 
        open={contactModalOpen} 
        onClose={() => setContactModalOpen(false)}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 24,
            py: 1
          }
        }}
      >
        <DialogTitle sx={{ 
          px: 3, 
          pt: 3, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'grey.100',
          pb: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
            </svg>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
              Contact {listingOwner?.name || 'Owner'}
            </Typography>
          </Box>
          <IconButton onClick={() => setContactModalOpen(false)} size="small">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ px: 3, py: 4 }}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3, 
              mb: 4, 
              bgcolor: 'primary.light',
              borderColor: 'primary.main',
              borderRadius: 2
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                  Listing:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {listing.title}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                  Price:
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="primary.main">
                  {formatPrice(listing)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                  Location:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatLocation(listing)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          {user ? (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Your message
              </Typography>
              <TextField
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                placeholder="Introduce yourself and explain why you're interested..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                sx={{ mb: 3 }}
              />
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  bgcolor: 'grey.50',
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Contact Details
                </Typography>
                
                {listingOwner?.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1">
                        {listingOwner?.phone}
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {listingOwner.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {listingOwner.email}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            </>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6, 
              bgcolor: 'grey.50', 
              borderRadius: 3,
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </Box>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'medium' }}>
                Authentication Required
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
                You need to be logged in to contact the {ownerTypeLabel} and access their contact details.
              </Typography>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                color="primary"
                sx={{ 
                  px: 4, 
                  py: 1.5, 
                  borderRadius: 2,
                  boxShadow: 2
                }}
              >
                Log in to continue
              </Button>
            </Box>
          )}
        </DialogContent>
        
        {user && (
          <DialogActions sx={{ px: 3, py: 3, borderTop: '1px solid', borderColor: 'grey.100' }}>
            <Button 
              variant="outlined" 
              onClick={() => setContactModalOpen(false)}
              sx={{ 
                borderRadius: 2,
                mr: 2, 
                px: 3
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSendMessage}
              disabled={!message.trim()}
              startIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              }
              sx={{ 
                borderRadius: 2,
                px: 4,
                py: 1.5,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              Send Message
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default ListingDetails; 