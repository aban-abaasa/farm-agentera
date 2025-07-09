import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Divider } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const Marketplace = () => (
  <Box sx={{ p: { xs: 2, md: 6 }, background: 'linear-gradient(120deg, #fce4ec 0%, #e3f2fd 100%)', minHeight: '100vh' }}>
    <Typography variant="h3" fontWeight="bold" color="primary.main" gutterBottom>
      <StorefrontIcon sx={{ fontSize: 40, mr: 1, verticalAlign: 'middle' }} /> Marketplace
    </Typography>
    <Typography variant="h6" color="text.secondary" mb={4}>
      Buy and sell agricultural products, discover market trends, and connect with buyers and sellers.
    </Typography>
    <Grid container spacing={4}>
      <Grid item xs={12} md={4}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent>
            <ShoppingCartIcon color="primary" sx={{ fontSize: 36, mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">Buy Products</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Browse available produce, livestock, and farm equipment for sale.
            </Typography>
            <Button variant="contained" color="primary">Shop Now</Button>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent>
            <StorefrontIcon color="success" sx={{ fontSize: 36, mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">Sell Products</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              List your products and reach thousands of potential buyers.
            </Typography>
            <Button variant="outlined" color="success">Sell Now</Button>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent>
            <TrendingUpIcon color="secondary" sx={{ fontSize: 36, mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">Market Trends</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              View the latest price trends and market insights for better decisions.
            </Typography>
            <Button variant="outlined" color="secondary">View Trends</Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
    <Divider sx={{ my: 6 }} />
    <Typography variant="body2" color="text.secondary" align="center">
      Marketplace is open to all farmers, traders, and investors. More features coming soon!
    </Typography>
  </Box>
);

export default Marketplace; 