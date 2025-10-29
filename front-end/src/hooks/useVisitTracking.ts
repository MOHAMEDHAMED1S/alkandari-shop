/**
 * useVisitTracking Hook
 * Provides automatic visit tracking functionality for React components
 */

import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import visitTrackingService from '../services/visitTrackingService';

interface UseVisitTrackingOptions {
  enabled?: boolean;
  trackPageViews?: boolean;
  trackEvents?: boolean;
  userId?: string;
  sessionTimeout?: number; // in minutes
  excludePaths?: string[];
  includeHash?: boolean;
  trackOnMount?: boolean;
}

interface UseVisitTrackingReturn {
  trackVisit: (additionalData?: Record<string, any>) => Promise<void>;
  trackEvent: (eventName: string, metadata?: Record<string, any>) => Promise<void>;
  setUserId: (userId: string) => void;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  sessionId: string;
}

export const useVisitTracking = (
  options: UseVisitTrackingOptions = {}
): UseVisitTrackingReturn => {
  const {
    enabled = true,
    trackPageViews = true,
    trackEvents = true,
    userId,
    sessionTimeout = 30,
    excludePaths = [],
    includeHash = false,
    trackOnMount = true
  } = options;

  const location = useLocation();
  const lastTrackedPath = useRef<string>('');
  const sessionTimer = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef<boolean>(false);

  // Initialize tracking service
  useEffect(() => {
    if (!isInitialized.current) {
      visitTrackingService.setEnabled(enabled);
      
      if (userId) {
        visitTrackingService.setUserId(userId);
      }
      
      isInitialized.current = true;
    }
  }, [enabled, userId]);

  // Reset session timer
  const resetSessionTimer = useCallback(() => {
    if (sessionTimer.current) {
      clearTimeout(sessionTimer.current);
    }
    
    sessionTimer.current = setTimeout(() => {
      visitTrackingService.resetSession();
    }, sessionTimeout * 60 * 1000);
  }, [sessionTimeout]);

  // Check if path should be excluded
  const shouldExcludePath = useCallback((path: string): boolean => {
    return excludePaths.some(excludePath => {
      if (excludePath.includes('*')) {
        const regex = new RegExp(excludePath.replace(/\*/g, '.*'));
        return regex.test(path);
      }
      return path === excludePath || path.startsWith(excludePath);
    });
  }, [excludePaths]);

  // Get current URL
  const getCurrentUrl = useCallback((): string => {
    const baseUrl = window.location.origin + location.pathname + location.search;
    return includeHash ? baseUrl + location.hash : baseUrl;
  }, [location, includeHash]);

  // Track visit function
  const trackVisit = useCallback(async (additionalData?: Record<string, any>) => {
    if (!enabled || !visitTrackingService.getEnabled()) return;

    const currentUrl = getCurrentUrl();
    const currentPath = location.pathname;

    // Skip if path should be excluded
    if (shouldExcludePath(currentPath)) return;

    try {
      await visitTrackingService.trackVisit({
        url: currentUrl,
        ...additionalData
      });
      
      lastTrackedPath.current = currentPath;
      resetSessionTimer();
    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  }, [enabled, getCurrentUrl, location.pathname, shouldExcludePath, resetSessionTimer]);

  // Track event function
  const trackEvent = useCallback(async (eventName: string, metadata?: Record<string, any>) => {
    if (!enabled || !trackEvents || !visitTrackingService.getEnabled()) return;

    try {
      await visitTrackingService.trackEvent(eventName, {
        url: getCurrentUrl(),
        path: location.pathname,
        ...metadata
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [enabled, trackEvents, getCurrentUrl, location.pathname]);

  // Set user ID function
  const setUserId = useCallback((newUserId: string) => {
    visitTrackingService.setUserId(newUserId);
  }, []);

  // Set enabled function
  const setEnabled = useCallback((newEnabled: boolean) => {
    visitTrackingService.setEnabled(newEnabled);
  }, []);

  // Track page views automatically
  useEffect(() => {
    if (!trackPageViews || !enabled) return;

    const currentPath = location.pathname + location.search + (includeHash ? location.hash : '');
    
    // Check if path should be excluded
    if (excludePaths && excludePaths.some(path => currentPath.includes(path))) {
      return;
    }

    // Only track if this is a different path or enough time has passed
    // The visitTrackingService will handle the cooldown logic internally
    const currentUrl = getCurrentUrl();
    
    // Check if we should track this page (let the service decide based on cooldown)
    if (lastTrackedPath.current !== currentPath) {
      trackVisit();
      lastTrackedPath.current = currentPath;
    }
  }, [location.pathname, location.search, location.hash, trackPageViews, enabled, trackVisit, excludePaths, includeHash, getCurrentUrl]);

  // Track initial page view on mount
  useEffect(() => {
    if (trackOnMount && enabled && trackPageViews) {
      trackVisit();
    }
  }, []); // Only run on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionTimer.current) {
        clearTimeout(sessionTimer.current);
      }
    };
  }, []);

  // Track user interactions for session activity
  useEffect(() => {
    if (!enabled) return;

    const handleUserActivity = () => {
      resetSessionTimer();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [enabled, resetSessionTimer]);

  return {
    trackVisit,
    trackEvent,
    setUserId,
    isEnabled: enabled && visitTrackingService.getEnabled(),
    setEnabled,
    sessionId: visitTrackingService.getSessionId()
  };
};

// Hook for tracking specific events
export const useEventTracking = (enabled: boolean = true) => {
  const { trackEvent, isEnabled } = useVisitTracking({ enabled, trackPageViews: false });

  const trackClick = useCallback((elementName: string, metadata?: Record<string, any>) => {
    trackEvent('click', { element: elementName, ...metadata });
  }, [trackEvent]);

  const trackFormSubmit = useCallback((formName: string, metadata?: Record<string, any>) => {
    trackEvent('form_submit', { form: formName, ...metadata });
  }, [trackEvent]);

  const trackDownload = useCallback((fileName: string, fileType?: string, metadata?: Record<string, any>) => {
    trackEvent('download', { fileName, fileType, ...metadata });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, results?: number, metadata?: Record<string, any>) => {
    trackEvent('search', { query, results, ...metadata });
  }, [trackEvent]);

  const trackPurchase = useCallback((orderId: string, amount?: number, currency?: string, metadata?: Record<string, any>) => {
    trackEvent('purchase', { orderId, amount, currency, ...metadata });
  }, [trackEvent]);

  const trackCustomEvent = useCallback((eventName: string, metadata?: Record<string, any>) => {
    trackEvent(eventName, metadata);
  }, [trackEvent]);

  return {
    trackClick,
    trackFormSubmit,
    trackDownload,
    trackSearch,
    trackPurchase,
    trackCustomEvent,
    isEnabled
  };
};

export default useVisitTracking;