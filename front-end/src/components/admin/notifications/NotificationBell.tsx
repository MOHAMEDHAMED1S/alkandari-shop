import React, { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import { getAdminNotifications, markAllNotificationsAsRead } from '@/lib/api';
import { AdminNotification } from '@/lib/api';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import NotificationDropdown from './NotificationDropdown';
import { useNotificationPolling } from '@/hooks/useNotificationPolling';

interface NotificationBellProps {
  token: string;
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ token, className = '' }) => {
  console.log('NotificationBell rendering with token:', !!token);
  
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use the new polling hook
  const { stats, refreshNotifications, resetTracking } = useNotificationPolling({
    token,
    interval: 30000, // Check every 30 seconds (increased from 8 seconds)
    onNewNotification: (notification) => {
      console.log('New notification received in NotificationBell:', notification);
      // Refresh the notifications list when new notification arrives
      loadNotifications();
    }
  });

  const unreadCount = stats.unread;
  
  console.log('NotificationBell stats:', { stats, unreadCount });

  // Load notifications
  const loadNotifications = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAdminNotifications(token, {
        page: 1,
        per_page: 20,
        read: false
      });
      
      setNotifications(response.data.notifications.data || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(t('admin.notifications.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && notifications.length === 0) {
      loadNotifications();
    }
  };

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Load notifications on mount and when token changes
  useEffect(() => {
    if (token) {
      console.log('NotificationBell: Token changed, loading notifications');
      // Only load notifications if we don't have any yet
      if (notifications.length === 0) {
        loadNotifications();
      }
    }
  }, [token]);

  // Add a ref to track if we've already loaded notifications for this session
  const hasLoadedNotificationsRef = useRef(false);
  
  // Load notifications only once per session
  useEffect(() => {
    if (token && !hasLoadedNotificationsRef.current) {
      console.log('NotificationBell: First load, loading notifications');
      hasLoadedNotificationsRef.current = true;
      loadNotifications();
    }
  }, [token]);

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (!token || unreadCount === 0) return;
    
    try {
      await markAllNotificationsAsRead(token);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          read_at: new Date().toISOString()
        }))
      );
      
      // Refresh notifications to get updated stats
      await refreshNotifications();
      
      toast.success(t('admin.notifications.markAllReadSuccess'));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error(t('admin.notifications.markAllReadError'));
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all duration-300 rounded-2xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:shadow-lg hover:scale-105 group"
        aria-label={t('admin.notifications.title')}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-sm group-hover:scale-110 transition-transform duration-300"></div>
          <Bell className="relative w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
        </div>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5 shadow-lg animate-pulse border-2 border-white dark:border-slate-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}

{isOpen && (
  <div
    className={`absolute ${
      isRTL 
        ? 'left-1/4 transform -translate-x-1/2 sm:left-0 sm:right-auto sm:transform-none' 
        : 'left-1/4 transform -translate-x-1/2 sm:right-0 sm:left-auto sm:transform-none'
    } mt-2 w-80 sm:w-96 max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)]
    bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl
    shadow-slate-200/30 dark:shadow-slate-900/30 border border-slate-200/50 
    dark:border-slate-700/50 z-50 max-h-80 sm:max-h-96 overflow-hidden`}
  >
          {/* Header */}
          <div className={`flex items-center justify-between p-4 sm:p-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {isRTL ? (
              <>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className={`flex items-center gap-3 flex-row-reverse`}>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm font-semibold text-primary hover:text-primary/80 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-300 hover:scale-105"
                    >
                      {t('admin.notifications.markAllRead')}
                    </button>
                  )}
                </div>
                <h3 className={`text-base sm:text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent text-right`}>
                  {t('admin.notifications.title')}
                </h3>
              </>
            ) : (
              <>
                <h3 className={`text-base sm:text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent text-left`}>
                  {t('admin.notifications.title')}
                </h3>
                <div className={`flex items-center gap-3`}>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm font-semibold text-primary hover:text-primary/80 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-300 hover:scale-105"
                    >
                      {t('admin.notifications.markAllRead')}
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="max-h-60 sm:max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent overscroll-contain">
            {loading ? (
              <div className="flex items-center justify-center p-6 sm:p-8">
                <div className="relative">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-4 border-primary/20 border-t-primary"></div>
                  <div className="absolute inset-0 rounded-full h-6 w-6 sm:h-8 sm:w-8 border-4 border-transparent border-t-primary/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 sm:p-6 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-4">
                  <p className="text-red-600 dark:text-red-400 font-semibold mb-3">{error}</p>
                  <button
                    onClick={loadNotifications}
                    className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-300 hover:scale-105 font-semibold"
                  >
                    {t('admin.notifications.retry')}
                  </button>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-sm"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
                    <Bell className="w-4 h-4 sm:w-6 sm:h-6 text-primary/60" />
                  </div>
                </div>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold">{t('admin.notifications.noNotifications')}</p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mt-1">{t('admin.notifications.newNotificationsWillAppear')}</p>
              </div>
            ) : (
              <div className="pb-4">
                <NotificationDropdown
                  notifications={notifications}
                  token={token}
                  onNotificationUpdate={() => {
                    loadNotifications();
                    refreshNotifications();
                  }}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 sm:p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to notifications page if exists
                }}
                className="w-full text-center text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-300 hover:scale-105 py-2 px-3 sm:px-4 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10"
              >
                {t('admin.notifications.viewAll')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;