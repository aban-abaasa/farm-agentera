import { Box, CircularProgress, Tab, Tabs, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useRoles } from '../../context/RoleContext';
import { accountRoles, roleOrder } from '../../content/agribone';
import { fonts } from '../../theme';
import BecomeTab from './BecomeTab';
import CustomerHome from './roles/CustomerHome';
import FarmerHome from './roles/FarmerHome';
import SupplierHome from './roles/SupplierHome';
import SpecialistHome from './roles/SpecialistHome';

const HOMES = {
  customer: CustomerHome,
  farmer: FarmerHome,
  supplier: SupplierHome,
  specialist: SpecialistHome,
};

const BECOME = 'become:';

/** Tab label for a role the person does not hold yet. */
const becomeLabel = (role, applicationByPathway) => {
  const status = applicationByPathway[accountRoles[role].pathway]?.status;
  const name = accountRoles[role].label;
  if (status === 'pending') return `${name} · pending review`;
  return `Become a ${name}`;
};

/**
 * /account — everyone lands on the Customer page. A person's other roles are
 * tabs beside it, and each role they don't have yet is a "Become a …" tab
 * (farmers switch on straight away; suppliers and specialists apply).
 */
const AccountHub = () => {
  const { user } = useAuth();
  const { roles, activeRole, setActiveRole, applications, applicationByPathway, loading } = useRoles();
  const name = user?.first_name || user?.name || '';
  const missing = roleOrder.filter((r) => !roles.includes(r));
  const becoming = activeRole.startsWith(BECOME) ? activeRole.slice(BECOME.length) : null;
  const Home = HOMES[activeRole] || CustomerHome;

  return (
    <Box>
      <Typography className="kicker" sx={{ color: 'warning.main' }}>My account</Typography>
      <Typography variant="h3" component="h1" sx={{ fontFamily: fonts.display, mb: 0.5 }}>
        {name ? `Welcome, ${name}` : 'Welcome'}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Everyone starts as a customer. Open a tab to switch account, or to add a farm, supplier or specialist account.
      </Typography>

      <Tabs
        value={activeRole}
        onChange={(_, value) => setActiveRole(value)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label="Account roles"
        sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        {roles.map((role) => (
          <Tab key={role} value={role} label={accountRoles[role].label} sx={{ fontWeight: 700 }} />
        ))}
        {missing.map((role) => (
          <Tab key={`${BECOME}${role}`} value={`${BECOME}${role}`} label={becomeLabel(role, applicationByPathway)} sx={{ fontWeight: 500, fontStyle: 'italic' }} />
        ))}
      </Tabs>

      {loading && roles.length <= 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}><CircularProgress size={22} /></Box>
      )}

      {becoming ? (
        <BecomeTab role={becoming} />
      ) : (
        <Home applications={applications} applicationByPathway={applicationByPathway} />
      )}
    </Box>
  );
};

export default AccountHub;
