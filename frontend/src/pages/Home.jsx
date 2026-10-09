import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import Hero from './home/Hero';
import Pathways from './home/Pathways';
import FarmersRoad from './home/FarmersRoad';
import OnTheGround from './home/OnTheGround';
import Letters from './home/Letters';
import CommunityBoard from './home/CommunityBoard';
import { fonts } from '../theme';

const ClosingCall = ({ signedIn }) => (
  <Box component="section" sx={{ py: { xs: 7, md: 9 }, textAlign: 'center' }}>
    <Container maxWidth="md">
      <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
        Take your place.
      </Typography>
      <Typography sx={{ fontFamily: fonts.accent, fontStyle: 'italic', fontSize: '1.4rem', color: 'text.secondary', mb: 4 }}>
        The soil is patient. The market is open. Someone on the ground is ready to vouch for you.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button component={RouterLink} to="/join" variant="contained" size="large">
          Choose your pathway
        </Button>
        {!signedIn && (
          <Button component={RouterLink} to="/register" variant="outlined" color="inherit" size="large">
            Create an account
          </Button>
        )}
      </Box>
    </Container>
  </Box>
);

const Home = () => {
  const { user } = useAuth();
  return (
    <Box>
      <Hero />
      <Pathways />
      <FarmersRoad />
      <OnTheGround />
      <Letters />
      <CommunityBoard />
      <ClosingCall signedIn={!!user} />
    </Box>
  );
};

export default Home;
