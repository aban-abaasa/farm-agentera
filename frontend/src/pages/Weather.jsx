import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Divider, Chip, Avatar, Button, Paper, List, ListItem, ListItemAvatar, ListItemText, Tooltip, useTheme, alpha } from '@mui/material';
import { useAppTheme } from '../context/ThemeContext';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import OpacityIcon from '@mui/icons-material/Opacity';
import GrainIcon from '@mui/icons-material/Grain';
import PlaceIcon from '@mui/icons-material/Place';
import { mockWeatherData, mockPopularLocations } from '../mocks/weather';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

// Helper to generate mock weather data for a region
function getMockWeatherForRegion(regionName) {
  // Simple randomization for demo purposes
  const tempBase = {
    'Central': 26,
    'Eastern': 28,
    'Western': 24,
    'Northern': 30
  };
  const base = tempBase[regionName] || 26;
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const today = new Date();
  const forecast = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(today.getTime() + i * 86400000);
    const day = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long' });
    const maxTemp = base + random(-2, 4);
    const minTemp = maxTemp - random(4, 7);
    const conditions = ['Sunny', 'Partly Cloudy', 'Rain', 'Thunderstorms'];
    const condition = conditions[random(0, conditions.length - 1)];
    const icons = {
      'Sunny': 'https://source.unsplash.com/featured/?weather,sunny',
      'Partly Cloudy': 'https://source.unsplash.com/featured/?weather,clouds',
      'Rain': 'https://source.unsplash.com/featured/?weather,rain',
      'Thunderstorms': 'https://source.unsplash.com/featured/?weather,storm'
    };
    return {
      day,
      date: date.toLocaleDateString(),
      maxTemp,
      minTemp,
      condition,
      icon: icons[condition],
      precipitation: random(0, 90),
      humidity: random(55, 90),
      windSpeed: random(6, 18)
    };
  });
  const rainfallData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "This Year",
        data: Array.from({ length: 12 }).map(() => random(30, 180)),
      },
      {
        label: "Average",
        data: Array.from({ length: 12 }).map(() => random(40, 150)),
      }
    ]
  };
  return {
    current: {
      location: regionName + ', Uganda',
      date: today.toLocaleDateString(),
      time: today.toLocaleTimeString(),
      temperature: base + random(-2, 4),
      condition: forecast[0].condition,
      icon: forecast[0].icon,
      humidity: forecast[0].humidity,
      windSpeed: forecast[0].windSpeed,
      windDirection: ['NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'][random(0, 7)],
      precipitation: forecast[0].precipitation,
      uvIndex: random(4, 10)
    },
    forecast,
    agriculturalAlerts: mockWeatherData.agriculturalAlerts.filter(a => a.regions.includes(regionName)),
    rainfallData
  };
}

const Weather = () => {
  const [selectedLocation, setSelectedLocation] = useState('Kampala');
  const [regionWeather, setRegionWeather] = useState(getMockWeatherForRegion('Central'));
  const [tipIndex, setTipIndex] = useState(0);
  const theme = useTheme();
  const { themeMode } = useAppTheme();
  const isDark = themeMode === 'dark';
  const tips = [
    'Water crops early in the morning to reduce evaporation.',
    'Monitor weather alerts to protect your livestock and crops.',
    'Use mulch to retain soil moisture during dry spells.',
    'Harvest crops before heavy rainfall to prevent spoilage.',
    'Rotate crops to improve soil health and resilience to weather.',
    'Check UV index to plan safe outdoor work hours.'
  ];

  // Cycle tips every 10 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(i => (i + 1) % tips.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [tips.length]);

  const RainfallTrendsChart = ({ rainfallData, theme }) => {
    const { labels, datasets } = rainfallData;
    const chartData = labels.map((month, i) => ({
      month,
      thisYear: datasets[0].data[i],
      average: datasets[1].data[i],
    }));
    let above = 0, below = 0;
    chartData.forEach(d => {
      if (d.thisYear > d.average) above++;
      else if (d.thisYear < d.average) below++;
    });
    return (
      <Box>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="month" tick={{ fill: theme.palette.text.secondary }} />
            <YAxis tick={{ fill: theme.palette.text.secondary }} />
            <RechartsTooltip 
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '8px',
                color: theme.palette.text.primary
              }}
            />
            <Legend />
            <Bar dataKey="thisYear" fill={theme.palette.primary.main} name="This Year" radius={[6, 6, 0, 0]} />
            <Bar dataKey="average" fill={theme.palette.success.main} name="Average" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {above > below
            ? `This year has seen above-average rainfall in ${above} months.`
            : above < below
              ? `This year has seen below-average rainfall in ${below} months.`
              : 'Rainfall this year closely matches the average.'}
        </Typography>
      </Box>
    );
  };

  // When user clicks a location chip
  const handleLocationClick = (loc) => {
    setSelectedLocation(loc.name);
    setRegionWeather(getMockWeatherForRegion(loc.region));
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 6 }, 
      background: isDark
        ? `linear-gradient(120deg, ${theme.palette.grey[800]} 0%, ${theme.palette.primary.dark}40 100%)`
        : `linear-gradient(120deg, ${theme.palette.primary.light}20 0%, ${theme.palette.warning.light}20 100%)`,
      minHeight: '100vh' 
    }}>
      <Typography variant="h3" fontWeight="bold" color="primary.main" gutterBottom>
        <WbSunnyIcon sx={{ fontSize: 40, mr: 1, verticalAlign: 'middle' }} /> Weather & Forecast
      </Typography>
      <Typography variant="h6" color="text.secondary" mb={4}>
        Stay updated with real-time weather, 7-day forecasts, rainfall trends, and agri-weather tips for your farm.
      </Typography>
      <Grid container spacing={4}>
        {/* Current Weather */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 3, mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WbSunnyIcon color="primary" sx={{ fontSize: 36, mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">Current Weather</Typography>
              </Box>
              <Typography variant="subtitle2" color="text.secondary">{regionWeather.current.location}</Typography>
              <Typography variant="h2" fontWeight="bold" color="primary.main" sx={{ my: 1 }}>
                {regionWeather.current.temperature}&deg;C
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {regionWeather.current.condition}
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}><Typography variant="body2">Humidity: {regionWeather.current.humidity}%</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2">Wind: {regionWeather.current.windSpeed} km/h {regionWeather.current.windDirection}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2">Precipitation: {regionWeather.current.precipitation} mm</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2">UV Index: {regionWeather.current.uvIndex}</Typography></Grid>
              </Grid>
            </CardContent>
          </Card>
          {/* Popular Locations */}
          <Paper elevation={0} sx={{ 
            p: 2, 
            borderRadius: 2, 
            background: isDark
              ? alpha(theme.palette.warning.dark, 0.2)
              : alpha(theme.palette.warning.light, 0.3)
          }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              <PlaceIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} /> Popular Locations
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {mockPopularLocations.map(loc => (
                <Chip
                  key={loc.id}
                  label={loc.name}
                  color={selectedLocation === loc.name ? 'primary' : 'default'}
                  onClick={() => handleLocationClick(loc)}
                  sx={{ fontWeight: 'bold' }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>
        {/* 7-Day Forecast & Rainfall */}
        <Grid item xs={12} md={5}>
          <Card elevation={3} sx={{ borderRadius: 3, mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarTodayIcon color="success" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">7-Day Forecast</Typography>
              </Box>
              <Grid container spacing={1}>
                {regionWeather.forecast.map((day, idx) => (
                  <Grid item xs={6} sm={4} key={idx}>
                    <Paper elevation={1} sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      textAlign: 'center', 
                      background: isDark
                        ? alpha(theme.palette.primary.dark, 0.2)
                        : alpha(theme.palette.primary.light, 0.3)
                    }}>
                      <Tooltip title={day.condition}>
                        <Avatar src={day.icon} alt={day.condition} sx={{ mx: 'auto', mb: 0.5, width: 36, height: 36 }} />
                      </Tooltip>
                      <Typography variant="subtitle2" fontWeight="bold">{day.day}</Typography>
                      <Typography variant="body2">{day.maxTemp}&deg; / {day.minTemp}&deg;C</Typography>
                      <Typography variant="caption" color="info.main">{day.condition}</Typography>
                      <Typography variant="caption" color="primary" display="block">{day.precipitation}% rain</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
          <Paper elevation={0} sx={{ 
            p: 2, 
            borderRadius: 2, 
            background: isDark
              ? alpha(theme.palette.primary.dark, 0.2)
              : alpha(theme.palette.primary.light, 0.3),
            mb: 2 
          }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              <OpacityIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} /> Rainfall Trends
            </Typography>
            <RainfallTrendsChart rainfallData={regionWeather.rainfallData} theme={theme} />
          </Paper>
        </Grid>
        {/* Alerts & Tips */}
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ borderRadius: 3, mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningAmberIcon color="error" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">Agri Alerts</Typography>
              </Box>
              <List dense>
                {regionWeather.agriculturalAlerts.map(alert => (
                  <ListItem key={alert.id} alignItems="flex-start" sx={{ mb: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: alert.severity === 'warning' ? 'warning.main' : alert.severity === 'alert' ? 'error.main' : 'info.main' }}>
                        <WarningAmberIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography fontWeight="bold">{alert.title}</Typography>}
                      secondary={<>
                        <Typography variant="body2" color="text.secondary">{alert.description}</Typography>
                        <Typography variant="caption" color="primary">Regions: {alert.regions.join(', ')}</Typography>
                      </>}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
          <Paper elevation={0} sx={{ 
            p: 2, 
            borderRadius: 2, 
            background: isDark
              ? alpha(theme.palette.success.dark, 0.2)
              : alpha(theme.palette.success.light, 0.3)
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TipsAndUpdatesIcon color="secondary" sx={{ fontSize: 22, mr: 1 }} />
              <Typography variant="subtitle2" fontWeight="bold">Agri-Weather Tip</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {tips[tipIndex]}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      <Divider sx={{ my: 6 }} />
      <Typography variant="body2" color="text.secondary" align="center">
        Weather insights for both farmers and investors. More features coming soon!
      </Typography>
    </Box>
  );
};

export default Weather; 