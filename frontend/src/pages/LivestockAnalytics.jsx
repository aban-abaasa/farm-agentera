import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Paper, Button, Divider, ToggleButtonGroup, ToggleButton, MenuItem, Select, Fade } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PetsIcon from '@mui/icons-material/Pets';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PlaceIcon from '@mui/icons-material/Place';
import InfoIcon from '@mui/icons-material/Info';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import FavoriteIcon from '@mui/icons-material/Favorite';

// Mock data
const priceTrendData = [
  { month: 'Jan', Cow: 1200000, Goat: 200000, Chicken: 25000 },
  { month: 'Feb', Cow: 1250000, Goat: 210000, Chicken: 26000 },
  { month: 'Mar', Cow: 1300000, Goat: 220000, Chicken: 25500 },
  { month: 'Apr', Cow: 1280000, Goat: 215000, Chicken: 27000 },
  { month: 'May', Cow: 1350000, Goat: 225000, Chicken: 28000 },
  { month: 'Jun', Cow: 1400000, Goat: 230000, Chicken: 29000 },
];

const animalDistribution = [
  { name: 'Cow', value: 12 },
  { name: 'Goat', value: 8 },
  { name: 'Chicken', value: 20 },
];
const COLORS = ['#1976d2', '#43a047', '#ffb300'];

const breedPopularity = [
  { breed: 'Ankole', value: 10 },
  { breed: 'Boer', value: 8 },
  { breed: 'Kuroiler', value: 15 },
  { breed: 'Other', value: 7 },
];

// Add mock health data
const healthTrendData = [
  { month: 'Jan', Healthy: 30, Vaccinated: 20 },
  { month: 'Feb', Healthy: 32, Vaccinated: 22 },
  { month: 'Mar', Healthy: 35, Vaccinated: 25 },
  { month: 'Apr', Healthy: 37, Vaccinated: 28 },
  { month: 'May', Healthy: 40, Vaccinated: 32 },
  { month: 'Jun', Healthy: 44, Vaccinated: 36 },
];
const healthStatus = [
  { name: 'Healthy', value: 44 },
  { name: 'Needs Attention', value: 3 },
  { name: 'Sick', value: 1 },
];
const HEALTH_COLORS = ['#43a047', '#ffb300', '#e53935'];

const stats = [
  { icon: <TrendingUpIcon color="primary" sx={{ fontSize: 36 }} />, label: 'Avg. Cow Price', value: 1350000, prev: 1300000, unit: 'UGX' },
  { icon: <EmojiEventsIcon color="success" sx={{ fontSize: 36 }} />, label: 'Most Popular', value: 'Chicken', prev: 'Goat', unit: '' },
  { icon: <PetsIcon color="warning" sx={{ fontSize: 36 }} />, label: 'Total Listings', value: 40, prev: 36, unit: '' },
  { icon: <PlaceIcon color="secondary" sx={{ fontSize: 36 }} />, label: 'Top Region', value: 'Central', prev: 'Central', unit: '' },
  { icon: <FavoriteIcon color="error" sx={{ fontSize: 36 }} />, label: 'Healthy Animals', value: 44, prev: 37, unit: '' },
];

const tips = [
  'Monitor price trends to sell at the best time.',
  'Diversify your livestock for better profits.',
  'Vaccinate animals regularly to prevent losses.',
  'Keep records of sales and treatments.',
  'Check demand in different regions before selling.',
  'Did you know? Chicken listings have grown 20% this year!',
  'AI Insight: Goats in Eastern region fetch 10% higher prices.',
  'Health compliance is up 18% this quarter! Keep it up!',
  'Tip: Schedule regular vet visits to maintain herd health.',
];

const breeds = ['Cow', 'Goat', 'Chicken'];
const regions = ['Central', 'Eastern', 'Northern', 'Western'];

export default function LivestockAnalytics() {
  const [tipIndex, setTipIndex] = useState(0);
  const [showAnimal, setShowAnimal] = useState(['Cow', 'Goat', 'Chicken']);
  const [compareA, setCompareA] = useState('Cow');
  const [compareB, setCompareB] = useState('Goat');
  const handleNextTip = () => setTipIndex((tipIndex + 1) % tips.length);

  // Stat card helpers
  const getTrend = (value, prev) => {
    if (typeof value === 'number' && typeof prev === 'number') {
      const diff = value - prev;
      const percent = prev ? ((diff / prev) * 100).toFixed(1) : 0;
      return { diff, percent, up: diff > 0 };
    }
    return null;
  };

  return (
    <Box sx={{ my: 8 }}>
      <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
        <TrendingUpIcon sx={{ fontSize: 36, mr: 1, verticalAlign: 'middle', animation: 'pulse 1.5s infinite alternate' }} /> Livestock Analytics
      </Typography>
      <Typography variant="h6" color="text.secondary" mb={4}>
        Get insights on livestock prices, trends, and market opportunities in Uganda.
      </Typography>
      {/* Stat cards */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, i) => {
          const trend = getTrend(stat.value, stat.prev);
          return (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card elevation={4} sx={{ borderRadius: 3, textAlign: 'center', py: 3, transition: '0.2s', '&:hover': { boxShadow: 8, transform: 'scale(1.04)' } }}>
                <CardContent>
                  <Fade in timeout={800 + i * 200}>
                    <Box>{stat.icon}</Box>
                  </Fade>
                  <Typography variant="subtitle1" fontWeight="bold" mt={1}>{stat.label}</Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    {stat.unit === 'UGX' ? 'UGX ' : ''}{stat.value}{stat.unit === 'UGX' ? '' : ''}
                  </Typography>
                  {trend && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                      {trend.up ? <ArrowUpwardIcon color="success" fontSize="small" /> : <ArrowDownwardIcon color="error" fontSize="small" />}
                      <Typography variant="body2" color={trend.up ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
                        {Math.abs(trend.percent)}%
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <Grid container spacing={4}>
        {/* Price Trend Chart with toggles */}
        <Grid item xs={12} md={8}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" flexGrow={1}>Price Trends (UGX)</Typography>
              <ToggleButtonGroup
                value={showAnimal}
                onChange={(_, val) => val.length && setShowAnimal(val)}
                aria-label="toggle animal lines"
                size="small"
              >
                {breeds.map(b => (
                  <ToggleButton key={b} value={b} aria-label={b}>
                    {b}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {showAnimal.includes('Cow') && <Line type="monotone" dataKey="Cow" stroke="#1976d2" strokeWidth={3} activeDot={{ r: 8 }} isAnimationActive />}
                {showAnimal.includes('Goat') && <Line type="monotone" dataKey="Goat" stroke="#43a047" strokeWidth={3} isAnimationActive />}
                {showAnimal.includes('Chicken') && <Line type="monotone" dataKey="Chicken" stroke="#ffb300" strokeWidth={3} isAnimationActive />}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        {/* Animal Distribution Donut Chart */}
        <Grid item xs={12} md={4}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>Animal Type Distribution</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={animalDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} label>
                  {animalDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      {/* Breed Popularity Bar Chart */}
      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 4, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>Breed Popularity</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={breedPopularity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="breed" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#1976d2" radius={[8, 8, 0, 0]} isAnimationActive />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        {/* Comparison Tool */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CompareArrowsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">Compare Breeds</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Select value={compareA} onChange={e => setCompareA(e.target.value)} size="small">
                {breeds.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
              </Select>
              <Select value={compareB} onChange={e => setCompareB(e.target.value)} size="small">
                {breeds.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
              </Select>
            </Box>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={priceTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                {compareA && <Line type="monotone" dataKey={compareA} stroke="#1976d2" strokeWidth={3} isAnimationActive />}
                {compareB && <Line type="monotone" dataKey={compareB} stroke="#ffb300" strokeWidth={3} isAnimationActive />}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      {/* Health Over Time Chart & Health Status Pie */}
      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 4, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>Health Over Time</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={healthTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Healthy" stroke="#43a047" strokeWidth={3} activeDot={{ r: 8 }} isAnimationActive />
                <Line type="monotone" dataKey="Vaccinated" stroke="#1976d2" strokeWidth={3} isAnimationActive />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>Health Status Distribution</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={healthStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} label>
                  {healthStatus.map((entry, index) => (
                    <Cell key={`cell-health-${index}`} fill={HEALTH_COLORS[index % HEALTH_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      {/* Market Insights / Tips */}
      <Paper elevation={3} sx={{ mt: 6, p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, #e3f2fd 0%, #fffde7 100%)', boxShadow: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InfoIcon color="primary" sx={{ fontSize: 32, mr: 2, animation: 'pulse 1.5s infinite alternate' }} />
          <Typography variant="h6" fontWeight="bold" color="primary.main" mr={2}>Market Insight:</Typography>
          <Typography variant="body1" color="text.secondary">{tips[tipIndex]}</Typography>
        </Box>
        <Button onClick={handleNextTip} color="primary" variant="outlined" sx={{ ml: 2, borderRadius: 2 }}>
          Next Tip
        </Button>
      </Paper>
      <Divider sx={{ my: 6 }} />
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.12); }
        }
      `}</style>
    </Box>
  );
} 