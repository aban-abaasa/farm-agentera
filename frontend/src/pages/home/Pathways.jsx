import { Box, Container, Grid } from '@mui/material';
import { SectionHeading } from '../../components/classic/Ornament';
import PathwayCard from '../../components/classic/PathwayCard';
import { pathways } from '../../content/agribone';

const Pathways = () => (
  <Box component="section" id="pathways" sx={{ py: { xs: 7, md: 10 }, bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
    <Container maxWidth="xl">
      <SectionHeading
        kicker="Five ways in"
        title="Choose your place at the table"
        subtitle="AgriBone works because each person does their part. Find yours."
      />
      <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
        {pathways.map((p) => (
          <Grid key={p.slug} size={{ xs: 12, md: 6, lg: 4 }}>
            <PathwayCard pathway={p} />
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default Pathways;
