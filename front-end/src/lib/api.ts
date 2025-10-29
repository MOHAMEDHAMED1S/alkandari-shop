import axios from 'axios';

const API_BASE_URL = 'http://backend.test/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: string; // Changed from number to string to match API response
  currency: string;
  is_available: boolean;
  category_id: number;
  images: string[];
  meta?: {
    ingredients?: string | null;
    skin_type?: string | null;
    weight?: string | null;
    dimensions?: string | null;
    brand?: string;
    shade?: string;
    finish?: string;
  };
  created_at: string;
  updated_at: string;
  category: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    is_active?: number;
    sort_order?: number;
    meta_title?: string | null;
    meta_description?: string | null;
    image?: string;
    parent_id?: number | null;
    created_at?: string;
    updated_at?: string;
  };
  // Inventory fields
  has_inventory: boolean;
  stock_quantity: number | null;
  is_in_stock: boolean;
  is_low_stock: boolean;
  // Sizes fields
  has_sizes: boolean;
  sizes?: string[];
  // Discount fields
  has_discount?: boolean;
  discount_percentage?: number;
  discounted_price?: string;
  price_before_discount?: string;
  discount_amount?: string;
  // Legacy properties for backward compatibility
  name?: string;
  oldPrice?: number;
  inStock?: boolean;
  features?: string[];
  specifications?: Record<string, string>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  products_count?: number;
  parent_id?: number | null;
  children?: Category[];
  is_active?: boolean;
  sort_order?: number;
}

export interface CartItem {
  product_id: number;
  quantity: number;
  size?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  governorate: string;
  postal_code: string;
}

export interface CheckoutData {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: ShippingAddress;
  items: CartItem[];
  discount_code?: string;
  shipping_amount: number;
}

export interface OrderTotal {
  subtotal: number;
  shipping_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
}

// Products API
export const getProducts = async (params?: {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
  sort?: string;
}) => {
  const response = await api.get<{ 
    success: boolean; 
    data: {
      current_page: number;
      data: Product[];
      first_page_url: string;
      from: number;
      last_page: number;
      last_page_url: string;
      links: Array<{
        url: string | null;
        label: string;
        page: number | null;
        active: boolean;
      }>;
      next_page_url: string | null;
      path: string;
      per_page: number;
      prev_page_url: string | null;
      to: number;
      total: number;
    };
    message: string;
  }>('/products', { params });
  
  // Transform the response to match the expected format
  return {
    success: response.data.success,
    data: {
      products: response.data.data.data, // The actual products array
      hasMore: response.data.data.next_page_url !== null, // Check if there's a next page
      current_page: response.data.data.current_page,
      last_page: response.data.data.last_page,
      total: response.data.data.total
    },
    message: response.data.message
  };
};

export const getFeaturedProducts = async () => {
  const response = await api.get<{ success: boolean; data: Product[] }>('/products/featured');
  return response.data;
};

export const getProduct = async (slug: string) => {
  const response = await api.get<{ success: boolean; data: Product }>(`/products/${slug}`);
  return response.data;
};

export const getProductById = async (id: string | number) => {
  const response = await api.get<{ success: boolean; data: Product }>(`/products/${id}`);
  return response.data;
};

// Categories API
export const getCategories = async (params?: { parents_only?: boolean; with_children?: boolean }) => {
  const response = await api.get<{ success: boolean; data: Category[] }>('/categories', { params });
  return response.data;
};

export const getCategoryTree = async () => {
  const response = await api.get<{ success: boolean; data: Category[] }>('/categories/tree');
  return response.data;
};

export const getCategoryProducts = async (slug: string, params?: { page?: number; per_page?: number }) => {
  const response = await api.get<{
    success: boolean;
    data: {
      category: Category;
      products: {
        current_page: number;
        data: Product[];
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        links: Array<{
          url: string | null;
          label: string;
          page: number | null;
          active: boolean;
        }>;
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
      };
    };
    message: string;
  }>(`/categories/${slug}/products`, { params });
  return response.data.data;
};

// Checkout API
export const calculateTotal = async (data: {
  items: CartItem[];
  discount_code?: string;
  shipping_amount: number;
}) => {
  const response = await api.post<{ success: boolean; data: OrderTotal }>('/checkout/calculate-total', data);
  return response.data;
};

// Shipping API
export const getShippingCost = async () => {
  const response = await api.get<{ 
    success: boolean; 
    data: { shipping_cost: string }; 
    message: string 
  }>('/shipping/cost');
  return response.data;
};

// Admin Shipping APIs
export const getAllShippingCosts = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: Array<{
      id: number;
      cost: string;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    }>;
    message: string;
  }>('/admin/shipping/', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getActiveShippingCost = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: {
      id: number;
      cost: string;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    };
    message: string;
  }>('/admin/shipping/active', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateShippingCost = async (token: string, cost: number) => {
  const response = await api.put<{
    success: boolean;
    data: {
      id: number;
      cost: string;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    };
    message: string;
  }>('/admin/shipping/update', 
  { cost }, 
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const validateDiscountCode = async (
  code: string, 
  items: CartItem[], 
  customer_phone: string,
  shipping_amount: number
) => {
  const response = await api.post('/checkout/validate-discount', { 
    discount_code: code,
    items,
    customer_phone,
    shipping_amount
  });
  return response.data;
};

// Removed duplicate createOrder function

// Payment API
export interface PaymentMethod {
  PaymentMethodId: number;
  PaymentMethodAr: string;
  PaymentMethodEn: string;
  PaymentMethodCode: string;
  IsDirectPayment: boolean;
  ServiceCharge: number;
  TotalAmount: number;
  CurrencyIso: string;
  ImageUrl: string;
  IsEmbeddedSupported: boolean;
  PaymentCurrencyIso: string;
}

export const getPaymentMethods = async () => {
  const response = await api.get<{
    success: boolean;
    data: { [key: string]: PaymentMethod };
    message: string;
  }>('/payments/methods');
  return response.data;
};

export const initiatePayment = async (data: {
  order_id: number;
  payment_method: string;
  customer_ip: string;
  user_agent?: string;
}) => {
  const response = await api.post<{
    success: boolean;
    data: {
      payment_id: number;
      invoice_id: number;
      payment_url: string;
      order_id: number;
      order_number: string;
      amount: string;
      currency: string;
      redirect_url: string;
    };
    message: string;
  }>('/payments/initiate', data);
  return response.data;
};

export const getPaymentStatus = async (orderId: number) => {
  const response = await api.get<{
    success: boolean;
    data: {
      order_id: number;
      order_number: string;
      status: string;
      payment_status: string;
      amount: string;
      currency: string;
      payment_method: string;
      invoice_id: string;
    };
    message: string;
  }>('/payments/status', {
    params: {
      order_id: orderId,
    },
  });
  return response.data;
};

export const processPaymentCallback = async (data: {
  paymentId: string;
  order_id: number;
}) => {
  const response = await api.post<{
    success: boolean;
    data: {
      order_id: number;
      order_number: string;
      status: string;
      payment_status: string;
      amount: string;
      currency: string;
    };
    message: string;
  }>('/payments/callback', data);
  return response.data;
};

// Payment verification
export const verifyPayment = async (orderId: number) => {
  const response = await api.get<{
    success: boolean;
    data: {
      order_id: number;
      order_number: string;
      status: string;
      payment_status: string;
      amount: string;
      currency: string;
      payment_method: string;
      invoice_id: string;
    };
    message: string;
  }>('/payments/status', {
    params: { order_id: orderId }
  });
  return response.data;
};

export const getOrderDetails = async (orderNumber: string, phone?: string) => {
  const config = phone ? { params: { phone } } : {};
  
  const response = await api.get<{
    success: boolean;
    data: {
      id: number;
      order_number: string;
      customer_name: string;
      customer_phone?: string;
      customer_email?: string;
      subtotal_amount: string;
      discount_amount: string;
      shipping_amount: string;
      total_amount: string;
      currency: string;
      status: string;
      shipping_address?: {
        street: string;
        city: string;
        governorate: string;
        postal_code?: string;
      };
      order_items: Array<{
        id: number;
        product_id: number;
        product_price: string;
        quantity: number;
        size?: string;
        subtotal: string;
        product_snapshot: {
          title: string;
          price: string;
          discounted_price?: string;
          has_discount?: boolean;
          discount_percentage?: number;
          currency: string;
          images: string[];
          description?: string;
        };
      }>;
      payment?: {
        status: string;
        amount: string;
        payment_method?: string;
        invoice_reference?: string;
      };
    };
    message: string;
  }>(`/orders/${orderNumber}`, config);
  
  return response.data;
};

// Order tracking
export const trackOrder = async (orderNumber: string) => {
  const response = await api.get<{
    success: boolean;
    data: {
      order: any;
      timeline: Array<{
        status: string;
        title: string;
        description: string;
        date: string;
        completed: boolean;
      }>;
      status_info: {
        title: string;
        description: string;
        color: string;
        icon: string;
      };
    };
    message: string;
  }>(`/orders/${orderNumber}/track`);
  return response.data;
};

// Create order
export const createOrder = async (orderData: any) => {
  const response = await api.post<{
    success: boolean;
    data: {
      order: any;
      tracking_number: string;
      order_number: string;
      total_amount: number;
      subtotal_amount: number;
      discount_amount: number;
      shipping_amount: number;
      currency: string;
      next_step: string;
    };
    message: string;
  }>('/checkout/create-order', orderData);
  return response.data;
};

export const getOrderDetailsWithPhone = async (orderNumber: string) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>(`/orders/${orderNumber}/details`);
  return response.data;
};

// ===== ADMIN API FUNCTIONS =====

// Admin Authentication
export const adminLogin = async (credentials: { email: string; password: string }) => {
  const response = await api.post<{
    access_token: string;
    token_type: string;
    expires_in: number;
    user: {
      id: number;
      name: string;
      email: string;
      phone: string;
      role: string;
      created_at: string;
      updated_at: string;
    };
  }>('/admin/login', credentials);
  return response.data;
};


// Dashboard APIs
export const getDashboardOverview = async (token: string, period?: number) => {
  const response = await api.get<{
    success: boolean;
    data: {
      overview: any;
      period_stats: any;
      growth: any;
      period: number;
      date_range: any;
    };
    message: string;
  }>('/admin/dashboard/overview', {
    headers: { Authorization: `Bearer ${token}` },
    params: { period }
  });
  return response.data;
};

export const getSalesAnalytics = async (token: string, period?: number, group_by?: string) => {
  const response = await api.get<{
    success: boolean;
    data: {
      sales_data: any[];
      summary: any;
    };
    message: string;
  }>('/admin/dashboard/sales-analytics', {
    headers: { Authorization: `Bearer ${token}` },
    params: { period, group_by }
  });
  return response.data;
};

export const getRealTimeStats = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: {
      online_visitors: number;
      current_orders: number;
      today_revenue: string;
      today_orders: number;
      recent_activities: any[];
    };
    message: string;
  }>('/admin/dashboard/real-time-stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getSystemHealth = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: {
      database: any;
      storage: any;
      api_response_time: any;
      last_backup: string;
      system_load: any;
    };
    message: string;
  }>('/admin/dashboard/system-health', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Categories Management APIs
export const getAdminCategories = async (token: string, params?: {
  search?: string;
  parent_id?: number;
  is_active?: boolean;
  sort_by?: string;
  sort_direction?: string;
  per_page?: number;
  page?: number;
}) => {
  console.log('API: getAdminCategories called with params:', params);
  
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>('/admin/categories', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  
  console.log('API: getAdminCategories response:', response.data);
  return response.data;
};

export const getAdminCategoryTree = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: any[];
    message: string;
  }>('/admin/categories/tree', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getCategoryStatistics = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>('/admin/categories/statistics', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createCategory = async (token: string, data: {
  name: string;
  description?: string;
  parent_id?: number;
  image?: string;
  is_active?: boolean;
  sort_order?: number;
  meta_title?: string;
  meta_description?: string;
}) => {
  const response = await api.post<{
    success: boolean;
    data: any;
    message: string;
  }>('/admin/categories', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getCategory = async (token: string, id: number) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/categories/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateCategory = async (token: string, id: number, data: any) => {
  const response = await api.put<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/categories/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteCategory = async (token: string, id: number) => {
  const response = await api.delete<{
    success: boolean;
    message: string;
  }>(`/admin/categories/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const toggleCategoryStatus = async (token: string, id: number) => {
  const response = await api.put<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/categories/${id}/toggle-status`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateCategorySortOrder = async (token: string, categories: Array<{id: number; sort_order: number}>) => {
  const response = await api.post<{
    success: boolean;
    message: string;
  }>('/admin/categories/update-sort-order', { categories }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Products Management APIs
export const getAdminProducts = async (token: string, params?: {
  category_id?: number;
  is_available?: boolean;
  search?: string;
  sort_by?: string;
  sort_direction?: string;
  per_page?: number;
  page?: number;
}) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>('/admin/products', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const getProductStatistics = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>('/admin/products/statistics', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createProduct = async (token: string, data: {
  title: string;
  description?: string;
  short_description?: string;
  price: string;
  currency?: string;
  is_available?: boolean;
  has_sizes?: boolean;
  sizes?: string[];
  category_id: number;
  images?: string[];
  meta?: any;
}) => {
  const response = await api.post<{
    success: boolean;
    data: any;
    message: string;
  }>('/admin/products', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getAdminProduct = async (token: string, id: number) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateProduct = async (token: string, id: number, data: any) => {
  const response = await api.put<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/products/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteProduct = async (token: string, id: number) => {
  const response = await api.delete<{
    success: boolean;
    message: string;
  }>(`/admin/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const bulkUpdateProducts = async (token: string, data: {
  product_ids: number[];
  action: string;
}) => {
  const response = await api.post<{
    success: boolean;
    data: any;
    message: string;
  }>('/admin/products/bulk-update', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const duplicateProduct = async (token: string, id: number) => {
  const response = await api.post<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/products/${id}/duplicate`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateProductImages = async (token: string, id: number, images: string[]) => {
  const response = await api.put<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/products/${id}/images`, { images }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// New Export API endpoints based on documentation
export const createProductExport = async (token: string, data: {
  format: 'json' | 'csv' | 'excel' | 'xlsx';
  limit?: number;
  filters?: {
    category_id?: number;
    is_available?: boolean;
    min_price?: number;
    max_price?: number;
    stock_quantity?: {
      min?: number;
      max?: number;
    };
  };
}) => {
  const response = await api.post<{
    success: boolean;
    export_id: string;
    download_url: string;
    file_name: string;
    file_path: string;
    records_count: number;
    estimated_completion: string;
  }>('/admin/exports/products', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Legacy export function for backward compatibility
export const exportProducts = async (token: string, params?: {
  format?: string;
  category_id?: number;
}) => {
  const response = await api.get('/admin/products/export', {
    headers: { Authorization: `Bearer ${token}` },
    params,
    responseType: 'blob'
  });
  return response;
};

// Orders Management APIs
export const getAdminOrders = async (token: string, params?: {
  status?: string;
  search?: string;
  sort_by?: string;
  sort_direction?: string;
  per_page?: number;
  page?: number;
  start_date?: string;
  end_date?: string;
}) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>('/admin/orders', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const getOrderStatistics = async (token: string, params?: {
  search?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>('/admin/orders/statistics', {
    headers: { Authorization: `Bearer ${token}` },
    params: params
  });
  return response.data;
};

export const getAdminOrder = async (token: string, id: number) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateOrderStatus = async (token: string, id: number, data: {
  status: string;
  admin_notes?: string;
  tracking_number?: string;
  shipping_date?: string;
  delivery_date?: string;
}) => {
  const response = await api.put<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/orders/${id}/update-status`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const bulkUpdateOrders = async (token: string, data: {
  order_ids: number[];
  status: string;
  admin_notes?: string;
}) => {
  const response = await api.post<{
    success: boolean;
    data: any;
    message: string;
  }>('/admin/order-management/bulk-update-status', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Payment Verification APIs - Comprehensive Version
export interface OverallSummary {
  total_orders_checked: number;
  critical_issues_found: number;
  verification_timestamp: string;
}

export interface AwaitingPaymentSummary {
  total_checked: number;
  paid_but_not_updated: number;
  correctly_pending: number;
  errors: number;
}

export interface CompletedOrdersSummary {
  total_checked: number;
  correctly_paid: number;
  not_paid_but_marked: number;
  errors: number;
}

export interface CriticalIssueOrder {
  order_id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  total_amount: string;
  currency: string;
  invoice_reference: string;
  database_status: string;
  myfatoorah_status: string;
  order_created_at: string;
  payment_date?: string;
  items_count: number;
  issue: 'PAID_BUT_NOT_UPDATED' | 'MARKED_AS_PAID_BUT_NOT_PAID';
  severity: 'CRITICAL';
}

export interface CorrectlyPendingOrder {
  order_id: number;
  order_number: string;
  myfatoorah_status: string;
  invoice_reference: string;
}

export interface CorrectlyPaidOrder {
  order_id: number;
  order_number: string;
  database_status: string;
  myfatoorah_status: string;
  verified: boolean;
}

export interface PaymentVerificationError {
  order_id: number;
  order_number: string;
  invoice_reference: string;
  error: string;
}

export interface AwaitingPaymentSection {
  summary: AwaitingPaymentSummary;
  critical_issues: CriticalIssueOrder[];
  correctly_pending: CorrectlyPendingOrder[];
  errors: PaymentVerificationError[];
}

export interface CompletedOrdersSection {
  summary: CompletedOrdersSummary;
  critical_issues: CriticalIssueOrder[];
  correctly_paid: CorrectlyPaidOrder[];
  errors: PaymentVerificationError[];
}

export interface ComprehensivePaymentVerificationResponse {
  success: boolean;
  data: {
    overall_summary: OverallSummary;
    awaiting_payment_section: AwaitingPaymentSection;
    completed_orders_section: CompletedOrdersSection;
  };
  message: string;
}

export const verifyPendingPayments = async (token: string) => {
  const response = await api.get<ComprehensivePaymentVerificationResponse>(
    '/admin/payments/verify-pending',
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

export const getOrderTimeline = async (token: string, id: number) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/orders/${id}/timeline`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createOrderExport = async (token: string, data: {
  format: 'json' | 'csv' | 'excel' | 'xlsx';
  limit?: number;
  filters?: {
    status?: string;
    payment_status?: string;
    date_from?: string;
    date_to?: string;
    min_amount?: number;
    max_amount?: number;
    customer_id?: number;
  };
}) => {
  const response = await api.post<{
    success: boolean;
    export_id: string;
    download_url: string;
    file_name: string;
    file_path: string;
    records_count: number;
    estimated_completion: string;
  }>('/admin/exports/orders', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Legacy export function for backward compatibility
export const exportOrders = async (token: string, params?: {
  format?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}) => {
  const response = await api.get('/admin/orders/export', {
    headers: { Authorization: `Bearer ${token}` },
    params,
    responseType: 'blob'
  });
  return response;
};

// Discount Codes Management APIs
export const getAdminDiscountCodes = async (token: string, params?: {
  search?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_direction?: string;
  per_page?: number;
  page?: number;
}) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>('/admin/discount-codes', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const getDiscountCodeStatistics = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>('/admin/discount-codes/statistics', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createDiscountCode = async (token: string, data: {
  code: string;
  name: string;
  description?: string;
  type: string;
  value: number;
  minimum_order_amount?: number;
  maximum_discount_amount?: number;
  usage_limit?: number;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  applicable_categories?: number[];
  applicable_products?: number[];
  first_time_only?: boolean;
  new_customer_only?: boolean;
  admin_notes?: string;
}) => {
  const response = await api.post<{
    success: boolean;
    data: any;
    message: string;
  }>('/admin/discount-codes', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getAdminDiscountCode = async (token: string, id: number) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/discount-codes/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateDiscountCode = async (token: string, id: number, data: any) => {
  const response = await api.put<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/discount-codes/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteDiscountCode = async (token: string, id: number) => {
  const response = await api.delete<{
    success: boolean;
    message: string;
  }>(`/admin/discount-codes/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const toggleDiscountCodeStatus = async (token: string, id: number) => {
  const response = await api.put<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/discount-codes/${id}/toggle-status`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getDiscountCodeUsage = async (token: string, id: number) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/discount-codes/${id}/usage`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const duplicateDiscountCode = async (token: string, id: number) => {
  const response = await api.post<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/discount-codes/${id}/duplicate`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Customers Management APIs

// Customer Interfaces
export interface CustomerAddress {
  city: string;
  street: string;
  governorate: string;
  postal_code: string | null;
}

export interface CustomerLatestOrder {
  id: number;
  customer_id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: CustomerAddress;
  total_amount: string;
  currency: string;
  status: 'awaiting_payment' | 'paid' | 'delivered' | 'pending';
  tracking_number: string;
  shipping_date: string | null;
  delivery_date: string | null;
  payment_id: number | null;
  notes: string | null;
  discount_code: string | null;
  discount_amount: string;
  subtotal_amount: string;
  shipping_amount: string;
  free_shipping: boolean;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: CustomerAddress;
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  preferred_language: string;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  last_order_at: string | null;
  total_orders: number;
  total_spent: string;
  average_order_value: string;
  preferences: any | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  latest_order: CustomerLatestOrder | null;
}

export interface CustomersPagination {
  current_page: number;
  data: Customer[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface CustomersSummary {
  total_customers: number;
  active_customers: number;
  vip_customers: number;
  new_customers: number;
  total_revenue: string;
  average_customer_value: number;
}

export interface CustomersResponse {
  success: boolean;
  data: {
    customers: CustomersPagination;
    summary: CustomersSummary;
  };
  message: string;
}

export const getAdminCustomers = async (token: string, params?: {
  search?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_direction?: string;
  per_page?: number;
  page?: number;
  status?: string;
}) => {
  const response = await api.get<CustomersResponse>('/admin/customers', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const getCustomerStatistics = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>('/admin/customers/statistics', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getAdminCustomer = async (token: string, id: number) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/customers/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateCustomer = async (token: string, id: number, data: {
  name?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
}) => {
  const response = await api.put<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/customers/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deactivateCustomer = async (token: string, id: number) => {
  const response = await api.put<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/customers/${id}/deactivate`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getCustomerOrders = async (token: string, id: number) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/customers/${id}/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getCustomerAnalytics = async (token: string, id: number) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/customers/${id}/analytics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const searchCustomers = async (token: string, query: string) => {
  const response = await api.get<{
    success: boolean;
    data: any[];
    message: string;
  }>('/admin/customers/search', {
    headers: { Authorization: `Bearer ${token}` },
    params: { query }
  });
  return response.data;
};

export const createCustomerExport = async (token: string, data: {
  format: 'json' | 'csv' | 'excel' | 'xlsx';
  limit?: number;
  filters?: {
    created_after?: string;
    created_before?: string;
    has_orders?: boolean;
  };
}) => {
  const response = await api.post<{
    success: boolean;
    export_id: string;
    download_url: string;
    file_name: string;
    file_path: string;
    records_count: number;
    estimated_completion: string;
  }>('/admin/exports/customers', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Legacy export function for backward compatibility
export const exportCustomers = async (token: string, params?: {
  format?: string;
  customer_type?: string;
  start_date?: string;
  end_date?: string;
}) => {
  const response = await api.get('/admin/customers/export', {
    headers: { Authorization: `Bearer ${token}` },
    params,
    responseType: 'blob'
  });
  return response;
};

// Users Management APIs
export const getAdminUsers = async (token: string, params?: {
  search?: string;
  role?: string;
  sort_by?: string;
  sort_direction?: string;
  per_page?: number;
  page?: number;
}) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>('/admin/users', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const getUserStatistics = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>('/admin/users/statistics', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createUser = async (token: string, data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  is_active?: boolean;
}) => {
  const response = await api.post<{
    success: boolean;
    data: any;
    message: string;
  }>('/admin/users', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getAdminUser = async (token: string, id: number) => {
  const response = await api.get<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getCurrentAdminUser = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
    message: string;
  }>('/admin/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateUser = async (token: string, id: number, data: {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  is_active?: boolean;
}) => {
  const response = await api.put<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/users/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteUser = async (token: string, id: number) => {
  const response = await api.delete<{
    success: boolean;
    message: string;
  }>(`/admin/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const toggleUserStatus = async (token: string, id: number) => {
  const response = await api.put<{
    success: boolean;
    data: any;
    message: string;
  }>(`/admin/users/${id}/toggle-status`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const changeUserPassword = async (token: string, id: number, data: {
  password: string;
  password_confirmation: string;
}) => {
  const response = await api.put<{
    success: boolean;
    message: string;
  }>(`/admin/users/${id}/change-password`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const bulkUpdateUsers = async (token: string, data: {
  user_ids: number[];
  action: string;
}) => {
  const response = await api.post<{
    success: boolean;
    data: any;
    message: string;
  }>('/admin/users/bulk-update', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const exportUsers = async (token: string, params?: {
  format?: string;
  role?: string;
}) => {
  const response = await api.get('/admin/users/export', {
    headers: { Authorization: `Bearer ${token}` },
    params,
    responseType: 'blob'
  });
  return response;
};

// Reports APIs
export const getSalesReport = async (token: string, params: {
  start_date: string;
  end_date: string;
  format?: string;
  group_by?: string;
}) => {
  const response = await api.get('/admin/reports/sales', {
    headers: { Authorization: `Bearer ${token}` },
    params,
    responseType: params.format === 'json' ? 'json' : 'blob'
  });
  return response;
};

export const getProductsReport = async (token: string, params?: {
  category_id?: number;
  format?: string;
  include_inactive?: boolean;
}) => {
  const response = await api.get('/admin/reports/products', {
    headers: { Authorization: `Bearer ${token}` },
    params,
    responseType: params?.format === 'json' ? 'json' : 'blob'
  });
  return response;
};

export const getCustomersReport = async (token: string, params?: {
  start_date?: string;
  end_date?: string;
  format?: string;
  customer_type?: string;
}) => {
  const response = await api.get('/admin/reports/customers', {
    headers: { Authorization: `Bearer ${token}` },
    params,
    responseType: params?.format === 'json' ? 'json' : 'blob'
  });
  return response;
};

export const getDashboardReport = async (token: string, params: {
  start_date: string;
  end_date: string;
  format?: string;
}) => {
  const response = await api.get('/admin/reports/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
    params,
    responseType: params.format === 'json' ? 'json' : 'blob'
  });
  return response;
};

// Additional Reports APIs based on documentation
export const getReportsDashboardOverview = async (token: string, params?: {
  date_from?: string;
  date_to?: string;
}) => {
  const response = await api.get<{
    success: boolean;
    data: {
      total_products: number;
      total_customers: number;
      total_orders: number;
      total_revenue: number;
      pending_orders: number;
      processing_orders: number;
      delivered_orders: number;
      cancelled_orders: number;
      low_stock_products: number;
      out_of_stock_products: number;
    };
    message: string;
  }>('/reports/dashboard/overview', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const getBusinessIntelligence = async (token: string, params?: {
  date_from?: string;
  date_to?: string;
}) => {
  const response = await api.get<{
    success: boolean;
    data: {
      kpis: {
        conversion_rate: number;
        customer_lifetime_value: number;
        average_order_value: number;
        repeat_customer_rate: number;
        cart_abandonment_rate: number;
      };
      growth_metrics: {
        revenue_growth: number;
        current_period_revenue: number;
        previous_period_revenue: number;
      };
      seasonal_trends: Array<{
        month: number;
        revenue: number;
        orders: number;
      }>;
    };
    message: string;
  }>('/reports/dashboard/business-intelligence', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const getReportsSalesAnalytics = async (token: string, params?: {
  date_from?: string;
  date_to?: string;
  period?: string;
}) => {
  const response = await api.get<{
    success: boolean;
    data: {
      sales_over_time: Array<{
        date: string;
        total_sales: number;
        order_count: number;
      }>;
      top_selling_products: Array<{
        product_id: number;
        product_name: string;
        total_sold: number;
        revenue: number;
      }>;
      sales_by_category: Array<{
        category_name: string;
        total_sales: number;
        percentage: number;
      }>;
      total_revenue: number;
      total_orders: number;
      average_order_value: number;
    };
    message: string;
  }>('/reports/analytics/sales', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const getReportsCustomerAnalytics = async (token: string, params?: {
  date_from?: string;
  date_to?: string;
}) => {
  const response = await api.get<{
    success: boolean;
    data: {
      customer_acquisition: Array<{
        date: string;
        new_customers: number;
      }>;
      top_customers: Array<{
        customer_id: number;
        customer_name: string;
        total_orders: number;
        total_spent: number;
      }>;
      customers_by_city: Array<{
        city: string;
        customer_count: number;
        percentage: number;
      }>;
      total_customers: number;
      new_customers_this_period: number;
      repeat_customers: number;
    };
    message: string;
  }>('/reports/analytics/customers', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const getReportsProductAnalytics = async (token: string, params?: {
  date_from?: string;
  date_to?: string;
}) => {
  const response = await api.get<{
    success: boolean;
    data: {
      product_performance: Array<{
        product_id: number;
        product_name: string;
        total_sold: number;
        revenue: number;
        stock_quantity: number;
      }>;
      low_stock_alerts: Array<{
        product_id: number;
        product_name: string;
        current_stock: number;
        minimum_stock: number;
      }>;
      out_of_stock_products: Array<{
        product_id: number;
        product_name: string;
      }>;
      products_by_category: Array<{
        category_name: string;
        product_count: number;
        percentage: number;
      }>;
      total_products: number;
      active_products: number;
      low_stock_count: number;
      out_of_stock_count: number;
    };
    message: string;
  }>('/reports/analytics/products', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const getReportsOrderAnalytics = async (token: string, params?: {
  date_from?: string;
  date_to?: string;
}) => {
  const response = await api.get<{
    success: boolean;
    data: {
      orders_by_status: Array<{
        status: string;
        count: number;
        percentage: number;
      }>;
      orders_by_payment_status: Array<{
        payment_status: string;
        count: number;
        percentage: number;
      }>;
      average_processing_time: {
        hours: number;
        minutes: number;
      };
      orders_over_time: Array<{
        date: string;
        order_count: number;
        total_amount: number;
      }>;
      recent_orders: Array<{
        order_id: number;
        order_number: string;
        customer_name: string;
        total_amount: number;
        status: string;
        created_at: string;
      }>;
      total_orders: number;
      pending_orders: number;
      completed_orders: number;
    };
    message: string;
  }>('/reports/analytics/orders', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const getFinancialOverview = async (token: string, params?: {
  date_from?: string;
  date_to?: string;
}) => {
  const response = await api.get<{
    success: boolean;
    data: {
      revenue_breakdown: {
        total_subtotal: number;
        total_tax: number;
        total_shipping: number;
        total_discount: number;
        total_revenue: number;
        total_orders: number;
      };
      monthly_revenue: Array<{
        year: number;
        month: number;
        revenue: number;
        orders_count: number;
      }>;
      refunds_and_cancellations: {
        cancelled_orders: number;
        cancelled_revenue: number;
        refunded_orders: number;
        refunded_amount: number;
      };
    };
    message: string;
  }>('/reports/financial/overview', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

// Image Upload APIs
export const uploadImage = async (token: string, file: File, folder?: string) => {
  const formData = new FormData();
  formData.append('image', file);
  if (folder) {
    formData.append('folder', folder);
  }

  // Use axios directly instead of the api instance to avoid default headers
  const response = await axios.post<{
    success: boolean;
    data: {
      url: string;
      path: string;
      filename: string;
      size: number;
      mime_type: string;
    };
    message: string;
  }>('https://api.soapy-bubbles.com/api/v1/admin/images/upload', formData, {
    headers: { 
      Authorization: `Bearer ${token}`
      // Don't set Content-Type manually, let the browser set it with boundary
    },
    withCredentials: true
  });
  return response.data;
};

export const uploadMultipleImages = async (token: string, files: File[], folder?: string) => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`images[${index}]`, file);
  });
  if (folder) {
    formData.append('folder', folder);
  }

  // Use axios directly instead of the api instance to avoid default headers
  const response = await axios.post<{
    success: boolean;
    data: {
      uploaded: Array<{
        url: string;
        path: string;
        filename: string;
        size: number;
        mime_type: string;
      }>;
      errors: Array<{
        index: number;
        filename: string;
        error: string;
      }>;
      total_uploaded: number;
      total_failed: number;
    };
    message: string;
  }>('https://api.soapy-bubbles.com/api/v1/admin/images/upload-multiple', formData, {
    headers: { 
      Authorization: `Bearer ${token}`
      // Don't set Content-Type manually, let the browser set it with boundary
    },
    withCredentials: true
  });
  return response.data;
};

export const deleteImage = async (token: string, path: string) => {
  const response = await api.delete<{
    success: boolean;
    message: string;
  }>(`/admin/images/${encodeURIComponent(path)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getImageFolders = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: string[];
    message: string;
  }>('/admin/images/folders', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// ===== NOTIFICATIONS API FUNCTIONS =====

export interface AdminNotification {
  id: number;
  type: string;
  payload: {
    data: {
      status?: string;
      currency?: string;
      order_id?: number;
      created_at?: string;
      order_number?: string;
      total_amount?: string;
      customer_name?: string;
      customer_phone?: string;
    };
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    created_at: string;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface NotificationsResponse {
  notifications: {
    current_page: number;
    data: AdminNotification[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  summary: {
    total_notifications: number;
    unread_notifications: number;
    read_notifications: number;
    notifications_by_type: Record<string, number>;
  };
}

// Get notifications with filtering and pagination
export const getAdminNotifications = async (token: string, params?: {
  page?: number;
  per_page?: number;
  type?: string;
  read?: boolean;
  date_from?: string;
  date_to?: string;
}) => {
  const response = await api.get<{
    success: boolean;
    data: NotificationsResponse;
    message: string;
  }>('/admin/notifications', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (token: string, id: number) => {
  const response = await api.put<{
    success: boolean;
    data: AdminNotification;
    message: string;
  }>(`/admin/notifications/${id}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (token: string) => {
  const response = await api.put<{
    success: boolean;
    data: {
      updated_count: number;
    };
    message: string;
  }>('/admin/notifications/mark-all-read', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Delete notification
export const deleteNotification = async (token: string, id: number) => {
  const response = await api.delete<{
    success: boolean;
    message: string;
  }>(`/admin/notifications/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Delete all read notifications
export const deleteReadNotifications = async (token: string) => {
  const response = await api.delete<{
    success: boolean;
    data: {
      deleted_count: number;
    };
    message: string;
  }>('/admin/notifications/read', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Export Management APIs
export const getExports = async (token: string, params?: {
  page?: number;
  per_page?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  type?: 'products' | 'customers' | 'orders';
}) => {
  const response = await api.get<{
    success: boolean;
    data: Array<{
      id: string;
      type: string;
      format: string;
      status: string;
      file_name: string;
      file_size: number;
      records_count: number;
      download_url: string;
      created_at: string;
      completed_at: string;
    }>;
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  }>('/admin/exports', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const getExportDetails = async (token: string, exportId: string) => {
  const response = await api.get<{
    success: boolean;
    data: {
      id: string;
      type: string;
      format: string;
      status: string;
      file_name: string;
      file_path: string;
      file_size: number;
      records_count: number;
      download_url: string;
      filters_applied: any;
      created_at: string;
      started_at: string;
      completed_at: string;
    };
  }>(`/admin/exports/${exportId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getExportStatus = async (token: string, exportId: string) => {
  const response = await api.get<{
    success: boolean;
    data: {
      id: string;
      status: string;
      progress: number;
      records_processed: number;
      records_total: number;
      estimated_completion: string | null;
      error_message: string | null;
    };
  }>(`/admin/exports/${exportId}/status`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const downloadExport = async (token: string, exportId: string) => {
  const response = await api.get(`/admin/exports/${exportId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob'
  });
  return response;
};

export const deleteExport = async (token: string, exportId: string) => {
  const response = await api.delete<{
    success: boolean;
    message: string;
  }>(`/admin/exports/${exportId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getExportStatistics = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: {
      total_exports: number;
      completed_exports: number;
      failed_exports: number;
      pending_exports: number;
      total_records_exported: number;
      total_file_size: number;
      exports_by_type: {
        products: number;
        customers: number;
        orders: number;
      };
      exports_by_format: {
        json: number;
        csv: number;
        xlsx: number;
      };
    };
  }>('/admin/exports/statistics/overview', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getImagesByFolder = async (token: string, folder: string) => {
  const response = await api.get<{
    success: boolean;
    data: Array<{
      url: string;
      path: string;
      filename: string;
      size: number;
      mime_type: string;
      created_at: number;
    }>;
    message: string;
  }>('/admin/images', {
    headers: { Authorization: `Bearer ${token}` },
    params: { folder }
  });
  return response.data;
};

// ==================== Chatbot Admin APIs ====================

export interface ChatbotSettings {
  name: string;
  system_prompt: string;
  welcome_message: string;
  is_active: boolean;
  product_access_type: 'all' | 'specific' | 'none';
  allowed_product_ids?: number[];
  ai_settings: {
    model: string;
    temperature: number;
    max_tokens: number;
    top_p?: number;
  };
  max_conversation_length: number;
  token_limit_per_message: number;
}

export interface ChatbotStatistics {
  total_conversations: number;
  active_conversations: number;
  total_messages: number;
  average_messages_per_conversation: number;
  daily_stats: Array<{
    date: string;
    conversations: number;
    messages: number;
  }>;
  hourly_distribution: Record<string, number>;
  popular_topics?: Array<{
    topic: string;
    count: number;
  }>;
}

export interface ChatbotConversation {
  id: number;
  session_id: string;
  customer_name?: string;
  customer_email?: string;
  status: 'active' | 'ended';
  message_count: number;
  started_at: string;
  last_activity: string;
  ended_at?: string;
}

// WhatsApp Settings Interfaces
export interface WhatsAppSetting {
  id: number;
  key: string;
  value: any;
  type: 'string' | 'array' | 'boolean';
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// الحصول على إعدادات الشات بوت
export const getChatbotSettings = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: ChatbotSettings;
  }>('/admin/chatbot/settings', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// تحديث إعدادات الشات بوت
export const updateChatbotSettings = async (token: string, settings: ChatbotSettings) => {
  const response = await api.put<{
    success: boolean;
    message: string;
    data: ChatbotSettings;
  }>('/admin/chatbot/settings', settings, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// الحصول على إحصائيات الشات بوت
export const getChatbotStatistics = async (token: string, days: number = 30) => {
  const response = await api.get<{
    success: boolean;
    data: ChatbotStatistics;
  }>('/admin/chatbot/statistics', {
    headers: { Authorization: `Bearer ${token}` },
    params: { days }
  });
  return response.data;
};

// الحصول على قائمة المحادثات
export const getChatbotConversations = async (
  token: string,
  params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: 'all' | 'active' | 'ended';
    date_from?: string;
    date_to?: string;
  }
) => {
  const response = await api.get<{
    success: boolean;
    data: {
      conversations: ChatbotConversation[];
      pagination: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        from: number;
        to: number;
      };
    };
  }>('/admin/chatbot/conversations', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

// الحصول على تفاصيل محادثة محددة
export const getChatbotConversationDetails = async (token: string, sessionId: string) => {
  const response = await api.get<{
    success: boolean;
    data: {
      id: number;
      session_id: string;
      status: string;
      message_count: number;
      created_at: string;
      last_activity_at: string;
      messages: Array<{
        id: number;
        conversation_id: number;
        role: 'user' | 'assistant';
        content: string;
        metadata: any;
        sent_at: string;
      }>;
    };
  }>(`/admin/chatbot/conversations/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// حذف محادثة
export const deleteChatbotConversation = async (token: string, sessionId: string) => {
  const response = await api.delete<{
    success: boolean;
    message: string;
  }>(`/admin/chatbot/conversations/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// حذف المحادثات القديمة
export const clearOldChatbotConversations = async (token: string, daysOld: number) => {
  const response = await api.delete<{
    success: boolean;
    message: string;
    deleted_count: number;
  }>('/admin/chatbot/conversations/clear-old', {
    headers: { Authorization: `Bearer ${token}` },
    data: { days_old: daysOld }
  });
  return response.data;
};

// الحصول على المنتجات المتاحة للشات بوت
export const getChatbotProducts = async (
  token: string,
  params?: {
    search?: string;
    per_page?: number;
    page?: number;
  }
) => {
  const response = await api.get<{
    success: boolean;
    data: {
      products: Product[];
      pagination: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
      };
    };
  }>('/admin/chatbot/products', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

// اختبار تكوين الشات بوت
export const testChatbotConfiguration = async (token: string, testMessage: string) => {
  const response = await api.post<{
    success: boolean;
    data: {
      settings_valid: boolean;
      ai_connection: {
        status: string;
        model: string;
        response_time: number;
      };
      product_access: {
        status: string;
        accessible_products_count: number;
      };
      test_response: {
        message: string;
        response_time: number;
      };
    };
  }>('/admin/chatbot/test', { test_message: testMessage }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// ==================== WhatsApp Settings APIs ====================

// Get all WhatsApp settings
export const getWhatsAppSettings = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: WhatsAppSetting[];
  }>('/admin/whatsapp', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Get specific WhatsApp setting by key
export const getWhatsAppSetting = async (token: string, key: string) => {
  const response = await api.get<{
    success: boolean;
    data: WhatsAppSetting;
  }>(`/admin/whatsapp/${key}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Update specific WhatsApp setting
export const updateWhatsAppSetting = async (
  token: string,
  key: string,
  data: { value: any; is_active?: boolean }
) => {
  const response = await api.put<{
    success: boolean;
    message: string;
    data: WhatsAppSetting;
  }>(`/admin/whatsapp/${key}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Bulk update WhatsApp settings
export const bulkUpdateWhatsAppSettings = async (
  token: string,
  settings: Array<{ key: string; value: any; is_active?: boolean }>
) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: {
      updated_count: number;
      updated_keys: string[];
    };
  }>('/admin/whatsapp/bulk-update', { settings }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Toggle WhatsApp globally
export const toggleWhatsAppGlobal = async (token: string) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: {
      whatsapp_enabled: boolean;
    };
  }>('/admin/whatsapp/toggle-global', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Toggle admin notifications
export const toggleWhatsAppAdminNotifications = async (token: string) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: {
      admin_notification_enabled: boolean;
    };
  }>('/admin/whatsapp/toggle-admin', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Toggle delivery notifications
export const toggleWhatsAppDeliveryNotifications = async (token: string) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: {
      delivery_notification_enabled: boolean;
    };
  }>('/admin/whatsapp/toggle-delivery', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Test WhatsApp connection
export const testWhatsAppConnection = async (
  token: string,
  phone: string,
  message?: string
) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data?: any;
    error?: string;
  }>('/admin/whatsapp/test', {
    phone,
    message: message || 'This is a test message from Soapy Shop'
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// ==================== Orders Control APIs ====================

// Orders Status Interfaces
export interface OrdersStatus {
  orders_enabled: boolean;
  status: 'open' | 'closed';
  message: string;
}

// Public API - Get orders status (no auth required)
export const getPublicOrdersStatus = async () => {
  const response = await api.get<{
    success: boolean;
    data: OrdersStatus;
  }>('/site/orders-status');
  return response.data;
};

// Admin API - Get orders status
export const getAdminOrdersStatus = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: OrdersStatus;
  }>('/admin/site/orders-status', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Admin API - Toggle orders (open ↔ close)
export const toggleOrders = async (token: string) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: OrdersStatus;
  }>('/admin/site/toggle-orders', {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Admin API - Set specific orders status
export const setOrdersStatus = async (token: string, enabled: boolean) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: OrdersStatus;
  }>('/admin/site/set-orders-status', { enabled }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// ==================== Product Discounts APIs ====================

// Product Discount Interfaces
export interface ProductDiscount {
  id: number;
  name: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  apply_to: 'all_products' | 'specific_products';
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  priority: number;
  formatted_discount: string;
  status_text: string;
  products: Array<{
    id: number;
    title: string;
    price: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface ProductDiscountSummary {
  total_discounts: number;
  active_discounts: number;
  all_products_discounts: number;
  specific_products_discounts: number;
}

export interface ProductDiscountsPagination {
  data: ProductDiscount[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ProductDiscountsResponse {
  success: boolean;
  data: {
    discounts: ProductDiscountsPagination;
    summary: ProductDiscountSummary;
  };
}

export interface ProductDiscountStatistics {
  total_discounts: number;
  active_discounts: number;
  inactive_discounts: number;
  expired_discounts: number;
  upcoming_discounts: number;
  all_products_discounts: number;
  specific_products_discounts: number;
  percentage_discounts: number;
  fixed_discounts: number;
  products_with_discounts: number;
}

// Get all product discounts
export const getProductDiscounts = async (token: string, params?: {
  page?: number;
  per_page?: number;
  status?: string;
  discount_type?: string;
  apply_to?: string;
  search?: string;
  sort_by?: string;
  sort_direction?: string;
}) => {
  const response = await api.get<ProductDiscountsResponse>('/admin/product-discounts', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

// Get product discount statistics
export const getProductDiscountStatistics = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: ProductDiscountStatistics;
  }>('/admin/product-discounts/statistics', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Create product discount
export const createProductDiscount = async (token: string, data: {
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  apply_to: 'all_products' | 'specific_products';
  product_ids?: number[];
  is_active: boolean;
  starts_at?: string | null;
  expires_at?: string | null;
  priority?: number;
}) => {
  const response = await api.post<{
    success: boolean;
    data: ProductDiscount;
    message: string;
  }>('/admin/product-discounts', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Update product discount
export const updateProductDiscount = async (token: string, id: number, data: {
  name?: string;
  description?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  apply_to?: 'all_products' | 'specific_products';
  product_ids?: number[];
  is_active?: boolean;
  starts_at?: string | null;
  expires_at?: string | null;
  priority?: number;
}) => {
  const response = await api.put<{
    success: boolean;
    data: ProductDiscount;
    message: string;
  }>(`/admin/product-discounts/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Delete product discount
export const deleteProductDiscount = async (token: string, id: number) => {
  const response = await api.delete<{
    success: boolean;
    message: string;
  }>(`/admin/product-discounts/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Toggle product discount status
export const toggleProductDiscountStatus = async (token: string, id: number) => {
  const response = await api.put<{
    success: boolean;
    data: ProductDiscount;
    message: string;
  }>(`/admin/product-discounts/${id}/toggle-status`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Duplicate product discount
export const duplicateProductDiscount = async (token: string, id: number) => {
  const response = await api.post<{
    success: boolean;
    data: ProductDiscount;
    message: string;
  }>(`/admin/product-discounts/${id}/duplicate`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Get affected products by discount
export const getAffectedProductsByDiscount = async (token: string, id: number, params?: {
  page?: number;
  per_page?: number;
}) => {
  const response = await api.get<{
    success: boolean;
    data: {
      discount: ProductDiscount;
      products: {
        data: Product[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
      };
    };
  }>(`/admin/product-discounts/${id}/affected-products`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

// ==================== Inventory Management APIs ====================

export interface InventoryProduct extends Product {
  low_stock_threshold: number;
  stock_last_updated_at: string | null;
}

export interface InventoryStatistics {
  total_products_with_inventory: number;
  total_products_without_inventory: number;
  products_in_stock: number;
  products_out_of_stock: number;
  products_low_stock: number;
  total_stock_value: string;
  total_stock_quantity: number;
}

export interface InventoryTransaction {
  id: number;
  type: 'increase' | 'decrease' | 'adjustment';
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  reason: 'purchase' | 'sale' | 'return' | 'adjustment' | 'damage';
  notes: string | null;
  order: {
    id: number;
    order_number: string;
  } | null;
  user: {
    id: number;
    name: string;
  } | null;
  created_at: string;
}

// Get inventory products with pagination and filters
export const getInventoryProducts = async (token: string, params?: {
  page?: number;
  per_page?: number;
  search?: string;
  stock_status?: 'in_stock' | 'out_of_stock' | 'low_stock' | 'all';
  has_inventory?: boolean;
  sort_by?: 'stock_quantity' | 'title' | 'price' | 'created_at';
  sort_order?: 'asc' | 'desc';
}) => {
  const response = await api.get<{
    success: boolean;
    data: {
      current_page: number;
      data: InventoryProduct[];
      per_page: number;
      total: number;
      last_page: number;
    };
  }>('/admin/inventory/products', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

// Get inventory statistics
export const getInventoryStatistics = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: {
      statistics: InventoryStatistics;
      low_stock_products: InventoryProduct[];
      out_of_stock_products: InventoryProduct[];
    };
  }>('/admin/inventory/statistics', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Adjust inventory (set, increase, decrease)
export const adjustInventory = async (token: string, productId: number, data: {
  action: 'set' | 'increase' | 'decrease';
  quantity: number;
  reason: 'purchase' | 'return' | 'adjustment' | 'damage';
  notes?: string;
}) => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: {
      product: InventoryProduct;
    };
  }>(`/admin/inventory/products/${productId}/adjust`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Get inventory transactions for a product
export const getInventoryTransactions = async (token: string, productId: number, params?: {
  page?: number;
  per_page?: number;
  type?: 'increase' | 'decrease' | 'adjustment';
  reason?: 'purchase' | 'sale' | 'return' | 'adjustment' | 'damage';
  start_date?: string;
  end_date?: string;
}) => {
  const response = await api.get<{
    success: boolean;
    data: {
      product: InventoryProduct;
      transactions: {
        current_page: number;
        data: InventoryTransaction[];
        per_page: number;
        total: number;
        last_page: number;
      };
    };
  }>(`/admin/inventory/products/${productId}/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

// Toggle inventory tracking for a product
export const toggleProductInventory = async (token: string, productId: number, data: {
  has_inventory: boolean;
  stock_quantity?: number;
  low_stock_threshold?: number;
}) => {
  const response = await api.put<{
    success: boolean;
    data: InventoryProduct;
    message: string;
  }>(`/admin/products/${productId}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
