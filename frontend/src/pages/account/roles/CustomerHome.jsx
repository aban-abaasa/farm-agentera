import StorefrontIcon from '@mui/icons-material/Storefront';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ChatIcon from '@mui/icons-material/Chat';
import ForumIcon from '@mui/icons-material/Forum';
import ActionGrid from '../../../components/account/ActionGrid';
import UpdatesFeed from '../../../components/account/UpdatesFeed';
import RoleLayout from '../../../components/account/RoleLayout';
import { buildFeed } from '../feed';

const actions = [
  { icon: <StorefrontIcon fontSize="small" />, title: 'Browse the market', body: 'Produce, land and services from farmers and suppliers.', to: '/marketplace' },
  { icon: <AccountBalanceWalletIcon fontSize="small" />, title: 'ICAN wallet', body: 'Fund your wallet and pay for orders.', to: '/ican-wallet' },
  { icon: <ChatIcon fontSize="small" />, title: 'Messages', body: 'Talk to the people you buy from.', to: '/messages' },
  { icon: <ForumIcon fontSize="small" />, title: 'Community', body: 'Questions, discussions and events.', to: '/community' },
];

const CustomerHome = ({ applications }) => (
  <RoleLayout
    main={<ActionGrid items={actions} />}
    side={<UpdatesFeed title="Getting started" items={buildFeed('customer', applications)} />}
  />
);

export default CustomerHome;
