/**
 * Social Visits Service
 * Handles fetching social media visits analytics data from the API
 */

import { api } from '../lib/api';
import { handleApiError } from '../lib/apiErrorHandler';

// Types for social visits data
export interface SocialVisitResult {
  platform: string;
  visits: number;
  unique_visitors: number;
}

export interface SocialVisitsSummary {
  total_visits: number;
  unique_visitors: number;
  date_range: {
    start_date: string;
    end_date: string;
  };
  platforms_filtered: string[];
}

export interface SocialVisitsResponse {
  success: boolean;
  data: {
    results: SocialVisitResult[];
    summary: SocialVisitsSummary;
  };
  message?: string;
}

export interface SocialVisitsFilters {
  platforms?: string[];
  start_date?: string;
  end_date?: string;
  group_by?: 'date' | 'platform' | 'both';
}

// Platform icons mapping
export const SOCIAL_PLATFORMS = {
  facebook: {
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    bgColor: '#E7F3FF'
  },
  instagram: {
    name: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    bgColor: '#FDF2F8'
  },
  twitter: {
    name: 'Twitter',
    icon: '🐦',
    color: '#1DA1F2',
    bgColor: '#EFF6FF'
  },
  snapchat: {
    name: 'Snapchat',
    icon: '👻',
    color: '#FFFC00',
    bgColor: '#FFFBEB'
  },
  other: {
    name: 'Other',
    icon: '🌐',
    color: '#6B7280',
    bgColor: '#F9FAFB'
  }
} as const;

export type SocialPlatform = keyof typeof SOCIAL_PLATFORMS;

class SocialVisitsService {
  constructor() {
    // No need for baseUrl since we're using the centralized api instance
  }

  /**
   * Get social media visits data
   */
  async getSocialVisits(filters?: SocialVisitsFilters): Promise<SocialVisitsResponse['data']> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<SocialVisitsResponse>(`/analytics/social-visits?${params}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch social visits data');
      }
      
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get social visits for specific platforms
   */
  async getSocialVisitsByPlatforms(platforms: string[], filters?: Omit<SocialVisitsFilters, 'platforms'>): Promise<SocialVisitsResponse['data']> {
    return this.getSocialVisits({ ...filters, platforms });
  }

  /**
   * Get social visits for date range
   */
  async getSocialVisitsByDateRange(startDate: string, endDate: string, filters?: Omit<SocialVisitsFilters, 'start_date' | 'end_date'>): Promise<SocialVisitsResponse['data']> {
    return this.getSocialVisits({ ...filters, start_date: startDate, end_date: endDate });
  }

  /**
   * Get social visits grouped by date
   */
  async getSocialVisitsGroupedByDate(filters?: Omit<SocialVisitsFilters, 'group_by'>): Promise<SocialVisitsResponse['data']> {
    return this.getSocialVisits({ ...filters, group_by: 'date' });
  }

  /**
   * Get social visits grouped by platform and date
   */
  async getSocialVisitsGroupedByBoth(filters?: Omit<SocialVisitsFilters, 'group_by'>): Promise<SocialVisitsResponse['data']> {
    return this.getSocialVisits({ ...filters, group_by: 'both' });
  }

  /**
   * Get platform info by key
   */
  getPlatformInfo(platform: string) {
    return SOCIAL_PLATFORMS[platform as SocialPlatform] || SOCIAL_PLATFORMS.other;
  }

  /**
   * Get all available platforms
   */
  getAllPlatforms() {
    return Object.keys(SOCIAL_PLATFORMS);
  }

  /**
   * Build query parameters from filters
   */
  private buildQueryParams(filters?: SocialVisitsFilters): string {
    if (!filters) return '';
    
    const params = new URLSearchParams();
    
    // Handle platforms array
    if (filters.platforms && filters.platforms.length > 0) {
      filters.platforms.forEach(platform => {
        params.append('platforms[]', platform);
      });
    }
    
    // Handle other parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== 'platforms' && value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return params.toString();
  }

  /**
   * Format date for API
   */
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get default date range (last 30 days)
   */
  getDefaultDateRange(): { start_date: string; end_date: string } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    return {
      start_date: this.formatDate(startDate),
      end_date: this.formatDate(endDate)
    };
  }

  /**
   * Calculate percentage for each platform
   */
  calculatePlatformPercentages(results: SocialVisitResult[]): Array<SocialVisitResult & { percentage: number }> {
    const totalVisits = results.reduce((sum, result) => sum + result.visits, 0);
    
    return results.map(result => ({
      ...result,
      percentage: totalVisits > 0 ? Math.round((result.visits / totalVisits) * 100) : 0
    }));
  }

  /**
   * Sort results by visits (descending)
   */
  sortByVisits(results: SocialVisitResult[]): SocialVisitResult[] {
    return [...results].sort((a, b) => b.visits - a.visits);
  }

  /**
   * Get top platforms by visits
   */
  getTopPlatforms(results: SocialVisitResult[], limit: number = 5): SocialVisitResult[] {
    return this.sortByVisits(results).slice(0, limit);
  }
}

// Create and export singleton instance
export const socialVisitsService = new SocialVisitsService();
export default socialVisitsService;