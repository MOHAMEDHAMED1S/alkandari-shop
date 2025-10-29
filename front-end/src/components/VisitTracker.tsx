/**
 * VisitTracker Component
 * Provides automatic visit tracking for the entire application
 */

import React, { useEffect } from 'react';
import { useVisitTracking } from '../hooks/useVisitTracking';

interface VisitTrackerProps {
  enabled?: boolean;
  userId?: string;
  trackPageViews?: boolean;
  trackEvents?: boolean;
  sessionTimeout?: number;
  excludePaths?: string[];
  includeHash?: boolean;
  onTrackingError?: (error: Error) => void;
  onVisitTracked?: (url: string) => void;
  children?: React.ReactNode;
}

export const VisitTracker: React.FC<VisitTrackerProps> = ({
  enabled = true,
  userId,
  trackPageViews = true,
  trackEvents = true,
  sessionTimeout = 30,
  excludePaths = ['/admin/login', '/admin/logout', '/api/*'],
  includeHash = false,
  onTrackingError,
  onVisitTracked,
  children
}) => {
  const { trackVisit, trackEvent, setUserId, isEnabled } = useVisitTracking({
    enabled,
    trackPageViews,
    trackEvents,
    userId,
    sessionTimeout,
    excludePaths,
    includeHash
  });

  // Update user ID when it changes
  useEffect(() => {
    if (userId) {
      setUserId(userId);
    }
  }, [userId, setUserId]);

  // Track custom events based on user interactions
  useEffect(() => {
    if (!isEnabled || !trackEvents) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        trackEvent('page_focus');
      } else {
        trackEvent('page_blur');
      }
    };

    const handleBeforeUnload = () => {
      trackEvent('page_unload');
    };

    const handleOnline = () => {
      trackEvent('connection_online');
    };

    const handleOffline = () => {
      trackEvent('connection_offline');
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isEnabled, trackEvents, trackEvent]);

  // Track scroll depth
  useEffect(() => {
    if (!isEnabled || !trackEvents) return;

    let maxScrollDepth = 0;
    const scrollDepthThresholds = [25, 50, 75, 90, 100];
    const trackedThresholds = new Set<number>();

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);

      if (scrollPercentage > maxScrollDepth) {
        maxScrollDepth = scrollPercentage;

        // Track scroll depth milestones
        scrollDepthThresholds.forEach(threshold => {
          if (scrollPercentage >= threshold && !trackedThresholds.has(threshold)) {
            trackedThresholds.add(threshold);
            trackEvent('scroll_depth', { percentage: threshold });
          }
        });
      }
    };

    const throttledScroll = throttle(handleScroll, 1000);
    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [isEnabled, trackEvents, trackEvent]);

  // Track time on page
  useEffect(() => {
    if (!isEnabled || !trackEvents) return;

    const startTime = Date.now();
    const timeThresholds = [30, 60, 120, 300, 600]; // seconds
    const trackedTimeThresholds = new Set<number>();

    const interval = setInterval(() => {
      const timeOnPage = Math.floor((Date.now() - startTime) / 1000);

      timeThresholds.forEach(threshold => {
        if (timeOnPage >= threshold && !trackedTimeThresholds.has(threshold)) {
          trackedTimeThresholds.add(threshold);
          trackEvent('time_on_page', { seconds: threshold });
        }
      });
    }, 10000); // Check every 10 seconds

    return () => {
      clearInterval(interval);
      
      // Track final time on page
      const finalTime = Math.floor((Date.now() - startTime) / 1000);
      if (finalTime > 5) { // Only track if user stayed for more than 5 seconds
        trackEvent('page_exit', { timeOnPage: finalTime });
      }
    };
  }, [isEnabled, trackEvents, trackEvent]);

  // Track clicks on external links
  useEffect(() => {
    if (!isEnabled || !trackEvents) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href) {
        const url = new URL(link.href);
        const currentDomain = window.location.hostname;

        // Track external link clicks
        if (url.hostname !== currentDomain) {
          trackEvent('external_link_click', {
            url: link.href,
            text: link.textContent?.trim() || '',
            domain: url.hostname
          });
        }

        // Track download links
        const downloadExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar', '.jpg', '.png', '.gif'];
        const isDownload = downloadExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
        
        if (isDownload) {
          trackEvent('file_download', {
            url: link.href,
            fileName: url.pathname.split('/').pop() || '',
            fileType: url.pathname.split('.').pop() || ''
          });
        }
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [isEnabled, trackEvents, trackEvent]);

  // Track form submissions
  useEffect(() => {
    if (!isEnabled || !trackEvents) return;

    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      
      if (form && form.tagName === 'FORM') {
        const formName = form.name || form.id || form.className || 'unnamed_form';
        const formData = new FormData(form);
        const fields = Array.from(formData.keys());

        trackEvent('form_submit', {
          formName,
          fields: fields.length,
          fieldNames: fields
        });
      }
    };

    document.addEventListener('submit', handleSubmit);

    return () => {
      document.removeEventListener('submit', handleSubmit);
    };
  }, [isEnabled, trackEvents, trackEvent]);

  // Error handling
  useEffect(() => {
    if (!onTrackingError) return;

    const handleError = (event: ErrorEvent) => {
      onTrackingError(new Error(event.message));
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [onTrackingError]);

  // This component doesn't render anything visible
  return children ? <>{children}</> : null;
};

// Utility function for throttling
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return (...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

export default VisitTracker;