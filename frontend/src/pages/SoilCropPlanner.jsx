import React, { useState, useRef } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Divider, Tabs, Tab, Fab, Fade, Paper, TextField, MenuItem, Modal, Snackbar, useTheme } from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import GrassIcon from '@mui/icons-material/Grass';
import ScienceIcon from '@mui/icons-material/Science';
import ForumIcon from '@mui/icons-material/Forum';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import InfoIcon from '@mui/icons-material/Info';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';

// Mock data
const soilStats = [
  { label: 'Optimal pH', value: 6.5, unit: '', icon: <ScienceIcon color="primary" /> },
  { label: 'Nitrogen', value: 'Medium', unit: '', icon: <TrendingUpIcon color="success" /> },
  { label: 'Moisture', value: 'Adequate', unit: '', icon: <GrassIcon color="secondary" /> },
  { label: 'Deficiency Alerts', value: 'None', unit: '', icon: <InfoIcon color="warning" /> },
];
const soilChartData = [
  { name: 'pH', value: 6.5 },
  { name: 'N', value: 60 },
  { name: 'P', value: 40 },
  { name: 'K', value: 55 },
];
const cropRotationData = [
  { year: '2021', Maize: 1, Beans: 0, Cassava: 0 },
  { year: '2022', Maize: 0, Beans: 1, Cassava: 0 },
  { year: '2023', Maize: 0, Beans: 0, Cassava: 1 },
];
const cropDiversity = [
  { name: 'Maize', value: 40 },
  { name: 'Beans', value: 30 },
  { name: 'Cassava', value: 20 },
  { name: 'Other', value: 10 },
];
const COLORS = ['#43a047', '#1976d2', '#ffb300', '#8d6e63'];
const recommendations = [
  { crop: 'Maize', reason: 'Best for current pH and nitrogen levels.' },
  { crop: 'Beans', reason: 'Improves soil nitrogen for next season.' },
  { crop: 'Cassava', reason: 'Tolerates current potassium levels.' },
];
const communityPosts = [
  { id: 1, user: 'Farmer Grace', content: 'What is the best crop after beans for sandy soil?', replies: 3 },
  { id: 2, user: 'AgroExpert', content: 'Share your soil test results for tailored advice!', replies: 5 },
  { id: 3, user: 'Investor John', content: 'How do I maximize yield on acidic soils?', replies: 2 },
];
const regions = [
  'Central', 'Eastern', 'Northern', 'Western', 'West Nile', 'Karamoja', 'Elgon', 'Southwestern', 'Lango', 'Acholi', 'Teso', 'Bukedi', 'Bunyoro', 'Bugisu', 'Busoga', 'Kigezi', 'Toro', 'Ankole'
];
const crops = [
  'Maize', 'Beans', 'Coffee', 'Banana', 'Cassava', 'Rice', 'Groundnuts', 'Sorghum', 'Millet', 'Sunflower', 'Soybean', 'Sweet Potato', 'Cotton', 'Sugarcane', 'Tea', 'Horticulture'
];

// Add mock data for soil profile and crop stages
const soilLayers = [
  { name: 'Topsoil', color: '#8d6e63', info: 'Rich in organic matter, best for planting.' },
  { name: 'Subsoil', color: '#bcaaa4', info: 'Contains minerals, less organic matter.' },
  { name: 'Bedrock', color: '#d7ccc8', info: 'Solid rock, not suitable for roots.' },
];
const cropStages = [
  { stage: 'Seed', img: '🌱', tip: 'Sow seeds at the right depth.' },
  { stage: 'Seedling', img: '🌿', tip: 'Keep soil moist for germination.' },
  { stage: 'Vegetative', img: '🌾', tip: 'Apply fertilizer and weed regularly.' },
  { stage: 'Flowering', img: '🌸', tip: 'Watch for pests and diseases.' },
  { stage: 'Harvest', img: '🌽', tip: 'Harvest at the right maturity.' },
];
const soilHealthScore = 78; // mock value
const ugandaRegions = [
  { name: 'Central', soil: 'Loam', crops: ['Maize', 'Coffee'] },
  { name: 'Eastern', soil: 'Clay', crops: ['Rice', 'Sugarcane'] },
  { name: 'Northern', soil: 'Sandy', crops: ['Millet', 'Sorghum'] },
  { name: 'Western', soil: 'Loam', crops: ['Banana', 'Tea'] },
];

function TabPanel({ children, value, index }) {
  return (
    <Fade in={value === index} timeout={400} unmountOnExit>
      <div hidden={value !== index} style={{ width: '100%' }}>
        {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
      </div>
    </Fade>
  );
}

export default function SoilCropPlanner() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [soilFile, setSoilFile] = useState(null);
  // For crop rotation planner
  const [selectedYear, setSelectedYear] = useState('2023');
  // Region and crop selectors
  const [selectedRegion, setSelectedRegion] = useState('Central');
  const [selectedCrop, setSelectedCrop] = useState('Maize');
  // Interactive features state
  const [activeLayer, setActiveLayer] = useState(soilLayers[0]);
  const [activeStage, setActiveStage] = useState(0);
  const [dragGrid, setDragGrid] = useState(Array(3).fill().map(() => Array(3).fill(null)));
  const [draggingCrop, setDraggingCrop] = useState(null);
  const [aiPhoto, setAiPhoto] = useState(null);
  const [aiResult, setAiResult] = useState('');
  const fileInputRef = useRef();
  const [selectedMapRegion, setSelectedMapRegion] = useState('Central');

  // Change inputSuppliers to state inside the component
  const [inputSuppliers, setInputSuppliers] = useState([
    {
      name: 'NASECO Seeds',
      type: 'Seeds',
      region: 'Central',
      crops: ['Maize', 'Beans', 'Rice'],
      contact: '+256 700 123456',
      website: 'https://nasecoseeds.com',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      rating: 4.7,
      verified: true,
      reviews: [
        { rating: 5, comment: 'Excellent quality seeds, great germination rate!', date: '2024-01-15', user: 'Farmer John' },
        { rating: 4, comment: 'Good service and delivery on time.', date: '2024-01-10', user: 'AgroInvestor' }
      ]
    },
    {
      name: 'AgroMax Uganda',
      type: 'Seedlings',
      region: 'Northern',
      crops: ['Cassava', 'Groundnuts', 'Soybean'],
      contact: '+256 703 456789',
      website: 'https://agromaxug.com',
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
      rating: 4.6,
      verified: true,
      reviews: [
        { rating: 5, comment: 'Healthy seedlings, very satisfied!', date: '2024-01-12', user: 'Farmer Sarah' }
      ]
    },
    {
      name: 'Bukoola Chemical Industries',
      type: 'Agrochemicals',
      region: 'Western',
      crops: ['Coffee', 'Banana', 'Tea'],
      contact: '+256 702 345678',
      website: 'https://bukoolachemicals.com',
      image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=400&q=80',
      rating: 4.8,
      verified: true,
      reviews: [
        { rating: 5, comment: 'Best agrochemicals in the region!', date: '2024-01-08', user: 'Coffee Farmer' },
        { rating: 4, comment: 'Effective products, good technical support.', date: '2024-01-05', user: 'Tea Estate' }
      ]
    },
    {
      name: 'East African Seed Co.',
      type: 'Fertilizers',
      region: 'Eastern',
      crops: ['Maize', 'Sorghum', 'Sunflower'],
      contact: '+256 701 234567',
      website: 'https://eastafricanseed.com',
      image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
      rating: 4.5,
      verified: false,
      reviews: []
    },
  ]);

  // Supplier suggestion form state
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestData, setSuggestData] = useState({ name: '', type: '', region: '', crops: '', contact: '', website: '' });
  const [suggestSuccess, setSuggestSuccess] = useState(false);

  // Enhanced supplier functionality state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [sortBy, setSortBy] = useState('rating');
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  // Toggle for all vs filtered suppliers
  const [showAllSuppliers, setShowAllSuppliers] = useState(false);

  const handleSuggestChange = e => {
    setSuggestData({ ...suggestData, [e.target.name]: e.target.value });
  };
  const handleSuggestSubmit = e => {
    e.preventDefault();
    setSuggestSuccess(true);
    setInputSuppliers(prev => [
      ...prev,
      {
        name: suggestData.name,
        type: suggestData.type,
        region: suggestData.region,
        crops: suggestData.crops.split(',').map(c => c.trim()),
        contact: suggestData.contact,
        website: suggestData.website,
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', // default image
        rating: 4.5, // default rating
        reviews: [], // add reviews array
        verified: false, // add verification status
        addedByYou: true // mark as added by user
      }
    ]);
    setSuggestData({ name: '', type: '', region: '', crops: '', contact: '', website: '' });
    setSuggestOpen(false);
  };

  // Enhanced supplier functionality handlers
  const handleSupplierClick = (supplier) => {
    setSelectedSupplier(supplier);
    setSupplierModalOpen(true);
  };

  const handleAddReview = () => {
    if (selectedSupplier && reviewData.comment.trim()) {
      setInputSuppliers(prev => prev.map(s => 
        s.name === selectedSupplier.name 
          ? { 
              ...s, 
              reviews: [...(s.reviews || []), { 
                rating: reviewData.rating, 
                comment: reviewData.comment, 
                date: new Date().toLocaleDateString(),
                user: 'Farmer User'
              }],
              rating: ((s.reviews || []).reduce((sum, r) => sum + r.rating, 0) + reviewData.rating) / ((s.reviews || []).length + 1)
            }
          : s
      ));
      setReviewData({ rating: 5, comment: '' });
      setReviewModalOpen(false);
    }
  };

  // Filter and sort suppliers
  const filteredSuppliers = inputSuppliers
    .filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.crops.some(crop => crop.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === 'All Types' || s.type === selectedType;
      const matchesRegion = selectedRegion ? s.region === selectedRegion : true;
      const matchesCrop = selectedCrop ? s.crops.includes(selectedCrop) : true;
      return matchesSearch && matchesType && matchesRegion && matchesCrop;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'name': return a.name.localeCompare(b.name);
        case 'region': return a.region.localeCompare(b.region);
        default: return 0;
      }
    });

  // Drag-and-drop handlers
  const handleDragStart = crop => setDraggingCrop(crop);
  const handleDrop = (row, col) => {
    if (draggingCrop) {
      const newGrid = dragGrid.map(arr => arr.slice());
      newGrid[row][col] = draggingCrop;
      setDragGrid(newGrid);
      setDraggingCrop(null);
    }
  };
  const handlePhotoUpload = e => {
    const file = e.target.files[0];
    setAiPhoto(file);
    setTimeout(() => setAiResult('Your soil looks loamy and healthy!'), 1200);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1600px', mx: 'auto', px: { xs: 2, md: 6 }, py: { xs: 2, md: 4 }, minHeight: '100vh' }}>
      {/* Decorative Header Section */}
      <Box sx={{
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden',
        mb: 8,
        boxShadow: '0 10px 30px rgba(76, 175, 80, 0.1)',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(200, 230, 201, 0.1) 100%)' 
          : 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
      }}>
        {/* Decorative circles */}
        <Box sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76,175,80,0.15) 0%, rgba(76,175,80,0) 70%)',
          top: '-100px',
          right: '-50px',
          zIndex: 0,
        }} />
        <Box sx={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,193,7,0.1) 0%, rgba(255,193,7,0) 70%)',
          bottom: '-80px',
          left: '10%',
          zIndex: 0,
        }} />
        {/* Farming SVG illustration */}
        <Box sx={{
          position: 'absolute',
          right: { xs: '-80px', sm: '-60px', md: '-20px', lg: '30px' },
          bottom: { xs: '-40px', sm: '-30px', md: '0px' },
          width: { xs: '180px', sm: '200px', md: '250px' },
          height: { xs: '180px', sm: '200px', md: '250px' },
          opacity: { xs: 0.15, sm: 0.15, md: 0.2 },
          zIndex: 1,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 512' fill='%234caf50'%3E%3Cpath d='M528 336c-48.6 0-88 39.4-88 88s39.4 88 88 88 88-39.4 88-88-39.4-88-88-88zm0 112c-13.23 0-24-10.77-24-24s10.77-24 24-24 24 10.77 24 24-10.77 24-24 24zm80-288h-64v-40.2c0-14.12 4.7-27.76 13.15-38.84 4.42-5.8 3.55-14.06-1.32-19.49L534.2 37.3c-6.66-7.45-18.32-6.92-24.7.78C490.58 60.9 480 89.81 480 119.8V160H377.67L321.58 29.14A47.914 47.914 0 0 0 277.45 0H144c-26.47 0-48 21.53-48 48v146.52c-8.63-6.73-20.96-6.46-28.89 1.47L36 227.1c-8.59 8.59-8.59 22.52 0 31.11l5.06 5.06c-4.99 9.26-8.96 18.82-11.91 28.72H22c-12.15 0-22 9.85-22 22v44c0 12.15 9.85 22 22 22h7.14c2.96 9.91 6.92 19.46 11.91 28.73l-5.06 5.05c-8.59 8.59-8.59 22.52 0 31.11L67.1 476c8.59 8.59 22.52 8.59 31.11 0l5.06-5.05c9.26 4.99 18.82 8.96 28.72 11.91V490c0 12.15 9.85 22 22 22h44c12.15 0 22-9.85 22-22v-7.14c9.9-2.95 19.46-6.92 28.72-11.91l5.05 5.05c8.59 8.59 22.52 8.59 31.11 0l31.11-31.11c8.59-8.59 8.59-22.52 0-31.11l-5.05-5.05c4.99-9.26 8.96-18.82 11.91-28.72H330c12.15 0 22-9.85 22-22v-6h80.54c21.91-28.99 56.32-48 95.46-48 18.64 0 36.07 4.61 51.8 12.2l50.82-50.82c6-6 9.37-14.14 9.37-22.63V192c.01-17.67-14.32-32-31.99-32zM176 416c-44.18 0-80-35.82-80-80s35.82-80 80-80 80 35.82 80 80-35.82 80-80 80zm22-256h-38V64h106.89l41.15 96H198z'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
        }} />
        {/* Content */}
        <Box sx={{
          position: 'relative',
          zIndex: 2,
          p: { xs: 4, sm: 6, md: 8 },
          display: { md: 'flex' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 4
        }}>
          {/* Left side content */}
          <Box sx={{ maxWidth: { md: '55%' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <GrassIcon sx={{ fontSize: 32, color: '#4caf50', mr: 1 }} />
              <Typography component="span" sx={{ fontSize: '1rem', fontWeight: 'medium', color: '#4caf50', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Soil & Crop Planner
              </Typography>
            </Box>
            <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 800, color: '#2e7d32', mb: 3, maxWidth: '800px', position: 'relative', '&::after': { content: '""', position: 'absolute', bottom: '-10px', left: 0, width: '80px', height: '4px', background: 'linear-gradient(to right, #4caf50, rgba(76,175,80,0.3))', borderRadius: '2px' } }}>
              Plan your crops with confidence
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, maxWidth: '600px', color: 'text.secondary', lineHeight: 1.6 }}>
              Analyze your soil, optimize crop rotation, and get smart recommendations for higher yields. Now with interactive tools for every Ugandan farmer.
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* Region & Crop Selectors */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField
          select
          label="Region"
          value={selectedRegion}
          onChange={e => setSelectedRegion(e.target.value)}
          size="small"
          sx={{ minWidth: 160 }}
        >
          {regions.map(region => (
            <MenuItem key={region} value={region}>{region}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Crop"
          value={selectedCrop}
          onChange={e => setSelectedCrop(e.target.value)}
          size="small"
          sx={{ minWidth: 160 }}
        >
          {crops.map(crop => (
            <MenuItem key={crop} value={crop}>{crop}</MenuItem>
          ))}
        </TextField>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          <b>Selected Region:</b> {selectedRegion} &nbsp; | &nbsp; <b>Crop:</b> {selectedCrop}
        </Typography>
      </Box>
      {/* Access Good Farm Inputs Section */}
      <Paper elevation={4} sx={{ 
        p: 4, 
        borderRadius: 4, 
        mb: 6, 
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(120deg, rgba(255, 253, 231, 0.05) 0%, rgba(224, 247, 250, 0.05) 100%)' 
          : 'linear-gradient(120deg, #fffde7 0%, #e0f7fa 100%)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ mb: 1 }}>
              Access Good Farm Inputs
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Find trusted suppliers for seeds, seedlings, fertilizers, and agrochemicals in your region.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<AddIcon />}
            onClick={() => setSuggestOpen(true)}
            sx={{ borderRadius: 3, fontWeight: 'bold', px: 4, py: 1.5, boxShadow: 3 }}
          >
            Add Your Business
          </Button>
        </Box>
        
        {/* Search and Filter */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: <InfoIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <TextField
            select
            label="Type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="All Types">All Types</MenuItem>
            <MenuItem value="Seeds">Seeds</MenuItem>
            <MenuItem value="Fertilizers">Fertilizers</MenuItem>
            <MenuItem value="Agrochemicals">Agrochemicals</MenuItem>
            <MenuItem value="Machinery">Machinery</MenuItem>
          </TextField>
          <TextField
            select
            label="Sort by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="rating">Rating</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="region">Region</MenuItem>
          </TextField>
          <Button
            variant={showAllSuppliers ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => setShowAllSuppliers(!showAllSuppliers)}
            sx={{ borderRadius: 2, fontWeight: 'bold', minWidth: 160 }}
          >
            {showAllSuppliers ? 'Show Filtered Suppliers' : 'Show All Suppliers'}
          </Button>
          <Typography variant="body2" color="text.secondary">
            {filteredSuppliers.length} suppliers found
          </Typography>
        </Box>

        {/* Supplier Categories */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
            Where to Add Suppliers
          </Typography>
          <Grid container spacing={2}>
            {[
              { name: 'Seeds & Seedlings', icon: '🌱', color: '#4caf50', count: 12 },
              { name: 'Fertilizers', icon: '🌿', color: '#8bc34a', count: 8 },
              { name: 'Agrochemicals', icon: '🧪', color: '#ff9800', count: 6 },
              { name: 'Farm Machinery', icon: '🚜', color: '#2196f3', count: 4 },
              { name: 'Irrigation', icon: '💧', color: '#00bcd4', count: 3 },
              { name: 'Organic Inputs', icon: '🌾', color: '#795548', count: 5 }
            ].map(category => (
              <Grid item xs={6} sm={4} md={2} key={category.name}>
                <Card elevation={2} sx={{ 
                  borderRadius: 3, 
                  textAlign: 'center', 
                  p: 2, 
                  cursor: 'pointer',
                  transition: '0.3s',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: 4,
                    bgcolor: category.color + '10'
                  }
                }}>
                  <Box sx={{ fontSize: 32, mb: 1 }}>{category.icon}</Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{category.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{category.count} suppliers</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Featured Suppliers */}
        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 3 }}>
          Featured Suppliers in {selectedRegion}
        </Typography>
        <Grid container spacing={3}>
          {(showAllSuppliers ? inputSuppliers : filteredSuppliers).map(supplier => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={supplier.name}>
              <Card elevation={4} sx={{ 
                borderRadius: 3, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                transition: '0.3s', 
                '&:hover': { 
                  boxShadow: 8, 
                  transform: 'scale(1.03)' 
                },
                position: 'relative',
                overflow: 'hidden'
              }}>
                {supplier.addedByYou && (
                  <Box sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    bgcolor: 'secondary.main',
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    fontSize: 12,
                    zIndex: 2,
                    boxShadow: 2
                  }}>
                    You Added
                  </Box>
                )}
                <Box sx={{ position: 'relative', height: 140 }}>
                  <img src={supplier.image} alt={supplier.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      <Box sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 0.5 
                    }}>
                      <Box sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white', 
                        px: 1.5, 
                        py: 0.5, 
                        borderRadius: 2, 
                        fontWeight: 'bold', 
                        fontSize: 14 
                      }}>
                        {supplier.rating} ★
                      </Box>
                      {supplier.verified && (
                        <Box sx={{ 
                          bgcolor: 'success.main', 
                          color: 'white', 
                          px: 1, 
                          py: 0.3, 
                          borderRadius: 1, 
                          fontSize: 10,
                          fontWeight: 'bold'
                        }}>
                          ✓ Verified
                        </Box>
                      )}
                    </Box>
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    p: 1
                  }}>
                    <Typography variant="caption" color="white" fontWeight="bold">
                      {supplier.type}
                    </Typography>
                  </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, fontSize: '1rem' }}>{supplier.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>📍 {supplier.region}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>🌾 {supplier.crops.join(', ')}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>📞 {supplier.contact}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small"
                      onClick={() => handleSupplierClick(supplier)}
                      sx={{ flex: 1, borderRadius: 2, fontWeight: 'bold' }}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      size="small"
                      sx={{ borderRadius: 2 }}
                    >
                      Contact
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Call to Action */}
        <Box sx={{ 
          textAlign: 'center', 
          mt: 6, 
          p: 4, 
          bgcolor: theme.palette.mode === 'dark' 
            ? 'rgba(76, 175, 80, 0.1)' 
            : 'rgba(76,175,80,0.1)', 
          borderRadius: 3 
        }}>
          <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ mb: 2 }}>
            Are you a supplier?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Join our network and connect with thousands of Ugandan farmers. It's free to list your business!
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large"
            onClick={() => setSuggestOpen(true)}
            sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 'bold', boxShadow: 3 }}
          >
            List Your Business Now
          </Button>
        </Box>
      </Paper>
      {/* Supplier Suggestion Form Modal */}
      <Modal open={suggestOpen} onClose={() => setSuggestOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 3, boxShadow: 24, minWidth: 340, maxWidth: 400 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Suggest a New Supplier</Typography>
          <form onSubmit={handleSuggestSubmit}>
            <TextField label="Name" name="name" value={suggestData.name} onChange={handleSuggestChange} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Type (e.g. Seeds, Fertilizer)" name="type" value={suggestData.type} onChange={handleSuggestChange} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Region" name="region" value={suggestData.region} onChange={handleSuggestChange} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Crops (comma separated)" name="crops" value={suggestData.crops} onChange={handleSuggestChange} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Contact" name="contact" value={suggestData.contact} onChange={handleSuggestChange} fullWidth required sx={{ mb: 2 }} />
            <TextField label="Website" name="website" value={suggestData.website} onChange={handleSuggestChange} fullWidth sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button onClick={() => setSuggestOpen(false)} color="secondary">Cancel</Button>
              <Button type="submit" variant="contained" color="primary">Submit</Button>
            </Box>
          </form>
        </Box>
      </Modal>
      <Snackbar open={suggestSuccess} autoHideDuration={3000} onClose={() => setSuggestSuccess(false)} message="Supplier suggestion submitted!" />
      
      {/* Supplier Details Modal */}
      <Modal open={supplierModalOpen} onClose={() => setSupplierModalOpen(false)}>
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          bgcolor: 'background.paper', 
          p: 4, 
          borderRadius: 3, 
          boxShadow: 24, 
          minWidth: 400, 
          maxWidth: 600,
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          {selectedSupplier && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">{selectedSupplier.name}</Typography>
                <Button onClick={() => setSupplierModalOpen(false)} color="secondary">✕</Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                <img 
                  src={selectedSupplier.image} 
                  alt={selectedSupplier.name} 
                  style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ mb: 1 }}>
                    {selectedSupplier.type}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>📍 {selectedSupplier.region}</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>🌾 {selectedSupplier.crops.join(', ')}</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>📞 {selectedSupplier.contact}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      {selectedSupplier.rating} ★
                    </Typography>
                    {selectedSupplier.verified && (
                      <Box sx={{ bgcolor: 'success.main', color: 'white', px: 1, py: 0.5, borderRadius: 1, fontSize: 12 }}>
                        ✓ Verified
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      href={selectedSupplier.website} 
                      target="_blank"
                      sx={{ borderRadius: 2, fontWeight: 'bold' }}
                    >
                      Visit Website
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => setReviewModalOpen(true)}
                      sx={{ borderRadius: 2 }}
                    >
                      Add Review
                    </Button>
                  </Box>
                </Box>
              </Box>

              {/* Reviews Section */}
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Reviews</Typography>
              {selectedSupplier.reviews && selectedSupplier.reviews.length > 0 ? (
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {selectedSupplier.reviews.map((review, index) => (
                    <Box key={index} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">{review.user}</Typography>
                        <Typography variant="body2" color="text.secondary">{review.date}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="primary.main" fontWeight="bold" sx={{ mr: 1 }}>
                          {review.rating} ★
                        </Typography>
                      </Box>
                      <Typography variant="body2">{review.comment}</Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No reviews yet. Be the first to review!
                </Typography>
              )}
            </>
          )}
        </Box>
      </Modal>

      {/* Review Modal */}
      <Modal open={reviewModalOpen} onClose={() => setReviewModalOpen(false)}>
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          bgcolor: 'background.paper', 
          p: 4, 
          borderRadius: 3, 
          boxShadow: 24, 
          minWidth: 400 
        }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>Add Review for {selectedSupplier?.name}</Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" mb={1}>Rating:</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <Button
                  key={star}
                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                  sx={{ 
                    minWidth: 40, 
                    color: star <= reviewData.rating ? 'warning.main' : 'text.secondary',
                    fontSize: 20
                  }}
                >
                  ★
                </Button>
              ))}
            </Box>
          </Box>

          <TextField
            label="Your Review"
            multiline
            rows={4}
            value={reviewData.comment}
            onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
            fullWidth
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => setReviewModalOpen(false)} color="secondary">
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleAddReview}
              disabled={!reviewData.comment.trim()}
            >
              Submit Review
            </Button>
          </Box>
        </Box>
      </Modal>
      {/* Tabs Navigation */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 4 }}>
        <Tab label="Soil Analysis" />
        <Tab label="Crop Rotation" />
        <Tab label="Smart Recommendations" />
        <Tab label="Community" />
        <Tab label="Interactive Tools" />
      </Tabs>
      {/* Tab Panels */}
      <TabPanel value={tab} index={0}>
        {/* Soil Analysis Tab */}
        <Grid container spacing={3} mb={4}>
          {soilStats.map(stat => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card elevation={3} sx={{ borderRadius: 3, textAlign: 'center', py: 3 }}>
                <CardContent>
                  {stat.icon}
                  <Typography variant="subtitle1" fontWeight="bold" mt={1}>{stat.label}</Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">{stat.value} {stat.unit}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Paper elevation={4} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>Soil Nutrient Chart</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={soilChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#43a047" radius={[8, 8, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>Upload Soil Data</Typography>
          <Button variant="contained" component="label" color="primary">
            Upload File
            <input type="file" hidden onChange={e => setSoilFile(e.target.files[0])} />
          </Button>
          {soilFile && <Typography variant="body2" color="text.secondary" mt={2}>Uploaded: {soilFile.name}</Typography>}
        </Paper>
      </TabPanel>
      <TabPanel value={tab} index={1}>
        {/* Crop Rotation Tab */}
        <Paper elevation={4} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BarChartIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">Crop Rotation Timeline</Typography>
            <TextField select size="small" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} sx={{ ml: 2, minWidth: 100 }}>
              {cropRotationData.map(row => <MenuItem key={row.year} value={row.year}>{row.year}</MenuItem>)}
            </TextField>
          </Box>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={cropRotationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Maize" stroke="#43a047" strokeWidth={3} isAnimationActive />
              <Line type="monotone" dataKey="Beans" stroke="#1976d2" strokeWidth={3} isAnimationActive />
              <Line type="monotone" dataKey="Cassava" stroke="#ffb300" strokeWidth={3} isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
        <Paper elevation={4} sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>Crop Diversity</Typography>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={cropDiversity} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} label>
                {cropDiversity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </TabPanel>
      <TabPanel value={tab} index={2}>
        {/* Smart Recommendations Tab */}
        <Paper elevation={4} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" color="primary.main" mb={2}>AI-Powered Crop Recommendations</Typography>
          <Grid container spacing={3}>
            {recommendations.map(rec => (
              <Grid item xs={12} md={4} key={rec.crop}>
                <Card elevation={3} sx={{ borderRadius: 3, textAlign: 'center', py: 3 }}>
                  <CardContent>
                    <AgricultureIcon color="success" sx={{ fontSize: 36, mb: 1 }} />
                    <Typography variant="h6" fontWeight="bold">{rec.crop}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>{rec.reason}</Typography>
                    <Button variant="outlined" color="success">See Details</Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
        <Paper elevation={3} sx={{ 
          p: 3, 
          borderRadius: 3, 
          mb: 4, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(90deg, rgba(33, 150, 243, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)' 
            : 'linear-gradient(90deg, #e3f2fd 0%, #fffde7 100%)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
            <Typography variant="h6" fontWeight="bold" color="primary.main" mr={2}>Tip:</Typography>
            <Typography variant="body1" color="text.secondary">Try rotating legumes after cereals for better soil health!</Typography>
          </Box>
        </Paper>
      </TabPanel>
      <TabPanel value={tab} index={3}>
        {/* Community Tab */}
        <Paper elevation={4} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ForumIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" fontWeight="bold" color="primary.main">Soil & Crop Community</Typography>
          </Box>
          <Grid container spacing={3}>
            {communityPosts.map(post => (
              <Grid item xs={12} md={4} key={post.id}>
                <Card elevation={2} sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { boxShadow: 8, transform: 'scale(1.03)' } }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">{post.user}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>{post.content}</Typography>
                    <Button variant="outlined" color="primary" size="small">View Discussion ({post.replies})</Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button variant="contained" color="secondary" size="large" sx={{ borderRadius: 3, px: 5, fontWeight: 'bold', boxShadow: 4 }}>
            Ask a Question / Share Your Plan
          </Button>
        </Box>
      </TabPanel>
      <TabPanel value={tab} index={4}>
        {/* Interactive Soil Profile Visualizer */}
        <Paper elevation={4} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Soil Profile Visualizer</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            {soilLayers.map((layer) => (
              <Box key={layer.name} onClick={() => setActiveLayer(layer)} sx={{ width: 220, height: 40, bgcolor: layer.color, borderRadius: 2, mb: 1, cursor: 'pointer', border: activeLayer.name === layer.name ? '3px solid #43a047' : '2px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 18, boxShadow: activeLayer.name === layer.name ? 6 : 1 }}>
                {layer.name}
              </Box>
            ))}
          </Box>
          <Typography variant="body1" color="text.secondary" align="center">{activeLayer.info}</Typography>
        </Paper>
        {/* Crop Growth Visualizer */}
        <Paper elevation={4} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Crop Growth Visualizer</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 2 }}>
            {cropStages.map((stage, idx) => (
              <Box key={stage.stage} onClick={() => setActiveStage(idx)} sx={{ cursor: 'pointer', opacity: activeStage === idx ? 1 : 0.5, textAlign: 'center' }}>
                <Box sx={{ fontSize: 40 }}>{stage.img}</Box>
                <Typography variant="body2" fontWeight="bold">{stage.stage}</Typography>
              </Box>
            ))}
          </Box>
          <Typography variant="body1" color="text.secondary" align="center">{cropStages[activeStage].tip}</Typography>
        </Paper>
        {/* Drag-and-Drop Crop Planner */}
        <Paper elevation={4} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Drag-and-Drop Crop Planner</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            {crops.slice(0, 6).map(crop => (
              <Button key={crop} variant="outlined" color="primary" draggable onDragStart={() => handleDragStart(crop)} sx={{ borderRadius: 2, fontWeight: 'bold' }}>{crop}</Button>
            ))}
          </Box>
          <Box sx={{ display: 'inline-block', border: '2px solid #43a047', borderRadius: 2, p: 1, bgcolor: '#f9fbe7' }}>
            {dragGrid.map((row, rowIdx) => (
              <Box key={rowIdx} sx={{ display: 'flex' }}>
                {row.map((cell, colIdx) => (
                  <Box key={colIdx} onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(rowIdx, colIdx)} sx={{ width: 60, height: 60, border: '1.5px dashed #43a047', borderRadius: 1, m: 0.5, bgcolor: cell ? '#c8e6c9' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>
                    {cell || '+'}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Paper>
        {/* Soil Health Gauge */}
        <Paper elevation={4} sx={{ p: 3, borderRadius: 4, mb: 4, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Soil Health Gauge</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ width: 160, height: 80, position: 'relative', mb: 1 }}>
              <svg width="160" height="80">
                <path d="M10,80 Q80,-30 150,80" fill="none" stroke="#43a047" strokeWidth="8" />
                <circle cx={10 + 140 * (soilHealthScore / 100)} cy={80 - 70 * Math.sin(Math.PI * (soilHealthScore / 100))} r="10" fill="#43a047" />
              </svg>
              <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ position: 'absolute', top: 30, left: 0, width: '100%' }}>{soilHealthScore}/100</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Higher is better. Improve by adding organic matter and rotating crops.</Typography>
          </Box>
        </Paper>
        {/* Photo Upload & AI Analysis */}
        <Paper elevation={4} sx={{ p: 3, borderRadius: 4, mb: 4, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Photo Upload & AI Analysis (Mock)</Typography>
          <Button variant="contained" color="primary" onClick={() => fileInputRef.current.click()} sx={{ mb: 2 }}>Upload Soil/Plant Photo</Button>
          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handlePhotoUpload} />
          {aiPhoto && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Photo uploaded: {aiPhoto.name}</Typography>}
          {aiResult && <Typography variant="body1" color="success.main" sx={{ mt: 2 }}>{aiResult}</Typography>}
        </Paper>
        {/* Interactive Uganda Map */}
        <Paper elevation={4} sx={{ p: 3, borderRadius: 4, mb: 4, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Uganda Soil & Crop Map</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            {ugandaRegions.map(region => (
              <Button key={region.name} variant={selectedMapRegion === region.name ? 'contained' : 'outlined'} color="primary" onClick={() => setSelectedMapRegion(region.name)} sx={{ borderRadius: 2, fontWeight: 'bold' }}>{region.name}</Button>
            ))}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <b>Soil Type:</b> {ugandaRegions.find(r => r.name === selectedMapRegion)?.soil} &nbsp; | &nbsp; <b>Main Crops:</b> {ugandaRegions.find(r => r.name === selectedMapRegion)?.crops.join(', ')}
          </Typography>
          <Box sx={{ width: 220, height: 180, mx: 'auto', bgcolor: '#e0f2f1', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 24, color: '#43a047', boxShadow: 2 }}>
            {selectedMapRegion}
          </Box>
        </Paper>
      </TabPanel>
      <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 32, right: 32, boxShadow: 6 }} onClick={() => setOpenModal(true)}>
        <AddIcon />
      </Fab>
      {/* Example Modal for Quick Add (can be expanded) */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 3, boxShadow: 24, minWidth: 320 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Quick Add</Typography>
          <Button variant="contained" color="primary" fullWidth sx={{ mb: 2 }} onClick={() => setTab(0)}>
            Analyze Soil
          </Button>
          <Button variant="contained" color="success" fullWidth sx={{ mb: 2 }} onClick={() => setTab(1)}>
            Plan Crop Rotation
          </Button>
          <Button variant="contained" color="secondary" fullWidth onClick={() => setTab(2)}>
            Get Recommendations
          </Button>
        </Box>
      </Modal>
      <Divider sx={{ my: 6 }} />
      <Typography variant="body2" color="text.secondary" align="center">
        This tool is designed for both smallholder farmers and large-scale investors. More features coming soon!
      </Typography>
    </Box>
  );
} 