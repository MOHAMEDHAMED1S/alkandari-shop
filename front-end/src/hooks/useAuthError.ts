import { useAdmin } from '@/contexts/AdminContext';
import { useEffect } from 'react';

export const useAuthError = () => {
  // MUST call hooks unconditionally at the top level
  const adminContext = useAdmin();
  const handleAuthError = adminContext?.handleAuthError || (() => {
    console.log('Fallback auth error handler');
    window.location.href = '/admin/login';
  });

  const handleApiError = (error: any) => {
    // Check if it's an authentication error
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Authentication error detected in API call');
      handleAuthError();
      return true; // Error was handled
    }
    return false; // Error was not handled
  };

  // Set up global error handler for fetch requests
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Check for authentication errors in response
        if (response.status === 401 || response.status === 403) {
          console.log('Authentication error detected in fetch response');
          handleAuthError();
        }
        
        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    };

    // Cleanup function to restore original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, [handleAuthError]);

  return { handleApiError };
};
