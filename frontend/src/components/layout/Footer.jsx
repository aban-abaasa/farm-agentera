import { Box, Container, Grid, Typography, Link, IconButton, TextField, Button, Divider, Paper, Tooltip } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn, Send, Phone, Email, LocationOn } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const Footer = () => {
  const theme = useTheme();
  return (
    <Box
      component="footer"
      sx={{
        pt: 6,
        pb: 4,
        mt: { xs: 2, sm: 3, md: 4 },
        mx: { xs: 2, sm: 2, md: 2, lg: 2 },
        mb: 2,
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(to right, #1a4d37, #2d5a3d, #3d6a4d)'
          : 'linear-gradient(to right, #2e7d32, #4caf50, #66bb6a)',
        color: 'white',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 -4px 10px rgba(0,0,0,0.3)'
          : '0 -4px 10px rgba(0,0,0,0.05)',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: 2, md: 4 },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(to right, #ffa726, #ff8f00, #ff6f00)'
            : 'linear-gradient(to right, #fbc02d, #f57c00, #f57f17)',
        }
      }}
    >
      {/* Decorative element - farming silhouette */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-5px',
          right: '5%',
          opacity: 0.1,
          width: '300px',
          height: '150px',
          background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 640 512\'%3E%3Cpath fill=\'%23ffffff\' d=\'M528 336c-48.6 0-88 39.4-88 88s39.4 88 88 88 88-39.4 88-88-39.4-88-88-88zm0 112c-13.23 0-24-10.77-24-24s10.77-24 24-24 24 10.77 24 24-10.77 24-24 24zm80-288h-64v-40.2c0-14.12 4.7-27.76 13.15-38.84 4.42-5.8 3.55-14.06-1.32-19.49L534.2 37.3c-6.66-7.45-18.32-6.92-24.7.78C490.58 60.9 480 89.81 480 119.8V160H377.67L321.58 29.14A47.914 47.914 0 0 0 277.45 0H144c-26.47 0-48 21.53-48 48v146.52c-8.63-6.73-20.96-6.46-28.89 1.47L36 227.1c-8.59 8.59-8.59 22.52 0 31.11l5.06 5.06c-4.99 9.26-8.96 18.82-11.91 28.72H22c-12.15 0-22 9.85-22 22v44c0 12.15 9.85 22 22 22h7.14c2.96 9.91 6.92 19.46 11.91 28.73l-5.06 5.05c-8.59 8.59-8.59 22.52 0 31.11L67.1 476c8.59 8.59 22.52 8.59 31.11 0l5.06-5.05c9.26 4.99 18.82 8.96 28.72 11.91V490c0 12.15 9.85 22 22 22h44c12.15 0 22-9.85 22-22v-7.14c9.9-2.95 19.46-6.92 28.72-11.91l5.05 5.05c8.59 8.59 22.52 8.59 31.11 0l31.11-31.11c8.59-8.59 8.59-22.52 0-31.11l-5.05-5.05c4.99-9.26 8.96-18.82 11.91-28.72H330c12.15 0 22-9.85 22-22v-6h80.54c21.91-28.99 56.32-48 95.46-48 18.64 0 36.07 4.61 51.8 12.2l50.82-50.82c6-6 9.37-14.14 9.37-22.63V192c.01-17.67-14.32-32-31.99-32zM176 416c-44.18 0-80-35.82-80-80s35.82-80 80-80 80 35.82 80 80-35.82 80-80 80zm22-256h-38V64h106.89l41.15 96H198z\'/%3E%3C/svg%3E") no-repeat center center',
          backgroundSize: 'contain',
          zIndex: 0,
        }}
      />

      <Container maxWidth="xl">
        <Grid container spacing={6}>
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom 
                sx={{ 
                  background: 'linear-gradient(to right, #ffffff, #e0f2f1)', 
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}>
                FARM-AGENT
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3, maxWidth: '90%' }}>
                Connecting farmers across Uganda to share resources, knowledge, and build a stronger agricultural community.
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                mt: 3,
                '& .MuiIconButton-root': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'white',
                    color: 'primary.main',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                  }
                }
              }}>
                <Tooltip title="Visit our Facebook Page" placement="top">
                  <IconButton aria-label="facebook" component="a" href="https://facebook.com/farmagentuganda" target="_blank" rel="noopener noreferrer"
                    sx={{
                      bgcolor: '#fff',
                      color: '#1877f3',
                      border: '2px solid #1877f3',
                      fontSize: 32,
                      mr: 1,
                      '&:hover': {
                        bgcolor: '#1877f3',
                        color: '#fff',
                      }
                    }}
                  >
                    <Facebook fontSize="inherit" />
                  </IconButton>
                </Tooltip>
                <IconButton aria-label="twitter" component="a" href="https://twitter.com/farmagentuganda" target="_blank" rel="noopener noreferrer">
                  <Twitter />
                </IconButton>
                <IconButton aria-label="instagram" component="a" href="https://instagram.com/farmagentuganda" target="_blank" rel="noopener noreferrer">
                  <Instagram />
                </IconButton>
                <IconButton aria-label="linkedin" component="a" href="https://linkedin.com/company/farmagentuganda" target="_blank" rel="noopener noreferrer">
                  <LinkedIn />
                </IconButton>
              </Box>
              <Button
                variant="contained"
                color="primary"
                href="https://facebook.com/farmagentuganda"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 2, fontWeight: 'bold', bgcolor: '#1877f3', '&:hover': { bgcolor: '#145db2' } }}
              >
                Follow us on Facebook
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
              Quick Links
            </Typography>
            <Box sx={{ 
              '& a': { 
                color: 'rgba(255,255,255,0.8)', 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                py: 0.75,
                transition: 'all 0.2s ease',
                '&:hover': { 
                  color: 'white', 
                  pl: 1,
                  fontWeight: 'medium',
                }
              } 
            }}>
              <Link href="/marketplace" sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                Marketplace
              </Link>
              <Link href="/community" sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                Community
              </Link>
              <Link href="/resources" sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                Resources
              </Link>
              <Link href="/weather" sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                Weather Updates
              </Link>
              <Link href="/profile" sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                My Account
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
              Stay Connected
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2
            }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Subscribe to receive updates on market prices, farming tips, and community events.
              </Typography>
              
              <Box sx={{ 
                display: 'flex',
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.15)'
                  : 'rgba(255,255,255,0.2)',
                borderRadius: 2,
                overflow: 'hidden',
                '&:hover': {
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 0 10px rgba(255,255,255,0.4)'
                    : '0 0 10px rgba(255,255,255,0.3)'
                }
              }}>
                <TextField 
                  placeholder="Your email address" 
                  fullWidth
                  variant="outlined"
                  sx={{ 
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(255,255,255,0.1)',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                      p: 1.5,
                      pl: 2,
                      '&::placeholder': {
                        color: 'rgba(255,255,255,0.7)',
                        opacity: 1
                      }
                    },
                  }}
                />
                <Button 
                  variant="contained" 
                  color="warning"
                  sx={{ 
                    borderRadius: 0,
                    px: 3,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#f57c00'
                    }
                  }}
                >
                  <Send />
                </Button>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
                  Contact Us
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 1,
                  '& .contact-item': {
                    display: 'flex',
                    alignItems: 'center',
                    color: 'rgba(255,255,255,0.8)',
                    '& svg': {
                      mr: 1,
                      color: 'rgba(255,255,255,0.6)'
                    }
                  }
                }}>
                  <Typography variant="body2" className="contact-item">
                    <LocationOn fontSize="small" />
                    P.O. Box 12345, Kampala, Uganda
                  </Typography>
                  <Typography variant="body2" className="contact-item">
                    <Email fontSize="small" />
                    support@farmagentcom
                  </Typography>
                  <Typography variant="body2" className="contact-item">
                    <Phone fontSize="small" />
                    +256 706993614
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ mt: 5, mb: 3, bgcolor: 'rgba(255,255,255,0.2)' }} />
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            © {new Date().getFullYear()} FARM-AGENT. All rights reserved.
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 3,
            '& a': {
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              fontSize: '0.8rem',
              '&:hover': {
                color: 'white',
                textDecoration: 'underline'
              }
            }
          }}>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Sitemap</Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer; 