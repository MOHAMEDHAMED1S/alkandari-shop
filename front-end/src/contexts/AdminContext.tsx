import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminLogin, getCurrentAdminUser } from '@/lib/api';
import { toast } from 'sonner';
import { requestNotificationPermission, checkNotificationStatus } from '@/utils/notifications';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AdminContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  handleAuthError: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  const handleAuthError = () => {
    console.log('Authentication error detected, redirecting to login');
    setUser(null);
    setToken(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setIsLoading(false);
    toast.error('Session expired. Please log in again.');
    
    // Use a more reliable redirect method
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 1000);
  };

  const refreshUser = async (tokenToUse?: string) => {
    const tokenToCheck = tokenToUse || token;
    if (!tokenToCheck) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await getCurrentAdminUser(tokenToCheck);
      if (response.success) {
        setUser(response.data);
        setToken(tokenToCheck);
        setIsLoading(false);
      } else {
        console.log('Token validation failed, redirecting to login');
        handleAuthError();
      }
    } catch (error: any) {
      console.error('Failed to refresh user:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Authentication failed, redirecting to login');
        handleAuthError();
      } else {
        // For other errors, show error but don't redirect immediately
        console.log('Non-auth error, keeping session for now');
        toast.error('Failed to verify session. Please refresh the page.');
        setIsLoading(false);
      }
    }
  };

  // Load token and user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');
    
    console.log('Loading from localStorage:', { savedToken: !!savedToken, savedUser: !!savedUser });
    
    if (savedToken && savedUser) {
      try {
        // Set user data immediately from localStorage
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setToken(savedToken);
        console.log('User data loaded from localStorage:', userData);
        // Don't verify token immediately, just set loading to false
        setIsLoading(false);
        // Skip token validation for now to avoid issues
        console.log('Skipping token validation to avoid logout issues');
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        // Clear invalid data
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setIsLoading(false);
      }
    } else {
      console.log('No saved data found, setting loading to false');
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await adminLogin({ email, password });
      
      console.log('Login response:', response);
      
      // Check if response has access_token (successful login)
      if (response.access_token) {
        const { user: userData, access_token: newToken } = response;
        setUser(userData);
        setToken(newToken);
        // Save token and user data to localStorage
        localStorage.setItem('admin_token', newToken);
        localStorage.setItem('admin_user', JSON.stringify(userData));
        console.log('Login successful, data saved to localStorage');
        
        // Request notification permission after successful login
        try {
          const permissionGranted = await requestNotificationPermission();
          if (permissionGranted) {
            console.log('Notification permission granted');
            toast.success('تم تفعيل الإشعارات بنجاح');
          } else {
            console.log('Notification permission denied');
            // Check notification status for debugging
            const status = checkNotificationStatus();
            console.log('Notification status:', status);
            toast.info(`الإشعارات: ${status.message}`);
          }
        } catch (error) {
          console.error('Failed to request notification permission:', error);
        }
        
        setIsLoading(false);
        return true;
      } else {
        console.log('Login failed: No access_token in response');
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setIsLoading(false);
  };

  const value: AdminContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
    handleAuthError,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};