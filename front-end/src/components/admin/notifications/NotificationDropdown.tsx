import React from 'react';
import { AdminNotification } from '../../../lib/api';
import NotificationItem from './NotificationItem';

interface NotificationDropdownProps {
  notifications: AdminNotification[];
  token: string;
  onNotificationUpdate: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  token,
  onNotificationUpdate
}) => {
  // Group notifications by date
  const groupNotificationsByDate = (notifications: AdminNotification[]) => {
    const groups: { [key: string]: AdminNotification[] } = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateKey: string;
      
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'اليوم';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'أمس';
      } else {
        dateKey = date.toLocaleDateString('ar-SA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notification);
    });
    
    return groups;
  };

  const groupedNotifications = groupNotificationsByDate(notifications);

  return (
    <div className="divide-y divide-gray-100">
      {Object.entries(groupedNotifications).map(([dateKey, dateNotifications]) => (
        <div key={dateKey}>
          {/* Date Header */}
          <div className="px-3 sm:px-4 py-2 bg-gray-50 border-b border-gray-100">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {dateKey}
            </h4>
          </div>
          
          {/* Notifications for this date */}
          <div>
            {dateNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                token={token}
                onUpdate={onNotificationUpdate}
              />
            ))}
          </div>
        </div>
      ))}
      {/* Extra padding at the bottom to ensure last item is fully visible */}
      <div className="h-2 sm:h-4"></div>
    </div>
  );
};

export default NotificationDropdown;