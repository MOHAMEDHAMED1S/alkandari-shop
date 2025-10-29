// Notification utilities for browser notifications and sound alerts
// Updated with modern 2024 implementation

export class NotificationManager {
  private static instance: NotificationManager;
  private notificationSound: HTMLAudioElement | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.initializeAudio();
    this.registerServiceWorker();
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // Register Service Worker for modern notifications
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        console.log('Registering Service Worker...');
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        this.serviceWorkerRegistration = registration;
        console.log('Service Worker registered successfully:', registration);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          console.log('Service Worker update found');
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New Service Worker installed, reloading...');
                window.location.reload();
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    } else {
      console.warn('Service Worker not supported in this browser');
    }
  }

  private initializeAudio() {
    try {
      // Create audio element for notification sound
      this.notificationSound = new Audio();
      // Initialize audio on first user interaction to comply with autoplay policy
      this.initializeAudioOnInteraction();
    } catch (error) {
      console.warn('Failed to initialize notification audio:', error);
    }
  }

  // Initialize audio context on first user interaction
  private initializeAudioOnInteraction() {
    const initAudio = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
        // Remove event listeners after first interaction
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
        document.removeEventListener('touchstart', initAudio);
      } catch (error) {
        console.warn('Failed to initialize audio on interaction:', error);
      }
    };

    // Add event listeners for user interaction
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
  }

  private createNotificationSound() {
    try {
      // Check if AudioContext is suspended and resume it
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume AudioContext if suspended (required for autoplay policy)
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          this.playSoundWithContext(audioContext);
        }).catch(error => {
          console.warn('Failed to resume AudioContext:', error);
        });
      } else {
        this.playSoundWithContext(audioContext);
      }
    } catch (error) {
      console.warn('Failed to create notification sound:', error);
    }
  }

  private playSoundWithContext(audioContext: AudioContext) {
    try {
      // Create a more pleasant notification sound using Web Audio API
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 chord
      const duration = 0.3;
      
      frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.1);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + index * 0.1 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + duration);
        
        oscillator.start(audioContext.currentTime + index * 0.1);
        oscillator.stop(audioContext.currentTime + index * 0.1 + duration);
      });
    } catch (error) {
      console.warn('Failed to play sound with context:', error);
    }
  }

  // Request browser notification permission with modern implementation
  public async requestNotificationPermission(): Promise<boolean> {
    console.log('Requesting notification permission...');
    
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('Notification permission already granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied by user');
      return false;
    }

    try {
      console.log('Requesting notification permission from user...');
      
      // Use modern async/await approach
      const permission = await Notification.requestPermission();
      console.log('Notification permission result:', permission);
      
      if (permission === 'granted') {
        console.log('Notification permission granted successfully');
        
        // Test notification using Service Worker if available
        if (this.serviceWorkerRegistration) {
          await this.showServiceWorkerNotification('تم تفعيل الإشعارات', {
            body: 'ستتلقى إشعارات عند وجود طلبات جديدة',
            icon: '/logo.png',
            tag: 'permission-test'
          });
        } else {
          // Fallback to regular notification
          this.showBrowserNotification('تم تفعيل الإشعارات', {
            body: 'ستتلقى إشعارات عند وجود طلبات جديدة',
            icon: '/logo.png',
            tag: 'permission-test'
          });
        }
      } else {
        console.log('Notification permission denied by user');
      }
      
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Show notification using Service Worker (modern approach)
  public async showServiceWorkerNotification(title: string, options: {
    body?: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
    data?: any;
  } = {}): Promise<void> {
    console.log('Attempting to show Service Worker notification:', { title, options });
    
    if (!this.serviceWorkerRegistration) {
      console.warn('Service Worker not available, falling back to regular notification');
      this.showBrowserNotification(title, options);
      return;
    }

    try {
      // Wait for Service Worker to be ready
      await navigator.serviceWorker.ready;
      
      // Send message to Service Worker to show notification
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          options: {
            body: options.body || '',
            icon: options.icon || '/logo.png',
            badge: '/logo.png',
            tag: options.tag || 'admin-notification',
            requireInteraction: options.requireInteraction || false,
            dir: 'rtl',
            silent: false,
            vibrate: [200, 100, 200],
            data: options.data || {}
          }
        });
        
        console.log('Service Worker notification message sent');
      } else {
        console.warn('No Service Worker controller available');
        this.showBrowserNotification(title, options);
      }
    } catch (error) {
      console.error('Error showing Service Worker notification:', error);
      this.showBrowserNotification(title, options);
    }
  }

  // Show browser notification
  public showBrowserNotification(title: string, options: {
    body?: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
  } = {}): Notification | null {
    console.log('Attempting to show browser notification:', { title, options });
    
    if (!('Notification' in window)) {
      console.warn('Notifications not supported in this browser');
      return null;
    }
    
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted:', Notification.permission);
      console.log('Current permission status:', Notification.permission);
      console.log('Please grant notification permission to receive browser notifications');
      
      // Try to request permission again
      this.requestNotificationPermission().then(granted => {
        if (granted) {
          console.log('Permission granted, retrying notification');
          this.showBrowserNotification(title, options);
        }
      });
      return null;
    }

    try {
      // Ensure we're in a secure context (HTTPS or localhost)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        console.warn('Notifications require HTTPS or localhost');
        return null;
      }

      console.log('Creating notification with options:', {
        title,
        body: options.body || '',
        icon: options.icon || '/logo.png',
        tag: options.tag || 'admin-notification',
        requireInteraction: options.requireInteraction || false,
        dir: 'rtl',
        badge: '/logo.png',
        silent: false
      });

      const notification = new Notification(title, {
        body: options.body || '',
        icon: options.icon || '/logo.png',
        tag: options.tag || 'admin-notification',
        requireInteraction: options.requireInteraction || false,
        dir: 'rtl', // Right-to-left for Arabic
        badge: '/logo.png', // Badge for mobile devices
        silent: false, // Ensure sound is played
      });

      console.log('Browser notification created successfully:', notification);

      // Add event listeners
      notification.onclick = () => {
        console.log('Notification clicked');
        window.focus();
        notification.close();
      };

      notification.onerror = (error) => {
        console.error('Notification error:', error);
      };

      notification.onshow = () => {
        console.log('Notification shown successfully');
      };

      notification.onclose = () => {
        console.log('Notification closed');
      };

      // Auto close after 8 seconds if not requiring interaction
      if (!options.requireInteraction) {
        setTimeout(() => {
          console.log('Auto-closing notification after 8 seconds');
          notification.close();
        }, 8000);
      }

      return notification;
    } catch (error) {
      console.error('Failed to show browser notification:', error);
      return null;
    }
  }

  // Play notification sound
  public playNotificationSound(): void {
    try {
      this.createNotificationSound();
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  // Show notification with sound and browser notification (simplified approach)
  public async showNotification(title: string, message: string, type: 'order' | 'system' | 'info' = 'info'): Promise<void> {
    console.log('Showing notification:', { title, message, type });
    
    // Play sound
    this.playNotificationSound();

    // Show browser notification using traditional approach first
    const icon = type === 'order' ? '/logo.png' : '/logo.png';
    const notificationOptions = {
      body: message,
      icon,
      tag: `admin-${type}-${Date.now()}`, // Unique tag to allow multiple notifications
      requireInteraction: type === 'order', // Orders require interaction
    };

    try {
      // Try Service Worker first, but fallback to traditional notification
      if (this.serviceWorkerRegistration && navigator.serviceWorker.controller) {
        await this.showServiceWorkerNotification(title, notificationOptions);
      } else {
        this.showBrowserNotification(title, notificationOptions);
      }
    } catch (error) {
      console.error('Error showing notification, falling back to traditional:', error);
      // Always fallback to traditional notification
      this.showBrowserNotification(title, notificationOptions);
    }
  }

  // Check notification status and provide helpful information
  public checkNotificationStatus(): {
    supported: boolean;
    permission: NotificationPermission;
    secureContext: boolean;
    canShowNotifications: boolean;
    message: string;
  } {
    const supported = 'Notification' in window;
    const permission = supported ? Notification.permission : 'denied';
    const secureContext = location.protocol === 'https:' || 
                         location.hostname === 'localhost' || 
                         location.hostname === '127.0.0.1';
    const canShowNotifications = supported && permission === 'granted' && secureContext;
    
    let message = '';
    if (!supported) {
      message = 'المتصفح لا يدعم الإشعارات';
    } else if (!secureContext) {
      message = 'الإشعارات تتطلب HTTPS أو localhost';
    } else if (permission === 'denied') {
      message = 'تم رفض صلاحيات الإشعارات - يرجى تفعيلها من إعدادات المتصفح';
    } else if (permission === 'default') {
      message = 'لم يتم طلب صلاحيات الإشعارات بعد';
    } else if (permission === 'granted') {
      message = 'الإشعارات مفعلة وجاهزة للعمل';
    }
    
    console.log('Notification status check:', {
      supported,
      permission,
      secureContext,
      canShowNotifications,
      message
    });
    
    return {
      supported,
      permission,
      secureContext,
      canShowNotifications,
      message
    };
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();

// Utility functions
export const requestNotificationPermission = () => notificationManager.requestNotificationPermission();
export const showNotification = (title: string, message: string, type?: 'order' | 'system' | 'info') => 
  notificationManager.showNotification(title, message, type);
export const playNotificationSound = () => notificationManager.playNotificationSound();
export const checkNotificationStatus = () => notificationManager.checkNotificationStatus();