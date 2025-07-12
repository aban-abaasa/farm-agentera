import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Paper, 
  Button, 
  Switch,
  Chip,
  LinearProgress,
  useTheme,
  Container,
  IconButton,
  Divider,
  Alert,
  Fade
} from '@mui/material';
import { useAppTheme } from '../context/ThemeContext';

// Icons
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import OpacityIcon from '@mui/icons-material/Opacity';
import TimerIcon from '@mui/icons-material/Timer';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const IrrigationManagement = () => {
  const theme = useTheme();
  const { themeMode } = useAppTheme();
  const isDark = themeMode === 'dark';
  
  const [systems, setSystems] = useState([
    {
      id: 1,
      name: 'Field A - Drip System',
      status: 'active',
      waterFlow: 45,
      efficiency: 87,
      nextSchedule: '6:00 AM',
      soilMoisture: 65,
      area: '5 hectares'
    },
    {
      id: 2,
      name: 'Field B - Sprinkler',
      status: 'scheduled',
      waterFlow: 0,
      efficiency: 92,
      nextSchedule: '2:00 PM',
      soilMoisture: 45,
      area: '8 hectares'
    },
    {
      id: 3,
      name: 'Greenhouse - Micro',
      status: 'maintenance',
      waterFlow: 0,
      efficiency: 0,
      nextSchedule: 'Manual',
      soilMoisture: 70,
      area: '0.5 hectares'
    }
  ]);

  const toggleSystem = (id) => {
    setSystems(prev => prev.map(system => 
      system.id === id 
        ? { ...system, status: system.status === 'active' ? 'scheduled' : 'active' }
        : system
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'scheduled': return 'warning';
      case 'maintenance': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Fade in timeout={800}>
        <Box sx={{
          background: isDark
            ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.info.dark}40 100%)`
            : `linear-gradient(135deg, ${theme.palette.info.light}20 0%, ${theme.palette.primary.light}20 100%)`,
          borderRadius: 4,
          p: 4,
          mb: 4,
          textAlign: 'center'
        }}>
          <Typography variant="h3" fontWeight="bold" color="info.main" gutterBottom>
            <WaterDropIcon sx={{ fontSize: 48, mr: 2, verticalAlign: 'middle' }} />
            Smart Irrigation Management
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Monitor and control your irrigation systems with precision and efficiency
          </Typography>
        </Box>
      </Fade>

      {/* Water Usage Overview */}
      <Grid container spacing={3} mb={4}>
        {[
          { title: 'Daily Usage', value: '2,340L', change: '+12%', trend: 'up', color: 'info' },
          { title: 'Efficiency Rate', value: '89%', change: '+5%', trend: 'up', color: 'success' },
          { title: 'Active Systems', value: '3/4', change: '0', trend: 'stable', color: 'warning' },
          { title: 'Water Savings', value: '15%', change: '+3%', trend: 'up', color: 'primary' }
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Fade in timeout={600 + index * 200}>
              <Card elevation={4} sx={{ 
                borderRadius: 3, 
                background: isDark
                  ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette[stat.color].dark}20 100%)`
                  : `linear-gradient(135deg, ${theme.palette[stat.color].light}20 0%, ${theme.palette.background.paper} 100%)`,
                transition: '0.3s',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[12]
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h4" fontWeight="bold" color={`${stat.color}.main`}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {stat.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {stat.trend === 'up' ? 
                      <TrendingUpIcon color="success" fontSize="small" /> : 
                      <TrendingDownIcon color="error" fontSize="small" />
                    }
                    <Typography variant="caption" color={stat.trend === 'up' ? 'success.main' : 'error.main'} ml={0.5}>
                      {stat.change}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Weather Alert */}
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }} icon={<FilterDramaIcon />}>
        <strong>Weather Update:</strong> Light rain expected in 2 hours. Automatic irrigation adjusted accordingly.
      </Alert>

      {/* Irrigation Systems */}
      <Typography variant="h5" fontWeight="bold" mb={3} sx={{ display: 'flex', alignItems: 'center' }}>
        <OpacityIcon sx={{ mr: 1 }} />
        Irrigation Systems
      </Typography>

      <Grid container spacing={3} mb={4}>
        {systems.map((system, index) => (
          <Grid item xs={12} md={6} lg={4} key={system.id}>
            <Fade in timeout={400 + index * 100}>
              <Card 
                elevation={3}
                sx={{ 
                  borderRadius: 3,
                  border: `2px solid ${theme.palette[getStatusColor(system.status)].main}20`,
                  transition: '0.3s',
                  '&:hover': { 
                    transform: 'translateY(-6px)',
                    boxShadow: theme.shadows[12]
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {system.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {system.area}
                      </Typography>
                    </Box>
                    <Chip 
                      label={system.status}
                      color={getStatusColor(system.status)}
                      size="small"
                    />
                  </Box>

                  {/* Water Flow */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Water Flow</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {system.waterFlow} L/min
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={system.waterFlow} 
                      color={system.status === 'active' ? 'info' : 'inherit'}
                      sx={{ borderRadius: 2, height: 6 }}
                    />
                  </Box>

                  {/* Soil Moisture */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Soil Moisture</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {system.soilMoisture}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={system.soilMoisture} 
                      color={system.soilMoisture > 60 ? 'success' : 'warning'}
                      sx={{ borderRadius: 2, height: 6 }}
                    />
                  </Box>

                  {/* Efficiency */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Efficiency</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {system.efficiency}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={system.efficiency} 
                      color="success"
                      sx={{ borderRadius: 2, height: 6 }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Controls */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Next: {system.nextSchedule}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        color={system.status === 'active' ? 'error' : 'success'}
                        onClick={() => toggleSystem(system.id)}
                        disabled={system.status === 'maintenance'}
                      >
                        {system.status === 'active' ? <StopIcon /> : <PlayArrowIcon />}
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <SettingsIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Smart Controls */}
      <Paper elevation={4} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          Smart Irrigation Controls
        </Typography>
        
        <Grid container spacing={3}>
          {[
            { label: 'Auto Weather Adjustment', enabled: true, description: 'Automatically adjust based on weather forecast' },
            { label: 'Soil Moisture Triggers', enabled: true, description: 'Start irrigation when soil moisture drops below threshold' },
            { label: 'Energy-Efficient Mode', enabled: false, description: 'Optimize irrigation timing for lower energy costs' },
            { label: 'Mobile Notifications', enabled: true, description: 'Get alerts for system status and maintenance' }
          ].map((control, index) => (
            <Grid item xs={12} sm={6} key={control.label}>
              <Box sx={{ 
                p: 2, 
                border: `1px solid ${theme.palette.divider}`, 
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {control.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {control.description}
                  </Typography>
                </Box>
                <Switch checked={control.enabled} color="primary" />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Quick Actions */}
      <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          Quick Actions
        </Typography>
        
        <Grid container spacing={2}>
          {[
            { label: 'Start All Systems', icon: <PlayArrowIcon />, color: 'success' },
            { label: 'Emergency Stop', icon: <StopIcon />, color: 'error' },
            { label: 'Schedule Maintenance', icon: <SettingsIcon />, color: 'warning' },
            { label: 'View Analytics', icon: <TrendingUpIcon />, color: 'info' }
          ].map((action) => (
            <Grid item xs={12} sm={6} md={3} key={action.label}>
              <Button
                variant="outlined"
                color={action.color}
                startIcon={action.icon}
                fullWidth
                sx={{ py: 1.5 }}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default IrrigationManagement;
