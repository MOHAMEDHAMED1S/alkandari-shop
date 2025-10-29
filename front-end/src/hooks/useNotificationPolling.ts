import { useState, useEffect, useRef } from 'react';
import { getAdminNotifications } from '@/lib/api';
import { toast } from 'sonner';
import { showNotification, checkNotificationStatus } from '@/utils/notifications';

interface NotificationPollingOptions {
  token: string;
  interval?: number; // milliseconds
  onNewNotification?: (notification: any) => void;
}

interface NotificationStats {
  total: number;
  unread: number;
  read: number;
}

export const useNotificationPolling = ({
  token,
  interval = 10000, // 10 seconds default
  onNewNotification
}: NotificationPollingOptions) => {
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    read: 0
  });
  
  const [isPolling, setIsPolling] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousNotificationsRef = useRef<any[]>([]);
  const lastNotificationIdsRef = useRef<Set<number>>(new Set());
  const isProcessingRef = useRef<boolean>(false); // Prevent concurrent processing

  const checkForNewNotifications = async () => {
    if (!token) {
      console.log('No token available for notification polling');
      return;
    }

    // Prevent concurrent processing to avoid infinite loops
    if (isProcessingRef.current) {
      console.log('Already processing notifications, skipping this check');
      return;
    }

    isProcessingRef.current = true;

    try {
      console.log('Checking for new notifications...');
      const response = await getAdminNotifications(token, {
        page: 1,
        per_page: 10,
        read: false // Get unread notifications
      });

      if (response.success) {
        const currentNotifications = response.data.notifications.data || [];
        const currentUnreadCount = response.data.summary.unread_notifications || 0;
        
        console.log('Notification check result:', {
          currentUnreadCount,
          lastNotificationCount,
          notificationsCount: currentNotifications.length
        });
        
        // Update stats
        setStats({
          total: response.data.summary.total_notifications || 0,
          unread: currentUnreadCount,
          read: response.data.summary.read_notifications || 0
        });

        // Compare current notifications with previous ones
        const currentNotificationIds = new Set(currentNotifications.map(n => n.id));
        const previousNotificationIds = new Set(previousNotificationsRef.current.map(n => n.id));
        
        // Check if notifications are exactly the same (no changes)
        const areNotificationsIdentical = 
          currentNotificationIds.size === previousNotificationIds.size &&
          [...currentNotificationIds].every(id => previousNotificationIds.has(id));
        
        console.log('Notification comparison:', {
          currentUnreadCount,
          lastNotificationCount,
          currentNotificationIds: Array.from(currentNotificationIds),
          previousNotificationIds: Array.from(previousNotificationIds),
          areNotificationsIdentical,
          currentCount: currentNotificationIds.size,
          previousCount: previousNotificationIds.size
        });
        
        // If notifications are identical, skip everything
        if (areNotificationsIdentical) {
          console.log('Notifications are identical, skipping update');
          return; // Exit early - no changes needed
        }

        // Additional check: if this is just a language change and we have the same notifications
        // but different counts, don't show notifications again
        if (currentNotificationIds.size === previousNotificationIds.size && 
            currentNotificationIds.size > 0 &&
            [...currentNotificationIds].every(id => previousNotificationIds.has(id))) {
          console.log('Same notifications detected, likely language change - skipping notification display');
          // Update tracking data without showing notifications
          setLastNotificationCount(currentUnreadCount);
          previousNotificationsRef.current = currentNotifications;
          return;
        }
        
        // Find truly new notifications (not seen before)
        const newNotificationIds = new Set();
        currentNotifications.forEach(notification => {
          if (!lastNotificationIdsRef.current.has(notification.id)) {
            newNotificationIds.add(notification.id);
          }
        });
        
        console.log('New notifications detected:', {
          newNotificationIds: Array.from(newNotificationIds),
          hasNewNotifications: newNotificationIds.size > 0
        });
        
        // Only show notifications for truly new ones
        if (newNotificationIds.size > 0) {
          const newNotifications = currentNotifications.filter(n => newNotificationIds.has(n.id));
          
          console.log('Showing new notifications:', {
            count: newNotifications.length,
            notifications: newNotifications.map(n => ({ id: n.id, title: n.payload?.title, type: n.type }))
          });
          
          // Show notifications for each new notification
          for (const notification of newNotifications) {
            const title = notification.payload?.title || 'إشعار جديد';
            const message = notification.payload?.message || '';
            const type = notification.type;
            
            console.log('Showing notification:', { id: notification.id, title, message, type });
            
            // Show toast notification only if not already shown recently
            const notificationKey = `notification_${notification.id}`;
            const lastShown = localStorage.getItem(notificationKey);
            const now = Date.now();
            const shouldShow = !lastShown || (now - parseInt(lastShown)) > 30000; // 30 seconds cooldown
            
            // Additional check: don't show if this notification was already processed in this session
            const sessionKey = `session_${notification.id}`;
            const sessionShown = sessionStorage.getItem(sessionKey);
            const shouldShowInSession = !sessionShown;
            
            if (shouldShow && shouldShowInSession) {
              // Show toast notification
              toast.success(title, {
                description: message,
                duration: notification.payload?.priority === 'high' ? 8000 : 4000,
                style: {
                  direction: 'rtl',
                  textAlign: 'right',
                },
                className: 'rtl-toast',
              });

              // Show browser notification with sound
              await showNotification(
                title,
                message,
                type === 'order_created' || type === 'payment_received' ? 'order' : 'system'
              );
              
              // Store timestamp to prevent re-showing
              localStorage.setItem(notificationKey, now.toString());
              // Store session marker to prevent re-showing in same session
              sessionStorage.setItem(sessionKey, now.toString());
            }

            // Call callback if provided
            if (onNewNotification) {
              onNewNotification(notification);
            }
          }
          
          // Update tracking data IMMEDIATELY after showing notifications
          lastNotificationIdsRef.current = new Set([...lastNotificationIdsRef.current, ...newNotificationIds]);
        }

        // Update tracking data
        setLastNotificationCount(currentUnreadCount);
        previousNotificationsRef.current = currentNotifications;
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    } finally {
      // Always reset processing flag
      isProcessingRef.current = false;
    }
  };

  const startPolling = () => {
    if (isPolling || !token) {
      console.log('Polling already active or no token, skipping start');
      return;
    }
    
    console.log('Starting notification polling...');
    setIsPolling(true);
    
    // Check notification status and request permission if needed
    const checkAndRequestPermission = async () => {
      try {
        const status = checkNotificationStatus();
        console.log('Starting notification polling with status:', status);
        
        if (!status.canShowNotifications) {
          console.log('Cannot show notifications:', status.message);
          // Try to request permission
          const { requestNotificationPermission } = await import('@/utils/notifications');
          const granted = await requestNotificationPermission();
          console.log('Permission request result:', granted);
        } else {
          console.log('Notifications are ready to use');
        }
      } catch (error) {
        console.error('Error checking notification status:', error);
      }
    };
    
    // Check permission status
    checkAndRequestPermission();
    
    // Initial check
    checkForNewNotifications();
    
    // Set up interval with longer delay to prevent spam
    intervalRef.current = setInterval(() => {
      console.log('Polling interval triggered');
      checkForNewNotifications();
    }, interval);
    
    console.log(`Polling started with ${interval}ms interval`);
  };

  const stopPolling = () => {
    console.log('Stopping notification polling...');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('Polling interval cleared');
    }
    setIsPolling(false);
    isProcessingRef.current = false; // Reset processing flag
    console.log('Polling stopped');
  };

  const refreshNotifications = async () => {
    await checkForNewNotifications();
  };

  const resetTracking = () => {
    console.log('Resetting notification tracking');
    setLastNotificationCount(0);
    lastNotificationIdsRef.current.clear();
    previousNotificationsRef.current = [];
    isProcessingRef.current = false; // Reset processing flag
    
    // Clean up old notification timestamps from localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('notification_')) {
        const timestamp = parseInt(localStorage.getItem(key) || '0');
        const now = Date.now();
        // Remove timestamps older than 1 hour
        if (now - timestamp > 3600000) {
          localStorage.removeItem(key);
        }
      }
    });

    // Clean up session storage
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.startsWith('session_')) {
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('Tracking reset complete:', {
      lastNotificationCount: 0,
      lastNotificationIds: Array.from(lastNotificationIdsRef.current),
      previousNotifications: previousNotificationsRef.current.length
    });
  };

  // Add a method to check if we should reset tracking (only on actual login/logout)
  const shouldResetTracking = (newToken: string, oldToken: string | null) => {
    // Only reset if this is a completely new session (no old token)
    return !oldToken && newToken;
  };

  // Auto-start polling when token is available
  useEffect(() => {
    console.log('useEffect triggered for token:', !!token);
    if (token) {
      console.log('Token available, starting polling without resetting tracking');
      // Don't reset tracking here to prevent notification duplication
      // Only start polling if not already active
      if (!isPolling) {
        startPolling();
      }
    } else {
      console.log('No token, stopping polling');
      stopPolling();
    }

    return () => {
      console.log('useEffect cleanup, stopping polling');
      stopPolling();
    };
  }, [token]);

  // Add a separate effect to handle language changes without resetting tracking
  useEffect(() => {
    // This effect runs on every render but doesn't reset tracking
    // It only ensures polling is active if we have a token
    if (token && !isPolling) {
      console.log('Language changed, restarting polling without reset');
      startPolling();
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  return {
    stats,
    isPolling,
    startPolling,
    stopPolling,
    refreshNotifications,
    resetTracking,
    lastNotificationCount
  };
};
