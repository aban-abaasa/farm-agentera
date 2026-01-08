import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  Tab,
  Tabs,
  useTheme,
  Container,
  Chip,
  LinearProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert,
  Fade,
  Zoom,
  CircularProgress,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

// Icons
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import PetsIcon from '@mui/icons-material/Pets';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import OpacityIcon from '@mui/icons-material/Opacity';
import NatureIcon from '@mui/icons-material/Nature';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import InsightsIcon from '@mui/icons-material/Insights';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import InventoryIcon from '@mui/icons-material/Inventory';

const Analytics = () => {
  const theme = useTheme();
  const { themeMode } = useAppTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDark = themeMode === 'dark';
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Comprehensive analytics data
  const overallMetrics = {
    totalRevenue: 'UGX 45,000,000',
    totalExpenses: 'UGX 28,500,000',
    netProfit: 'UGX 16,500,000',
    profitMargin: '36.7%',
    productivity: '87%',
    efficiency: '92%',
    sustainability: '85%',
    growth: '+12.3%'
  };

  const keyPerformanceIndicators = [
    {
      title: 'Farm Productivity',
      value: overallMetrics.productivity,
      change: '+5.2%',
      trend: 'up',
      color: 'primary',
      icon: <AgricultureIcon />,
      description: 'Overall farm output efficiency'
    },
    {
      title: 'Financial Performance',
      value: overallMetrics.profitMargin,
      change: '+3.1%',
      trend: 'up',
      color: 'success',
      icon: <AttachMoneyIcon />,
      description: 'Profit margin and revenue growth'
    },
    {
      title: 'Sustainability Score',
      value: overallMetrics.sustainability,
      change: '+2.8%',
      trend: 'up',
      color: 'info',
      icon: <NatureIcon />,
      description: 'Environmental impact and practices'
    },
    {
      title: 'Operational Efficiency',
      value: overallMetrics.efficiency,
      change: '+1.5%',
      trend: 'up',
      color: 'secondary',
      icon: <InsightsIcon />,
      description: 'Resource utilization and waste reduction'
    }
  ];

  // Sector-wise analytics
  const sectorAnalytics = [
    {
      sector: 'Livestock',
      revenue: 'UGX 18,500,000',
      growth: '+15.2%',
      efficiency: 89,
      animals: 95,
      health: 94,
      icon: <PetsIcon />,
      color: theme.palette.primary.main
    },
    {
      sector: 'Crops',
      revenue: 'UGX 14,200,000',
      growth: '+8.7%',
      efficiency: 85,
      area: '15 hectares',
      yield: '12 tons/hectare',
      icon: <LocalFloristIcon />,
      color: theme.palette.success.main
    },
    {
      sector: 'Irrigation',
      cost: 'UGX 2,800,000',
      savings: '+22%',
      efficiency: 91,
      coverage: '12 hectares',
      usage: '85%',
      icon: <WaterDropIcon />,
      color: theme.palette.info.main
    },
    {
      sector: 'Inventory',
      value: 'UGX 8,500,000',
      turnover: '+18%',
      efficiency: 87,
      items: 245,
      stockouts: 3,
      icon: <InventoryIcon />,
      color: theme.palette.warning.main
    }
  ];

  // Monthly performance data
  const monthlyPerformance = [
    { month: 'Jan', revenue: 3800, expenses: 2200, profit: 1600, productivity: 82 },
    { month: 'Feb', revenue: 4200, expenses: 2400, profit: 1800, productivity: 85 },
    { month: 'Mar', revenue: 3900, expenses: 2300, profit: 1600, productivity: 83 },
    { month: 'Apr', revenue: 4500, expenses: 2600, profit: 1900, productivity: 87 },
    { month: 'May', revenue: 4800, expenses: 2800, profit: 2000, productivity: 89 },
    { month: 'Jun', revenue: 5200, expenses: 3000, profit: 2200, productivity: 92 }
  ];

  // Top insights and recommendations
  const insights = [
    {
      type: 'success',
      title: 'Revenue Growth',
      message: 'Farm revenue increased by 12.3% this quarter, driven primarily by livestock sales.',
      action: 'View livestock analytics',
      actionPath: '/livestock-analytics'
    },
    {
      type: 'info',
      title: 'Irrigation Efficiency',
      message: 'Smart irrigation system reduced water usage by 22% while maintaining crop yields.',
      action: 'View irrigation data',
      actionPath: '/irrigation-management'
    },
    {
      type: 'warning',
      title: 'Inventory Alert',
      message: '3 items are running low in stock. Consider restocking feed and veterinary supplies.',
      action: 'Manage inventory',
      actionPath: '/inventory-management'
    },
    {
      type: 'info',
      title: 'Sustainability',
      message: 'Your farm ranks in the top 15% for sustainable practices in the region.',
      action: 'View sustainability report',
      actionPath: '/analytics'
    }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const navigateToSection = (path) => {
    navigate(path);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              <AnalyticsIcon sx={{ fontSize: 40, mr: 2, verticalAlign: 'middle' }} />
              Farm Analytics Dashboard
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh Data
            </Button>
            <Button variant="contained" startIcon={<DownloadIcon />}>
              Export Report
            </Button>
          </Box>
        </Box>
        <Typography variant="h6" color="text.secondary">
          Comprehensive analytics and insights across all farm operations
        </Typography>
      </Box>

      {/* Key Performance Indicators */}
      <Grid container spacing={3} mb={4}>
        {keyPerformanceIndicators.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={kpi.title}>
            <Zoom in timeout={600 + index * 200}>
              <Card elevation={4} sx={{
                borderRadius: 3,
                background: isDark
                  ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette[kpi.color].dark}20 100%)`
                  : `linear-gradient(135deg, ${theme.palette[kpi.color].light}20 0%, ${theme.palette.background.paper} 100%)`,
                border: `1px solid ${theme.palette[kpi.color].main}20`,
                transition: '0.3s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[12]
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: theme.palette[kpi.color].main,
                      width: 48,
                      height: 48
                    }}>
                      {kpi.icon}
                    </Avatar>
                    <Chip
                      label={kpi.change}
                      size="small"
                      icon={kpi.trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      color={kpi.trend === 'up' ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color={`${kpi.color}.main`} mb={1}>
                    {kpi.value}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    {kpi.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {kpi.description}
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Main Analytics Tabs */}
      <Paper elevation={4} sx={{ borderRadius: 3, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Overview" icon={<AssessmentIcon />} />
            <Tab label="Sector Analysis" icon={<BarChartIcon />} />
            <Tab label="Performance Trends" icon={<TimelineIcon />} />
            <Tab label="Insights" icon={<InsightsIcon />} />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Monthly Performance Overview
                </Typography>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    <Chip label="Revenue (000s)" color="success" size="small" />
                    <Chip label="Expenses (000s)" color="error" size="small" />
                    <Chip label="Profit (000s)" color="primary" size="small" />
                    <Chip label="Productivity %" color="info" size="small" />
                  </Box>
                  <Box sx={{ height: 250, display: 'flex', alignItems: 'end', gap: 2 }}>
                    {monthlyPerformance.map((data) => (
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
                            height: `${(data.expenses / 6000) * 100}%`,
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
              
              <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Quick Analytics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<PetsIcon />} 
                    fullWidth
                    onClick={() => navigateToSection('/livestock-analytics')}
                  >
                    Livestock Analytics
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<LocalFloristIcon />} 
                    fullWidth
                    onClick={() => navigateToSection('/soil-crop-planner')}
                  >
                    Crop Analytics
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<AttachMoneyIcon />} 
                    fullWidth
                    onClick={() => navigateToSection('/finance')}
                  >
                    Financial Analytics
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<WaterDropIcon />} 
                    fullWidth
                    onClick={() => navigateToSection('/irrigation-management')}
                  >
                    Irrigation Analytics
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}

          {/* Sector Analysis Tab */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              {sectorAnalytics.map((sector, index) => (
                <Grid item xs={12} md={6} key={sector.sector}>
                  <Fade in timeout={400 + index * 100}>
                    <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: sector.color,
                            mr: 2,
                            width: 40,
                            height: 40
                          }}>
                            {sector.icon}
                          </Avatar>
                          <Typography variant="h6" fontWeight="bold">
                            {sector.sector}
                          </Typography>
                        </Box>
                        
                        <Grid container spacing={2}>
                          {sector.revenue && (
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Revenue</Typography>
                              <Typography variant="h6" fontWeight="bold">{sector.revenue}</Typography>
                            </Grid>
                          )}
                          {sector.cost && (
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Cost</Typography>
                              <Typography variant="h6" fontWeight="bold">{sector.cost}</Typography>
                            </Grid>
                          )}
                          {sector.growth && (
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Growth</Typography>
                              <Chip label={sector.growth} color="success" size="small" />
                            </Grid>
                          )}
                          {sector.savings && (
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Savings</Typography>
                              <Chip label={sector.savings} color="success" size="small" />
                            </Grid>
                          )}
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" mb={1}>
                              Efficiency: {sector.efficiency}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={sector.efficiency} 
                              sx={{ 
                                borderRadius: 2,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: sector.color
                                }
                              }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Performance Trends Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Performance Trends Analysis
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      Revenue vs Profit Trend
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'end', gap: 1 }}>
                      {monthlyPerformance.map((data) => (
                        <Box key={data.month} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 0.5, width: '100%', height: 150, alignItems: 'end' }}>
                            <Box sx={{
                              height: `${(data.revenue / 6000) * 100}%`,
                              backgroundColor: theme.palette.primary.main,
                              borderRadius: 1,
                              flex: 1,
                              minHeight: 8
                            }} />
                            <Box sx={{
                              height: `${(data.profit / 6000) * 100}%`,
                              backgroundColor: theme.palette.success.main,
                              borderRadius: 1,
                              flex: 1,
                              minHeight: 8
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
                
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      Productivity Trend
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'end', gap: 1 }}>
                      {monthlyPerformance.map((data, index) => (
                        <Box key={data.month} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box sx={{
                            height: `${(data.productivity / 100) * 150}px`,
                            backgroundColor: theme.palette.info.main,
                            borderRadius: 1,
                            width: '80%',
                            minHeight: 8,
                            position: 'relative',
                            '&::after': index < monthlyPerformance.length - 1 ? {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              right: -10,
                              width: 20,
                              height: 2,
                              backgroundColor: theme.palette.info.main,
                              transform: `rotate(${monthlyPerformance[index + 1].productivity > data.productivity ? '10deg' : '-10deg'})`
                            } : {}
                          }} />
                          <Typography variant="caption" color="text.secondary" mt={1}>
                            {data.month}
                          </Typography>
                          <Typography variant="caption" color="info.main" fontWeight="bold">
                            {data.productivity}%
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Insights Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                AI-Powered Insights & Recommendations
              </Typography>
              
              <Grid container spacing={3}>
                {insights.map((insight, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Fade in timeout={400 + index * 100}>
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
                            onClick={() => navigateToSection(insight.actionPath)}
                          >
                            {insight.action}
                          </Button>
                        }
                      >
                        <Typography variant="h6" fontWeight="bold" mb={1}>
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

              <Divider sx={{ my: 4 }} />

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Advanced Analytics Reports
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Generate comprehensive reports for deeper insights into your farm operations
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button variant="contained" startIcon={<AssessmentIcon />}>
                    Performance Report
                  </Button>
                  <Button variant="outlined" startIcon={<ShowChartIcon />}>
                    Trend Analysis
                  </Button>
                  <Button variant="outlined" startIcon={<CalendarTodayIcon />}>
                    Monthly Summary
                  </Button>
                  <Button variant="outlined" startIcon={<DownloadIcon />}>
                    Export Data
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Analytics;
