import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuthError } from '@/hooks/useAuthError';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // MUST call hooks unconditionally at the top level
  const adminContext = useAdmin();
  const { handleApiError } = useAuthError();
  
  // Extract values with fallbacks
  const isAuthenticated = adminContext?.isAuthenticated || false;
  const isLoading = adminContext?.isLoading || false;
  const user = adminContext?.user || null;

  useEffect(() => {
    // Handle authentication errors globally
    const handleGlobalError = (event: any) => {
      if (event.detail?.error) {
        handleApiError(event.detail.error);
      }
    };

    window.addEventListener('auth-error', handleGlobalError);
    return () => window.removeEventListener('auth-error', handleGlobalError);
  }, [handleApiError]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    const currentPath = location.pathname;
    navigate('/admin/login', { 
      state: { from: currentPath },
      replace: true 
    });
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
