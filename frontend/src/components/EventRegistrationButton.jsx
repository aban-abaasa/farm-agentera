import React, { useState } from 'react';
import { 
  Button, 
  Snackbar, 
  Alert, 
  Tooltip,
  CircularProgress,
  Box
} from '@mui/material';
import { useEventRegistration } from '../hooks/useEventRegistration.js';

const EventRegistrationButton = ({ 
  eventId, 
  variant = 'contained',
  size = 'small',
  color = 'primary',
  sx = {},
  fullWidth = false,
  showTooltip = true,
  onRegistrationChange = null // Callback for parent components
}) => {
  const {
    isRegistered,
    isLoading,
    error,
    isLoggedIn,
    toggleRegistration,
    registrationButtonText,
    canRegister,
    clearError
  } = useEventRegistration(eventId);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleClick = async () => {
    if (!isLoggedIn) {
      setSnackbarMessage('Please log in to register for events');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    const result = await toggleRegistration();
    
    if (result) {
      setSnackbarMessage(result.message);
      setSnackbarSeverity(result.success ? 'success' : 'error');
      setSnackbarOpen(true);
      
      // Notify parent component of registration change
      if (onRegistrationChange && result.success) {
        onRegistrationChange(isRegistered ? 'unregistered' : 'registered', eventId);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    clearError();
  };

  const getButtonProps = () => {
    const baseProps = {
      variant,
      size,
      color: isRegistered ? 'secondary' : color,
      fullWidth,
      disabled: !canRegister,
      onClick: handleClick,
      sx: {
        textTransform: 'none',
        borderRadius: 6,
        px: 2,
        ...sx
      }
    };

    return baseProps;
  };

  const renderButton = () => (
    <Button {...getButtonProps()}>
      {isLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} color="inherit" />
          Loading...
        </Box>
      ) : (
        registrationButtonText
      )}
    </Button>
  );

  const getTooltipTitle = () => {
    if (!isLoggedIn) {
      return 'Please log in to register for events';
    }
    if (isRegistered) {
      return 'Click to unregister from this event';
    }
    return 'Click to register for this event';
  };

  return (
    <>
      {showTooltip ? (
        <Tooltip title={getTooltipTitle()} arrow>
          <span>
            {renderButton()}
          </span>
        </Tooltip>
      ) : (
        renderButton()
      )}

      {/* Snackbar for user feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage || error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EventRegistrationButton;
