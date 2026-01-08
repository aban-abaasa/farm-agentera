import { useState } from 'react';
import { 
  Box, Container, Typography, Grid, Card, CardContent, 
  Avatar, Chip, Button, TextField, InputAdornment, 
  Paper, Divider, Fade, Grow, Dialog, DialogTitle, 
  DialogContent, DialogActions, IconButton, FormControl,
  InputLabel, Select, MenuItem, Alert, Snackbar, CircularProgress,
  useTheme, alpha
} from '@mui/material';
import { useAppTheme } from '../context/ThemeContext';
import { 
  Search as SearchIcon, 
  Email as EmailIcon, 
  Phone as PhoneIcon, 
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { teamMembers } from '../mocks/supportteam.js';

const SupportTeam = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const theme = useTheme();
  const { themeMode } = useAppTheme();
  const isDark = themeMode === 'dark';
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    contactMethod: 'email'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Get unique specialties for filter options
  const specialties = ['all', ...new Set(teamMembers.map(member => member.specialty))];

  // Filter team members based on search term and selected specialty
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        member.specialty.toLowerCase().includes(searchTerm.toLowerCase());
                        
    const matchesSpecialty = selectedSpecialty === 'all' || member.specialty === selectedSpecialty;
    
    return matchesSearch && matchesSpecialty;
  });

  // Handle opening contact modal
  const handleOpenContactModal = (member) => {
    setSelectedMember(member);
    setContactModalOpen(true);
  };

  // Handle closing contact modal
  const handleCloseContactModal = () => {
    setContactModalOpen(false);
    setContactFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      contactMethod: 'email'
    });
    setFormErrors({});
    // Reset selected member after a slight delay to avoid UI flicker
    setTimeout(() => {
      setSelectedMember(null);
    }, 300);
  };

  // Handle input change for contact form
  const handleContactInputChange = (e) => {
    const { name, value } = e.target;
    setContactFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    if (!contactFormData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!contactFormData.email.trim() && contactFormData.contactMethod === 'email') {
      errors.email = 'Email is required for email contact method';
    } else if (contactFormData.email && !/\S+@\S+\.\S+/.test(contactFormData.email)) {
      errors.email = 'Email address is invalid';
    }
    
    if (!contactFormData.phone.trim() && contactFormData.contactMethod === 'phone') {
      errors.phone = 'Phone is required for phone contact method';
    }
    
    if (!contactFormData.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!contactFormData.message.trim()) {
      errors.message = 'Message is required';
    } else if (contactFormData.message.length < 20) {
      errors.message = 'Message should be at least 20 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle contact form submission
  const handleContactSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setSubmitting(false);
      setSubmitSuccess(true);
      
      // Close modal after success
      setTimeout(() => {
        handleCloseContactModal();
        setSubmitSuccess(false);
      }, 2000);
    }, 1500);
  };

  return (
    <Box className="w-full max-w-screen-2xl mx-auto">
      {/* Hero Section */}
      <Box 
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: isDark
            ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.primary.dark} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          color: theme.palette.common.white,
          borderRadius: 4,
          boxShadow: isDark 
            ? `0 10px 30px ${alpha(theme.palette.common.black, 0.3)}` 
            : `0 10px 30px ${alpha(theme.palette.primary.main, 0.1)}`,
          mb: 12,
        }}
      >
        {/* Decorative elements */}
        <Box 
          sx={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.background.paper, 0.1)} 0%, transparent 70%)`,
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
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.2)} 0%, transparent 70%)`,
            bottom: '-80px',
            left: '10%',
            zIndex: 0,
          }}
        />
        
        {/* Support team illustration */}
        <Box 
          sx={{
            position: 'absolute',
            right: { xs: '-100px', sm: '-80px', md: '2%' },
            bottom: 0,
            width: { xs: '200px', sm: '220px', md: '280px' },
            height: { xs: '200px', sm: '220px', md: '280px' },
            opacity: 0.2,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 512'%3E%3Cpath fill='%23ffffff' d='M184 88c0 30.9-25.1 56-56 56s-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56zM64 245.7C54 256.9 48 271.8 48 288s6 31.1 16 42.3V245.7zm144.4-49.3C178.7 222.7 160 261.2 160 304c0 34.3 12 65.8 32 90.5V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V389.2C26.2 371.2 0 332.7 0 288c0-61.9 50.1-112 112-112h32c24 0 46.2 7.5 64.4 20.3zM448 416V394.5c20-24.7 32-56.2 32-90.5c0-42.8-18.7-81.3-48.4-107.7C449.8 183.5 472 176 496 176h32c61.9 0 112 50.1 112 112c0 44.7-26.2 83.2-64 101.2V416c0 17.7-14.3 32-32 32H480c-17.7 0-32-14.3-32-32zM568 88c0 30.9-25.1 56-56 56s-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56zm8 157.7v84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM320 160c-35.3 0-64-28.7-64-64s28.7-64 64-64s64 28.7 64 64s-28.7 64-64 64zM240 304c0 16.2 6 31 16 42.3V261.7c-10 11.3-16 26.1-16 42.3zm144-42.3v84.7c10-11.3 16-26.1 16-42.3s-6-31.1-16-42.3zM448 304c0 44.7-26.2 83.2-64 101.2V448c0 17.7-14.3 32-32 32H288c-17.7 0-32-14.3-32-32V405.2c-37.8-18-64-56.5-64-101.2c0-61.9 50.1-112 112-112h32c61.9 0 112 50.1 112 112z'/%3E%3C/svg%3E")`,
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
          display: { md: 'flex' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 4
        }}>
          <Box sx={{ maxWidth: { md: '60%' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon sx={{ mr: 1, color: alpha(theme.palette.common.white, 0.8) }} />
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  textTransform: 'uppercase', 
                  fontWeight: 600, 
                  letterSpacing: 1, 
                  color: alpha(theme.palette.common.white, 0.9)
                }}
              >
                Expert Support Network
              </Typography>
            </Box>
            
            <Typography 
              component="h1" 
              variant="h2" 
              fontWeight={800}
              sx={{ 
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.75rem' },
                textShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.1)}`,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-16px',
                  left: 0,
                  width: '80px',
                  height: '4px',
                  background: theme.palette.warning.main,
                  borderRadius: '2px',
                }
              }}
            >
              Our Support Team
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4, 
                mt: 4,
                maxWidth: '600px',
                color: alpha(theme.palette.common.white, 0.9),
                lineHeight: 1.6
              }}
            >
              Meet our dedicated team of agricultural specialists who are committed to 
              supporting Ugandan farmers with expert knowledge, resources, and connections.
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Search and Filter Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          mb: 6
        }}
      >
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                placeholder="Search team members by name, role, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography variant="subtitle2" color="text.secondary" mb={1} fontWeight="medium">
                Filter by specialty:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {specialties.map((specialty) => (
                  <Chip
                    key={specialty}
                    label={specialty === 'all' ? 'All Specialties' : specialty}
                    onClick={() => setSelectedSpecialty(specialty)}
                    color={selectedSpecialty === specialty ? 'primary' : 'default'}
                    variant={selectedSpecialty === specialty ? 'filled' : 'outlined'}
                    sx={{ 
                      mb: { xs: 1, md: 0 },
                      fontSize: '0.85rem',
                    }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Team Stats Overview */}
      <Box 
        sx={{ 
          mb: 6, 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center',
          gap: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Paper 
          elevation={2} 
          sx={{ 
            borderRadius: 3, 
            py: 2.5, 
            px: 4, 
            minWidth: { xs: '160px', sm: '180px', md: '200px' },
            flex: { xs: '1 1 100%', sm: '1 1 160px', md: '1 1 0' },
            maxWidth: { xs: '100%', sm: '200px' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: { xs: '100px', sm: '120px' }
          }}
        >
          <Typography variant="h3" fontWeight="bold" color="primary">{teamMembers.length}</Typography>
          <Typography variant="subtitle2" color="text.secondary">Support Experts</Typography>
        </Paper>

        <Paper 
          elevation={2} 
          sx={{ 
            borderRadius: 3, 
            py: 2.5, 
            px: 4, 
            minWidth: { xs: '160px', sm: '180px', md: '200px' },
            flex: { xs: '1 1 100%', sm: '1 1 160px', md: '1 1 0' },
            maxWidth: { xs: '100%', sm: '200px' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: { xs: '100px', sm: '120px' }
          }}
        >
          <Typography variant="h3" fontWeight="bold" color="primary">{specialties.length - 1}</Typography>
          <Typography variant="subtitle2" color="text.secondary">Specialties</Typography>
        </Paper>

        <Paper 
          elevation={2} 
          sx={{ 
            borderRadius: 3, 
            py: 2.5, 
            px: 4, 
            minWidth: { xs: '160px', sm: '180px', md: '200px' },
            flex: { xs: '1 1 100%', sm: '1 1 160px', md: '1 1 0' },
            maxWidth: { xs: '100%', sm: '200px' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: { xs: '100px', sm: '120px' }
          }}
        >
          <Typography variant="h3" fontWeight="bold" color="primary">24/7</Typography>
          <Typography variant="subtitle2" color="text.secondary">Support Access</Typography>
        </Paper>
      </Box>

      {/* Team Members Grid */}
      <Box sx={{ mb: 8 }}>
        <Grid 
          container 
          spacing={4} 
          sx={{
            justifyContent: "center",
            alignItems: "stretch"
          }}
        >
          {filteredMembers.map((member, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              lg={3} 
              key={member.id} 
              sx={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Grow in={true} timeout={(index + 1) * 200}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 16px 30px ${alpha(theme.palette.common.black, 0.15)}`,
                      '& .member-image': {
                        transform: 'scale(1.05)'
                      }
                    },
                    width: '100%',
                    height: '100%',
                    minHeight: 520,
                    maxWidth: 340,
                    position: 'relative',
                    bgcolor: 'background.paper',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`
                  }}
                >
                  <Box sx={{ 
                    position: 'relative',
                    height: 160, 
                    bgcolor: 'primary.dark',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: isDark
                        ? `linear-gradient(145deg, ${alpha(theme.palette.primary.dark, 0.8)} 0%, ${alpha(theme.palette.primary.main, 0.9)} 100%)`
                        : `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.7)} 0%, ${alpha(theme.palette.primary.light, 0.9)} 100%)`,
                      zIndex: 1
                    }
                  }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.1,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
                        zIndex: 1
                      }}
                    />

                    <Avatar
                      src={member.image}
                      alt={member.name}
                      className="member-image"
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        border: `4px solid ${theme.palette.common.white}`,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.2)}`,
                        zIndex: 2,
                        transition: 'transform 0.3s ease'
                      }}
                    />
                  </Box>
                  
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 2.5,
                    pb: 0
                  }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                      {member.name}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {member.role}
                    </Typography>
                    
                    <Chip 
                      label={member.specialty} 
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ 
                        my: 1.5,
                        fontWeight: 'medium' 
                      }} 
                    />
                    
                    <Divider sx={{ width: '100%', my: 2 }} />
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      paragraph 
                      sx={{ 
                        height: 100,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {member.description}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    p: 2.5,
                    mt: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 28, height: 28 }}>
                        <EmailIcon fontSize="small" sx={{ color: theme.palette.common.white, fontSize: '0.9rem' }} />
                      </Avatar>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>
                        {member.contact.email}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 28, height: 28 }}>
                        <PhoneIcon fontSize="small" sx={{ color: theme.palette.common.white, fontSize: '0.9rem' }} />
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        {member.contact.phone}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 28, height: 28 }}>
                        <LocationIcon fontSize="small" sx={{ color: theme.palette.common.white, fontSize: '0.9rem' }} />
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        {member.location}, Uganda
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    mt: 'auto',
                    p: 2.5,
                    pt: 0
                  }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      fullWidth
                      onClick={() => handleOpenContactModal(member)}
                      sx={{ 
                        py: 1.25,
                        borderRadius: 2,
                        boxShadow: 2,
                        '&:hover': { boxShadow: 4 }
                      }}
                    >
                      Contact {member.name.split(' ')[0]}
                    </Button>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    p: 1.5,
                    bgcolor: isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.grey[50], 1) 
                  }}>
                    <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', fontSize: '0.9rem' }} />
                    <Typography variant="caption" color="text.secondary">
                      Joined {new Date(member.joinedDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long'
                      })}
                    </Typography>
                  </Box>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Call to Action Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: 3, 
          mb: 8,
          background: isDark 
            ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`
            : `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative elements */}
        <Box 
          sx={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0)} 70%)`,
            top: '-100px',
            right: '-50px',
            zIndex: 0,
          }}
        />
        
        <Box 
          sx={{
            position: 'absolute',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0)} 70%)`,
            bottom: '-70px',
            left: '10%',
            zIndex: 0,
          }}
        />

        <Grid container spacing={4} alignItems="center" position="relative" zIndex={1}>
          <Grid item xs={12} md={7}>
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom 
              fontWeight="bold"
              sx={{ 
                position: 'relative',
                pb: 2,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '60px',
                  height: '3px',
                  background: `linear-gradient(to right, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                  borderRadius: '3px',
                }
              }}
            >
              Need Specialized Support?
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mt: 3 }}>
              Our team of experts is ready to help with any agricultural challenges you're facing.
              Whether you need advice on crop management, livestock health, market access, or financing options,
              we're here to support your farming journey.
            </Typography>
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              bgcolor: alpha(theme.palette.background.paper, 0.7), 
              borderRadius: 2,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 4,
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Email us at:
                </Typography>
                <Typography variant="body1" fontWeight="medium" color="primary">
                  support@ugafarm.org
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Call our support line:
                </Typography>
                <Typography variant="body1" fontWeight="medium" color="primary">
                  +256 700 123 456
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={5} sx={{ textAlign: 'center' }}>
            <Paper 
              elevation={4} 
              sx={{ 
                p: 4, 
                borderRadius: 3, 
                bgcolor: theme.palette.background.paper,
                maxWidth: { sm: '400px', md: '100%' },
                mx: 'auto'
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight="medium" color="primary.dark">
                Schedule a Consultation
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Fill out this form to request a personalized consultation with one of our agricultural experts.
              </Typography>
              <Box component="form" sx={{ mt: 3 }}>
                <TextField 
                  fullWidth 
                  label="Your Name" 
                  variant="outlined" 
                  margin="normal" 
                  size="small"
                />
                <TextField 
                  fullWidth 
                  label="Your Email" 
                  variant="outlined" 
                  margin="normal" 
                  size="small"
                />
                <TextField 
                  fullWidth 
                  label="Subject" 
                  variant="outlined" 
                  margin="normal" 
                  size="small"
                />
                <TextField 
                  fullWidth 
                  label="Message" 
                  variant="outlined" 
                  margin="normal" 
                  size="small" 
                  multiline 
                  rows={3}
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  size="large"
                  sx={{ 
                    mt: 2, 
                    py: 1.5, 
                    borderRadius: 2,
                    fontWeight: 'bold',
                    boxShadow: 3,
                    '&:hover': { boxShadow: 5 }
                  }}
                >
                  Request Support
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Contact Member Modal */}
      <Dialog 
        open={contactModalOpen} 
        onClose={handleCloseContactModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        {selectedMember && (
          <>
            <Box sx={{ 
              position: 'relative', 
              bgcolor: 'primary.main', 
              color: theme.palette.common.white,
              py: 2,
              px: 3
            }}>
              <DialogTitle sx={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                pb: 0,
                pt: 1
              }}>
                Contact {selectedMember.name}
              </DialogTitle>
              <Typography variant="subtitle1" sx={{ ml: 3, mb: 1 }}>
                {selectedMember.role} • {selectedMember.specialty}
              </Typography>
              <IconButton
                aria-label="close"
                onClick={handleCloseContactModal}
                sx={{
                  position: 'absolute',
                  right: 12,
                  top: 12,
                  color: theme.palette.common.white,
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            
            <DialogContent sx={{ p: 0 }}>
              <Grid container>
                {/* Member Info Column */}
                <Grid item xs={12} md={4} sx={{ 
                  bgcolor: isDark ? alpha(theme.palette.background.paper, 0.05) : alpha(theme.palette.grey[50], 1), 
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <Avatar
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    sx={{ 
                      width: 150, 
                      height: 150, 
                      border: `4px solid ${theme.palette.common.white}`,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
                      mb: 3
                    }}
                  />
                  
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom align="center">
                    About {selectedMember.name.split(' ')[0]}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    paragraph 
                    align="center"
                    sx={{ mb: 3 }}
                  >
                    {selectedMember.description}
                  </Typography>
                  
                  <Divider sx={{ width: '100%', my: 2 }} />
                  
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Direct Contact:
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: 1.5
                    }}>
                      <EmailIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {selectedMember.contact.email}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: 1.5
                    }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {selectedMember.contact.phone}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center'
                    }}>
                      <LocationIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {selectedMember.location}, Uganda
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                {/* Contact Form Column */}
                <Grid item xs={12} md={8}>
                  <Box 
                    component="form" 
                    onSubmit={handleContactSubmit}
                    sx={{ p: 3 }}
                  >
                    <Typography variant="h6" gutterBottom fontWeight="medium" color="primary.dark">
                      Send Message to {selectedMember.name.split(' ')[0]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Fill out this form to get in touch with {selectedMember.name.split(' ')[0]} directly. They typically respond within 24-48 hours.
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          fullWidth 
                          label="Your Name" 
                          name="name"
                          value={contactFormData.name}
                          onChange={handleContactInputChange}
                          variant="outlined" 
                          margin="normal"
                          error={!!formErrors.name}
                          helperText={formErrors.name}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl 
                          fullWidth 
                          variant="outlined" 
                          margin="normal"
                        >
                          <InputLabel id="contact-method-label">Preferred Contact Method</InputLabel>
                          <Select
                            labelId="contact-method-label"
                            id="contact-method"
                            name="contactMethod"
                            value={contactFormData.contactMethod}
                            onChange={handleContactInputChange}
                            label="Preferred Contact Method"
                          >
                            <MenuItem value="email">Email</MenuItem>
                            <MenuItem value="phone">Phone</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          fullWidth 
                          label="Your Email" 
                          name="email"
                          type="email"
                          value={contactFormData.email}
                          onChange={handleContactInputChange}
                          variant="outlined" 
                          margin="normal"
                          error={!!formErrors.email}
                          helperText={formErrors.email}
                          required={contactFormData.contactMethod === 'email'}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          fullWidth 
                          label="Your Phone" 
                          name="phone"
                          value={contactFormData.phone}
                          onChange={handleContactInputChange}
                          variant="outlined" 
                          margin="normal"
                          error={!!formErrors.phone}
                          helperText={formErrors.phone}
                          required={contactFormData.contactMethod === 'phone'}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField 
                          fullWidth 
                          label="Subject" 
                          name="subject"
                          value={contactFormData.subject}
                          onChange={handleContactInputChange}
                          variant="outlined" 
                          margin="normal"
                          error={!!formErrors.subject}
                          helperText={formErrors.subject}
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField 
                          fullWidth 
                          label="Message" 
                          name="message"
                          value={contactFormData.message}
                          onChange={handleContactInputChange}
                          variant="outlined" 
                          margin="normal"
                          multiline 
                          rows={5}
                          error={!!formErrors.message}
                          helperText={formErrors.message}
                          required
                        />
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ 
                      mt: 3, 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="caption" color="text.secondary">
                        * All fields with asterisk are required
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        type="submit"
                        size="large"
                        disabled={submitting}
                        sx={{ 
                          py: 1.25, 
                          px: 4,
                          borderRadius: 2,
                          fontWeight: 'bold'
                        }}
                      >
                        {submitting ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          'Send Message'
                        )}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
      
      {/* Success Snackbar */}
      <Snackbar
        open={submitSuccess}
        autoHideDuration={6000}
        onClose={() => setSubmitSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSubmitSuccess(false)} 
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Your message has been sent successfully! {selectedMember?.name.split(' ')[0]} will contact you soon.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SupportTeam; 