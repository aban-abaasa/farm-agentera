import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Paper, 
  Button, 
  IconButton,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
  Tab,
  Tabs,
  useTheme,
  Container,
  Alert,
  AlertTitle,
  Fade,
  Zoom
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppTheme } from '../context/ThemeContext';

// Icons
import AgricultureIcon from '@mui/icons-material/Agriculture';
import GrassIcon from '@mui/icons-material/Grass';
import PetsIcon from '@mui/icons-material/Pets';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import OpacityIcon from '@mui/icons-material/Opacity';
import NatureIcon from '@mui/icons-material/Nature';
import StorageIcon from '@mui/icons-material/Storage';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import SchoolIcon from '@mui/icons-material/School';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import InsightsIcon from '@mui/icons-material/Insights';
import PaidIcon from '@mui/icons-material/Paid';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SavingsIcon from '@mui/icons-material/Savings';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';

const FarmManagement = () => {
  const theme = useTheme();
  const { themeMode } = useAppTheme();
  const navigate = useNavigate();
  const isDark = themeMode === 'dark';
  const [activeTab, setActiveTab] = useState(0);
  const [farmStats, setFarmStats] = useState(null);

  // Mock farm data
  const farmData = {
    farmName: "Green Valley Farm",
    location: "Mbarara, Uganda",
    size: "25 hectares",
    established: "2018",
    crops: ["Maize", "Coffee", "Bananas", "Beans"],
    livestock: ["30 Cattle", "15 Goats", "50 Chickens"],
    lastVisit: "2024-07-10",
    healthScore: 85,
    productivity: 78,
    sustainability: 92
  };

  const farmModules = [
    {
      id: 'livestock',
      title: 'Livestock Management',
      description: 'Manage your animals, health records, and breeding programs',
      icon: <PetsIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      path: '/livestock-management',
      stats: { total: 95, healthy: 90, alerts: 2 },
      features: ['Animal Registry', 'Health Tracking', 'Breeding Records', 'Vaccination Schedule']
    },
    {
      id: 'crops',
      title: 'Crop & Soil Management',
      description: 'Plan your crops, monitor soil health, and optimize yields',
      icon: <GrassIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      path: '/soil-crop-planner',
      stats: { total: '15 hectares', planted: '12 hectares', harvesting: '3 hectares' },
      features: ['Soil Analysis', 'Crop Planning', 'Yield Tracking', 'Pest Management']
    },
    {
      id: 'irrigation',
      title: 'Water & Irrigation',
      description: 'Monitor water usage, irrigation schedules, and water quality',
      icon: <WaterDropIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.info.main,
      path: '/irrigation-management',
      stats: { systems: 4, active: 3, efficiency: '87%' },
      features: ['Smart Irrigation', 'Water Quality', 'Usage Analytics', 'Weather Integration']
    },
    {
      id: 'analytics',
      title: 'Farm Analytics',
      description: 'Data-driven insights for better farm management decisions',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.main,
      path: '/analytics',
      stats: { reports: 15, insights: 8, trends: 'Positive' },
      features: ['Performance Metrics', 'Predictive Analytics', 'Cost Analysis', 'ROI Tracking']
    },
    {
      id: 'finance',
      title: 'Financial Management',
      description: 'Track revenue, expenses, profits, and financial analytics',
      icon: <PaidIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.success.dark,
      path: '/finance',
      stats: { revenue: 'UGX 45M', profit: 'UGX 16.5M', roi: '+18.5%' },
      features: ['Revenue Tracking', 'Expense Management', 'Profit Analysis', 'ROI Calculation']
    },
    {
      id: 'inventory',
      title: 'Inventory & Storage',
      description: 'Track feed, seeds, equipment, and harvest storage',
      icon: <StorageIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.warning.main,
      path: '/inventory-management',
      stats: { items: 45, lowStock: 5, expiring: 2 },
      features: ['Stock Management', 'Expiry Tracking', 'Equipment Log', 'Purchase Planning']
    },
    {
      id: 'climate',
      title: 'Climate & Weather',
      description: 'Weather monitoring, climate adaptation, and risk management',
      icon: <FilterDramaIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.info.dark,
      path: '/weather',
      stats: { alerts: 1, forecast: '7 days', accuracy: '94%' },
      features: ['Weather Forecast', 'Climate Data', 'Risk Alerts', 'Seasonal Planning']
    }
  ];

  const quickActions = [
    { title: 'Add New Animal', icon: <PetsIcon />, action: () => navigate('/livestock-management'), color: 'primary' },
    { title: 'Record Harvest', icon: <LocalFloristIcon />, action: () => navigate('/soil-crop-planner'), color: 'success' },
    { title: 'Check Weather', icon: <FilterDramaIcon />, action: () => navigate('/weather'), color: 'info' },
    { title: 'Manage Inventory', icon: <StorageIcon />, action: () => navigate('/inventory-management'), color: 'warning' },
    { title: 'Water Management', icon: <WaterDropIcon />, action: () => navigate('/irrigation-management'), color: 'info' },
    { title: 'Financial Overview', icon: <TrendingUpIcon />, action: () => navigate('/finance'), color: 'secondary' }
  ];

  // Analytics data for the dashboard
  const analyticsData = {
    overallMetrics: {
      productivity: '87%',
      profitMargin: '36.7%',
      sustainability: '85%',
      efficiency: '92%'
    },
    sectorPerformance: [
      { sector: 'Livestock', revenue: 18500000, growth: '+15.2%', efficiency: 89, color: theme.palette.primary.main },
      { sector: 'Crops', revenue: 14200000, growth: '+8.7%', efficiency: 85, color: theme.palette.success.main },
      { sector: 'Irrigation', savings: 22, efficiency: 91, cost: 2800000, color: theme.palette.info.main },
      { sector: 'Inventory', value: 8500000, turnover: '+18%', efficiency: 87, color: theme.palette.warning.main }
    ],
    monthlyTrends: [
      { month: 'Jan', revenue: 3800, profit: 1600, productivity: 82 },
      { month: 'Feb', revenue: 4200, profit: 1800, productivity: 85 },
      { month: 'Mar', revenue: 3900, profit: 1600, productivity: 83 },
      { month: 'Apr', revenue: 4500, profit: 1900, productivity: 87 },
      { month: 'May', revenue: 4800, profit: 2000, productivity: 89 },
      { month: 'Jun', revenue: 5200, profit: 2200, productivity: 92 }
    ],
    insights: [
      { type: 'success', title: 'Revenue Growth', message: 'Farm revenue increased by 12.3% this quarter' },
      { type: 'info', title: 'Irrigation Efficiency', message: 'Smart irrigation reduced water usage by 22%' },
      { type: 'warning', title: 'Inventory Alert', message: '3 items running low in stock' }
    ]
  };

  const alerts = [
    { 
      type: 'warning', 
      title: 'Vaccination Due', 
      message: '5 cattle need vaccination this week',
      icon: <WarningIcon />,
      action: 'View Schedule'
    },
    { 
      type: 'info', 
      title: 'Weather Alert', 
      message: 'Heavy rains expected tomorrow. Secure outdoor equipment.',
      icon: <FilterDramaIcon />,
      action: 'View Forecast'
    },
    { 
      type: 'success', 
      title: 'Harvest Ready', 
      message: 'Maize in Field B is ready for harvest',
      icon: <LocalFloristIcon />,
      action: 'Plan Harvest'
    }
  ];

  const upcomingTasks = [
    { task: 'Feed livestock', time: '6:00 AM', status: 'pending' },
    { task: 'Water crops - Field A', time: '8:00 AM', status: 'completed' },
    { task: 'Vet visit - Cattle health check', time: '2:00 PM', status: 'pending' },
    { task: 'Fertilizer application', time: '4:00 PM', status: 'pending' }
  ];

  // Load farm statistics
  useEffect(() => {
    const timer = setTimeout(() => {
      setFarmStats({
        totalRevenue: 'UGX 45,000,000',
        monthlyGrowth: '+12%',
        efficiency: '87%',
        sustainability: '92%'
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Fade in timeout={800}>
        <Box sx={{
          background: isDark
            ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.primary.dark}40 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.success.light}20 100%)`,
          borderRadius: 4,
          p: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" fontWeight="bold" color="primary.main" gutterBottom>
                <AgricultureIcon sx={{ fontSize: 48, mr: 2, verticalAlign: 'middle' }} />
                Farm Management Hub
              </Typography>
              <Typography variant="h6" color="text.secondary" mb={3}>
                Comprehensive tools to manage your farm operations, from livestock to crops, irrigation to analytics.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={farmData.farmName} 
                  avatar={<Avatar><AgricultureIcon /></Avatar>}
                  color="primary" 
                  size="medium"
                />
                <Chip label={farmData.location} icon={<InfoIcon />} variant="outlined" />
                <Chip label={farmData.size} icon={<NatureIcon />} variant="outlined" />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <img 
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=500&q=80" 
                  alt="Modern Farm" 
                  style={{ 
                    width: '100%', 
                    maxWidth: 300, 
                    height: 200, 
                    objectFit: 'cover', 
                    borderRadius: 16,
                    boxShadow: theme.shadows[8]
                  }} 
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Farm Statistics */}
      <Grid container spacing={3} mb={4}>
        {[
          { title: 'Farm Health Score', value: farmData.healthScore, suffix: '%', color: 'success', icon: <NatureIcon /> },
          { title: 'Productivity Index', value: farmData.productivity, suffix: '%', color: 'primary', icon: <TrendingUpIcon /> },
          { title: 'Sustainability Score', value: farmData.sustainability, suffix: '%', color: 'info', icon: <LocalFloristIcon /> },
          { title: 'Monthly Revenue', value: farmStats?.totalRevenue || 'Loading...', suffix: '', color: 'secondary', icon: <AssessmentIcon /> }
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Zoom in timeout={600 + index * 200}>
              <Card elevation={4} sx={{ 
                borderRadius: 3, 
                background: isDark
                  ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette[stat.color].dark}20 100%)`
                  : `linear-gradient(135deg, ${theme.palette[stat.color].light}20 0%, ${theme.palette.background.paper} 100%)`,
                border: `1px solid ${theme.palette[stat.color].main}20`,
                transition: '0.3s',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[12]
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ 
                    color: theme.palette[stat.color].main, 
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color={`${stat.color}.main`}>
                    {typeof stat.value === 'number' ? stat.value : stat.value}{stat.suffix}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  {typeof stat.value === 'number' && (
                    <LinearProgress 
                      variant="determinate" 
                      value={stat.value} 
                      color={stat.color}
                      sx={{ mt: 1, borderRadius: 2 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Tabs */}
      <Paper elevation={4} sx={{ borderRadius: 3, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Farm Modules" icon={<AgricultureIcon />} />
            <Tab label="Analytics Dashboard" icon={<AssessmentIcon />} />
            <Tab label="Financial Overview" icon={<PaidIcon />} />
            <Tab label="Quick Actions" icon={<EventAvailableIcon />} />
            <Tab label="Alerts & Tasks" icon={<NotificationsIcon />} />
            <Tab label="Learning Center" icon={<SchoolIcon />} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {/* Farm Modules Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {farmModules.map((module, index) => (
                <Grid item xs={12} md={6} lg={4} key={module.id}>
                  <Fade in timeout={400 + index * 100}>
                    <Card 
                      elevation={3}
                      sx={{ 
                        height: '100%',
                        borderRadius: 3,
                        transition: '0.3s',
                        cursor: 'pointer',
                        border: `2px solid transparent`,
                        '&:hover': { 
                          transform: 'translateY(-6px)',
                          borderColor: module.color,
                          boxShadow: theme.shadows[12]
                        }
                      }}
                      onClick={() => navigate(module.path)}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ color: module.color, mr: 2 }}>
                            {module.icon}
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" fontWeight="bold">
                              {module.title}
                            </Typography>
                          </Box>
                          <IconButton size="small" sx={{ color: module.color }}>
                            <ArrowForwardIcon />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" mb={3}>
                          {module.description}
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                            Key Features:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {module.features.map((feature) => (
                              <Chip 
                                key={feature}
                                label={feature} 
                                size="small" 
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Quick Stats:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {Object.entries(module.stats).map(([key, value]) => (
                              <Chip 
                                key={key}
                                label={`${key}: ${value}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Analytics Dashboard Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssessmentIcon sx={{ mr: 1 }} />
                  Comprehensive Farm Analytics Dashboard
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" size="small" startIcon={<BarChartIcon />}>
                    Export Report
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<TimelineIcon />}>
                    Advanced Analytics
                  </Button>
                </Box>
              </Box>
              
              {/* Key Performance Indicators */}
              <Grid container spacing={3} mb={4}>
                {[
                  { title: 'Farm Productivity', value: analyticsData.overallMetrics.productivity, color: 'primary', icon: <AgricultureIcon />, description: 'Overall farm output efficiency', change: '+5.2%' },
                  { title: 'Profit Margin', value: analyticsData.overallMetrics.profitMargin, color: 'success', icon: <TrendingUpIcon />, description: 'Financial performance growth', change: '+3.1%' },
                  { title: 'Sustainability', value: analyticsData.overallMetrics.sustainability, color: 'info', icon: <NatureIcon />, description: 'Environmental impact score', change: '+2.8%' },
                  { title: 'Efficiency', value: analyticsData.overallMetrics.efficiency, color: 'secondary', icon: <InsightsIcon />, description: 'Resource utilization rate', change: '+1.5%' }
                ].map((metric, index) => (
                  <Grid item xs={12} sm={6} md={3} key={metric.title}>
                    <Zoom in timeout={300 + index * 100}>
                      <Card elevation={3} sx={{ 
                        borderRadius: 3,
                        background: isDark
                          ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette[metric.color].dark}20 100%)`
                          : `linear-gradient(135deg, ${theme.palette[metric.color].light}20 0%, ${theme.palette.background.paper} 100%)`,
                        border: `1px solid ${theme.palette[metric.color].main}20`,
                        transition: '0.3s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Avatar sx={{ 
                              bgcolor: theme.palette[metric.color].main,
                              width: 48,
                              height: 48
                            }}>
                              {metric.icon}
                            </Avatar>
                            <Chip
                              label={metric.change}
                              size="small"
                              icon={<TrendingUpIcon />}
                              color={metric.change.startsWith('+') ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="h5" fontWeight="bold" color={`${metric.color}.main`} mb={1}>
                            {metric.value}
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                            {metric.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {metric.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>

              {/* Main Analytics Content */}
              <Grid container spacing={3} mb={4}>
                {/* Monthly Performance Trends */}
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Monthly Performance Overview
                  </Typography>
                  <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                      <Chip label="Revenue (000s)" color="success" size="small" />
                      <Chip label="Expenses (000s)" color="error" size="small" />
                      <Chip label="Profit (000s)" color="primary" size="small" />
                      <Chip label="Productivity %" color="info" size="small" />
                    </Box>
                    <Box sx={{ height: 250, display: 'flex', alignItems: 'end', gap: 2 }}>
                      {analyticsData.monthlyTrends.map((data) => (
                        <Box key={data.month} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: 200, justifyContent: 'end', gap: 1 }}>
                            <Box sx={{
                              height: `${(data.revenue / 6000) * 100}%`,
                              backgroundColor: theme.palette.success.main,
                              borderRadius: 1,
                              minHeight: 8,
                              opacity: 0.8
                            }} />
                            <Box sx={{
                              height: `${((data.revenue - data.profit) / 6000) * 100}%`,
                              backgroundColor: theme.palette.error.main,
                              borderRadius: 1,
                              minHeight: 8,
                              opacity: 0.8
                            }} />
                            <Box sx={{
                              height: `${(data.profit / 6000) * 100}%`,
                              backgroundColor: theme.palette.primary.main,
                              borderRadius: 1,
                              minHeight: 8,
                              opacity: 0.8
                            }} />
                            <Box sx={{
                              height: `${(data.productivity / 100) * 50}%`,
                              backgroundColor: theme.palette.info.main,
                              borderRadius: 1,
                              minHeight: 8,
                              opacity: 0.8
                            }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary" mt={1}>
                            {data.month}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                {/* Sector Performance */}
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Sector Performance Analysis
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {analyticsData.sectorPerformance.map((sector, index) => (
                      <Fade in timeout={200 + index * 100} key={sector.sector}>
                        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ 
                              bgcolor: sector.color,
                              mr: 2,
                              width: 32,
                              height: 32
                            }}>
                              {sector.sector === 'Livestock' ? <PetsIcon /> : 
                               sector.sector === 'Crops' ? <LocalFloristIcon /> :
                               sector.sector === 'Irrigation' ? <WaterDropIcon /> :
                               <StorageIcon />}
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ flexGrow: 1 }}>
                              {sector.sector}
                            </Typography>
                            {sector.growth && (
                              <Chip label={sector.growth} color="success" size="small" />
                            )}
                            {sector.turnover && (
                              <Chip label={sector.turnover} color="success" size="small" />
                            )}
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            {sector.revenue && (
                              <Typography variant="body2" color="text.secondary">
                                Revenue: <Typography component="span" fontWeight="bold">UGX {sector.revenue.toLocaleString()}</Typography>
                              </Typography>
                            )}
                            {sector.cost && (
                              <Typography variant="body2" color="text.secondary">
                                Cost: <Typography component="span" fontWeight="bold">UGX {sector.cost.toLocaleString()}</Typography>
                              </Typography>
                            )}
                            {sector.value && (
                              <Typography variant="body2" color="text.secondary">
                                Value: <Typography component="span" fontWeight="bold">UGX {sector.value.toLocaleString()}</Typography>
                              </Typography>
                            )}
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            Efficiency: {sector.efficiency}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={sector.efficiency} 
                            sx={{ 
                              borderRadius: 2,
                              height: 8,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: sector.color
                              }
                            }}
                          />
                        </Paper>
                      </Fade>
                    ))}
                  </Box>
                </Grid>
              </Grid>

              {/* Analytics Insights and Actions */}
              <Grid container spacing={3}>
                {/* Key Insights */}
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    AI-Powered Insights & Recommendations
                  </Typography>
                  <Grid container spacing={2}>
                    {analyticsData.insights.map((insight, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Fade in timeout={300 + index * 100}>
                          <Alert 
                            severity={insight.type} 
                            sx={{ 
                              borderRadius: 2,
                              '& .MuiAlert-action': { alignItems: 'flex-start', pt: 0 }
                            }}
                            action={
                              <Button 
                                color="inherit" 
                                size="small"
                                onClick={() => {
                                  if (insight.title === 'Revenue Growth') navigate('/livestock-analytics');
                                  if (insight.title === 'Irrigation Efficiency') navigate('/irrigation-management');
                                  if (insight.title === 'Inventory Alert') navigate('/inventory-management');
                                }}
                              >
                                View Details
                              </Button>
                            }
                          >
                            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                              {insight.title}
                            </Typography>
                            <Typography variant="body2">
                              {insight.message}
                            </Typography>
                          </Alert>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                {/* Quick Analytics Actions */}
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Detailed Analytics
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<PetsIcon />}
                      fullWidth
                      onClick={() => navigate('/livestock-analytics')}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Livestock Analytics
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<LocalFloristIcon />}
                      fullWidth
                      onClick={() => navigate('/soil-crop-planner')}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Crop Analytics
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<TrendingUpIcon />}
                      fullWidth
                      onClick={() => navigate('/finance')}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Financial Analytics
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<WaterDropIcon />}
                      fullWidth
                      onClick={() => navigate('/irrigation-management')}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Irrigation Analytics
                    </Button>
                    <Divider sx={{ my: 1 }} />
                    <Button 
                      variant="contained" 
                      startIcon={<AssessmentIcon />}
                      fullWidth
                      onClick={() => navigate('/analytics')}
                    >
                      Advanced Analytics
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Financial Overview Tab */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                  <PaidIcon sx={{ mr: 1 }} />
                  Financial Management Dashboard
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" size="small" startIcon={<BarChartIcon />}>
                    Export Financial Report
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<AccountBalanceWalletIcon />}>
                    Manage Budgets
                  </Button>
                </Box>
              </Box>
              
              {/* Financial Key Performance Indicators */}
              <Grid container spacing={3} mb={4}>
                {[
                  { 
                    title: 'Total Revenue', 
                    value: 'UGX 45,000,000', 
                    change: '+12.3%', 
                    color: 'success', 
                    icon: <AttachMoneyIcon />, 
                    description: 'Total farm income this period' 
                  },
                  { 
                    title: 'Net Profit', 
                    value: 'UGX 16,500,000', 
                    change: '+8.7%', 
                    color: 'primary', 
                    icon: <SavingsIcon />, 
                    description: 'Profit after all expenses' 
                  },
                  { 
                    title: 'Total Expenses', 
                    value: 'UGX 28,500,000', 
                    change: '+4.2%', 
                    color: 'warning', 
                    icon: <ReceiptIcon />, 
                    description: 'All operational costs' 
                  },
                  { 
                    title: 'ROI', 
                    value: '+18.5%', 
                    change: '+2.1%', 
                    color: 'info', 
                    icon: <TrendingUpIcon />, 
                    description: 'Return on investment' 
                  }
                ].map((metric, index) => (
                  <Grid item xs={12} sm={6} md={3} key={metric.title}>
                    <Zoom in timeout={300 + index * 100}>
                      <Card elevation={3} sx={{ 
                        borderRadius: 3,
                        background: isDark
                          ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette[metric.color].dark}20 100%)`
                          : `linear-gradient(135deg, ${theme.palette[metric.color].light}20 0%, ${theme.palette.background.paper} 100%)`,
                        border: `1px solid ${theme.palette[metric.color].main}20`,
                        transition: '0.3s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Avatar sx={{ 
                              bgcolor: theme.palette[metric.color].main,
                              width: 48,
                              height: 48
                            }}>
                              {metric.icon}
                            </Avatar>
                            <Chip
                              label={metric.change}
                              size="small"
                              icon={<TrendingUpIcon />}
                              color={metric.change.startsWith('+') ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="h5" fontWeight="bold" color={`${metric.color}.main`} mb={1}>
                            {metric.value}
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                            {metric.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {metric.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>

              {/* Financial Analysis Content */}
              <Grid container spacing={3} mb={4}>
                {/* Monthly Revenue Trends */}
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Monthly Financial Performance
                  </Typography>
                  <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                      <Chip label="Revenue (Millions)" color="success" size="small" />
                      <Chip label="Expenses (Millions)" color="error" size="small" />
                      <Chip label="Net Profit (Millions)" color="primary" size="small" />
                    </Box>
                    <Box sx={{ height: 250, display: 'flex', alignItems: 'end', gap: 2 }}>
                      {[
                        { month: 'Jan', revenue: 38, expenses: 28, profit: 10 },
                        { month: 'Feb', revenue: 42, expenses: 30, profit: 12 },
                        { month: 'Mar', revenue: 39, expenses: 29, profit: 10 },
                        { month: 'Apr', revenue: 45, expenses: 32, profit: 13 },
                        { month: 'May', revenue: 48, expenses: 34, profit: 14 },
                        { month: 'Jun', revenue: 52, expenses: 36, profit: 16 }
                      ].map((data) => (
                        <Box key={data.month} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: 200, justifyContent: 'end', gap: 1 }}>
                            <Box sx={{
                              height: `${(data.revenue / 60) * 100}%`,
                              backgroundColor: theme.palette.success.main,
                              borderRadius: 1,
                              minHeight: 8,
                              opacity: 0.8
                            }} />
                            <Box sx={{
                              height: `${(data.expenses / 60) * 100}%`,
                              backgroundColor: theme.palette.error.main,
                              borderRadius: 1,
                              minHeight: 8,
                              opacity: 0.8
                            }} />
                            <Box sx={{
                              height: `${(data.profit / 60) * 100}%`,
                              backgroundColor: theme.palette.primary.main,
                              borderRadius: 1,
                              minHeight: 8,
                              opacity: 0.8
                            }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary" mt={1}>
                            {data.month}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                {/* Financial Categories Breakdown */}
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Expense Categories
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      { category: 'Feed & Supplies', amount: 'UGX 8.5M', percentage: 30, color: theme.palette.primary.main },
                      { category: 'Labor Costs', amount: 'UGX 6.2M', percentage: 22, color: theme.palette.success.main },
                      { category: 'Equipment', amount: 'UGX 4.8M', percentage: 17, color: theme.palette.info.main },
                      { category: 'Veterinary', amount: 'UGX 3.2M', percentage: 11, color: theme.palette.warning.main },
                      { category: 'Utilities', amount: 'UGX 2.8M', percentage: 10, color: theme.palette.error.main },
                      { category: 'Other', amount: 'UGX 3.0M', percentage: 10, color: theme.palette.grey[500] }
                    ].map((expense, index) => (
                      <Fade in timeout={200 + index * 100} key={expense.category}>
                        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {expense.category}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight="bold">
                              {expense.amount}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {expense.percentage}% of total expenses
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={expense.percentage} 
                            sx={{ 
                              borderRadius: 2,
                              height: 6,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: expense.color
                              }
                            }}
                          />
                        </Paper>
                      </Fade>
                    ))}
                  </Box>
                </Grid>
              </Grid>

              {/* Financial Actions and Recommendations */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Financial Insights & Recommendations
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { 
                        type: 'success', 
                        title: 'Revenue Growth', 
                        message: 'Farm revenue increased by 12.3% compared to last quarter. Livestock sales performance is particularly strong.' 
                      },
                      { 
                        type: 'info', 
                        title: 'Cost Optimization', 
                        message: 'Consider bulk purchasing of feed supplies to reduce costs by 8-12%. Current feed expenses are 30% of total costs.' 
                      },
                      { 
                        type: 'warning', 
                        title: 'Budget Alert', 
                        message: 'Equipment maintenance costs exceeded budget by 15%. Schedule regular maintenance to avoid costly repairs.' 
                      }
                    ].map((insight, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Fade in timeout={300 + index * 100}>
                          <Alert 
                            severity={insight.type} 
                            sx={{ 
                              borderRadius: 2,
                              '& .MuiAlert-action': { alignItems: 'flex-start', pt: 0 }
                            }}
                            action={
                              <Button 
                                color="inherit" 
                                size="small"
                                onClick={() => navigate('/finance')}
                              >
                                View Details
                              </Button>
                            }
                          >
                            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                              {insight.title}
                            </Typography>
                            <Typography variant="body2">
                              {insight.message}
                            </Typography>
                          </Alert>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Financial Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<AttachMoneyIcon />}
                      fullWidth
                      onClick={() => navigate('/finance')}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Detailed Financial Analysis
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<AccountBalanceWalletIcon />}
                      fullWidth
                      onClick={() => navigate('/finance')}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Budget Management
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<BarChartIcon />}
                      fullWidth
                      onClick={() => navigate('/finance')}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Financial Reports
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<SavingsIcon />}
                      fullWidth
                      onClick={() => navigate('/investments')}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Investment Opportunities
                    </Button>
                    <Divider sx={{ my: 1 }} />
                    <Button 
                      variant="contained" 
                      startIcon={<PaidIcon />}
                      fullWidth
                      onClick={() => navigate('/finance')}
                    >
                      Complete Financial Dashboard
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Quick Actions Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" mb={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <EventAvailableIcon sx={{ mr: 1 }} />
                Quick Farm Actions
              </Typography>
              
              <Grid container spacing={3}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} sm={6} md={4} key={action.title}>
                    <Zoom in timeout={300 + index * 100}>
                      <Card 
                        elevation={3}
                        sx={{ 
                          textAlign: 'center',
                          cursor: 'pointer',
                          borderRadius: 3,
                          transition: '0.3s',
                          border: `2px solid transparent`,
                          '&:hover': { 
                            transform: 'translateY(-6px)',
                            borderColor: theme.palette[action.color].main,
                            boxShadow: theme.shadows[12]
                          }
                        }}
                        onClick={action.action}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: theme.palette[action.color].main,
                              width: 56,
                              height: 56,
                              mx: 'auto',
                              mb: 2
                            }}
                          >
                            {action.icon}
                          </Avatar>
                          <Typography variant="h6" fontWeight="bold" color={`${action.color}.main`}>
                            {action.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" mt={1}>
                            Click to access {action.title.toLowerCase()}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
              
              <Divider sx={{ my: 4 }} />
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Additional Farm Operations
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Access more specialized tools and features for comprehensive farm management
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<CalendarTodayIcon />}
                    onClick={() => navigate('/weather')}
                  >
                    Weather Planning
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<ThermostatIcon />}
                    onClick={() => navigate('/settings')}
                  >
                    System Settings
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<SupportAgentIcon />}
                    onClick={() => navigate('/support-team')}
                  >
                    Expert Support
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          {/* Alerts & Tasks Tab */}
          {activeTab === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" mb={2} sx={{ display: 'flex', alignItems: 'center' }}>
                  <NotificationsIcon sx={{ mr: 1 }} />
                  Active Alerts
                </Typography>
                {alerts.map((alert, index) => (
                  <Fade in timeout={300 + index * 100} key={index}>
                    <Alert 
                      severity={alert.type} 
                      sx={{ mb: 2, borderRadius: 2 }}
                      icon={alert.icon}
                      action={
                        <Button color="inherit" size="small">
                          {alert.action}
                        </Button>
                      }
                    >
                      <AlertTitle>{alert.title}</AlertTitle>
                      {alert.message}
                    </Alert>
                  </Fade>
                ))}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" mb={2} sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ mr: 1 }} />
                  Today's Tasks
                </Typography>
                {upcomingTasks.map((task, index) => (
                  <Fade in timeout={300 + index * 100} key={index}>
                    <Card elevation={1} sx={{ mb: 2, borderRadius: 2 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {task.task}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {task.time}
                            </Typography>
                          </Box>
                          <Chip 
                            label={task.status} 
                            color={task.status === 'completed' ? 'success' : 'warning'}
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                ))}
              </Grid>
            </Grid>
          )}

          {/* Learning Center Tab */}
          {/* Learning Center Tab */}
          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" mb={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1 }} />
                Farm Management Learning Center
              </Typography>
              
              <Grid container spacing={3}>
                {[
                  { 
                    title: 'Best Practices Guide', 
                    description: 'Learn modern farming techniques and best practices',
                    icon: <SchoolIcon />,
                    color: 'primary'
                  },
                  { 
                    title: 'Expert Consultations', 
                    description: 'Get advice from agricultural experts and veterinarians',
                    icon: <SupportAgentIcon />,
                    color: 'success'
                  },
                  { 
                    title: 'Training Videos', 
                    description: 'Watch educational videos on farm management',
                    icon: <InfoIcon />,
                    color: 'info'
                  },
                  { 
                    title: 'Community Forum', 
                    description: 'Connect with other farmers and share experiences',
                    icon: <AgricultureIcon />,
                    color: 'secondary'
                  }
                ].map((item, index) => (
                  <Grid item xs={12} sm={6} key={item.title}>
                    <Fade in timeout={300 + index * 100}>
                      <Card 
                        elevation={2}
                        sx={{ 
                          cursor: 'pointer',
                          borderRadius: 3,
                          transition: '0.2s',
                          '&:hover': { 
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[8]
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ color: `${item.color}.main`, mr: 2 }}>
                              {item.icon}
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                              {item.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {item.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Call to Action */}
      <Fade in timeout={1200}>
        <Paper 
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 4,
            background: isDark
              ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.primary.dark}30 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.success.light}20 100%)`,
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Ready to Transform Your Farm Management?
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Join thousands of farmers using digital tools to increase productivity and sustainability.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large" 
              startIcon={<AgricultureIcon />}
              onClick={() => navigate('/livestock-management')}
            >
              Start Managing Livestock
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              startIcon={<GrassIcon />}
              onClick={() => navigate('/soil-crop-planner')}
            >
              Plan Your Crops
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
};

export default FarmManagement;
