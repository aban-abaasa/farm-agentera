import { Box, Chip, Typography } from '@mui/material';
import PinDropIcon from '@mui/icons-material/PinDrop';
import ChatIcon from '@mui/icons-material/Chat';
import ForumIcon from '@mui/icons-material/Forum';
import ActionGrid from '../../../components/account/ActionGrid';
import BusinessProfileCard from '../../../components/account/BusinessProfileCard';
import UpdatesFeed from '../../../components/account/UpdatesFeed';
import RoleLayout from '../../../components/account/RoleLayout';
import { buildFeed } from '../feed';
import { fonts } from '../../../theme';

const actions = [
  { icon: <PinDropIcon fontSize="small" />, title: 'On-ground team', body: 'See how farmers find you.', to: '/support-team' },
  { icon: <ChatIcon fontSize="small" />, title: 'Messages', body: 'Farmers who need a visit or advice.', to: '/messages' },
  { icon: <ForumIcon fontSize="small" />, title: 'Community questions', body: 'Answer farmers in your area.', to: '/community/qa' },
];

const CoverageCard = ({ application }) => {
  if (!application) return null;
  const area = [application.sub_region, application.region].filter(Boolean).join(', ');
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', p: { xs: 2, md: 2.5 } }}>
      <Typography className="kicker" sx={{ color: 'warning.main', mb: 1 }}>Where and what</Typography>
      <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.15rem', mb: 1 }}>
        {area || 'Area not set'}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {(application.capabilities || []).map((c) => <Chip key={c} size="small" label={c} />)}
      </Box>
    </Box>
  );
};

const SpecialistHome = ({ applications, applicationByPathway }) => {
  const application = applicationByPathway.support;
  return (
    <RoleLayout
      main={
        <>
          <CoverageCard application={application} />
          <BusinessProfileCard roleLabel="Specialist" pitchinRef={application?.pitchin_ref} />
          <ActionGrid items={actions} />
        </>
      }
      side={<UpdatesFeed title="Specialist feed" items={buildFeed('specialist', applications)} />}
    />
  );
};

export default SpecialistHome;
