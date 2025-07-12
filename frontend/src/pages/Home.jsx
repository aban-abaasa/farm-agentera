import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, Button, Card, CardContent, Container, 
  Divider, Grid, Typography, Stack, Link, Avatar,
  Chip, Paper, useTheme, useMediaQuery
} from '@mui/material';
import {
  Agriculture, GroupWork, Park, ShoppingCart, Layers, CloudQueue,
  ArrowForward, ArrowDownward, CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import PageContainer from '../components/layout/PageContainer';
import { testimonials, stats } from '../mocks/home';

const Home = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  // Track which card is being hovered
  const [hoveredCard, setHoveredCard] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Handle horizontal scroll position for mobile indicator
  const handleScroll = (e) => {
    const container = e.target;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth - container.clientWidth;
    const scrollPercentage = scrollLeft / scrollWidth;
    setScrollPosition(scrollPercentage);
  };

  // Features array with added animation properties and theme-aware colors
  const features = [
    {
      icon: <Agriculture fontSize="large" sx={{ color: '#4caf50' }} />,
      title: 'Land Management',
      description: 'Find available farmland for lease, purchase, or partnership. Connect with landowners and collaborate on agricultural projects.',
      link: '/marketplace/land',
      lightColor: '#e8f5e9',
      darkColor: '#1b5e20',
      animationDelay: '0s'
    },
    {
      icon: <ShoppingCart fontSize="large" sx={{ color: '#ff9800' }} />,
      title: 'Marketplace',
      description: 'Buy and sell agricultural produce, livestock, equipment, and more with farmers across Uganda.',
      link: '/marketplace/produce',
      lightColor: '#fff8e1',
      darkColor: '#e65100',
      animationDelay: '0.1s'
    },
    {
      icon: <Layers fontSize="large" sx={{ color: '#2196f3' }} />,
      title: 'Services Exchange',
      description: 'Offer your farming expertise or hire skilled agricultural services for your farm operations.',
      link: '/marketplace/services',
      lightColor: '#e3f2fd',
      darkColor: '#0d47a1',
      animationDelay: '0.2s'
    },
    {
      icon: <GroupWork fontSize="large" sx={{ color: '#9c27b0' }} />,
      title: 'Community Forums',
      description: 'Connect with fellow farmers, share knowledge, ask questions, and collaborate on agricultural initiatives.',
      link: '/community',
      lightColor: '#f3e5f5',
      darkColor: '#4a148c',
      animationDelay: '0.3s'
    },
    {
      icon: <Park fontSize="large" sx={{ color: '#00796b' }} />,
      title: 'Resource Center',
      description: 'Access valuable farming resources, best practices, training materials, and educational content.',
      link: '/resources',
      lightColor: '#e0f2f1',
      darkColor: '#004d40',
      animationDelay: '0.4s'
    },
    {
      icon: <CloudQueue fontSize="large" sx={{ color: '#0288d1' }} />,
      title: 'Weather Updates',
      description: 'Stay informed with localized weather forecasts, seasonal predictions, and farming calendars.',
      link: '/weather',
      lightColor: '#e1f5fe',
      darkColor: '#01579b',
      animationDelay: '0.5s'
    }
  ];

  // Animation for cards on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      const cards = document.querySelectorAll('.feature-card');
      cards.forEach((card) => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box>
      {/* Hero Section with modern design - full width but with side margins */}
      <Box 
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #0d1b0f 0%, #1a2e1d 50%, #263f29 100%)'
            : 'linear-gradient(135deg, #2e7d32 0%, #43a047 50%, #4caf50 100%)',
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 12, md: 16 },
          mx: { xs: 2, sm: 3, md: 3, lg: 3 },  // Add margins on the sides
          borderRadius: { xs: 2, md: 4 },      // Add rounded corners for a cleaner look
          mt: 2,                               // Add a small margin at the top
        }}
      >
        {/* Decorative elements */}
        <Box 
          sx={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: theme.palette.mode === 'dark'
              ? 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)'
              : 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            top: '-100px',
            right: '-100px',
            zIndex: 0,
          }}
        />
        <Box 
          sx={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: theme.palette.mode === 'dark'
              ? 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)'
              : 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            bottom: '-50px',
            left: '10%',
            zIndex: 0,
          }}
        />
        
        {/* Grain texture overlay */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          zIndex: 1,
        }} />
        
        {/* Tractor silhouette */}
        <Box 
          sx={{
            position: 'absolute',
            right: { xs: '-150px', md: '5%' },
            bottom: 0,
            width: { xs: '300px', md: '550px' },
            height: { xs: '200px', md: '350px' },
            opacity: 0.15,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 512' fill='%23ffffff'%3E%3Cpath d='M528 336c-48.6 0-88 39.4-88 88s39.4 88 88 88 88-39.4 88-88-39.4-88-88-88zm0 112c-13.23 0-24-10.77-24-24s10.77-24 24-24 24 10.77 24 24-10.77 24-24 24zm80-288h-64v-40.2c0-14.12 4.7-27.76 13.15-38.84 4.42-5.8 3.55-14.06-1.32-19.49L534.2 37.3c-6.66-7.45-18.32-6.92-24.7.78C490.58 60.9 480 89.81 480 119.8V160H377.67L321.58 29.14A47.914 47.914 0 0 0 277.45 0H144c-26.47 0-48 21.53-48 48v146.52c-8.63-6.73-20.96-6.46-28.89 1.47L36 227.1c-8.59 8.59-8.59 22.52 0 31.11l5.06 5.06c-4.99 9.26-8.96 18.82-11.91 28.72H22c-12.15 0-22 9.85-22 22v44c0 12.15 9.85 22 22 22h7.14c2.96 9.91 6.92 19.46 11.91 28.73l-5.06 5.05c-8.59 8.59-8.59 22.52 0 31.11L67.1 476c8.59 8.59 22.52 8.59 31.11 0l5.06-5.05c9.26 4.99 18.82 8.96 28.72 11.91V490c0 12.15 9.85 22 22 22h44c12.15 0 22-9.85 22-22v-7.14c9.9-2.95 19.46-6.92 28.72-11.91l5.05 5.05c8.59 8.59 22.52 8.59 31.11 0l31.11-31.11c8.59-8.59 8.59-22.52 0-31.11l-5.05-5.05c4.99-9.26 8.96-18.82 11.91-28.72H330c12.15 0 22-9.85 22-22v-6h80.54c21.91-28.99 56.32-48 95.46-48 18.64 0 36.07 4.61 51.8 12.2l50.82-50.82c6-6 9.37-14.14 9.37-22.63V192c.01-17.67-14.32-32-31.99-32zM176 416c-44.18 0-80-35.82-80-80s35.82-80 80-80 80 35.82 80 80-35.82 80-80 80zm22-256h-38V64h106.89l41.15 96H198z'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'bottom right',
            backgroundSize: 'contain',
            zIndex: 0,
          }}
        />
        
        {/* Use Container for consistent width in the hero content */}
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box>
                {/* Subtitle */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Agriculture sx={{ mr: 1, color: '#81c784' }} />
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      textTransform: 'uppercase', 
                      fontWeight: 600, 
                      letterSpacing: 1, 
                      color: 'rgba(255, 255, 255, 0.9)'
                    }}
                  >
                    Uganda's Premier Farming Network
                  </Typography>
                </Box>
                
                {/* Main Heading */}
                <Typography 
                  component="h1" 
                  variant="h2" 
                  fontWeight={800}
                  sx={{ 
                    mb: 3,
                    fontSize: { xs: '2.5rem', md: '3.75rem' },
                    textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-16px',
                      left: 0,
                      width: '80px',
                      height: '4px',
                      background: '#ffeb3b',
                      borderRadius: '2px',
                    }
                  }}
                >
                  Connect, Collaborate, Grow Together
                </Typography>
                
                {/* Description */}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 4, 
                    mt: 4,
                    maxWidth: '600px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 1.6
                  }}
                >
                  Join thousands of Ugandan farmers sharing resources, knowledge, and creating 
                  opportunities together to build a stronger agricultural community.
                </Typography>
                
                {/* Feature chips */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                  <Chip 
                    label="Land Leasing" 
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.15)', 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' } 
                    }} 
                  />
                  <Chip 
                    label="Produce Marketplace" 
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.15)', 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' } 
                    }} 
                  />
                  <Chip 
                    label="Community Support" 
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.15)', 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' } 
                    }} 
                  />
                  <Chip 
                    label="Weather Updates" 
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.15)', 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' } 
                    }} 
                  />
                </Box>
                
                {/* CTA Buttons */}
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  mt={5}
                >
                  {user ? (
                    <Button 
                      variant="contained" 
                      size="large" 
                      component={RouterLink} 
                      to="/dashboard"
                      sx={{
                        bgcolor: 'white',
                        color: '#2e7d32',
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.9)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Go to Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="contained" 
                        size="large"
                        component={RouterLink} 
                        to="/register"
                        endIcon={<ArrowForward />}
                        sx={{
                          bgcolor: 'white',
                          color: '#2e7d32',
                          fontWeight: 'bold',
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.9)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Join Now
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="large"
                        component={RouterLink} 
                        to="/login"
                        sx={{
                          borderColor: 'rgba(255,255,255,0.6)',
                          color: 'white',
                          fontWeight: 'bold',
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          '&:hover': {
                            borderColor: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)'
                          }
                        }}
                      >
                        Sign In
                      </Button>
                    </>
                  )}
                </Stack>
              </Box>
            </Grid>
            
            {!isSmallScreen && (
              <Grid item md={6}>
                <Box 
                  sx={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%'
                  }}
                >
                  {/* Stats cards floating in 3D space */}
                  <Box sx={{ 
                    position: 'relative', 
                    height: 400, 
                    width: '100%',
                    perspective: '1000px'
                  }}>
                    {stats.map((stat, index) => (
                      <Paper
                        key={index}
                        elevation={4}
                        sx={{
                          position: 'absolute',
                          padding: 3,
                          borderRadius: 4,
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(46, 125, 50, 0.1)' 
                            : 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          border: theme.palette.mode === 'dark' 
                            ? '1px solid rgba(255, 255, 255, 0.1)' 
                            : 'none',
                          textAlign: 'center',
                          width: 180,
                          transform: `translate(${(index % 2) * 220 - 110}px, ${Math.floor(index / 2) * 160 - 80}px) 
                                      rotate(${(index * 5) - 5}deg)`,
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: `translate(${(index % 2) * 220 - 110}px, ${Math.floor(index / 2) * 160 - 80}px) 
                                        rotate(${(index * 5) - 5}deg) scale(1.05)`,
                            zIndex: 10,
                            boxShadow: theme.palette.mode === 'dark' 
                              ? '0 10px 30px rgba(0,0,0,0.5)' 
                              : '0 10px 30px rgba(0,0,0,0.15)'
                          },
                          zIndex: 5 - index
                        }}
                      >
                        <Typography variant="h4" color="primary" fontWeight="bold">
                          {stat.value}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
          
          {/* Scroll indicator */}
          <Box 
            sx={{ 
              position: 'absolute',
              bottom: -64,
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              color: 'white',
              zIndex: 10
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
              Explore our features
            </Typography>
            <ArrowDownward sx={{ 
              animation: 'bounce 2s infinite',
              '@keyframes bounce': {
                '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                '40%': { transform: 'translateY(-20px)' },
                '60%': { transform: 'translateY(-10px)' }
              }
            }} />
          </Box>
        </Container>
      </Box>

      {/* Wrap the rest of the content in PageContainer for consistent layout */}
      <PageContainer>
        {/* Features Section */}
        <Box 
          sx={{ 
            py: 10, 
            position: 'relative',
            overflow: 'hidden',
            bgcolor: theme.palette.mode === 'dark' 
              ? theme.palette.background.default 
              : '#fafafa'
          }}
        >
          {/* Background decorative elements */}
          <Box 
            sx={{
              position: 'absolute',
              top: '10%',
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.03) 0%, rgba(76, 175, 80, 0) 50%)',
              zIndex: 0
            }}
          />
          <Box 
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '100%',
              height: '100%',
              backgroundImage: 'radial-gradient(circle at 80% 80%, rgba(255, 193, 7, 0.03) 0%, rgba(255, 193, 7, 0) 50%)',
              zIndex: 0
            }}
          />
          
          <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography 
                component="span" 
                sx={{
                  display: 'inline-block',
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(76, 175, 80, 0.2)' 
                    : '#e8f5e9',
                  color: theme.palette.mode === 'dark' 
                    ? '#81c784' 
                    : '#2e7d32',
                  px: 2,
                  py: 0.5,
                  borderRadius: 10,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  mb: 2
                }}
              >
                PLATFORM FEATURES
              </Typography>
              <Typography 
                variant="h3" 
                fontWeight="bold" 
                gutterBottom
                sx={{ 
                  mb: 2,
                  background: 'linear-gradient(to right, #2e7d32, #66bb6a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                How We Help Farmers
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="text.secondary" 
                sx={{ maxWidth: 700, mx: 'auto' }}
              >
                Our platform offers comprehensive solutions tailored to the unique needs of 
                Ugandan farmers, helping you grow your agricultural business
              </Typography>
            </Box>
            
            {/* Features layout - horizontal scroll on mobile, grid on desktop */}
            <Box 
              sx={{
                display: { xs: 'block', md: 'flex' },
                flexWrap: { md: 'wrap' },
                justifyContent: { md: 'center' },
                gap: { md: 3 },
                mx: { md: -1.5 }, // Compensate for padding in the container on desktop
              }}
            >
              {/* Mobile horizontal scroll container */}
              <Box
                onScroll={handleScroll}
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  gap: 3,
                  pb: 2,
                  px: 2,
                  mx: -2, // Extend to screen edges
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch',
                  scrollSnapType: 'x mandatory', // Add scroll snap for better UX
                  '&::-webkit-scrollbar': {
                    height: 8,
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: 4,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
                    borderRadius: 4,
                    '&:hover': {
                      background: 'linear-gradient(90deg, #388e3c, #689f38)',
                    }
                  },
                  // Add momentum scrolling for iOS
                  '@media (max-width: 600px)': {
                    scrollSnapType: 'x mandatory',
                    '&::-webkit-scrollbar': {
                      display: 'none'
                    }
                  }
                }}
              >
                {features.map((feature, index) => (
                  <Box
                    key={index}
                    className="feature-card"
                    sx={{
                      minWidth: '280px',
                      maxWidth: '320px',
                      width: '280px',
                      scrollSnapAlign: 'center', // Add scroll snap alignment
                      opacity: 0,
                      transform: 'translateX(40px)',
                      transition: `all 0.6s ease ${feature.animationDelay}`,
                      '&:first-of-type': {
                        ml: 2, // Add left margin to first item
                      },
                      '&:last-of-type': {
                        mr: 2, // Add right margin to last item
                      }
                    }}
                    onTouchStart={() => setHoveredCard(index)}
                    onTouchEnd={() => setHoveredCard(null)}
                  >
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderRadius: 4,
                        border: theme.palette.mode === 'dark' 
                          ? '1px solid rgba(255,255,255,0.1)' 
                          : '1px solid rgba(0,0,0,0.05)',
                        overflow: 'hidden',
                        position: 'relative',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        transform: hoveredCard === index ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                        boxShadow: hoveredCard === index 
                          ? (theme.palette.mode === 'dark' 
                              ? '0 15px 35px rgba(0,0,0,0.5)' 
                              : '0 15px 35px rgba(0,0,0,0.12)')
                          : (theme.palette.mode === 'dark' 
                              ? '0 8px 25px rgba(0,0,0,0.3)' 
                              : '0 8px 25px rgba(0,0,0,0.08)'),
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '5px',
                          background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
                          opacity: hoveredCard === index ? 1 : 0,
                          transition: 'opacity 0.3s ease',
                        },
                        '& .feature-icon-wrapper': {
                          transform: hoveredCard === index ? 'scale(1.15) rotate(10deg)' : 'scale(1) rotate(0deg)',
                        },
                      }}
                    >
                      <Box sx={{ 
                        p: 3, 
                        display: 'flex', 
                        alignItems: 'center',
                        bgcolor: theme.palette.mode === 'dark' 
                          ? feature.darkColor 
                          : feature.lightColor,
                        borderBottom: theme.palette.mode === 'dark' 
                          ? '1px solid rgba(255,255,255,0.1)' 
                          : '1px solid rgba(0,0,0,0.05)'
                      }}>
                        <Box 
                          className="feature-icon-wrapper"
                          sx={{ 
                            width: 48, 
                            height: 48, 
                            borderRadius: '50%', 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            bgcolor: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.1)' 
                              : 'white',
                            boxShadow: theme.palette.mode === 'dark' 
                              ? '0 4px 12px rgba(0,0,0,0.3)' 
                              : '0 4px 12px rgba(0,0,0,0.08)',
                            transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                          }}
                        >
                          {React.cloneElement(feature.icon, { fontSize: 'medium' })}
                        </Box>
                        <Typography 
                          variant="h6" 
                          component="h2" 
                          fontWeight="bold"
                          sx={{ fontSize: '1.1rem' }}
                        >
                          {feature.title}
                        </Typography>
                      </Box>
                      
                      <CardContent sx={{ 
                        flexGrow: 1, 
                        p: 3, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between'
                      }}>
                        <Typography 
                          color="text.secondary" 
                          sx={{ 
                            mb: 3, 
                            fontSize: '0.9rem',
                            lineHeight: 1.5
                          }}
                        >
                          {feature.description}
                        </Typography>
                        
                        <Button 
                          component={RouterLink} 
                          to={feature.link}
                          color="primary"
                          size="small"
                          endIcon={
                            <ArrowForward sx={{
                              transform: hoveredCard === index ? 'translateX(4px)' : 'translateX(0)',
                              transition: 'transform 0.3s ease'
                            }}/>
                          }
                          sx={{ 
                            textTransform: 'none',
                            fontWeight: 'medium',
                            mt: 'auto',
                            alignSelf: 'flex-start',
                            fontSize: '0.875rem',
                            '&:hover': {
                              background: 'none',
                            }
                          }}
                        >
                          Learn More
                        </Button>
                      </CardContent>
                      
                      {/* Animated corner accent */}
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '50px',
                          height: '50px',
                          background: `radial-gradient(circle at bottom right, ${
                            theme.palette.mode === 'dark' 
                              ? feature.darkColor 
                              : feature.lightColor
                          }, transparent 70%)`,
                          opacity: 0.7,
                          transition: 'all 0.3s ease',
                          transform: hoveredCard === index ? 'scale(1.3)' : 'scale(1)',
                        }} 
                      />
                    </Card>
                  </Box>
                ))}
              </Box>

              {/* Desktop grid layout (hidden on mobile) */}
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 3,
                  width: '100%'
                }}
              >
                {features.map((feature, index) => (
                  <Box
                    key={index}
                    className="feature-card"
                    sx={{
                      width: {
                        md: 'calc(33.333% - 24px)',  // 3 columns on medium screens
                        lg: 'calc(25% - 24px)',      // 4 columns on large screens
                        xl: 'calc(20% - 24px)',      // 5 columns on extra-large screens
                      },
                      minWidth: '280px',
                      maxWidth: '380px',
                      margin: '12px',
                      opacity: 0,
                      transform: 'translateY(40px)',
                      transition: `all 0.6s ease ${feature.animationDelay}`,
                    }}
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderRadius: 4,
                        border: theme.palette.mode === 'dark' 
                          ? '1px solid rgba(255,255,255,0.1)' 
                          : '1px solid rgba(0,0,0,0.05)',
                        overflow: 'hidden',
                        position: 'relative',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        '&:hover': {
                          transform: 'translateY(-12px) scale(1.03)',
                          boxShadow: theme.palette.mode === 'dark' 
                            ? '0 20px 40px rgba(0,0,0,0.5)' 
                            : '0 20px 40px rgba(0,0,0,0.12)',
                          '&::before': {
                            opacity: 1,
                          },
                          '& .feature-icon-wrapper': {
                            transform: 'scale(1.15) rotate(10deg)',
                          },
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '5px',
                          background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                        },
                        zIndex: hoveredCard === index ? 10 : 1,
                      }}
                    >
                      <Box sx={{ 
                        p: 3, 
                        display: 'flex', 
                        alignItems: 'center',
                        bgcolor: theme.palette.mode === 'dark' 
                          ? feature.darkColor 
                          : feature.lightColor,
                        borderBottom: theme.palette.mode === 'dark' 
                          ? '1px solid rgba(255,255,255,0.1)' 
                          : '1px solid rgba(0,0,0,0.05)'
                      }}>
                        <Box 
                          className="feature-icon-wrapper"
                          sx={{ 
                            width: 56, 
                            height: 56, 
                            borderRadius: '50%', 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            bgcolor: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.1)' 
                              : 'white',
                            boxShadow: theme.palette.mode === 'dark' 
                              ? '0 4px 12px rgba(0,0,0,0.3)' 
                              : '0 4px 12px rgba(0,0,0,0.08)',
                            transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography 
                          variant="h5" 
                          component="h2" 
                          fontWeight="bold"
                        >
                          {feature.title}
                        </Typography>
                      </Box>
                      
                      <CardContent sx={{ 
                        flexGrow: 1, 
                        p: 3, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between'
                      }}>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                          {feature.description}
                        </Typography>
                        
                        <Button 
                          component={RouterLink} 
                          to={feature.link}
                          color="primary"
                          endIcon={
                            <ArrowForward sx={{
                              transform: hoveredCard === index ? 'translateX(4px)' : 'translateX(0)',
                              transition: 'transform 0.3s ease'
                            }}/>
                          }
                          sx={{ 
                            textTransform: 'none',
                            fontWeight: 'medium',
                            mt: 'auto', // Push to bottom
                            alignSelf: 'flex-start', // Align to left
                            '&:hover': {
                              background: 'none',
                            }
                          }}
                        >
                          Learn More
                        </Button>
                      </CardContent>
                      
                      {/* Animated corner accent */}
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '60px',
                          height: '60px',
                          background: `radial-gradient(circle at bottom right, ${
                            theme.palette.mode === 'dark' 
                              ? feature.darkColor 
                              : feature.lightColor
                          }, transparent 70%)`,
                          opacity: 0.7,
                          transition: 'all 0.3s ease',
                          transform: hoveredCard === index ? 'scale(1.5)' : 'scale(1)',
                        }} 
                      />
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Mobile scroll indicator */}
            <Box 
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                justifyContent: 'center',
                alignItems: 'center',
                mt: 3,
                gap: 1,
                opacity: 0.8
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                Swipe to explore features
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  ml: 1
                }}
              >
                {[...Array(3)].map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: scrollPosition < (index + 1) * 0.33 ? 8 : 6,
                      height: scrollPosition < (index + 1) * 0.33 ? 8 : 6,
                      borderRadius: '50%',
                      bgcolor: scrollPosition < (index + 1) * 0.33 ? 'primary.main' : 'action.disabled',
                      transition: 'all 0.3s ease',
                      transform: scrollPosition < (index + 1) * 0.33 ? 'scale(1.2)' : 'scale(1)'
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Testimonials */}
        <Box sx={{ 
          py: 10, 
          bgcolor: theme.palette.mode === 'dark' 
            ? theme.palette.background.paper 
            : '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background patterns */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
            zIndex: 0
          }} />

          <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography 
                component="span" 
                sx={{
                  display: 'inline-block',
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 152, 0, 0.2)' 
                    : '#fff8e1',
                  color: theme.palette.mode === 'dark' 
                    ? '#ffb74d' 
                    : '#ff9800',
                  px: 2,
                  py: 0.5,
                  borderRadius: 10,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  mb: 2
                }}
              >
                TESTIMONIALS
              </Typography>
              <Typography 
                variant="h3" 
                fontWeight="bold" 
                gutterBottom
                sx={{ 
                  mb: 2,
                  background: 'linear-gradient(to right, #ff9800, #ff5722)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Success Stories
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="text.secondary" 
                sx={{ maxWidth: 700, mx: 'auto' }}
              >
                Hear from farmers who have transformed their agricultural ventures through our platform
              </Typography>
            </Box>
            
            {/* Testimonial cards with carousel-like layout */}
            <Box 
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: { xs: 4, md: 5 },
                perspective: '1000px',
              }}
            >
              {testimonials.map((testimonial, index) => (
                <Box
                  key={index}
                  className="testimonial-card"
                  sx={{
                    width: {
                      xs: '100%',
                      sm: 'calc(50% - 32px)',
                      lg: 'calc(33.333% - 32px)',
                    },
                    maxWidth: '450px',
                    opacity: 0,
                    transform: `translateY(40px) rotate(${index % 2 === 0 ? '-1deg' : '1deg'})`,
                    animation: `fadeInUp 0.8s ease-out forwards ${0.2 + index * 0.15}s`,
                    '@keyframes fadeInUp': {
                      '0%': {
                        opacity: 0,
                        transform: `translateY(40px) rotate(${index % 2 === 0 ? '-1deg' : '1deg'})`,
                      },
                      '100%': {
                        opacity: 1,
                        transform: `translateY(0) rotate(${index % 2 === 0 ? '-1deg' : '1deg'})`,
                      },
                    },
                    transition: 'all 0.4s ease',
                    '&:hover': {
                      transform: `translateY(-10px) rotate(${index % 2 === 0 ? '-1deg' : '1deg'})`,
                    }
                  }}
                >
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      borderRadius: 4,
                      transition: 'all 0.3s ease',
                      overflow: 'visible',
                      position: 'relative',
                      pt: 4,
                      boxShadow: theme.palette.mode === 'dark' 
                        ? '0 10px 40px rgba(0,0,0,0.3)' 
                        : '0 10px 40px rgba(0,0,0,0.07)',
                      border: theme.palette.mode === 'dark' 
                        ? '1px solid rgba(255,255,255,0.1)' 
                        : '1px solid rgba(0,0,0,0.05)',
                      '&:hover': {
                        boxShadow: theme.palette.mode === 'dark' 
                          ? '0 15px 50px rgba(0,0,0,0.5)' 
                          : '0 15px 50px rgba(0,0,0,0.12)',
                        '&::after': {
                          transform: 'rotate(10deg)',
                        }
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        top: 12,
                        left: 12,
                        zIndex: -1,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${testimonial.bgColor}33, ${testimonial.bgColor}11)`,
                        transition: 'all 0.5s ease',
                      }
                    }}
                  >
                    {/* Avatar with shine effect */}
                    <Box sx={{ position: 'relative' }}>
                      <Avatar 
                        sx={{ 
                          width: 80, 
                          height: 80, 
                          bgcolor: testimonial.bgColor,
                          position: 'absolute',
                          top: -40,
                          left: 24,
                          border: theme.palette.mode === 'dark' 
                            ? '4px solid rgba(255, 255, 255, 0.1)' 
                            : '4px solid white',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                          fontSize: '1.75rem',
                          fontWeight: 'bold',
                          zIndex: 2
                        }}
                      >
                        {testimonial.initial}
                      </Avatar>
                      
                      {/* Shine effect */}
                      <Box 
                        sx={{
                          position: 'absolute',
                          top: -40,
                          left: 24,
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: 'linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)',
                          zIndex: 3,
                          opacity: 0.6,
                          animation: `shine 4s infinite ${index * 0.5}s`,
                          '@keyframes shine': {
                            '0%': { transform: 'translateX(-80px) rotate(45deg)' },
                            '20%, 100%': { transform: 'translateX(80px) rotate(45deg)' }
                          }
                        }}
                      />
                    </Box>
                    
                    <CardContent 
                      sx={{ 
                        flexGrow: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between', 
                        p: 4,
                        pt: 5
                      }}
                    >
                      {/* Quote icon */}
                      <Box 
                        sx={{
                          position: 'absolute',
                          right: 24,
                          top: 20,
                          fontSize: '4rem',
                          fontFamily: 'Georgia, serif',
                          color: `${testimonial.bgColor}33`,
                          lineHeight: 0.7,
                          fontWeight: 'bold'
                        }}
                      >
                        "
                      </Box>
                      
                      <Box sx={{ position: 'relative' }}>
                        <Typography 
                          variant="body1" 
                          paragraph 
                          sx={{ 
                            fontSize: '1.1rem',
                            lineHeight: 1.6,
                            mb: 4,
                            fontStyle: 'italic',
                            color: theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.8)' 
                              : '#555',
                            '&::first-letter': {
                              fontSize: '1.5em',
                              fontWeight: 'bold',
                              color: testimonial.bgColor,
                            }
                          }}
                        >
                          {testimonial.quote}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Divider 
                          sx={{ 
                            my: 2,
                            '&::before': {
                              width: '30px',
                              borderTop: `3px solid ${testimonial.bgColor}` 
                            }
                          }} 
                        />
                        <Typography variant="h6" fontWeight="bold">
                          {testimonial.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <Box 
                            component="span" 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              bgcolor: testimonial.bgColor,
                              display: 'inline-block'
                            }} 
                          />
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </CardContent>
                    
                    {/* Decorative elements */}
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '80px',
                        height: '80px',
                        overflow: 'hidden',
                      }}
                    >
                      <Box 
                        sx={{
                          position: 'absolute',
                          top: -40,
                          right: -40,
                          width: '80px',
                          height: '80px',
                          background: testimonial.bgColor,
                          transform: 'rotate(45deg)',
                          opacity: 0.2
                        }}
                      />
                    </Box>
                  </Card>
                </Box>
              ))}
            </Box>
            
            {/* View more testimonials button */}
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                endIcon={<ArrowForward />}
                component={RouterLink}
                to="/community"
                sx={{
                  borderRadius: 5,
                  px: 4,
                  py: 1,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    transform: 'translateY(-3px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                More Success Stories
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Call to Action */}
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            py: { xs: 8, md: 12 },
            color: 'white',
            textAlign: 'center',
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, #2d4a32 0%, #1b3a1e 100%)' 
              : 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
          }}
        >
          {/* Background texture */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }} />
          
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              gutterBottom
              sx={{ 
                textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                mb: 3
              }}
            >
              Ready to Transform Your Farming?
            </Typography>
            <Typography 
              variant="h6" 
              paragraph 
              sx={{ 
                mb: 5, 
                maxWidth: 700, 
                mx: 'auto',
                opacity: 0.9
              }}
            >
              Join thousands of Ugandan farmers already benefiting from our platform.
              Get access to resources, community support, and marketplace opportunities.
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              justifyContent: 'center',
              gap: 3
            }}>
              <Button 
                variant="contained" 
                size="large"
                component={RouterLink}
                to={user ? "/dashboard" : "/register"}
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? '#2e4f34' : 'white',
                  color: theme.palette.mode === 'dark' ? 'white' : '#ff5722',
                  fontWeight: 'bold',
                  px: 5,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? '#3a5f40' : 'rgba(255,255,255,0.9)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                  }
                }}
                startIcon={<CheckCircle />}
              >
                {user ? "Go to Dashboard" : "Join Our Community"}
              </Button>
              
              <Button 
                variant="outlined" 
                size="large"
                component={RouterLink}
                to="/resources"
                sx={{
                  borderColor: 'rgba(255,255,255,0.6)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'medium',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Learn More
              </Button>
            </Box>
            
            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', gap: 5 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">3+</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Years Active</Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">25+</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Districts</Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">12K+</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Transactions</Typography>
              </Box>
            </Box>
          </Container>
        </Box>
      </PageContainer>
    </Box>
  );
};

export default Home; 