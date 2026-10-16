import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AddIcon from '@mui/icons-material/Add';
import { useRoles } from '../../context/RoleContext';
import { accountRoles, roleOrder, ROLE_HOME_PATH } from '../../content/agribone';
import { fonts } from '../../theme';

const ROLE_ICONS = {
  customer: PersonIcon,
  farmer: AgricultureIcon,
  supplier: LocalShippingIcon,
  specialist: SupportAgentIcon,
};

/**
 * The role strip under the main navigation. Once a person holds more than one role, every
 * page shows their roles here: choose one and the whole page changes to that role's page,
 * with the navigation that goes with it. The choice is remembered.
 *
 * A person who only has the customer role sees nothing here; they add roles from
 * My Account.
 */
const RoleBar = () => {
  const navigate = useNavigate();
  const { roles, activeRole, setActiveRole } = useRoles();

  if (roles.length < 2) return null;

  const missing = roleOrder.filter((r) => !roles.includes(r));
  const current = roles.includes(activeRole) ? activeRole : null;

  const choose = (role) => {
    setActiveRole(role);
    navigate(ROLE_HOME_PATH);
  };

  return (
    <Box
      aria-label="Switch role"
      component="nav"
      sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: 'rgba(31,77,54,0.06)' }}
    >
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 1, minHeight: 44 }}>
          <Typography
            className="kicker"
            sx={{ fontSize: '0.64rem', color: 'text.secondary', mr: 1, display: { xs: 'none', sm: 'block' } }}
          >
            Viewing as
          </Typography>

          {roles.map((role) => {
            const Icon = ROLE_ICONS[role] || PersonIcon;
            const isActive = role === current;
            return (
              <Button
                key={role}
                onClick={() => choose(role)}
                aria-current={isActive ? 'page' : undefined}
                startIcon={<Icon fontSize="small" />}
                sx={{
                  borderRadius: 0,
                  px: { xs: 1.25, sm: 2 },
                  py: 1.1,
                  fontFamily: fonts.body,
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.78rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  borderBottom: '3px solid',
                  borderColor: isActive ? 'warning.main' : 'transparent',
                  '&:hover': { backgroundColor: 'transparent', color: 'primary.main' },
                }}
              >
                {accountRoles[role].label}
              </Button>
            );
          })}

          {missing.length > 0 && (
            <Button
              onClick={() => choose(`become:${missing[0]}`)}
              startIcon={<AddIcon fontSize="small" />}
              sx={{
                borderRadius: 0,
                px: { xs: 1, sm: 1.5 },
                fontSize: '0.74rem',
                fontStyle: 'italic',
                textTransform: 'none',
                color: 'text.secondary',
                '&:hover': { backgroundColor: 'transparent', color: 'primary.main' },
              }}
            >
              Add a role
            </Button>
          )}

          {current && (
            <Typography
              sx={{
                ml: 'auto',
                display: { xs: 'none', lg: 'block' },
                fontFamily: fonts.accent,
                fontStyle: 'italic',
                fontSize: '0.92rem',
                color: 'text.secondary',
              }}
            >
              {accountRoles[current].blurb}
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default RoleBar;
