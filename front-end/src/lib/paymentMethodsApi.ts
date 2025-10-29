import { api } from './api';

// Payment Method Interface
export interface PaymentMethod {
  PaymentMethodId: number;
  PaymentMethodCode: string;
  PaymentMethodEn: string;
  PaymentMethodAr: string;
  ImageUrl: string;
  IsDirectPayment: boolean;
  ServiceCharge: number;
  TotalAmount: number;
  CurrencyIso: string;
  IsEmbeddedSupported: boolean;
  PaymentCurrencyIso: string;
  is_enabled: boolean;
}

// API Response Interfaces
export interface PaymentMethodsResponse {
  success: boolean;
  data: { [key: string]: PaymentMethod };
  message: string;
}

export interface PaymentMethodToggleResponse {
  success: boolean;
  data: PaymentMethod;
  message: string;
}

export interface PaymentMethodSyncResponse {
  success: boolean;
  data: {
    synced_count: number;
    updated_count: number;
    new_count: number;
  };
  message: string;
}

export interface PaymentMethodUpdateResponse {
  success: boolean;
  data: PaymentMethod;
  message: string;
}

// Payment Methods Management APIs
export const getPaymentMethods = async (token: string): Promise<PaymentMethodsResponse> => {
  const response = await api.get<PaymentMethodsResponse>('/admin/payment-methods', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const togglePaymentMethod = async (
  token: string, 
  code: string
): Promise<PaymentMethodToggleResponse> => {
  const response = await api.put<PaymentMethodToggleResponse>(
    `/admin/payment-methods/${code}/toggle`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

export const syncPaymentMethods = async (token: string): Promise<PaymentMethodSyncResponse> => {
  const response = await api.post<PaymentMethodSyncResponse>(
    '/admin/payment-methods/sync',
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

export const updatePaymentMethod = async (
  token: string,
  code: string,
  data: Partial<PaymentMethod>
): Promise<PaymentMethodUpdateResponse> => {
  const response = await api.put<PaymentMethodUpdateResponse>(
    `/admin/payment-methods/${code}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

// Customer-facing API for available payment methods
export const getAvailablePaymentMethods = async (): Promise<PaymentMethodsResponse> => {
  const response = await api.get<PaymentMethodsResponse>('/payments/methods');
  return response.data;
};

// Error handling utility
export const handlePaymentMethodError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.status === 401) {
    return 'Authentication required. Please log in again.';
  }
  
  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.response?.status === 404) {
    return 'Payment method not found.';
  }
  
  if (error.response?.status === 422) {
    return 'Invalid data provided. Please check your input.';
  }
  
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};