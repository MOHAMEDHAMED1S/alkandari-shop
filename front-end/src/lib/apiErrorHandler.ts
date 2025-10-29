import { toast } from 'sonner';

export const handleApiError = (error: any, showToast: boolean = true) => {
  console.error('API Error:', error);
  
  // Check if it's an authentication error
  if (error.response?.status === 401 || error.response?.status === 403) {
    console.log('Authentication error detected, dispatching global event');
    
    // Dispatch global authentication error event
    window.dispatchEvent(new CustomEvent('auth-error', {
      detail: { error }
    }));
    
    return true; // Error was handled
  }
  
  // Handle other types of errors
  if (showToast) {
    if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.');
    } else if (error.response?.status >= 400 && error.response?.status < 500) {
      toast.error('Request failed. Please check your input.');
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred.');
    }
  }
  
  return false; // Error was not handled as auth error
};

export const createApiCall = async (apiFunction: () => Promise<any>, showToast: boolean = true) => {
  try {
    const result = await apiFunction();
    return result;
  } catch (error) {
    const wasAuthError = handleApiError(error, showToast);
    throw error; // Re-throw the error for component handling
  }
};
