import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Grid, Link, Typography } from '@mui/material';
import { SectionHeading } from '../../components/classic/Ornament';
import PathwayCard from '../../components/classic/PathwayCard';
import { pathways } from '../../content/agribone';
import { fonts } from '../../theme';

/** /join — the five pathways, with a note on how approval works. */
const Join = () => (
  <Container maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>
    <SectionHeading
      kicker="Pathways"
      title="Where do you belong?"
      subtitle="Customers and farmers may begin straight away. On-ground support, suppliers and partners are reviewed and approved by the AgriBone developer panel."
    />

    <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
      {pathways.map((p) => (
        <Grid key={p.slug} size={{ xs: 12, md: 6, lg: 4 }}>
          <PathwayCard pathway={p} />
        </Grid>
      ))}
    </Grid>

    <Box
      sx={{
        mt: { xs: 6, md: 9 }, p: { xs: 3, md: 4 }, textAlign: 'center', border: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography sx={{ fontFamily: fonts.accent, fontStyle: 'italic', fontSize: '1.4rem' }}>
        Every transaction on AgriBone is settled in the ICAN wallet.
      </Typography>
      <Link component={RouterLink} to="/ican-wallet" className="kicker" sx={{ display: 'inline-block', mt: 1.5 }}>
        Open your wallet →
      </Link>
    </Box>
  </Container>
);

export default Join;
