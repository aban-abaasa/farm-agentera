import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  registerForEvent, 
  unregisterFromEvent, 
  getUserEventRegistration 
} from '../services/api/communityService';

/**
 * Custom hook for handling event registration functionality
 * @param {string|number} eventId - Event ID
 * @returns {Object} - Registration state and handlers
 */
export const useEventRegistration = (eventId) => {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [error, setError] = useState(null);

  // Check registration status on mount and when user/eventId changes
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!user?.id || !eventId) return;

      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error: checkError } = await getUserEventRegistration(eventId, user.id);
        
        if (checkError) {
          setError(checkError);
        } else {
          setIsRegistered(data.isRegistered);
          setRegistrationData(data.registration);
        }
      } catch (err) {
        setError(err.message || 'Failed to check registration status');
      } finally {
        setIsLoading(false);
      }
    };

    checkRegistrationStatus();
  }, [user?.id, eventId]);

  /**
   * Handle event registration
   */
  const handleRegister = async () => {
    if (!user?.id || !eventId) {
      setError('Please log in to register for events');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: registerError } = await registerForEvent(eventId, user.id);

      if (registerError) {
        setError(registerError);
      } else {
        setIsRegistered(true);
        setRegistrationData({ registration_date: new Date().toISOString(), status: 'registered' });
        return { success: true, message: data?.message || 'Successfully registered!' };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to register for event';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle event unregistration
   */
  const handleUnregister = async () => {
    if (!user?.id || !eventId) {
      setError('Please log in to unregister from events');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: unregisterError } = await unregisterFromEvent(eventId, user.id);

      if (unregisterError) {
        setError(unregisterError);
      } else {
        setIsRegistered(false);
        setRegistrationData(null);
        return { success: true, message: data?.message || 'Successfully unregistered!' };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to unregister from event';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggle registration status
   */
  const toggleRegistration = async () => {
    if (isRegistered) {
      return await handleUnregister();
    } else {
      return await handleRegister();
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  return {
    // State
    isRegistered,
    isLoading,
    registrationData,
    error,
    isLoggedIn: !!user?.id,
    
    // Actions
    handleRegister,
    handleUnregister,
    toggleRegistration,
    clearError,
    
    // Computed values
    registrationButtonText: isLoading 
      ? 'Loading...' 
      : isRegistered 
        ? 'Unregister' 
        : 'Register',
    canRegister: !!user?.id && !isLoading
  };
};

export default useEventRegistration;
