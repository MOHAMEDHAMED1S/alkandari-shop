import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { getAdminOrders } from '@/lib/api';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_price: string;
  quantity: number;
  product_snapshot?: {
    title: string;
    images: string[];
  };
  product?: {
    title: string;
    slug: string;
    images: string[];
  };
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  status: string;
  total_amount: string;
  currency: string;
  shipping_address: {
    street: string;
    city: string;
    governorate: string;
    postal_code?: string;
  };
  created_at: string;
  payment?: {
    payment_method: string;
    invoice_reference: string;
  };
  order_items?: OrderItem[];
  discount_code?: string;
  discount_amount?: string;
  subtotal_amount?: string;
  shipping_amount?: string;
  free_shipping?: boolean;
  notes?: string;
}

const InvoiceBulkPrint: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (!token) return;

      const orderIds = searchParams.get('ids');
      if (!orderIds) {
        navigate('/admin/orders');
        return;
      }

      try {
        setLoading(true);
        const ids = orderIds.split(',');
        const loadedOrders: Order[] = [];

        // تحميل كل طلب
        for (const id of ids) {
          const response = await getAdminOrders(token, {
            search: id,
            per_page: 1,
          });

          if (response.data?.orders?.data && response.data.orders.data.length > 0) {
            loadedOrders.push(response.data.orders.data[0]);
          }
        }

        setOrders(loadedOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token, searchParams, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const calculateSubtotal = (order: Order) => {
    if (order.subtotal_amount) return Number(order.subtotal_amount);
    
    return order.order_items?.reduce((sum, item) => {
      return sum + (Number(item.product_price) * item.quantity);
    }, 0) || 0;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'مدفوع';
      case 'pending': return 'قيد الانتظار';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التوصيل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل الفواتير...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">لم يتم العثور على الطلبات</p>
          <Button onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للطلبات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }
            
            /* إخفاء كل شيء */
            body * {
              visibility: hidden;
            }
            
            /* إظهار الفواتير فقط */
            .print-invoices,
            .print-invoices * {
              visibility: visible;
            }
            
            /* وضع الفواتير في الموضع الصحيح */
            .print-invoices {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
            }
            
            /* فصل كل فاتورة في صفحة منفصلة */
            .invoice-page {
              display: block;
              position: relative;
              width: 100%;
              min-height: 100vh !important;
              height: auto;
              overflow: visible;
              box-sizing: border-box;
              page-break-after: always !important;
              page-break-inside: avoid !important;
              page-break-before: auto;
              break-after: page !important;
              break-inside: avoid !important;
              break-before: auto;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            /* أول فاتورة */
            .invoice-page:first-child {
              page-break-before: avoid;
              break-before: avoid;
            }
            
            /* آخر فاتورة لا تحتاج page break */
            .invoice-page:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
            
            /* إخفاء العناصر غير المطلوبة */
            .no-print {
              display: none !important;
              visibility: hidden !important;
            }
            
            /* إزالة الخلفيات */
            body {
              background: white !important;
              margin: 0;
              padding: 0;
            }
            
            /* التأكد من عدم تداخل المحتوى */
            .print-invoices > * {
              float: none !important;
              position: relative !important;
            }
            
            /* إضافة مساحة بيضاء في نهاية كل فاتورة للهواتف */
            .invoice-page::after {
              content: "";
              display: block;
              height: 10vh;
              width: 100%;
            }
          }
          
          /* CSS خاص للهواتف المحمولة */
          @media print and (max-width: 768px) {
            .invoice-page {
              min-height: 100vh !important;
              height: 100vh !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: flex-start !important;
              page-break-after: always !important;
              page-break-inside: avoid !important;
            }
            
            .invoice-page > * {
              flex-shrink: 0;
            }
          }
          
          @media screen {
            .invoice-page {
              max-width: 210mm;
              margin: 20px auto;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            
            .invoice-page:not(:last-child) {
              margin-bottom: 40px;
            }
          }
        `}
      </style>

      <div className="min-h-screen bg-gray-100 print:bg-white">
        {/* أزرار التحكم - مخفية عند الطباعة */}
        <div className="no-print sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Button variant="outline" onClick={() => navigate('/admin/orders')}>
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {orders.length} فاتورة
              </span>
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="w-4 h-4" />
                طباعة الكل
              </Button>
            </div>
          </div>
        </div>

        {/* الفواتير */}
        <div className="print-invoices">
          {orders.map((order, orderIndex) => {
            const subtotal = calculateSubtotal(order);
            const discount = Number(order.discount_amount || 0);
            const shipping = Number(order.shipping_amount || 0);

            return (
              <div key={order.id} className="invoice-page bg-white" dir="rtl">
                <div className="border border-gray-300">
                  {/* Header */}
                  <div style={{
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    padding: '15px 20px',
                    borderBottom: '2px solid #4a5568'
                  }}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src="/logo.png" 
                          alt="Soapy Bubble Logo" 
                          className="w-16 h-16 object-contain"
                        />
                        <div className="text-right">
                          <h1 className="text-2xl font-bold text-gray-800 mb-0.5" style={{ fontFamily: 'Arial, sans-serif' }}>
                            Soapy Bubble
                          </h1>
                        </div>
                      </div>
                      
                      <div className="bg-white p-2.5 rounded shadow-sm text-right">
                        <p className="text-[10px] text-gray-700 my-0.5">
                          <span className="font-semibold text-gray-900">تاريخ الطلب:</span>{' '}
                          {new Date(order.created_at).toLocaleString('ar-SA', { 
                            year: 'numeric',
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-[10px] text-gray-700 my-0.5">
                          <span className="font-semibold text-gray-900">طريقة الاستلام:</span> توصيل للمنزل
                        </p>
                      </div>
                    </div>

                    <div className="text-center bg-white p-2 rounded text-lg font-bold text-gray-800 mb-2">
                      {order.order_number}
                    </div>

                    <div className="text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBgColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    {/* تفاصيل المفصل */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 p-2.5  border border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-300">
                          تفاصيل العميل
                        </h3>
                        <p className="text-[10px] text-gray-700 my-1">
                          <span className="font-semibold text-gray-900">الاسم:</span> {order.customer_name}
                        </p>
                        <p className="text-[10px] text-gray-700 my-1">
                          <span className="font-semibold text-gray-900">رقم الهاتف:</span> {order.customer_phone}
                        </p>
                        {order.customer_email && (
                          <p className="text-[10px] text-gray-700 my-1">
                            <span className="font-semibold text-gray-900">البريد:</span> {order.customer_email}
                          </p>
                        )}
                      </div>

                      <div className="bg-gray-50 p-2.5  border border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-300">
                          حالة الدفع
                        </h3>
                        <p className="text-[10px] text-gray-700 my-1">
                          <span className="font-semibold text-gray-900">طريقة الدفع:</span>{' '}
                          {order.payment?.payment_method || 'نقدي عند الاستلام'}
                        </p>
                        <p className="text-[10px] text-gray-700 my-1">
                          <span className="font-semibold text-gray-900">حالة الدفع:</span> {getStatusText(order.status)}
                        </p>
                        {order.payment?.invoice_reference && (
                          <p className="text-[10px] text-gray-700 my-1">
                            <span className="font-semibold text-gray-900">رقم المرجع:</span> {order.payment.invoice_reference}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* جدول المنتجات */}
                    <div className="border border-gray-200  overflow-hidden mb-4">
                      <table className="w-full border-collapse">
                        <thead className="bg-gray-800 text-white">
                          <tr>
                            <th className="p-1.5 text-center text-[10px] font-semibold border-l border-gray-600">#</th>
                            <th className="p-1.5 text-center text-[10px] font-semibold border-l border-gray-600">صورة</th>
                            <th className="p-1.5 text-center text-[10px] font-semibold border-l border-gray-600">اسم المنتج</th>
                            <th className="p-1.5 text-center text-[10px] font-semibold border-l border-gray-600">الكمية</th>
                            <th className="p-1.5 text-center text-[10px] font-semibold border-l border-gray-600">السعر (د.ك)</th>
                            <th className="p-1.5 text-center text-[10px] font-semibold">المجموع (د.ك)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.order_items?.map((item, index) => {
                            const productName = item.product_snapshot?.title || item.product?.title || 'منتج';
                            const productImage = item.product_snapshot?.images?.[0] || item.product?.images?.[0];
                            const itemTotal = Number(item.product_price) * item.quantity;
                            
                            return (
                              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="p-1.5 text-center text-[10px] text-gray-700 border-b border-l border-gray-200">{index + 1}</td>
                                <td className="p-1 text-center border-b border-l border-gray-200">
                                  {productImage ? (
                                    <img 
                                      src={productImage} 
                                      alt={productName} 
                                      className="w-10 h-10 object-cover rounded border border-gray-200 mx-auto"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded mx-auto"></div>
                                  )}
                                </td>
                                <td className="p-1.5 text-center text-[10px] font-medium text-gray-800 border-b border-l border-gray-200">
                                  {productName}
                                </td>
                                <td className="p-1.5 text-center text-[10px] text-gray-700 border-b border-l border-gray-200">{item.quantity}</td>
                                <td className="p-1.5 text-center text-[10px] text-gray-700 border-b border-l border-gray-200">
                                  {Number(item.product_price).toFixed(2)}
                                </td>
                                <td className="p-1.5 text-center text-[10px] text-gray-700 border-b border-gray-200">
                                  {itemTotal.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* الإجماليات */}
                    <div className="mb-4 ltr">
                      <div className="bg-gray-50 border border-gray-200  overflow-hidden">
                        <div className="flex justify-between px-3 py-2 text-xs border-b border-gray-200">
                          <span className="text-gray-700 font-medium">المجموع</span>
                          <span className="text-gray-900 font-semibold">{subtotal.toFixed(2)} د.ك</span>
                        </div>
                        
                        {discount > 0 && (
                          <div className="flex justify-between px-3 py-2 text-xs border-b border-gray-200">
                            <span className="text-gray-700 font-medium">
                              خصم {order.discount_code ? `(${order.discount_code})` : ''}
                            </span>
                            <span className="text-gray-900 font-semibold">{discount.toFixed(2)} د.ك</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between px-3 py-2 text-xs border-b border-gray-200">
                          <span className="text-gray-700 font-medium">مصاريف التوصيل</span>
                          <span className="text-gray-900 font-semibold">
                            {order.free_shipping ? 'مجاني' : `${shipping.toFixed(2)} د.ك`}
                          </span>
                        </div>
                        
                        <div className="flex justify-between px-3 py-2.5 text-sm bg-gray-800 text-white font-bold">
                          <span>المجموع الكلي</span>
                          <span>{Number(order.total_amount).toFixed(2)} د.ك</span>
                        </div>
                      </div>
                    </div>

                    {/* عنوان التوصيل */}
                    <div className="bg-gray-50 p-2.5 rounded border border-gray-200 mb-3">
                      <h3 className="text-xs font-semibold text-gray-800 mb-2">عنوان التوصيل</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[9px] font-semibold text-gray-900 mb-0.5">المحافظة / المدينة:</p>
                          <p className="text-[10px] text-gray-700">{order.shipping_address.governorate} / {order.shipping_address.city}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-semibold text-gray-900 mb-0.5">نوع المكان:</p>
                          <p className="text-[10px] text-gray-700">منزل</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-semibold text-gray-900 mb-0.5">الشارع:</p>
                          <p className="text-[10px] text-gray-700">{order.shipping_address.street}</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-gray-300 text-center">
                      <p className="text-[10px] text-gray-600 my-0.5">شكراً لتسوقكم معنا!</p>
                      <p className="text-[10px] text-gray-600 my-0.5">لأي استفسارات، يرجى التواصل معنا</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default InvoiceBulkPrint;

