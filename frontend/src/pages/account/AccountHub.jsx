import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Chip, CircularProgress, Tab, Tabs, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useRoles } from '../../context/RoleContext';
import { accountRoles, roleOrder } from '../../content/agribone';
import { fonts } from '../../theme';
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

/** What to show for a role the person does not hold yet. */
const addRoleState = (role, applicationByPathway) => {
  const { pathway } = accountRoles[role];
  const app = applicationByPathway[pathway];
  if (app?.status === 'pending') return { chip: 'Pending review', label: 'View application' };
  if (app?.status === 'rejected') return { chip: null, label: 'Apply again' };
  return { chip: null, label: role === 'farmer' ? 'Start farming' : 'Apply' };
};

/** Roles not yet held, with one clear button each. Customers can add any. */
const AddRoles = ({ roles, applicationByPathway }) => {
  const missing = roleOrder.filter((r) => !roles.includes(r));
  if (!missing.length) return null;
  return (
    <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
      <Typography className="kicker" sx={{ color: 'warning.main', mb: 1.5 }}>Add to your account</Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {missing.map((role) => {
          const state = addRoleState(role, applicationByPathway);
          return (
            <Box key={role} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button component={RouterLink} to={`/join/${accountRoles[role].pathway}`} variant="outlined" color="inherit" size="small">
                {state.label}: {accountRoles[role].label}
              </Button>
              {state.chip && <Chip size="small" color="info" label={state.chip} />}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

/**
 * /account — one place for every role a person holds.
 * Everyone is a customer; farmers, suppliers and farm specialists also get a
 * business account (profile, feed, tools) in their own tab.
 */
const AccountHub = () => {
  const { user } = useAuth();
  const { roles, activeRole, setActiveRole, applications, applicationByPathway, loading } = useRoles();
  const Home = HOMES[activeRole] || CustomerHome;
  const name = user?.first_name || user?.name || '';
  const multi = roles.length > 1;

  return (
    <Box>
      <Typography className="kicker" sx={{ color: 'warning.main' }}>My account</Typography>
      <Typography variant="h3" component="h1" sx={{ fontFamily: fonts.display, mb: 0.5 }}>
        {name ? `Welcome, ${name}` : 'Welcome'}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {multi ? 'Switch between your accounts below.' : 'You are a customer. Add a farm, supplier or specialist account any time.'}
      </Typography>

      {multi && (
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
        </Tabs>
      )}

      {loading && roles.length <= 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}><CircularProgress size={22} /></Box>
      )}

      <Home applications={applications} applicationByPathway={applicationByPathway} />

      <AddRoles roles={roles} applicationByPathway={applicationByPathway} />
    </Box>
  );
};

export default AccountHub;
