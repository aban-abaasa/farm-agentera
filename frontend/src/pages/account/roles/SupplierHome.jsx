import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SellIcon from '@mui/icons-material/Sell';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ChatIcon from '@mui/icons-material/Chat';
import { Alert } from '@mui/material';
import ActionGrid from '../../../components/account/ActionGrid';
import BusinessProfileCard from '../../../components/account/BusinessProfileCard';
import UpdatesFeed from '../../../components/account/UpdatesFeed';
import RoleLayout from '../../../components/account/RoleLayout';
import { DIGITAL_CITY_URL } from '../../../content/agribone';
import { buildFeed } from '../feed';

const actions = [
  { icon: <LocalShippingIcon fontSize="small" />, title: 'Supplier portal', body: 'Orders, stock and deliveries on Digital City Era.', href: DIGITAL_CITY_URL },
  { icon: <SellIcon fontSize="small" />, title: 'List on the market', body: 'Seed, feed, inputs, tools and equipment for farmers.', to: '/marketplace/create' },
  { icon: <AccountBalanceWalletIcon fontSize="small" />, title: 'Get paid in ICAN', body: 'Every order is settled in the ICAN wallet.', to: '/ican-wallet' },
  { icon: <ChatIcon fontSize="small" />, title: 'Messages', body: 'Talk to farmers who want to order.', to: '/messages' },
];

const SupplierHome = ({ applications, applicationByPathway }) => {
  const application = applicationByPathway.supplier;
  return (
    <RoleLayout
      main={
        <>
          <Alert severity="info" icon={<LocalShippingIcon fontSize="inherit" />}>
            Your supplier account is connected to Digital City Era, where your orders, stock and deliveries are managed.
          </Alert>
          <BusinessProfileCard
            roleLabel="Supplier"
            businessName={application?.organisation}
            pitchinRef={application?.pitchin_ref}
          />
          <ActionGrid items={actions} />
        </>
      }
      side={<UpdatesFeed title="Supplier feed" items={buildFeed('supplier', applications)} />}
    />
  );
};

export default SupplierHome;
