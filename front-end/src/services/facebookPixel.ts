import ReactPixel from 'react-facebook-pixel';

// Facebook Pixel ID from the provided code
const PIXEL_ID = '667200866159106';

interface PixelEventData {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  num_items?: number;
  search_string?: string;
  status?: boolean;
}

class FacebookPixelService {
  private isInitialized = false;

  /**
   * Initialize Facebook Pixel
   */
  init(): void {
    if (typeof window !== 'undefined' && !this.isInitialized) {
      const options = {
        autoConfig: true,
        debug: process.env.NODE_ENV === 'development',
      };

      ReactPixel.init(PIXEL_ID, undefined, options);
      ReactPixel.pageView();
      this.isInitialized = true;
      
      console.log('Facebook Pixel initialized with ID:', PIXEL_ID);
    }
  }

  /**
   * Track page view
   */
  trackPageView(): void {
    if (this.isInitialized) {
      ReactPixel.pageView();
    }
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, data?: PixelEventData): void {
    if (this.isInitialized) {
      ReactPixel.track(eventName, data);
    }
  }

  /**
   * Track ViewContent event (when user views a product)
   */
  trackViewContent(data: {
    content_name: string;
    content_category?: string;
    content_ids: string[];
    content_type?: string;
    value?: number;
    currency?: string;
  }): void {
    this.trackEvent('ViewContent', {
      content_name: data.content_name,
      content_category: data.content_category,
      content_ids: data.content_ids,
      content_type: data.content_type || 'product',
      value: data.value,
      currency: data.currency || 'KWD',
    });
  }

  /**
   * Track AddToCart event
   */
  trackAddToCart(data: {
    content_name: string;
    content_category?: string;
    content_ids: string[];
    value: number;
    currency?: string;
  }): void {
    this.trackEvent('AddToCart', {
      content_name: data.content_name,
      content_category: data.content_category,
      content_ids: data.content_ids,
      content_type: 'product',
      value: data.value,
      currency: data.currency || 'KWD',
    });
  }

  /**
   * Track InitiateCheckout event
   */
  trackInitiateCheckout(data: {
    content_ids: string[];
    value: number;
    currency?: string;
    num_items: number;
  }): void {
    this.trackEvent('InitiateCheckout', {
      content_ids: data.content_ids,
      content_type: 'product',
      value: data.value,
      currency: data.currency || 'KWD',
      num_items: data.num_items,
    });
  }

  /**
   * Track Purchase event
   */
  trackPurchase(data: {
    content_ids: string[];
    value: number;
    currency?: string;
    num_items: number;
  }): void {
    this.trackEvent('Purchase', {
      content_ids: data.content_ids,
      content_type: 'product',
      value: data.value,
      currency: data.currency || 'KWD',
      num_items: data.num_items,
    });
  }

  /**
   * Track Search event
   */
  trackSearch(searchString: string): void {
    this.trackEvent('Search', {
      search_string: searchString,
    });
  }

  /**
   * Track AddToWishlist event
   */
  trackAddToWishlist(data: {
    content_name: string;
    content_category?: string;
    content_ids: string[];
    value?: number;
    currency?: string;
  }): void {
    this.trackEvent('AddToWishlist', {
      content_name: data.content_name,
      content_category: data.content_category,
      content_ids: data.content_ids,
      content_type: 'product',
      value: data.value,
      currency: data.currency || 'KWD',
    });
  }

  /**
   * Track Lead event (for newsletter signup, contact form, etc.)
   */
  trackLead(): void {
    this.trackEvent('Lead');
  }

  /**
   * Track CompleteRegistration event
   */
  trackCompleteRegistration(): void {
    this.trackEvent('CompleteRegistration', {
      status: true,
    });
  }

  /**
   * Track Contact event
   */
  trackContact(): void {
    this.trackEvent('Contact');
  }
}

// Export singleton instance
export const facebookPixel = new FacebookPixelService();
export default facebookPixel;