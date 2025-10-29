import { api } from '../lib/api';
import { handleApiError } from '../lib/apiErrorHandler';

/**
 * Visit Tracking Service
 * Handles automatic visit tracking, referrer tracking, and pixel tracking
 */

interface VisitData {
  url: string;
  referrer_url?: string;
  userAgent?: string;
  timestamp?: string;
  sessionId?: string;
  userId?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  ip?: string;
  page_title?: string;
  retryCount?: number;
  lastRetryAt?: number;
}

interface PixelTrackingData {
  event: string;
  url: string;
  referrer_url?: string;
  userAgent?: string;
  timestamp?: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  page_title?: string;
  retryCount?: number;
  lastRetryAt?: number;
}

class VisitTrackingService {
  private sessionId: string;
  private isEnabled: boolean;
  private trackingQueue: VisitData[] = [];
  private pixelQueue: PixelTrackingData[] = [];
  private isProcessing: boolean = false;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_BASE = 1000; // 1 second base delay
  private readonly MAX_QUEUE_SIZE = 100;
  
  // Smart tracking properties
  private visitedPages: Map<string, { timestamp: number; count: number }> = new Map();
  private readonly VISIT_COOLDOWN = 30000; // 30 seconds cooldown for same page
  private readonly SESSION_STORAGE_KEY = 'visit_tracking_session';

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = true;
    
    // Load visited pages from session storage
    this.loadVisitedPagesFromStorage();

    // Process queues periodically
    setInterval(() => this.processQueues(), 30000); // Every 30 seconds

    // Process queues before page unload
    window.addEventListener('beforeunload', () => {
      this.processQueues(true);
      this.saveVisitedPagesToStorage();
    });
    
    // Save visited pages periodically
    setInterval(() => this.saveVisitedPagesToStorage(), 60000); // Every minute
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Detect device type based on user agent
   */
  private detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/tablet|ipad|playbook|silk/.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  /**
   * Detect browser from user agent
   */
  private detectBrowser(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    
    return 'Unknown';
  }

  /**
   * Detect operating system from user agent
   */
  private detectOS(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    
    return 'Unknown';
  }

  /**
   * Get the full referrer URL, excluding internal site references
   * @returns The full referrer URL or null if no external referrer
   */
  private getReferrerUrl(): string | null {
    try {
      const referrer = document.referrer;
      
      if (!referrer) {
        return null;
      }

      const referrerUrl = new URL(referrer);
      const currentUrl = new URL(window.location.href);
      
      // Exclude internal referrers (same hostname)
      if (referrerUrl.hostname === currentUrl.hostname) {
        return null;
      }
      
      return referrer;
    } catch (error) {
      console.warn('Error getting referrer URL:', error);
      return null;
    }
  }

  /**
   * Track a visit to the current page
   */
  async trackVisit(additionalData?: Partial<VisitData>): Promise<void> {
    if (!this.isEnabled) return;

    const url = window.location.href;
    
    // Smart tracking: check if we should track this page visit
    if (!this.shouldTrackPage(url)) {
      console.log('Skipping page tracking due to recent visit:', url);
      return;
    }

    const visitData: VisitData = {
      url,
      referrer_url: this.getReferrerUrl(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.getUserId(),
      deviceType: this.detectDeviceType(),
      browser: this.detectBrowser(),
      os: this.detectOS(),
      page_title: document.title,
      retryCount: 0,
      lastRetryAt: 0,
      ...additionalData
    };

    // Add to queue with size management
    if (this.trackingQueue.length >= this.MAX_QUEUE_SIZE) {
      this.trackingQueue.shift(); // Remove oldest entry
    }
    this.trackingQueue.push(visitData);

    // Process immediately if not already processing
    if (!this.isProcessing) {
      await this.processQueues();
    }
  }

  /**
   * Track a pixel event
   */
  async trackPixel(event: string, metadata?: Record<string, any>): Promise<void> {
    if (!this.isEnabled) return;

    // Don't track admin pages
    const currentUrl = window.location.href;
    const urlObj = new URL(currentUrl);
    if (urlObj.pathname.startsWith('/admin')) {
      console.log('Skipping admin page pixel tracking:', currentUrl);
      return;
    }

    const pixelData: PixelTrackingData = {
      event,
      url: currentUrl,
      referrer_url: this.getReferrerUrl(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      page_title: document.title,
      metadata
    };

    // Prevent queue overflow
    if (this.pixelQueue.length >= this.MAX_QUEUE_SIZE) {
      console.warn('Pixel tracking queue is full, dropping oldest entries');
      this.pixelQueue.splice(0, this.pixelQueue.length - this.MAX_QUEUE_SIZE + 1);
    }

    // Add to queue for batch processing
    this.pixelQueue.push(pixelData);
    
    // Process immediately if queue is getting large
    if (this.pixelQueue.length >= 10) {
      await this.processQueues();
    }
  }

  /**
   * Process tracking queues
   */
  private async processQueues(force: boolean = false): Promise<void> {
    if (this.isProcessing && !force) return;
    if (this.trackingQueue.length === 0 && this.pixelQueue.length === 0) return;

    this.isProcessing = true;

    try {
      // Process visit tracking queue
      if (this.trackingQueue.length > 0) {
        const visits = [...this.trackingQueue];
        this.trackingQueue = [];

        for (const visit of visits) {
          await this.sendVisitData(visit);
        }
      }

      // Process pixel tracking queue
      if (this.pixelQueue.length > 0) {
        const pixels = [...this.pixelQueue];
        this.pixelQueue = [];

        for (const pixel of pixels) {
          await this.sendPixelData(pixel);
        }
      }
    } catch (error) {
      console.error('Error processing tracking queues:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Send visit data to API
   */
  private async sendVisitData(visitData: VisitData): Promise<void> {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/visits/track', visitData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send visit data');
      }
    } catch (error) {
      const retryCount = visitData.retryCount || 0;
      
      if (retryCount < this.MAX_RETRIES) {
        // Calculate exponential backoff delay
        const delay = this.RETRY_DELAY_BASE * Math.pow(2, retryCount);
        
        // Add retry metadata
        const retryData: VisitData = {
          ...visitData,
          retryCount: retryCount + 1,
          lastRetryAt: Date.now()
        };
        
        // Re-add to queue for retry with delay
        setTimeout(() => {
          if (this.trackingQueue.length < this.MAX_QUEUE_SIZE) {
            this.trackingQueue.unshift(retryData);
          }
        }, delay);
        
        console.warn(`Visit tracking failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
      } else {
        console.error('Visit tracking failed after maximum retries:', error);
        handleApiError(error, false); // Don't show toast for tracking errors
      }
    }
  }

  /**
   * Send pixel data to API
   */
  private async sendPixelData(pixelData: PixelTrackingData): Promise<void> {
    try {
      const response = await api.post('/visits/pixel', pixelData);
      
      // For pixel tracking, consider any 200 status as success
      // The response might be binary data, not JSON
      if (response.status === 200) {
        return; // Success
      }
      
      throw new Error(`Pixel tracking failed with status: ${response.status}`);
    } catch (error) {
      const retryCount = pixelData.retryCount || 0;
      
      if (retryCount < this.MAX_RETRIES) {
        // Calculate exponential backoff delay
        const delay = this.RETRY_DELAY_BASE * Math.pow(2, retryCount);
        
        // Add retry metadata
        const retryData: PixelTrackingData = {
          ...pixelData,
          retryCount: retryCount + 1,
          lastRetryAt: Date.now()
        };
        
        // Re-add to queue for retry with delay
        setTimeout(() => {
          if (this.pixelQueue.length < this.MAX_QUEUE_SIZE) {
            this.pixelQueue.unshift(retryData);
          }
        }, delay);
        
        console.warn(`Pixel tracking failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
      } else {
        console.error('Pixel tracking failed after maximum retries:', error);
        handleApiError(error, false); // Don't show toast for tracking errors
      }
    }
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string): void {
    // Update session storage or local storage if needed
    sessionStorage.setItem('visit_tracking_user_id', userId);
  }

  /**
   * Get current user ID
   */
  getUserId(): string | undefined {
    return sessionStorage.getItem('visit_tracking_user_id') || undefined;
  }

  /**
   * Enable or disable tracking
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if tracking is enabled
   */
  getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Reset session (generate new session ID)
   */
  resetSession(): void {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Track page view (convenience method)
   */
  async trackPageView(): Promise<void> {
    await this.trackVisit();
  }

  /**
   * Track custom event (convenience method)
   */
  async trackEvent(eventName: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackPixel(eventName, metadata);
  }

  /**
   * Load visited pages from session storage
   */
  private loadVisitedPagesFromStorage(): void {
    try {
      const stored = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.visitedPages = new Map(data.visitedPages || []);
      }
    } catch (error) {
      console.warn('Failed to load visited pages from storage:', error);
      this.visitedPages = new Map();
    }
  }

  /**
   * Save visited pages to session storage
   */
  private saveVisitedPagesToStorage(): void {
    try {
      const data = {
        visitedPages: Array.from(this.visitedPages.entries()),
        sessionId: this.sessionId
      };
      sessionStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save visited pages to storage:', error);
    }
  }

  /**
   * Check if a page should be tracked (smart tracking)
   */
  private shouldTrackPage(url: string): boolean {
    // Don't track admin pages
    const urlObj = new URL(url);
    if (urlObj.pathname.startsWith('/admin')) {
      console.log('Skipping admin page tracking:', url);
      return false;
    }

    const now = Date.now();
    const pageData = this.visitedPages.get(url);

    if (!pageData) {
      // First visit to this page in this session
      this.visitedPages.set(url, { timestamp: now, count: 1 });
      return true;
    }

    // Check if enough time has passed since last visit
    if (now - pageData.timestamp < this.VISIT_COOLDOWN) {
      // Too soon, don't track
      return false;
    }

    // Update the page data
    this.visitedPages.set(url, { timestamp: now, count: pageData.count + 1 });
    return true;
  }

  /**
   * Clear visited pages data (for testing or manual reset)
   */
  clearVisitedPages(): void {
    this.visitedPages.clear();
    try {
      sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear visited pages from storage:', error);
    }
  }
}

// Create and export singleton instance
export const visitTrackingService = new VisitTrackingService();
export default visitTrackingService;