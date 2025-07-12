import React, { useState } from 'react';
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
  Zoom
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppTheme } from '../context/ThemeContext';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaidIcon from '@mui/icons-material/Paid';
import SavingsIcon from '@mui/icons-material/Savings';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';

const Finance = () => {
  const theme = useTheme();
  const { themeMode } = useAppTheme();
  const navigate = useNavigate();
  const isDark = themeMode === 'dark';
  const [activeTab, setActiveTab] = useState(0);

  // Mock financial data
  const financialOverview = {
    totalRevenue: 'UGX 45,000,000',
    totalExpenses: 'UGX 28,500,000',
    netProfit: 'UGX 16,500,000',
    profitMargin: '36.7%',
    monthlyGrowth: '+12.3%',
    cashFlow: 'UGX 8,200,000',
    investments: 'UGX 12,000,000',
    roi: '+18.5%'
  };

  const keyMetrics = [
    {
      title: 'Total Revenue',
      value: financialOverview.totalRevenue,
      change: '+12.3%',
      trend: 'up',
      color: 'success',
      icon: <AttachMoneyIcon />
    },
    {
      title: 'Net Profit',
      value: financialOverview.netProfit,
      change: '+8.7%',
      trend: 'up',
      color: 'primary',
      icon: <SavingsIcon />
    },
    {
      title: 'Total Investments',
      value: financialOverview.investments,
      change: '+15.2%',
      trend: 'up',
      color: 'info',
      icon: <PaidIcon />
    },
    {
      title: 'ROI',
      value: financialOverview.roi,
      change: '+2.1%',
      trend: 'up',
      color: 'secondary',
      icon: <TrendingUpIcon />
    }
  ];

  const recentTransactions = [
    { id: 1, type: 'Revenue', description: 'Livestock Sales - Cattle', amount: 'UGX 3,500,000', date: '2024-07-10', category: 'Sales' },
    { id: 2, type: 'Expense', description: 'Feed Purchase - Maize', amount: 'UGX -850,000', date: '2024-07-09', category: 'Feed' },
    { id: 3, type: 'Investment', description: 'New Irrigation System', amount: 'UGX -2,200,000', date: '2024-07-08', category: 'Equipment' },
    { id: 4, type: 'Revenue', description: 'Crop Sales - Coffee', amount: 'UGX 1,800,000', date: '2024-07-07', category: 'Sales' },
    { id: 5, type: 'Expense', description: 'Veterinary Services', amount: 'UGX -450,000', date: '2024-07-06', category: 'Healthcare' }
  ];

  const investments = [
    { name: 'Solar Water Pumps', amount: 'UGX 4,500,000', roi: '+22%', status: 'Active', period: '2 years' },
    { name: 'Greenhouse Construction', amount: 'UGX 3,200,000', roi: '+18%', status: 'Active', period: '18 months' },
    { name: 'Dairy Equipment', amount: 'UGX 2,800,000', roi: '+15%', status: 'Active', period: '3 years' },
    { name: 'Land Expansion', amount: 'UGX 1,500,000', roi: '+12%', status: 'Planned', period: '5 years' }
  ];

  const monthlyData = [
    { month: 'Jan', revenue: 3800000, expenses: 2200000, profit: 1600000 },
    { month: 'Feb', revenue: 4200000, expenses: 2400000, profit: 1800000 },
    { month: 'Mar', revenue: 3900000, expenses: 2300000, profit: 1600000 },
    { month: 'Apr', revenue: 4500000, expenses: 2600000, profit: 1900000 },
    { month: 'May', revenue: 4800000, expenses: 2800000, profit: 2000000 },
    { month: 'Jun', revenue: 5200000, expenses: 3000000, profit: 2200000 }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'Revenue':
        return 'success';
      case 'Expense':
        return 'error';
      case 'Investment':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            <AccountBalanceWalletIcon sx={{ fontSize: 40, mr: 2, verticalAlign: 'middle' }} />
            Financial Management
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary">
          Comprehensive financial overview, investment tracking, and business analytics
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        {keyMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={metric.title}>
            <Zoom in timeout={600 + index * 200}>
              <Card elevation={4} sx={{
                borderRadius: 3,
                background: isDark
                  ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette[metric.color].dark}20 100%)`
                  : `linear-gradient(135deg, ${theme.palette[metric.color].light}20 0%, ${theme.palette.background.paper} 100%)`,
                border: `1px solid ${theme.palette[metric.color].main}20`,
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[12]
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ color: theme.palette[metric.color].main }}>
                      {metric.icon}
                    </Box>
                    <Chip
                      label={metric.change}
                      size="small"
                      icon={metric.trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      color={metric.trend === 'up' ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color={`${metric.color}.main`} mb={1}>
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {metric.title}
                  </Typography>
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
            <Tab label="Overview" icon={<AnalyticsIcon />} />
            <Tab label="Transactions" icon={<ReceiptIcon />} />
            <Tab label="Investments" icon={<PaidIcon />} />
            <Tab label="Analytics" icon={<BarChartIcon />} />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Monthly Financial Trends
                </Typography>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label="Revenue" color="success" size="small" />
                    <Chip label="Expenses" color="error" size="small" />
                    <Chip label="Profit" color="primary" size="small" />
                  </Box>
                  <Box sx={{ height: 200, display: 'flex', alignItems: 'end', gap: 1 }}>
                    {monthlyData.map((data) => (
                      <Box key={data.month} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: 150, justifyContent: 'end', gap: 0.5 }}>
                          <Box sx={{
                            height: `${(data.revenue / 6000000) * 100}%`,
                            backgroundColor: theme.palette.success.main,
                            borderRadius: 1,
                            minHeight: 8
                          }} />
                          <Box sx={{
                            height: `${(data.expenses / 6000000) * 100}%`,
                            backgroundColor: theme.palette.error.main,
                            borderRadius: 1,
                            minHeight: 8
                          }} />
                          <Box sx={{
                            height: `${(data.profit / 6000000) * 100}%`,
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: 1,
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
              
              <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button variant="contained" startIcon={<AddIcon />} fullWidth>
                    Record Transaction
                  </Button>
                  <Button variant="outlined" startIcon={<PaidIcon />} fullWidth>
                    New Investment
                  </Button>
                  <Button variant="outlined" startIcon={<DownloadIcon />} fullWidth>
                    Export Report
                  </Button>
                  <Button variant="outlined" startIcon={<AnalyticsIcon />} fullWidth>
                    View Analytics
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}

          {/* Transactions Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Transactions
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />}>
                  Add Transaction
                </Button>
              </Box>
              
              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id} hover>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Chip label={transaction.category} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={transaction.type} 
                            size="small" 
                            color={getTransactionColor(transaction.type)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ 
                          color: transaction.type === 'Revenue' ? 'success.main' : 
                                 transaction.type === 'Expense' ? 'error.main' : 'info.main',
                          fontWeight: 'bold'
                        }}>
                          {transaction.amount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Investments Tab */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Investment Portfolio
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />}>
                  New Investment
                </Button>
              </Box>
              
              <Grid container spacing={3}>
                {investments.map((investment, index) => (
                  <Grid item xs={12} md={6} key={investment.name}>
                    <Fade in timeout={400 + index * 100}>
                      <Card elevation={2} sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                              {investment.name}
                            </Typography>
                            <Chip 
                              label={investment.status} 
                              color={investment.status === 'Active' ? 'success' : 'warning'}
                              size="small"
                            />
                          </Box>
                          <Typography variant="h5" color="primary.main" fontWeight="bold" mb={1}>
                            {investment.amount}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Period: {investment.period}
                            </Typography>
                            <Chip 
                              label={`ROI: ${investment.roi}`}
                              color="success"
                              size="small"
                              icon={<TrendingUpIcon />}
                            />
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={parseFloat(investment.roi.replace('+', '').replace('%', '')) * 4} 
                            color="success"
                            sx={{ borderRadius: 2 }}
                          />
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Analytics Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Financial Analytics & Insights
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      Profit Margin Trend
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        36.7%
                      </Typography>
                      <Chip 
                        label="+2.3%" 
                        color="success" 
                        size="small" 
                        icon={<TrendingUpIcon />}
                        sx={{ ml: 2 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Current profit margin is above industry average
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={73} 
                      color="success"
                      sx={{ borderRadius: 2 }}
                    />
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      Investment Performance
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        +18.5%
                      </Typography>
                      <Chip 
                        label="Excellent" 
                        color="success" 
                        size="small"
                        sx={{ ml: 2 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Overall return on investments
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={85} 
                      color="primary"
                      sx={{ borderRadius: 2 }}
                    />
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="bold" mb={1}>
                      Financial Insights
                    </Typography>
                    <Typography variant="body2">
                      • Your farm's profitability has increased by 12.3% this month
                      • Consider investing in solar irrigation systems for better ROI
                      • Cash flow is healthy with UGX 8.2M available for investments
                      • Livestock sales are your highest revenue generator
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Finance;
