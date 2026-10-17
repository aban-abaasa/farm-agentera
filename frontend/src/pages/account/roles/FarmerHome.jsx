import AgricultureIcon from '@mui/icons-material/Agriculture';
import PetsIcon from '@mui/icons-material/Pets';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import GrassIcon from '@mui/icons-material/Grass';
import SellIcon from '@mui/icons-material/Sell';
import CampaignIcon from '@mui/icons-material/Campaign';
import PinDropIcon from '@mui/icons-material/PinDrop';
import ActionGrid from '../../../components/account/ActionGrid';
import BusinessProfileCard from '../../../components/account/BusinessProfileCard';
import UpdatesFeed from '../../../components/account/UpdatesFeed';
import RoleLayout from '../../../components/account/RoleLayout';
import { useRoles } from '../../../context/RoleContext';
import { buildFeed } from '../feed';

const actions = [
  { icon: <CampaignIcon fontSize="small" />, title: 'Tell suppliers what you have', body: 'Say what you have and your price. Suppliers on Digital City Era see it straight away.', to: '/produce-offers' },
  { icon: <AgricultureIcon fontSize="small" />, title: 'My farm', body: 'Plots, tasks and farm overview.', to: '/farm-management' },
  { icon: <PetsIcon fontSize="small" />, title: 'Livestock', body: 'Animals, health and records.', to: '/livestock-management' },
  { icon: <Inventory2Icon fontSize="small" />, title: 'Inventory', body: 'Inputs, stock and customer orders.', to: '/inventory-management' },
  { icon: <GrassIcon fontSize="small" />, title: 'Soil & crop planner', body: 'Plan what to plant, find input suppliers.', to: '/soil-crop-planner' },
  { icon: <SellIcon fontSize="small" />, title: 'Sell your produce', body: 'A full listing with photos and details, for customers and stores.', to: '/marketplace/create' },
  { icon: <PinDropIcon fontSize="small" />, title: 'Find a specialist', body: 'Get verified, or find a manager or partner.', to: '/support-team' },
];

const FarmerHome = ({ applications }) => {
  const { companyForRole } = useRoles();
  const company = companyForRole('farmer');
  return (
  <RoleLayout
    main={
      <>
        <BusinessProfileCard role="farmer" />
        <ActionGrid items={actions} />
      </>
    }
    side={<UpdatesFeed title="Farm feed" items={buildFeed('farmer', applications, company)} />}
  />
  );
};

export default FarmerHome;
