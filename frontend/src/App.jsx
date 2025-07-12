import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './reduced-motion.css'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AuthCallback from './pages/auth/AuthCallback'
import CompleteProfile from './pages/auth/CompleteProfile'
import { AuthProvider } from './context/AuthContext'
import ThemeContextProvider from './context/ThemeContext'
import Settings from './pages/Settings'
import Profile from './pages/profile/Profile'
import EditProfile from './pages/profile/EditProfile'
import NotFound from './pages/NotFound'
import Weather from './pages/Weather'
import Resources from './pages/Resources'
import Marketplace from './pages/marketplace/Marketplace'
import LandListings from './pages/marketplace/LandListings'
import ProduceListings from './pages/marketplace/ProduceListings'
import ServiceListings from './pages/marketplace/ServiceListings'
import ListingDetails from './pages/marketplace/ListingDetails'
import CreateListing from './pages/marketplace/CreateListing'
import Community from './pages/community/Community'
import CommunityDiscussions from './pages/community/CommunityDiscussions'
import CommunityEvents from './pages/community/CommunityEvents'
import CommunityQA from './pages/community/CommunityQA'
import PostDetails from './pages/community/PostDetails'
import SupportTeam from './pages/SupportTeam'
import LivestockManagement from './pages/LivestockManagement'
import SoilCropPlanner from './pages/SoilCropPlanner'
import FarmManagement from './pages/FarmManagement'
import IrrigationManagement from './pages/IrrigationManagement'
import InventoryManagement from './pages/InventoryManagement'
import LivestockAnalytics from './pages/LivestockAnalytics'
import Analytics from './pages/Analytics'
import Finance from './pages/Finance'
import Investments from './pages/Investments'
import Messages from './pages/Messages'
import { Suspense } from 'react'
import { CircularProgress, Box } from '@mui/material'
import PageContainer from './components/layout/PageContainer'
import ProtectedRoute from './components/ProtectedRoute'

// Wrap page components with PageContainer for consistent layout
const withPageContainer = (Component, props = {}) => {
  return (
    <PageContainer {...props}>
      <Component />
    </PageContainer>
  );
};

function App() {
  return (
    <ThemeContextProvider>
      <Router>
        <AuthProvider>
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
          </Box>
        }>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="*" element={withPageContainer(NotFound)} />
            </Route>
            
            {/* Auth routes - accessible only when NOT logged in */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Profile completion route - special case */}
            <Route path="/complete-profile" element={<CompleteProfile />} />
            
            {/* Protected routes - require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                <Route path="dashboard" element={withPageContainer(Dashboard)} />
                <Route path="settings" element={withPageContainer(Settings)} />
                <Route path="profile/:id" element={withPageContainer(Profile)} />
                <Route path="profile/edit" element={withPageContainer(EditProfile)} />
                <Route path="weather" element={withPageContainer(Weather)} />
                <Route path="resources" element={withPageContainer(Resources)} />
                <Route path="support-team" element={withPageContainer(SupportTeam)} />
                <Route path="farm-management" element={withPageContainer(FarmManagement)} />
                <Route path="livestock-management" element={withPageContainer(LivestockManagement)} />
                <Route path="soil-crop-planner" element={withPageContainer(SoilCropPlanner)} />
                <Route path="irrigation-management" element={withPageContainer(IrrigationManagement)} />
                <Route path="inventory-management" element={withPageContainer(InventoryManagement)} />
                <Route path="livestock-analytics" element={withPageContainer(LivestockAnalytics)} />
                <Route path="finance" element={withPageContainer(Finance)} />
                <Route path="analytics" element={withPageContainer(Analytics)} />
                <Route path="investments" element={withPageContainer(Investments)} />
                <Route path="messages" element={withPageContainer(Messages)} />
                
                {/* Marketplace Routes */}
                <Route path="marketplace" element={withPageContainer(Marketplace)} />
                <Route path="marketplace/land" element={withPageContainer(LandListings)} />
                <Route path="marketplace/produce" element={withPageContainer(ProduceListings)} />
                <Route path="marketplace/services" element={withPageContainer(ServiceListings)} />
                <Route path="marketplace/listing/:id" element={withPageContainer(ListingDetails)} />
                <Route path="marketplace/create" element={withPageContainer(CreateListing)} />
                
                {/* Community Routes */}
                <Route path="community" element={withPageContainer(Community)} />
                <Route path="community/discussions" element={withPageContainer(CommunityDiscussions)} />
                <Route path="community/events" element={withPageContainer(CommunityEvents)} />
                <Route path="community/qa" element={withPageContainer(CommunityQA)} />
                <Route path="community/post/:id" element={withPageContainer(PostDetails)} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
    </ThemeContextProvider>
  )
}

export default App
