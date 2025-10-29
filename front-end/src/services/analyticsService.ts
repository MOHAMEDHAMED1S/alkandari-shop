/**
 * Analytics Service
 * Handles fetching analytics data from the API
 */

import { api } from '../lib/api';
import { handleApiError } from '../lib/apiErrorHandler';

// Types for analytics data
export interface GeneralStats {
  total_visits: number;
  unique_visitors: number;
  visits_by_referer_type: {
    other: number;
    direct: number;
  };
  top_referer_domains: Array<{
    referer_domain: string;
    count: number;
  }>;
  daily_visits: Array<{
    date: string;
    visits: number;
    unique_visitors: number;
  }>;
  popular_pages: Array<{
    page_url: string;
    page_title: string | null;
    visits: number;
  }>;
  date_range: {
    start: string;
    end: string;
  };
}

export interface RealTimeStats {
  total_visits_24h: number;
  unique_visitors_24h: number;
  visits_by_referer_type: {
    other: number;
    direct: number;
  };
  hourly_visits: Array<{
    hour: number;
    visits: number;
  }>;
  top_pages_24h: Array<{
    page_url: string;
    page_title: string | null;
    visits: number;
  }>;
}

export interface RefererStats {
  referer_domain: string;
  count: number;
}

export interface PopularPage {
  page_url: string;
  page_title: string | null;
  visits: number;
}

export interface DailyVisit {
  date: string;
  visits: number;
  unique_visitors: number;
}

export interface DeviceStats {
  devices: Array<{
    device_type: string;
    visits: number;
  }>;
  browsers: Array<{
    browser: string;
    visits: number;
  }>;
  operating_systems: Array<{
    os: string;
    visits: number;
  }>;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  page?: string;
  referrer?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  country?: string;
  limit?: number;
  format?: 'csv' | 'json';
}

class AnalyticsService {
  constructor() {
    // No need for baseUrl since we're using the centralized api instance
  }

  /**
   * Get general statistics
   */
  async getGeneralStats(filters?: AnalyticsFilters): Promise<GeneralStats> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<{ success: boolean; data: GeneralStats; message: string }>(`/analytics/general?${params}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch general stats');
      }
      
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get real-time statistics
   */
  async getRealTimeStats(): Promise<RealTimeStats> {
    try {
      const response = await api.get<{ success: boolean; data: RealTimeStats; message: string }>('/analytics/realtime');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch real-time stats');
      }
      
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get referer statistics
   */
  async getRefererStats(filters?: AnalyticsFilters): Promise<RefererStats[]> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<{ success: boolean; data: RefererStats[]; message: string }>(`/analytics/referers?${params}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch referer stats');
      }
      
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get top referer domains
   */
  async getTopRefererDomains(filters?: AnalyticsFilters): Promise<Array<{
    domain: string;
    visits: number;
    percentage: number;
  }>> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<{ success: boolean; data: { domains: Array<{ domain: string; visits: number; percentage: number; }> }; message: string }>(`/analytics/referers/domains?${params}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch top referer domains');
      }
      
      return response.data.data.domains || [];
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get popular pages
   */
  async getPopularPages(filters?: AnalyticsFilters): Promise<PopularPage[]> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<{ success: boolean; data: { pages: PopularPage[] }; message: string }>(`/analytics/pages?${params}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch popular pages');
      }
      
      return response.data.data.pages || [];
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get daily visits
   */
  async getDailyVisits(filters?: AnalyticsFilters): Promise<DailyVisit[]> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<{ success: boolean; data: { visits: DailyVisit[] }; message: string }>(`/analytics/daily?${params}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch daily visits');
      }
      
      return response.data.data.visits || [];
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get device statistics
   */
  async getDeviceStats(filters?: AnalyticsFilters): Promise<DeviceStats> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<{ success: boolean; data: DeviceStats; message: string }>(`/analytics/devices?${params}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch device stats');
      }
      
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get country statistics
   */
  async getCountryStats(filters?: AnalyticsFilters): Promise<Array<{
    country: string;
    visits: number;
    percentage: number;
  }>> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<{ success: boolean; data: { countries: Array<{ country: string; visits: number; percentage: number; }> }; message: string }>(`/analytics/countries?${params}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch country stats');
      }
      
      return response.data.data.countries || [];
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get hourly statistics for today
   */
  async getHourlyStats(): Promise<Array<{
    hour: number;
    visits: number;
    uniqueVisitors: number;
  }>> {
    try {
      const response = await api.get<{ success: boolean; data: { hours: Array<{ hour: number; visits: number; uniqueVisitors: number; }> }; message: string }>('/analytics/hourly');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch hourly stats');
      }
      
      return response.data.data.hours || [];
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get search terms (if available from referrers)
   */
  async getSearchTerms(filters?: AnalyticsFilters): Promise<Array<{
    term: string;
    visits: number;
    percentage: number;
  }>> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<{ success: boolean; data: { terms: Array<{ term: string; visits: number; percentage: number; }> }; message: string }>(`/analytics/search-terms?${params}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch search terms');
      }
      
      return response.data.data.terms || [];
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get conversion funnel data
   */
  async getConversionFunnel(filters?: AnalyticsFilters): Promise<Array<{
    step: string;
    visitors: number;
    conversionRate: number;
  }>> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<{ success: boolean; data: { funnel: Array<{ step: string; visitors: number; conversionRate: number; }> }; message: string }>(`/analytics/funnel?${params}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch conversion funnel');
      }
      
      return response.data.data.funnel || [];
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Export analytics data
   */
  async exportData(format: 'csv' | 'json' = 'csv', filters?: AnalyticsFilters): Promise<Blob> {
    try {
      const params = this.buildQueryParams({ ...filters, format });
      const response = await api.get(`/analytics/export?${params}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Build query parameters from filters
   */
  private buildQueryParams(filters?: AnalyticsFilters): string {
    if (!filters) return '';
    
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return params.toString();
  }

  /**
   * Get analytics summary for dashboard
   */
  async getDashboardSummary(filters?: AnalyticsFilters): Promise<{
    general: GeneralStats;
    realTime: RealTimeStats;
    referers: RefererStats[];
    devices: DeviceStats;
    dailyVisits: DailyVisit[];
  }> {
    try {
      const [general, realTime, referers, devices, dailyVisits] = await Promise.all([
        this.getGeneralStats(filters),
        this.getRealTimeStats(),
        this.getRefererStats(filters),
        this.getDeviceStats(filters),
        this.getDailyVisits(filters)
      ]);

      return {
        general,
        realTime,
        referers,
        devices,
        dailyVisits
      };
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  }

  /**
   * Get analytics data with caching
   */
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: now });
    return data;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Create and export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;