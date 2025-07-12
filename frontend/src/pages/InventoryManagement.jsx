import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Paper, 
  Button, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  useTheme,
  Container,
  Alert,
  Fade,
  LinearProgress,
  Badge
} from '@mui/material';
import { useAppTheme } from '../context/ThemeContext';

// Icons
import StorageIcon from '@mui/icons-material/Storage';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BuildIcon from '@mui/icons-material/Build';
import GrassIcon from '@mui/icons-material/Grass';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const InventoryManagement = () => {
  const theme = useTheme();
  const { themeMode } = useAppTheme();
  const isDark = themeMode === 'dark';

  const [inventoryData] = useState([
    {
      id: 1,
      name: 'Cattle Feed (Premium)',
      category: 'Feed',
      currentStock: 45,
      minStock: 20,
      maxStock: 100,
      unit: 'bags',
      lastUpdated: '2024-07-10',
      expiryDate: '2024-12-15',
      supplier: 'AgriSupply Ltd',
      cost: 85000,
      status: 'normal'
    },
    {
      id: 2,
      name: 'Maize Seeds (Hybrid)',
      category: 'Seeds',
      currentStock: 5,
      minStock: 10,
      maxStock: 50,
      unit: 'kg',
      lastUpdated: '2024-07-08',
      expiryDate: '2025-03-20',
      supplier: 'SeedCorp Uganda',
      cost: 25000,
      status: 'low'
    },
    {
      id: 3,
      name: 'Tractor Fuel',
      category: 'Fuel',
      currentStock: 150,
      minStock: 50,
      maxStock: 200,
      unit: 'liters',
      lastUpdated: '2024-07-11',
      expiryDate: null,
      supplier: 'PetroFarm',
      cost: 450000,
      status: 'normal'
    },
    {
      id: 4,
      name: 'NPK Fertilizer',
      category: 'Fertilizer',
      currentStock: 2,
      minStock: 5,
      maxStock: 25,
      unit: 'bags',
      lastUpdated: '2024-07-09',
      expiryDate: '2025-06-30',
      supplier: 'FertilizerPlus',
      cost: 120000,
      status: 'critical'
    },
    {
      id: 5,
      name: 'Chicken Feed Pellets',
      category: 'Feed',
      currentStock: 8,
      minStock: 15,
      maxStock: 40,
      unit: 'bags',
      lastUpdated: '2024-07-11',
      expiryDate: '2024-11-30',
      supplier: 'PoultryFeed Co',
      cost: 55000,
      status: 'low'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'error';
      case 'low': return 'warning';
      case 'normal': return 'success';
      case 'overstocked': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'critical': return 'Critical';
      case 'low': return 'Low Stock';
      case 'normal': return 'Normal';
      case 'overstocked': return 'Overstocked';
      default: return 'Unknown';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Feed': return <GrassIcon />;
      case 'Seeds': return <LocalShippingIcon />;
      case 'Fuel': return <LocalShippingIcon />;
      case 'Fertilizer': return <BuildIcon />;
      case 'Equipment': return <BuildIcon />;
      default: return <InventoryIcon />;
    }
  };

  const getStockPercentage = (current, max) => {
    return (current / max) * 100;
  };

  const criticalItems = inventoryData.filter(item => item.status === 'critical').length;
  const lowStockItems = inventoryData.filter(item => item.status === 'low').length;
  const totalValue = inventoryData.reduce((sum, item) => sum + (item.cost * item.currentStock), 0);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Fade in timeout={800}>
        <Box sx={{
          background: isDark
            ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.warning.dark}40 100%)`
            : `linear-gradient(135deg, ${theme.palette.warning.light}20 0%, ${theme.palette.primary.light}20 100%)`,
          borderRadius: 4,
          p: 4,
          mb: 4,
          textAlign: 'center'
        }}>
          <Typography variant="h3" fontWeight="bold" color="warning.main" gutterBottom>
            <StorageIcon sx={{ fontSize: 48, mr: 2, verticalAlign: 'middle' }} />
            Inventory Management
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Track your farm supplies, equipment, and storage with smart inventory control
          </Typography>
        </Box>
      </Fade>

      {/* Critical Alerts */}
      {(criticalItems > 0 || lowStockItems > 0) && (
        <Alert 
          severity={criticalItems > 0 ? "error" : "warning"} 
          sx={{ mb: 3, borderRadius: 2 }} 
          icon={<WarningIcon />}
        >
          <strong>Inventory Alert:</strong> 
          {criticalItems > 0 && ` ${criticalItems} items are critically low.`}
          {lowStockItems > 0 && ` ${lowStockItems} items need restocking.`}
          <Button color="inherit" size="small" sx={{ ml: 2 }}>
            View Details
          </Button>
        </Alert>
      )}

      {/* Inventory Overview */}
      <Grid container spacing={3} mb={4}>
        {[
          { 
            title: 'Total Items', 
            value: inventoryData.length, 
            change: '+2', 
            trend: 'up', 
            color: 'primary',
            icon: <InventoryIcon />
          },
          { 
            title: 'Total Value', 
            value: `UGX ${(totalValue / 1000000).toFixed(1)}M`, 
            change: '+5%', 
            trend: 'up', 
            color: 'success',
            icon: <TrendingUpIcon />
          },
          { 
            title: 'Low Stock Items', 
            value: lowStockItems, 
            change: '-1', 
            trend: 'down', 
            color: 'warning',
            icon: <WarningIcon />
          },
          { 
            title: 'Critical Items', 
            value: criticalItems, 
            change: '0', 
            trend: 'stable', 
            color: 'error',
            icon: <WarningIcon />
          }
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
                  <Box sx={{ color: `${stat.color}.main`, mb: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color={`${stat.color}.main`}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {stat.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {stat.trend === 'up' ? 
                      <TrendingUpIcon color="success" fontSize="small" /> : 
                      stat.trend === 'down' ?
                      <TrendingDownIcon color="error" fontSize="small" /> :
                      <TrendingUpIcon color="disabled" fontSize="small" />
                    }
                    <Typography 
                      variant="caption" 
                      color={stat.trend === 'up' ? 'success.main' : stat.trend === 'down' ? 'error.main' : 'text.disabled'} 
                      ml={0.5}
                    >
                      {stat.change}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Inventory Categories */}
      <Typography variant="h5" fontWeight="bold" mb={3} sx={{ display: 'flex', alignItems: 'center' }}>
        <InventoryIcon sx={{ mr: 1 }} />
        Inventory by Category
      </Typography>

      <Grid container spacing={3} mb={4}>
        {['Feed', 'Seeds', 'Fertilizer', 'Fuel', 'Equipment'].map((category, index) => {
          const categoryItems = inventoryData.filter(item => item.category === category);
          const categoryValue = categoryItems.reduce((sum, item) => sum + (item.cost * item.currentStock), 0);
          
          return (
            <Grid item xs={12} sm={6} md={2.4} key={category}>
              <Fade in timeout={400 + index * 100}>
                <Card 
                  elevation={2}
                  sx={{ 
                    textAlign: 'center',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: '0.2s',
                    '&:hover': { 
                      transform: 'scale(1.05)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ color: 'primary.main', mb: 1 }}>
                      {getCategoryIcon(category)}
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {categoryItems.length} items
                    </Typography>
                    <Typography variant="caption" color="primary.main">
                      UGX {(categoryValue / 1000).toFixed(0)}K
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          );
        })}
      </Grid>

      {/* Detailed Inventory Table */}
      <Paper elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Detailed Inventory
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} color="primary">
            Add Item
          </Button>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: isDark ? theme.palette.grey[800] : theme.palette.grey[100] }}>
              <TableRow>
                <TableCell><strong>Item Name</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Current Stock</strong></TableCell>
                <TableCell><strong>Stock Level</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Expiry Date</strong></TableCell>
                <TableCell><strong>Value</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventoryData.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 2, color: 'primary.main' }}>
                        {getCategoryIcon(item.category)}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.supplier}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={item.category} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.currentStock} {item.unit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Min: {item.minStock} / Max: {item.maxStock}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: 100 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={getStockPercentage(item.currentStock, item.maxStock)}
                        color={getStatusColor(item.status)}
                        sx={{ borderRadius: 2, height: 6, mb: 0.5 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {getStockPercentage(item.currentStock, item.maxStock).toFixed(0)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusText(item.status)}
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.expiryDate || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      UGX {(item.cost * item.currentStock).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default InventoryManagement;
