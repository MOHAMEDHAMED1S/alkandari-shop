import React from 'react';
import { AdminNotification } from '../../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  ShoppingBag, 
  CreditCard, 
  User, 
  AlertCircle, 
  CheckCircle,
  X
} from 'lucide-react';
import { api } from '../../../lib/api';

interface NotificationItemProps {
  notification: AdminNotification;
  token: string;
  onUpdate: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  token,
  onUpdate
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_created':
      case 'order_updated':
        return <ShoppingBag className="w-5 h-5 text-blue-500" />;
      case 'payment_received':
      case 'payment_failed':
        return <CreditCard className="w-5 h-5 text-green-500" />;
      case 'user_registered':
        return <User className="w-5 h-5 text-purple-500" />;
      case 'system_alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order_created':
      case 'order_updated':
        return 'border-r-blue-500';
      case 'payment_received':
        return 'border-r-green-500';
      case 'payment_failed':
        return 'border-r-red-500';
      case 'user_registered':
        return 'border-r-purple-500';
      case 'system_alert':
        return 'border-r-red-500';
      default:
        return 'border-r-gray-500';
    }
  };

  const handleMarkAsRead = async () => {
    if (notification.read_at) return;

    try {
      await api.put(`/admin/notifications/${notification.id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/notifications/${notification.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.payload.created_at), {
    addSuffix: true,
    locale: ar
  });

  return (
    <div 
      className={`
        relative p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-200 
        border-r-4 ${getNotificationColor(notification.type)}
        border border-gray-200 dark:border-gray-700 rounded-lg
        ${!notification.read_at ? 'bg-blue-50/30' : 'bg-white dark:bg-gray-800'}
        shadow-sm hover:shadow-md
      `}
    >
      {/* Status indicators */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2">
          {!notification.read_at && (
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {!notification.read_at && (
            <button
              onClick={handleMarkAsRead}
              className="p-1 sm:p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="تحديد كمقروء"
            >
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="حذف الإشعار"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-1 sm:space-y-2">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">
          {notification.payload.title}
        </h4>
        
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          {notification.payload.message}
        </p>
        
        {/* Details */}
        <div className="flex flex-col gap-1 mt-2 sm:mt-3 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span className="font-medium text-xs">{timeAgo}</span>
            {notification.payload.data?.order_id && (
              <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">
                طلب رقم: {notification.payload.data.order_id}
              </span>
            )}
          </div>
          
           {notification.payload.data?.customer_name && (
             <div className="flex items-center gap-2">
               <span className="font-medium text-xs">{notification.payload.data.customer_name}</span>
               <span className="text-gray-400 text-xs">المستخدم</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;