import React, { useState, useReducer, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Divider, Modal, TextField, MenuItem, InputAdornment, Paper, Checkbox, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Snackbar, useTheme } from '@mui/material';
import { useAppTheme } from '../context/ThemeContext';
import PetsIcon from '@mui/icons-material/Pets';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorefrontIcon from '@mui/icons-material/Storefront';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import ForumIcon from '@mui/icons-material/Forum';
import EventIcon from '@mui/icons-material/Event';
import HelpIcon from '@mui/icons-material/Help';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Autocomplete from '@mui/material/Autocomplete';
import ListAltIcon from '@mui/icons-material/ListAlt';
import HealingIcon from '@mui/icons-material/Healing';
import BarChartIcon from '@mui/icons-material/BarChart';

// Mock data
const vetList = [
  { id: 1, name: 'Dr. Okello', specialty: 'Cattle', location: 'Mbarara', contact: '0700 123456' },
  { id: 2, name: 'Dr. Namusoke', specialty: 'Goats & Sheep', location: 'Luwero', contact: '0782 654321' },
  { id: 3, name: 'Dr. Mugisha', specialty: 'Poultry', location: 'Jinja', contact: '0755 987654' },
];
const productList = [
  { id: 1, name: 'Dewormer', for: 'Cattle', price: 15000 },
  { id: 2, name: 'Vaccine - Newcastle', for: 'Chicken', price: 5000 },
  { id: 3, name: 'Mineral Lick', for: 'Goats', price: 8000 },
];
const priceTrends = [1200000, 1250000, 1300000, 1280000, 1350000, 1400000];
const dailyTasks = [
  { id: 1, task: 'Feed all animals', done: false },
  { id: 2, task: 'Clean animal shelters', done: false },
  { id: 3, task: 'Check water supply', done: false },
  { id: 4, task: 'Inspect for signs of illness', done: false },
];

// --- CMMS Reducer and LocalStorage Helpers ---
const initialCMMS = {
  animals: [],
  tasks: [],
  treatments: [],
};
function cmmsReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return { ...state, ...action.payload };
    case 'ADD_ANIMAL':
      return { ...state, animals: [action.payload, ...state.animals] };
    case 'EDIT_ANIMAL':
      return { ...state, animals: state.animals.map(a => a.id === action.payload.id ? action.payload : a) };
    case 'DELETE_ANIMAL':
      return { ...state, animals: state.animals.filter(a => a.id !== action.payload) };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'EDIT_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'ADD_TREATMENT':
      return { ...state, treatments: [action.payload, ...state.treatments] };
    case 'EDIT_TREATMENT':
      return { ...state, treatments: state.treatments.map(tr => tr.id === action.payload.id ? action.payload : tr) };
    case 'DELETE_TREATMENT':
      return { ...state, treatments: state.treatments.filter(tr => tr.id !== action.payload) };
    default:
      return state;
  }
}
function loadCMMS() {
  try {
    const data = JSON.parse(localStorage.getItem('livestock_cmms'));
    return data || initialCMMS;
  } catch {
    return initialCMMS;
  }
}
function saveCMMS(data) {
  localStorage.setItem('livestock_cmms', JSON.stringify(data));
}

const DEMO_ANIMALS = [
  { id: 1, type: 'Cow', breed: 'Ankole', price: 1200000, location: 'Mbarara', image: '', },
  { id: 2, type: 'Goat', breed: 'Boer', price: 200000, location: 'Lira', image: '', },
  { id: 3, type: 'Chicken', breed: 'Kuroiler', price: 25000, location: 'Kampala', image: '', },
];

const LivestockManagement = () => {
  const theme = useTheme();
  const { themeMode } = useAppTheme();
  const isDark = themeMode === 'dark';
  
  const [openModal, setOpenModal] = useState(false);
  const [newAnimal, setNewAnimal] = useState({ type: '', breed: '', price: '', location: '' });
  const [tasks] = useState(dailyTasks);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [openDiscussion, setOpenDiscussion] = useState(false);
  const [openEvents, setOpenEvents] = useState(false);
  const [openQA, setOpenQA] = useState(false);
  const [openContactSeller, setOpenContactSeller] = useState({ open: false, animal: null });
  const [openContactVet, setOpenContactVet] = useState({ open: false, vet: null });
  const [openOrderProduct, setOpenOrderProduct] = useState({ open: false, product: null });
  const [openHealthDetails, setOpenHealthDetails] = useState({ open: false, record: null });
  const [animalImage, setAnimalImage] = useState('');
  const [discussionMessages] = useState([
    { id: 1, user: 'Sarah', text: 'How do you keep your cows healthy during the dry season?' },
    { id: 2, user: 'Moses', text: 'I use mineral licks and provide extra water.' },
  ]);
  const [newDiscussionMsg, setNewDiscussionMsg] = useState('');
  const [events] = useState([
    { id: 1, title: 'Vaccination Drive', date: '2024-07-10', location: 'Mbarara', details: 'Free vaccination for cattle and goats.' },
    { id: 2, title: 'Livestock Market Day', date: '2024-07-15', location: 'Lira', details: 'Buy and sell livestock, meet buyers.' },
  ]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [qaList] = useState([
    { id: 1, question: 'What is the best feed for goats?', answer: 'Grass, leaves, and salt lick are good for goats.' },
    { id: 2, question: 'How often should I vaccinate chickens?', answer: 'At least every 3 months or as advised by a vet.' },
  ]);
  const [newQuestion, setNewQuestion] = useState('');
  const [showQaAnswer, setShowQaAnswer] = useState({ open: false, qa: null });
  const [qaSubmitted, setQaSubmitted] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [vetContactSubmitted, setVetContactSubmitted] = useState(false);

  // --- useReducer for CMMS ---
  const [cmms, dispatch] = useReducer(cmmsReducer, initialCMMS);
  useEffect(() => {
    const data = loadCMMS();
    dispatch({ type: 'INIT', payload: data });
  }, []);
  useEffect(() => {
    saveCMMS(cmms);
  }, [cmms]);

  // Add demo animals on first load if cmms.animals is empty
  useEffect(() => {
    if (cmms.animals.length === 0) {
      DEMO_ANIMALS.forEach(animal => {
        dispatch({ type: 'ADD_ANIMAL', payload: animal });
      });
    }
    // eslint-disable-next-line
  }, []);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleInputChange = (e) => setNewAnimal({ ...newAnimal, [e.target.name]: e.target.value });
  const handlePostAnimal = () => {
    dispatch({ type: 'ADD_ANIMAL', payload: { ...newAnimal, id: cmms.animals.length + 1, image: animalImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' } });
    setNewAnimal({ type: '', breed: '', price: '', location: '' });
    setAnimalImage('');
    handleCloseModal();
  };

  // Daily task completion
  const handleTaskToggle = (id) => {
    dispatch({ type: 'EDIT_TASK', payload: { id, done: !tasks.find(t => t.id === id).done } });
    setSnackbar({ open: true, message: 'Task updated!' });
  };

  const handleAnimalImage = e => {
    const file = e.target.files[0];
    if (file) setAnimalImage(URL.createObjectURL(file));
  };

  // Animal CRUD modal state
  const [animalModalOpen, setAnimalModalOpen] = useState(false);
  const [editAnimal, setEditAnimal] = useState(null);
  const [animalForm, setAnimalForm] = useState({ type: '', breed: '', price: '', location: '', image: '', lastTreatment: '', nextDue: '' });
  const [animalImagePreview, setAnimalImagePreview] = useState('');

  // Open add/edit animal modal
  const openAddAnimalModal = () => {
    setAnimalForm({ type: '', breed: '', price: '', location: '', image: '', lastTreatment: '', nextDue: '' });
    setAnimalImagePreview('');
    setEditAnimal(null);
    setAnimalModalOpen(true);
  };
  const openEditAnimalModal = (animal) => {
    setAnimalForm({ ...animal });
    setAnimalImagePreview(animal.image || '');
    setEditAnimal(animal);
    setAnimalModalOpen(true);
  };
  // Handle animal form changes
  const handleAnimalFormChange = (e) => {
    setAnimalForm({ ...animalForm, [e.target.name]: e.target.value });
  };
  // Handle animal image upload
  const handleAnimalImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAnimalImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };
  // Submit animal form
  const handleAnimalFormSubmit = (e) => {
    e.preventDefault();
    if (!animalForm.type || !animalForm.breed || !animalForm.location) return;
    const animalData = {
      ...animalForm,
      image: animalImagePreview || animalForm.image,
      id: editAnimal ? editAnimal.id : Date.now(),
      price: animalForm.price || '',
      lastTreatment: animalForm.lastTreatment || '',
      nextDue: animalForm.nextDue || '',
    };
    if (editAnimal) {
      dispatch({ type: 'EDIT_ANIMAL', payload: animalData });
      setSnackbar({ open: true, message: 'Animal updated!' });
    } else {
      dispatch({ type: 'ADD_ANIMAL', payload: animalData });
      setSnackbar({ open: true, message: 'Animal added!' });
    }
    setAnimalModalOpen(false);
    setAnimalForm({ type: '', breed: '', price: '', location: '', image: '', lastTreatment: '', nextDue: '' });
    setAnimalImagePreview('');
    setEditAnimal(null);
  };
  // Delete animal
  const handleDeleteAnimal = (id) => {
    if (window.confirm('Are you sure you want to delete this animal?')) {
      dispatch({ type: 'DELETE_ANIMAL', payload: id });
      setSnackbar({ open: true, message: 'Animal deleted.' });
    }
  };

  // Enhanced Health Task CRUD modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    task: '',
    type: '',
    animalIds: [],
    due: '',
    done: false,
    priority: '',
    notes: '',
    attachment: '',
    attachmentName: '',
  });

  // Open add/edit task modal
  const openAddTaskModal = () => {
    setTaskForm({ task: '', type: '', animalIds: [], due: '', done: false, priority: '', notes: '', attachment: '', attachmentName: '' });
    setEditTask(null);
    setTaskModalOpen(true);
  };
  const openEditTaskModal = (task) => {
    setTaskForm({ ...task });
    setEditTask(task);
    setTaskModalOpen(true);
  };
  // Handle task form changes
  const handleTaskFormChange = (e) => {
    const { name, value } = e.target;
    setTaskForm({ ...taskForm, [name]: value });
  };
  // Handle attachment upload
  const handleTaskAttachment = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setTaskForm({ ...taskForm, attachment: ev.target.result, attachmentName: file.name });
      reader.readAsDataURL(file);
    }
  };
  // Submit task form
  const handleTaskFormSubmit = (e, addAnother = false) => {
    e.preventDefault();
    if (!taskForm.task) return;
    const taskData = {
      ...taskForm,
      id: editTask ? editTask.id : Date.now(),
      done: !!taskForm.done,
    };
    if (editTask) {
      dispatch({ type: 'EDIT_TASK', payload: taskData });
      setSnackbar({ open: true, message: 'Task updated!' });
    } else {
      dispatch({ type: 'ADD_TASK', payload: taskData });
      setSnackbar({ open: true, message: 'Task added!' });
    }
    if (addAnother) {
      setTaskForm({ task: '', type: '', animalIds: [], due: '', done: false, priority: '', notes: '', attachment: '', attachmentName: '' });
      setEditTask(null);
    } else {
      setTaskModalOpen(false);
      setTaskForm({ task: '', type: '', animalIds: [], due: '', done: false, priority: '', notes: '', attachment: '', attachmentName: '' });
      setEditTask(null);
    }
  };
  // Delete task
  const handleDeleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch({ type: 'DELETE_TASK', payload: id });
      setSnackbar({ open: true, message: 'Task deleted.' });
    }
  };
  // Mark task as done
  const handleToggleTaskDone = (task) => {
    dispatch({ type: 'EDIT_TASK', payload: { ...task, done: !task.done } });
    setSnackbar({ open: true, message: task.done ? 'Task marked as not done.' : 'Task completed!' });
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 6 }, 
      background: isDark 
        ? `linear-gradient(120deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)` 
        : `linear-gradient(120deg, ${theme.palette.primary.light}20 0%, ${theme.palette.secondary.light}20 100%)`,
      minHeight: '100vh' 
    }}>
      <Box sx={{
        width: '100%',
        minHeight: 220,
        background: isDark
          ? `linear-gradient(120deg, ${theme.palette.grey[800]} 0%, ${theme.palette.primary.dark}40 100%)`
          : `linear-gradient(120deg, ${theme.palette.primary.light}30 0%, ${theme.palette.primary.main}20 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4,
        borderRadius: 4,
        boxShadow: 6,
        mb: 6,
        mt: 2,
        p: { xs: 3, md: 6 },
        position: 'relative',
      }}>
        <Box sx={{ flex: 1, minWidth: 200, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="h3" fontWeight="bold" color="primary.main" sx={{ mb: 2, letterSpacing: 1 }}>
            <PetsIcon sx={{ fontSize: 48, mr: 1, verticalAlign: 'middle', color: theme.palette.primary.main }} />
            Livestock Management
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2, maxWidth: 500 }}>
            Empower your farm with smart animal care, health tracking, and modern maintenance tools. Connect, manage, and thrive with ease.
          </Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" alt="Livestock" style={{ 
            width: '100%', 
            maxWidth: 320, 
            borderRadius: 16, 
            boxShadow: isDark 
              ? `0 8px 32px ${theme.palette.primary.dark}30` 
              : `0 8px 32px ${theme.palette.primary.main}15` 
          }} />
        </Box>
      </Box>
      <Typography variant="h3" fontWeight="bold" color="primary.main" gutterBottom>
        <PetsIcon sx={{ fontSize: 40, mr: 1, verticalAlign: 'middle' }} /> Livestock Community & Care
      </Typography>
      <Typography variant="h6" color="text.secondary" mb={4}>
        Connect, learn, and share with other livestock keepers. Discuss care, join events, and ask questions.
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              <ForumIcon color="primary" sx={{ fontSize: 36, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">Care Discussions</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Share tips, ask for advice, and discuss best practices in livestock care and management.
              </Typography>
              <Button variant="contained" color="primary" onClick={() => setOpenDiscussion(true)}>Join Discussion</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              <EventIcon color="success" sx={{ fontSize: 36, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">Livestock Events</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Find and join upcoming livestock training, vaccination drives, and community meetups.
              </Typography>
              <Button variant="outlined" color="success" onClick={() => setOpenEvents(true)}>View Events</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              <HelpIcon color="secondary" sx={{ fontSize: 36, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">Q&A</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Ask questions and get answers from experienced farmers and animal health experts.
              </Typography>
              <Button variant="outlined" color="secondary" onClick={() => setOpenQA(true)}>Ask a Question</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Divider sx={{ my: 6 }} />
      {/* Livestock Marketplace Section */}
      <Paper elevation={4} sx={{ 
        p: 3, 
        mb: 6, 
        borderRadius: 4, 
        background: isDark
          ? `linear-gradient(120deg, ${theme.palette.grey[800]} 0%, ${theme.palette.secondary.dark}20 100%)`
          : `linear-gradient(120deg, ${theme.palette.secondary.light}20 0%, ${theme.palette.primary.light}20 100%)`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <StorefrontIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h5" fontWeight="bold" flexGrow={1}>Livestock Marketplace</Typography>
          <Button variant="contained" color="success" startIcon={<AddCircleIcon />} onClick={handleOpenModal}>
            Post Animal for Sale
          </Button>
        </Box>
        <Grid container spacing={3}>
          {cmms.animals.map(animal => (
            <Grid item xs={12} sm={6} md={4} key={animal.id}>
              <Card elevation={2} sx={{ borderRadius: 3, transition: '0.3s', '&:hover': { boxShadow: 8, transform: 'scale(1.03)' } }}>
                <CardContent>
                  <Box sx={{ height: 120, mb: 2, background: `url(${animal.image}) center/cover`, borderRadius: 2 }} />
                  <Typography variant="h6" fontWeight="bold">{animal.type} ({animal.breed})</Typography>
                  <Typography variant="body2" color="text.secondary">Location: {animal.location}</Typography>
                  <Typography variant="body2" color="primary.main" fontWeight="bold" mb={1}>
                    UGX {Number(animal.price).toLocaleString()}
                  </Typography>
                  <Button variant="outlined" color="primary" size="small" onClick={() => setOpenContactSeller({ open: true, animal })}>Contact Seller</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
      {/* Post Animal Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 3, boxShadow: 24, minWidth: 320 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Post Animal for Sale</Typography>
          <TextField select fullWidth label="Type" name="type" value={newAnimal.type} onChange={handleInputChange} sx={{ mb: 2 }}>
            <MenuItem value="Cow">Cow</MenuItem>
            <MenuItem value="Goat">Goat</MenuItem>
            <MenuItem value="Chicken">Chicken</MenuItem>
          </TextField>
          <TextField fullWidth label="Breed" name="breed" value={newAnimal.breed} onChange={handleInputChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Location" name="location" value={newAnimal.location} onChange={handleInputChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Price (UGX)" name="price" value={newAnimal.price} onChange={handleInputChange} type="number" sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start">UGX</InputAdornment> }} />
          <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
            Upload Image
            <input type="file" accept="image/*" hidden onChange={handleAnimalImage} />
          </Button>
          {animalImage && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img src={animalImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8 }} />
            </Box>
          )}
          <Button variant="contained" color="success" fullWidth onClick={handlePostAnimal} disabled={!newAnimal.type || !newAnimal.breed || !newAnimal.price || !newAnimal.location}>
            Post Animal
          </Button>
        </Box>
      </Modal>
      {/* Health Marketplace Section */}
      <Paper elevation={4} sx={{ 
        p: 3, 
        mb: 6, 
        borderRadius: 4, 
        background: isDark
          ? `linear-gradient(120deg, ${theme.palette.grey[800]} 0%, ${theme.palette.success.dark}20 100%)`
          : `linear-gradient(120deg, ${theme.palette.success.light}20 0%, ${theme.palette.primary.light}20 100%)`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocalHospitalIcon color="error" sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h5" fontWeight="bold" flexGrow={1}>Health Marketplace</Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" mb={2}>Veterinary Services</Typography>
        <Grid container spacing={2} mb={3}>
          {vetList.map(vet => (
            <Grid item xs={12} sm={6} md={4} key={vet.id}>
              <Card elevation={1} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">{vet.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Specialty: {vet.specialty}</Typography>
                  <Typography variant="body2" color="text.secondary">Location: {vet.location}</Typography>
                  <Typography variant="body2" color="primary.main">Contact: {vet.contact}</Typography>
                  <Button variant="outlined" color="error" size="small" sx={{ mt: 1 }} onClick={() => setOpenContactVet({ open: true, vet })}>Contact Vet</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Typography variant="subtitle1" color="text.secondary" mb={2}>Animal Health Products</Typography>
        <Grid container spacing={2}>
          {productList.map(product => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card elevation={1} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">{product.name}</Typography>
                  <Typography variant="body2" color="text.secondary">For: {product.for}</Typography>
                  <Typography variant="body2" color="primary.main">UGX {product.price.toLocaleString()}</Typography>
                  <Button variant="outlined" color="success" size="small" sx={{ mt: 1 }} onClick={() => setOpenOrderProduct({ open: true, product })}>Order Product</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
      {/* Analytics Section */}
      <Paper elevation={4} sx={{ p: 3, mb: 6, borderRadius: 4, background: 'linear-gradient(120deg, #e3f2fd 0%, #b2ebf2 100%)', position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AssessmentIcon color="success" sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h5" fontWeight="bold" flexGrow={1}>Livestock Analytics</Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" mb={2}>Average Cow Price Trend (UGX)</Typography>
        <Box sx={{ width: '100%', height: 120, mb: 2, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          {priceTrends.map((price, idx) => (
            <Box key={idx} sx={{ flex: 1, height: `${60 + (price - 1200000) / 10000 * 10}px`, bgcolor: idx === priceTrends.length - 1 ? 'success.main' : 'primary.light', borderRadius: 2, transition: '0.3s' }} />
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Prices are trending upwards. Consider selling when prices peak, and buy when prices dip for best returns.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" color="text.secondary" mb={1}>Tips for Ugandan Farmers</Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Vaccinate animals regularly to prevent disease outbreaks.</li>
          <li>Keep records of births, sales, and treatments for better management.</li>
          <li>Monitor market prices to maximize your profits.</li>
        </ul>
      </Paper>
      {/* Daily Care Dashboard */}
      <Paper elevation={4} sx={{ p: 3, mb: 6, borderRadius: 4, background: 'linear-gradient(120deg, #fce4ec 0%, #f8bbd0 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EventAvailableIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h5" fontWeight="bold" flexGrow={1}>Daily Care Dashboard</Typography>
        </Box>
        <List>
          {cmms.tasks.map(task => (
            <ListItem key={task.id} dense>
              <Checkbox checked={task.done} onChange={() => handleTaskToggle(task.id)} color="success" />
              <ListItemText primary={task.task} sx={{ textDecoration: task.done ? 'line-through' : 'none' }} />
              {task.done && <CheckCircleIcon color="success" />}
            </ListItem>
          ))}
        </List>
      </Paper>
      {/* Health Records & Reminders */}
      <Paper elevation={6} sx={{ 
        p: 4, 
        mb: 6, 
        borderRadius: 5, 
        background: isDark
          ? `linear-gradient(120deg, ${theme.palette.grey[800]} 0%, ${theme.palette.primary.dark}30 100%)`
          : `linear-gradient(120deg, ${theme.palette.secondary.light}20 0%, ${theme.palette.info.light}20 100%)`,
        boxShadow: 10 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ListAltIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" fontWeight="bold" flexGrow={1}>Animal Register</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Fab color="primary" aria-label="add" onClick={openAddAnimalModal} sx={{ boxShadow: 4 }}>
            <AddIcon />
          </Fab>
        </Box>
        <Box sx={{ overflowX: 'auto', mb: 2 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Animal</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Type</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Breed</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Last Treatment</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Next Due</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Status</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cmms.animals.map(animal => (
                <tr key={animal.id}>
                  <td style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {animal.image && <img src={animal.image} alt={animal.type} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />}
                      {animal.type} #{animal.id}
                    </Box>
                  </td>
                  <td style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>{animal.type}</td>
                  <td style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>{animal.breed}</td>
                  <td style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>{animal.lastTreatment || '-'}</td>
                  <td style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>{animal.nextDue || '-'}</td>
                  <td style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>{cmms.tasks.some(t => !t.done) ? <span style={{ color: theme.palette.warning.main, fontWeight: 600 }}>Due</span> : <span style={{ color: theme.palette.success.main, fontWeight: 600 }}>OK</span>}</td>
                  <td style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>
                    <IconButton color="primary" onClick={() => openEditAnimalModal(animal)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDeleteAnimal(animal.id)}><DeleteIcon /></IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
        {/* Add/Edit Animal Modal with Last Treatment and Next Due */}
        <Modal open={animalModalOpen} onClose={() => setAnimalModalOpen(false)}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 3, boxShadow: 24, minWidth: 340, maxWidth: 400 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>{editAnimal ? 'Edit Animal' : 'Add Animal'}</Typography>
            <form onSubmit={handleAnimalFormSubmit}>
              <TextField select label="Type" name="type" value={animalForm.type} onChange={handleAnimalFormChange} fullWidth required sx={{ mb: 2 }}>
                <MenuItem value="Cow">Cow</MenuItem>
                <MenuItem value="Goat">Goat</MenuItem>
                <MenuItem value="Chicken">Chicken</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
              <TextField label="Breed" name="breed" value={animalForm.breed} onChange={handleAnimalFormChange} fullWidth required sx={{ mb: 2 }} />
              <TextField label="Location" name="location" value={animalForm.location} onChange={handleAnimalFormChange} fullWidth required sx={{ mb: 2 }} />
              <TextField label="Price (UGX)" name="price" value={animalForm.price} onChange={handleAnimalFormChange} type="number" fullWidth sx={{ mb: 2 }} />
              <TextField label="Last Treatment" name="lastTreatment" value={animalForm.lastTreatment || ''} onChange={handleAnimalFormChange} fullWidth sx={{ mb: 2 }} />
              <TextField label="Next Due" name="nextDue" type="date" value={animalForm.nextDue || ''} onChange={handleAnimalFormChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
              <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                Upload Image
                <input type="file" accept="image/*" hidden onChange={handleAnimalImageUpload} />
              </Button>
              {animalImagePreview && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img src={animalImagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8 }} />
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button onClick={() => setAnimalModalOpen(false)} color="secondary">Cancel</Button>
                <Button type="submit" variant="contained" color="primary">{editAnimal ? 'Update' : 'Add'}</Button>
              </Box>
            </form>
          </Box>
        </Modal>
      </Paper>
      {/* Health Marketplace Section */}
      <Paper elevation={4} sx={{ 
        p: 3, 
        mb: 6, 
        borderRadius: 4, 
        background: isDark
          ? `linear-gradient(120deg, ${theme.palette.grey[800]} 0%, ${theme.palette.success.dark}20 100%)`
          : `linear-gradient(120deg, ${theme.palette.success.light}20 0%, ${theme.palette.primary.light}20 100%)`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocalHospitalIcon color="error" sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h5" fontWeight="bold" flexGrow={1}>Health Marketplace</Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" mb={2}>Veterinary Services</Typography>
        <Grid container spacing={2} mb={3}>
          {vetList.map(vet => (
            <Grid item xs={12} sm={6} md={4} key={vet.id}>
              <Card elevation={1} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">{vet.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Specialty: {vet.specialty}</Typography>
                  <Typography variant="body2" color="text.secondary">Location: {vet.location}</Typography>
                  <Typography variant="body2" color="primary.main">Contact: {vet.contact}</Typography>
                  <Button variant="outlined" color="error" size="small" sx={{ mt: 1 }} onClick={() => setOpenContactVet({ open: true, vet })}>Contact Vet</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Typography variant="subtitle1" color="text.secondary" mb={2}>Animal Health Products</Typography>
        <Grid container spacing={2}>
          {productList.map(product => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card elevation={1} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">{product.name}</Typography>
                  <Typography variant="body2" color="text.secondary">For: {product.for}</Typography>
                  <Typography variant="body2" color="primary.main">UGX {product.price.toLocaleString()}</Typography>
                  <Button variant="outlined" color="success" size="small" sx={{ mt: 1 }} onClick={() => setOpenOrderProduct({ open: true, product })}>Order Product</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
      {/* Analytics Section */}
      <Paper elevation={4} sx={{ p: 3, mb: 6, borderRadius: 4, background: 'linear-gradient(120deg, #e3f2fd 0%, #b2ebf2 100%)', position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AssessmentIcon color="success" sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h5" fontWeight="bold" flexGrow={1}>Livestock Analytics</Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" mb={2}>Average Cow Price Trend (UGX)</Typography>
        <Box sx={{ width: '100%', height: 120, mb: 2, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          {priceTrends.map((price, idx) => (
            <Box key={idx} sx={{ flex: 1, height: `${60 + (price - 1200000) / 10000 * 10}px`, bgcolor: idx === priceTrends.length - 1 ? 'success.main' : 'primary.light', borderRadius: 2, transition: '0.3s' }} />
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Prices are trending upwards. Consider selling when prices peak, and buy when prices dip for best returns.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" color="text.secondary" mb={1}>Tips for Ugandan Farmers</Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Vaccinate animals regularly to prevent disease outbreaks.</li>
          <li>Keep records of births, sales, and treatments for better management.</li>
          <li>Monitor market prices to maximize your profits.</li>
        </ul>
      </Paper>
      {/* Daily Care Dashboard */}
      <Paper elevation={4} sx={{ p: 3, mb: 6, borderRadius: 4, background: 'linear-gradient(120deg, #fce4ec 0%, #f8bbd0 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EventAvailableIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h5" fontWeight="bold" flexGrow={1}>Daily Care Dashboard</Typography>
        </Box>
        <List>
          {cmms.tasks.map(task => (
            <ListItem key={task.id} dense>
              <Checkbox checked={task.done} onChange={() => handleTaskToggle(task.id)} color="success" />
              <ListItemText primary={task.task} sx={{ textDecoration: task.done ? 'line-through' : 'none' }} />
              {task.done && <CheckCircleIcon color="success" />}
            </ListItem>
          ))}
        </List>
      </Paper>
      {/* Health Records & Reminders */}
      <Paper elevation={4} sx={{ 
        p: 3, 
        mb: 6, 
        borderRadius: 4, 
        background: isDark
          ? `linear-gradient(120deg, ${theme.palette.grey[800]} 0%, ${theme.palette.primary.dark}20 100%)`
          : `linear-gradient(120deg, ${theme.palette.primary.light}20 0%, ${theme.palette.info.light}20 100%)`,
        position: 'relative' 
      }}>
        <Box sx={{ mb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ListAltIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h5" fontWeight="bold" flexGrow={1}>Animal Register</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Fab color="primary" aria-label="add" onClick={openAddAnimalModal} sx={{ boxShadow: 4 }}>
              <AddIcon />
            </Fab>
          </Box>
          <Box sx={{ overflowX: 'auto', mb: 2 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: isDark ? theme.palette.grey[800] : theme.palette.grey[100] }}>
                  <th style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>Animal</th>
                  <th style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>Type</th>
                  <th style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>Breed</th>
                  <th style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>Last Treatment</th>
                  <th style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>Next Due</th>
                  <th style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>Status</th>
                  <th style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cmms.animals.map(animal => (
                  <tr key={animal.id}>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {animal.image && <img src={animal.image} alt={animal.type} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />}
                        {animal.type} #{animal.id}
                      </Box>
                    </td>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{animal.type}</td>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{animal.breed}</td>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{animal.lastTreatment || '-'}</td>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{animal.nextDue || '-'}</td>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>{cmms.tasks.some(t => !t.done) ? <span style={{ color: '#ffa726', fontWeight: 600 }}>Due</span> : <span style={{ color: '#43a047', fontWeight: 600 }}>OK</span>}</td>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>
                      <IconButton color="primary" onClick={() => openEditAnimalModal(animal)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDeleteAnimal(animal.id)}><DeleteIcon /></IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
          <Modal open={animalModalOpen} onClose={() => setAnimalModalOpen(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 3, boxShadow: 24, minWidth: 340, maxWidth: 400 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>{editAnimal ? 'Edit Animal' : 'Add Animal'}</Typography>
              <form onSubmit={handleAnimalFormSubmit}>
                <TextField select label="Type" name="type" value={animalForm.type} onChange={handleAnimalFormChange} fullWidth required sx={{ mb: 2 }}>
                  <MenuItem value="Cow">Cow</MenuItem>
                  <MenuItem value="Goat">Goat</MenuItem>
                  <MenuItem value="Chicken">Chicken</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
                <TextField label="Breed" name="breed" value={animalForm.breed} onChange={handleAnimalFormChange} fullWidth required sx={{ mb: 2 }} />
                <TextField label="Location" name="location" value={animalForm.location} onChange={handleAnimalFormChange} fullWidth required sx={{ mb: 2 }} />
                <TextField label="Price (UGX)" name="price" value={animalForm.price} onChange={handleAnimalFormChange} type="number" fullWidth sx={{ mb: 2 }} />
                <TextField label="Last Treatment" name="lastTreatment" value={animalForm.lastTreatment || ''} onChange={handleAnimalFormChange} fullWidth sx={{ mb: 2 }} />
                <TextField label="Next Due" name="nextDue" type="date" value={animalForm.nextDue || ''} onChange={handleAnimalFormChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                  Upload Image
                  <input type="file" accept="image/*" hidden onChange={handleAnimalImageUpload} />
                </Button>
                {animalImagePreview && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <img src={animalImagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8 }} />
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button onClick={() => setAnimalModalOpen(false)} color="secondary">Cancel</Button>
                  <Button type="submit" variant="contained" color="primary">{editAnimal ? 'Update' : 'Add'}</Button>
                </Box>
              </form>
            </Box>
          </Modal>
        </Box>
        <Divider sx={{ my: 4 }} />
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <HealingIcon color="secondary" sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h5" fontWeight="bold" flexGrow={1}>Health & Maintenance Tasks</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Fab color="secondary" aria-label="add-task" onClick={openAddTaskModal} sx={{ boxShadow: 4 }}>
              <AssignmentIcon />
            </Fab>
          </Box>
          <Box sx={{ overflowX: 'auto', mb: 2 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: isDark ? theme.palette.grey[800] : theme.palette.grey[100] }}>
                  <th style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>Task</th>
                  <th style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>Type</th>
                  <th style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>Animals</th>
                  <th style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>Due</th>
                  <th style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>Priority</th>
                  <th style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>Notes</th>
                  <th style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>Attachment</th>
                  <th style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>Status</th>
                  <th style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cmms.tasks.map(task => (
                  <tr key={task.id}>
                    <td style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>{task.task}</td>
                    <td style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>
                      {task.type && <Chip label={task.type} color="info" size="small" />}
                    </td>
                    <td style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>
                      {task.animalIds && task.animalIds.length > 0
                        ? task.animalIds.map(id => {
                            const a = cmms.animals.find(an => String(an.id) === String(id));
                            return a ? <Chip key={id} label={`${a.type}${a.breed ? ' (' + a.breed + ')' : ''} #${a.id}`} size="small" sx={{ mr: 0.5 }} /> : null;
                          })
                        : <span style={{ color: theme.palette.text.disabled }}>No animals assigned</span>}
                    </td>
                    <td style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>{task.due || '-'}</td>
                    <td style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>
                      {task.priority && <Chip label={task.priority} color={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'success'} size="small" />}
                    </td>
                    <td style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>
                      {task.notes ? (
                        <Tooltip title={task.notes}><span>📝</span></Tooltip>
                      ) : '-'}
                    </td>
                    <td style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>
                      {task.attachment ? (
                        <Tooltip title={task.attachmentName || 'Attachment'}>
                          <a href={task.attachment} target="_blank" rel="noopener noreferrer"><AttachFileIcon /></a>
                        </Tooltip>
                      ) : '-'}
                    </td>
                    <td style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>
                      {task.done ? <span style={{ color: theme.palette.success.main, fontWeight: 600 }}>Completed <CheckCircleIcon sx={{ fontSize: 18, verticalAlign: 'middle' }} /></span> : <span style={{ color: theme.palette.warning.main, fontWeight: 600 }}>Due</span>}
                    </td>
                    <td style={{ padding: 8, border: `1px solid ${isDark ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>
                      <IconButton color="primary" onClick={() => openEditTaskModal(task)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDeleteTask(task.id)}><DeleteIcon /></IconButton>
                      <IconButton color="success" onClick={() => handleToggleTaskDone(task)}><CheckCircleIcon /></IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
          <Modal open={taskModalOpen} onClose={() => setTaskModalOpen(false)}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 3, boxShadow: 24, minWidth: 340, maxWidth: 400 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>{editTask ? 'Edit Task' : 'Add Task'}</Typography>
              <form onSubmit={e => handleTaskFormSubmit(e, false)}>
                <TextField label="Task" name="task" value={taskForm.task} onChange={handleTaskFormChange} fullWidth required sx={{ mb: 2 }} />
                <TextField select label="Type" name="type" value={taskForm.type} onChange={handleTaskFormChange} fullWidth sx={{ mb: 2 }}>
                  <MenuItem value="">Select Type</MenuItem>
                  <MenuItem value="Vaccination">Vaccination</MenuItem>
                  <MenuItem value="Deworming">Deworming</MenuItem>
                  <MenuItem value="Cleaning">Cleaning</MenuItem>
                  <MenuItem value="Feeding">Feeding</MenuItem>
                  <MenuItem value="Inspection">Inspection</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
                <TextField select label="Priority" name="priority" value={taskForm.priority} onChange={handleTaskFormChange} fullWidth sx={{ mb: 2 }}>
                  <MenuItem value="">Select Priority</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </TextField>
                <Autocomplete
                  multiple
                  options={cmms.animals.map(a => ({
                    id: String(a.id),
                    label: `${a.type}${a.breed ? ' (' + a.breed + ')' : ''} #${a.id}`
                  }))}
                  value={cmms.animals.filter(a => taskForm.animalIds.includes(String(a.id))).map(a => ({ id: String(a.id), label: `${a.type}${a.breed ? ' (' + a.breed + ')' : ''} #${a.id}` }))}
                  onChange={(event, newValue) => {
                    setTaskForm({ ...taskForm, animalIds: newValue.map(v => v.id) });
                  }}
                  getOptionLabel={option => option.label}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Assign to Animals"
                      placeholder={cmms.animals.length === 0 ? 'No animals available' : 'Type to search...'}
                      helperText={cmms.animals.length === 0 ? 'No animals available. Please add animals first.' : 'Select or type to filter animals.'}
                      disabled={cmms.animals.length === 0}
                      sx={{ mb: 2 }}
                    />
                  )}
                  disabled={cmms.animals.length === 0}
                />
                <TextField label="Due Date" name="due" type="date" value={taskForm.due} onChange={handleTaskFormChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                <TextField label="Notes/Description" name="notes" value={taskForm.notes} onChange={handleTaskFormChange} fullWidth multiline rows={2} sx={{ mb: 2 }} />
                <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                  Upload Attachment
                  <input type="file" accept="image/*,.pdf,.doc,.docx" hidden onChange={handleTaskAttachment} />
                </Button>
                {taskForm.attachment && (
                  <Box sx={{ mt: 1, textAlign: 'center' }}>
                    <Tooltip title={taskForm.attachmentName || 'Attachment'}>
                      <a href={taskForm.attachment} target="_blank" rel="noopener noreferrer"><AttachFileIcon sx={{ fontSize: 32 }} /></a>
                    </Tooltip>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button onClick={() => setTaskModalOpen(false)} color="secondary">Cancel</Button>
                  <Button type="submit" variant="contained" color="primary">{editTask ? 'Update' : 'Add'}</Button>
                  <Button variant="outlined" color="success" onClick={e => handleTaskFormSubmit(e, true)}>Add Another</Button>
                </Box>
              </form>
            </Box>
          </Modal>
        </Box>
        <Divider sx={{ my: 4 }} />
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BarChartIcon color="success" sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h5" fontWeight="bold" flexGrow={1}>Summary & Reporting</Typography>
          </Box>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6} md={3}><Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}><Typography variant="h6">Total Animals</Typography><Typography variant="h4" color="primary.main" fontWeight="bold">{cmms.animals.length}</Typography></Paper></Grid>
            <Grid item xs={6} md={3}><Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}><Typography variant="h6">Tasks Due</Typography><Typography variant="h4" color="warning.main" fontWeight="bold">{cmms.tasks.filter(t => !t.done).length}</Typography></Paper></Grid>
            <Grid item xs={6} md={3}><Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}><Typography variant="h6">Treatments Logged</Typography><Typography variant="h4" color="success.main" fontWeight="bold">{cmms.treatments.length}</Typography></Paper></Grid>
            <Grid item xs={6} md={3}><Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}><Typography variant="h6">Overdue Tasks</Typography><Typography variant="h4" color="error.main" fontWeight="bold">{cmms.tasks.filter(t => !t.done && t.task.toLowerCase().includes('check')).length}</Typography></Paper></Grid>
          </Grid>
          <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => {
            const csv = [
              ['Animal','Type','Breed','Last Treatment','Next Due','Status'],
              ...cmms.animals.map(animal => [
                `${animal.type} #${animal.id}`,
                animal.type,
                animal.breed,
                cmms.treatments.find(r => r.animal === animal.type)?.event || '-',
                cmms.treatments.find(r => r.animal === animal.type)?.date || '-',
                cmms.tasks.some(t => !t.done) ? 'Due' : 'OK',
              ])
            ].map(row => row.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'livestock_cmms_report.csv';
            a.click();
            URL.revokeObjectURL(url);
          }}>
            Download Report (CSV)
          </Button>
        </Box>
      </Paper>
      <Divider sx={{ my: 6 }} />
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      <Typography variant="body2" color="text.secondary" align="center" mb={2}>
        The livestock community is open to all. More interactive features coming soon!
      </Typography>
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button variant="contained" color="secondary" size="large" sx={{ borderRadius: 3, px: 5, fontWeight: 'bold', boxShadow: 4 }}>
          Get Started with Livestock Community
        </Button>
      </Box>
      <Modal open={openDiscussion} onClose={() => setOpenDiscussion(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 3, boxShadow: 24, minWidth: 340, maxWidth: 400 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Community Discussion</Typography>
          <Box sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
            {discussionMessages.map(msg => (
              <Box key={msg.id} sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="primary.main">{msg.user}:</Typography>
                <Typography variant="body2">{msg.text}</Typography>
              </Box>
            ))}
          </Box>
          <TextField
            label="Your Message"
            value={newDiscussionMsg}
            onChange={e => setNewDiscussionMsg(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (newDiscussionMsg.trim()) {
                dispatch({ type: 'ADD_TASK', payload: { id: Date.now(), task: newDiscussionMsg, done: false } });
                setNewDiscussionMsg('');
              }
            }}
            disabled={!newDiscussionMsg.trim()}
            sx={{ mb: 2 }}
          >
            Post
          </Button>
          <Button onClick={() => setOpenDiscussion(false)} variant="outlined" color="primary">Close</Button>
        </Box>
      </Modal>
      <Modal open={openEvents} onClose={() => { setOpenEvents(false); setSelectedEvent(null); }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 3, boxShadow: 24, minWidth: 340, maxWidth: 400 }}>
          {!selectedEvent ? (
            <>
              <Typography variant="h6" fontWeight="bold" mb={2}>Livestock Events</Typography>
              {events.map(ev => (
                <Box key={ev.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">{ev.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{ev.date} - {ev.location}</Typography>
                  <Button size="small" variant="outlined" color="primary" sx={{ mt: 1 }} onClick={() => setSelectedEvent(ev)}>View Details</Button>
                </Box>
              ))}
              <Button onClick={() => setOpenEvents(false)} variant="contained" color="success">Close</Button>
            </>
          ) : (
            <>
              <Typography variant="h6" fontWeight="bold" mb={2}>{selectedEvent.title}</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>{selectedEvent.date} - {selectedEvent.location}</Typography>
              <Typography variant="body1" mb={2}>{selectedEvent.details}</Typography>
              <Button onClick={() => setSelectedEvent(null)} variant="outlined" color="primary" sx={{ mr: 1 }}>Back</Button>
              <Button onClick={() => { setOpenEvents(false); setSelectedEvent(null); }} variant="contained" color="success">Close</Button>
            </>
          )}
        </Box>
      </Modal>
      <Modal open={openQA} onClose={() => { setOpenQA(false); setQaSubmitted(false); }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 3, boxShadow: 24, minWidth: 340, maxWidth: 400 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Ask a Question</Typography>
          {!qaSubmitted ? (
            <>
              <TextField
                label="Your Question"
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  if (newQuestion.trim()) {
                    dispatch({
                      type: 'ADD_TREATMENT',
                      payload: {
                        id: Date.now(),
                        question: newQuestion,
                        answer: 'Thank you! Our experts will answer soon.'
                      }
                    });
                    setQaSubmitted(true);
                    setNewQuestion('');
                  }
                }}
                disabled={!newQuestion.trim()}
                sx={{ mb: 2 }}
              >
                Submit
              </Button>
            </>
          ) : (
            <Typography color="success.main" mb={2}>Your question has been submitted!</Typography>
          )}
          <Typography variant="subtitle2" fontWeight="bold" mt={2}>Recent Q&amp;A</Typography>
          {qaList.map(qa => (
            <Box key={qa.id} sx={{ mb: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Typography variant="body2" fontWeight="bold">Q: {qa.question}</Typography>
              <Button size="small" color="primary" onClick={() => setShowQaAnswer({ open: true, qa })}>View Answer</Button>
            </Box>
          ))}
          <Button onClick={() => setOpenQA(false)} variant="outlined" color="secondary" sx={{ mt: 2 }}>Close</Button>
        </Box>
      </Modal>
      <Modal open={showQaAnswer.open} onClose={() => setShowQaAnswer({ open: false, qa: null })}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 3, boxShadow: 24, minWidth: 320 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Answer</Typography>
          <Typography variant="body2" mb={2}>{showQaAnswer.qa?.answer}</Typography>
          <Button onClick={() => setShowQaAnswer({ open: false, qa: null })} variant="contained" color="primary">Close</Button>
        </Box>
      </Modal>
      <Modal open={openContactSeller.open} onClose={() => { setOpenContactSeller({ open: false, animal: null }); setContactSubmitted(false); }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 3, boxShadow: 24, minWidth: 320 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Contact Seller</Typography>
          {!contactSubmitted ? (
            <>
              <TextField label="Your Name" fullWidth sx={{ mb: 2 }} />
              <TextField label="Your Phone" fullWidth sx={{ mb: 2 }} />
              <TextField label="Message" fullWidth multiline rows={2} sx={{ mb: 2 }} />
              <Button variant="contained" color="primary" fullWidth onClick={() => setContactSubmitted(true)}>Send</Button>
            </>
          ) : (
            <Typography color="success.main" mb={2}>Message sent to seller!</Typography>
          )}
          <Button onClick={() => { setOpenContactSeller({ open: false, animal: null }); setContactSubmitted(false); }} variant="outlined" color="primary">Close</Button>
        </Box>
      </Modal>
      <Modal open={openContactVet.open} onClose={() => { setOpenContactVet({ open: false, vet: null }); setVetContactSubmitted(false); }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 3, boxShadow: 24, minWidth: 320 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Contact Vet</Typography>
          {!vetContactSubmitted ? (
            <>
              <TextField label="Your Name" fullWidth sx={{ mb: 2 }} />
              <TextField label="Your Phone" fullWidth sx={{ mb: 2 }} />
              <TextField label="Message" fullWidth multiline rows={2} sx={{ mb: 2 }} />
              <Button variant="contained" color="error" fullWidth onClick={() => setVetContactSubmitted(true)}>Send</Button>
            </>
          ) : (
            <Typography color="success.main" mb={2}>Message sent to vet!</Typography>
          )}
          <Button onClick={() => { setOpenContactVet({ open: false, vet: null }); setVetContactSubmitted(false); }} variant="outlined" color="error">Close</Button>
        </Box>
      </Modal>
      <Modal open={openOrderProduct.open} onClose={() => { setOpenOrderProduct({ open: false, product: null }); setOrderSubmitted(false); }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 3, boxShadow: 24, minWidth: 320 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Order Product</Typography>
          {!orderSubmitted ? (
            <>
              <TextField label="Your Name" fullWidth sx={{ mb: 2 }} />
              <TextField label="Your Phone" fullWidth sx={{ mb: 2 }} />
              <TextField label="Message" fullWidth multiline rows={2} sx={{ mb: 2 }} />
              <Button variant="contained" color="success" fullWidth onClick={() => setOrderSubmitted(true)}>Send</Button>
            </>
          ) : (
            <Typography color="success.main" mb={2}>Order sent!</Typography>
          )}
          <Button onClick={() => { setOpenOrderProduct({ open: false, product: null }); setOrderSubmitted(false); }} variant="outlined" color="success">Close</Button>
        </Box>
      </Modal>
      <Modal open={openHealthDetails.open} onClose={() => setOpenHealthDetails({ open: false, record: null })}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 3, boxShadow: 24, minWidth: 320 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Health Record Details</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>Name: {openHealthDetails.record?.name}</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>Status: {openHealthDetails.record?.status}</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>Next Due: {openHealthDetails.record?.next}</Typography>
          <Button onClick={() => setOpenHealthDetails({ open: false, record: null })} variant="contained" color="primary">Close</Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default LivestockManagement; 