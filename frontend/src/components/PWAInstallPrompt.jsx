import { useEffect, useState } from 'react';
import { Button, Snackbar, Alert, IconButton } from '@mui/material';
import { Close as CloseIcon, GetApp as InstallIcon } from '@mui/icons-material';

const isStandalone = () => (
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true
);

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isStandalone()) return;

    const handleBeforeInstallPrompt = (event) => {
      // Prevent Chrome's default mini-infobar
      event.preventDefault();
      
      // Store the event for later use
      setDeferredPrompt(event);
      
      // Automatically show our prompt after 2 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    };

    const handleAppInstalled = () => {
      // Clear prompt when installed
      setDeferredPrompt(null);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Don't render if already installed
  if (isStandalone()) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show Chrome's native install prompt
    deferredPrompt.prompt();
    
    // Wait for user's response
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User ${outcome} the install prompt`);
    
    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  return (
    <Snackbar
      open={showPrompt && !!deferredPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ mb: 2 }}
    >
      <Alert
        severity="success"
        variant="filled"
        icon={<InstallIcon />}
        sx={{
          width: '100%',
          backgroundColor: '#2e7d32',
          fontSize: '1rem',
          alignItems: 'center'
        }}
        action={
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{ color: 'white' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Button
          onClick={handleInstall}
          variant="contained"
          size="small"
          sx={{
            backgroundColor: 'white',
            color: '#2e7d32',
            fontWeight: 'bold',
            mr: 1,
            '&:hover': {
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          Install AgriBone App
        </Button>
        Quick access from your home screen!
      </Alert>
    </Snackbar>
  );
}
