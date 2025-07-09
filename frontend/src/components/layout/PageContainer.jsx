import { Container, Box } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * PageContainer component to provide consistent layout across all pages
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {boolean} props.fullWidth - Whether to use full width or constrained width
 * @param {Object} props.sx - Additional styles to apply to the container
 * @returns {React.ReactElement} The PageContainer component
 */
const PageContainer = ({ children, fullWidth = false, sx = {} }) => {
  return (
    <Container 
      maxWidth={fullWidth ? false : "xl"} 
      sx={{ 
        py: 3, 
        px: { xs: 2, sm: 3, md: 4 },
        my: { xs: 2, sm: 3 },
        ...sx 
      }}
    >
      <Box
        sx={{
          borderRadius: { xs: 2, md: 3 },
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </Container>
  );
};

PageContainer.propTypes = {
  children: PropTypes.node.isRequired,
  fullWidth: PropTypes.bool,
  sx: PropTypes.object,
};

export default PageContainer; 