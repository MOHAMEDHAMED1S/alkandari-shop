import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally for Laravel Echo
(window as any).Pusher = Pusher;

// Initialize Laravel Echo with Pusher configuration
const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  forceTLS: import.meta.env.VITE_PUSHER_SCHEME === 'https',
  host: import.meta.env.VITE_PUSHER_HOST,
  port: import.meta.env.VITE_PUSHER_PORT,
  wsHost: import.meta.env.VITE_PUSHER_HOST,
  wsPort: import.meta.env.VITE_PUSHER_PORT,
  wssPort: import.meta.env.VITE_PUSHER_PORT,
  disableStats: true,
  encrypted: true,
  enabledTransports: ['ws', 'wss'],
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
    },
  },
});

export default echo;

// Function to update auth token when it changes
export const updateEchoAuth = (token: string) => {
  if (echo.connector && 'pusher' in echo.connector) {
    (echo.connector as any).pusher.config.auth = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
};

// Function to show notification toast
export const showNotification = (notification: any) => {
  const { title, message, priority } = notification;
  
  // Determine toast duration based on priority
  let duration = 4000; // default 4 seconds
  if (priority === 'high') {
    duration = 8000; // 8 seconds for high priority
  } else if (priority === 'low') {
    duration = 2000; // 2 seconds for low priority
  }

  // You can integrate with your toast library here
  // For now, we'll use browser notification if available
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/favicon.ico',
      tag: `notification-${notification.id}`,
    });
  }

  // Also log to console for debugging
  console.log('New notification:', { title, message, priority, duration });
};