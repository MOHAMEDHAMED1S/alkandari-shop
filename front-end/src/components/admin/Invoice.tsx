import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_price: string;
  quantity: number;
  product_snapshot?: {
    title: string;
    slug: string;
    description: string;
    short_description: string;
    price: string;
    currency: string;
    images: string[];
    meta: any;
    category: string;
  };
  product?: {
    id: number;
    title: string;
    slug: string;
    description: string;
    short_description: string;
    price: string;
    currency: string;
    is_available: boolean;
    category_id: number;
    images: string[];
    meta: any;
    created_at: string;
    updated_at: string;
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
  updated_at: string;
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

interface InvoiceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

const Invoice: React.FC<InvoiceProps> = ({ open, onOpenChange, order }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  // دالة فتح صفحة الطباعة
  const handlePrint = () => {
    if (!order) {
      toast.error('لم يتم العثور على بيانات الطلب');
      return;
    }

    // فتح صفحة الفاتورة في tab جديد
    const printUrl = `/admin/orders/invoice/${order.order_number}`;
    window.open(printUrl, '_blank');
    
    toast.success('تم فتح صفحة الفاتورة');
  };

  // دالة إرسال الواتساب
  const handleWhatsApp = () => {
    let phone = order.customer_phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
    
    if (!phone.startsWith('+') && !phone.startsWith('965')) {
      phone = '965' + phone;
    } else if (phone.startsWith('+')) {
      phone = phone.substring(1);
    }
    
    const message = `مرحباً ${order.customer_name}،

تم تأكيد طلبكم رقم: *${order.order_number}*

 *تفاصيل الطلب:*
${order.order_items?.map((item, index) => {
  const productName = item.product_snapshot?.title || item.product?.title || 'منتج';
  return `${index + 1}. ${productName} (${item.quantity}x)`;
}).join('\n')}

*المبلغ الإجمالي:* ${Number(order.total_amount).toFixed(2)} د.ك

 *عنوان التوصيل:*
${order.shipping_address.street}
${order.shipping_address.city}, ${order.shipping_address.governorate}

شكراً لتسوقكم معنا! `;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success('تم فتح واتساب');
  };

  const calculateSubtotal = () => {
    if (order.subtotal_amount) return Number(order.subtotal_amount);
    
    return order.order_items?.reduce((sum, item) => {
      return sum + (Number(item.product_price) * item.quantity);
    }, 0) || 0;
  };

  const subtotal = calculateSubtotal();
  const discount = Number(order.discount_amount || 0);
  const shipping = Number(order.shipping_amount || 0);

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

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }
            body * {
              visibility: hidden;
            }
            #invoice-print-content, #invoice-print-content * {
              visibility: visible;
            }
            #invoice-print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0" dir="rtl">
          <DialogHeader className="p-6 pb-0 print:hidden">
            <DialogTitle className="text-2xl font-bold text-right">
              فاتورة الطلب
            </DialogTitle>
          </DialogHeader>

          {/* أزرار التحكم */}
          <div className="flex gap-3 px-6 pb-4 print:hidden">
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              طباعة
            </Button>
            <Button onClick={handleWhatsApp} variant="outline" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              إرسال واتساب
            </Button>
          </div>

          {/* محتوى الفاتورة */}
          <div id="invoice-print-content" ref={invoiceRef} className="bg-white" style={{ maxWidth: '210mm', margin: '0 auto' }}>
            {/* Header */}
            <div className="border border-gray-300">
              <div style={{
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                padding: '15px 20px',
                borderBottom: '2px solid #4a5568'
              }}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/logo.png" 
                      alt="Expo Alkandari Logo" 
                      className="w-16 h-16 object-contain"
                    />
                    <div className="text-right">
                      <h1 className="text-2xl font-bold text-gray-800 mb-0.5" style={{ fontFamily: 'Arial, sans-serif' }}>
                        Expo Alkandaris
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
                        <th className="p-1.5 text-center text-[10px] font-semibold border-l border-gray-600">الرمز</th>
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
                            <td className="p-1.5 text-center text-[9px] text-gray-700 border-b border-l border-gray-200">
                              {item.product?.slug?.substring(0, 12) || '-'}
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
                      <p className="text-[9px] font-semibold text-gray-900 mb-0.5">المحافظة / المدينة / المنطقة:</p>
                      <p className="text-[10px] text-gray-700">{order.shipping_address.governorate} / {order.shipping_address.city}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-gray-900 mb-0.5">نوع مكان الاستلام:</p>
                      <p className="text-[10px] text-gray-700">منزل</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-gray-900 mb-0.5">الشارع:</p>
                      <p className="text-[10px] text-gray-700">{order.shipping_address.street}</p>
                    </div>
                  </div>
                </div>

                {/* تفاصيل الدفع */}
                {order.payment && (
                  <div className="bg-gray-100 p-3  border border-gray-300 mb-3">
                    <h3 className="text-xs font-semibold text-gray-800 mb-2"> فاتورة تفاصيل الدفع</h3>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-white p-2 rounded text-center">
                        <p className="text-[9px] text-gray-600 mb-0.5">معرف الفاتورة</p>
                        <p className="text-[10px] font-semibold text-gray-900">
                          {order.payment.invoice_reference || order.order_number}
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded text-center">
                        <p className="text-[9px] text-gray-600 mb-0.5">حالة الفاتورة</p>
                        <p className="text-[10px] font-semibold text-gray-900">{getStatusText(order.status)}</p>
                      </div>
                      <div className="bg-white p-2 rounded text-center">
                        <p className="text-[9px] text-gray-600 mb-0.5">معرف المرجع</p>
                        <p className="text-[10px] font-semibold text-gray-900">
                          {order.payment.invoice_reference || '-'}
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded text-center">
                        <p className="text-[9px] text-gray-600 mb-0.5">مبلغ الدفع</p>
                        <p className="text-[10px] font-semibold text-gray-900">
                          {Number(order.total_amount).toFixed(2)} د.ك
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ملاحظات */}
                {order.notes && (
                  <div className="bg-gray-50 p-2.5 rounded border border-gray-200 mb-3">
                    <h3 className="text-xs font-semibold text-gray-800 mb-1">ملاحظات العميل</h3>
                    <p className="text-[10px] text-gray-700">{order.notes}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-300 text-center">
                  <p className="text-[10px] text-gray-600 my-0.5">شكراً لتسوقكم معنا!</p>
                  <p className="text-[10px] text-gray-600 my-0.5">لأي استفسارات، يرجى التواصل معنا</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Invoice;
