import { Grid } from '@mui/material';

/** Two columns on desktop: the working area on the left, the feed on the right. */
const RoleLayout = ({ main, side }) => (
  <Grid container spacing={{ xs: 2.5, md: 3 }}>
    <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>{main}</Grid>
    <Grid size={{ xs: 12, md: 4 }}>{side}</Grid>
  </Grid>
);

export default RoleLayout;
