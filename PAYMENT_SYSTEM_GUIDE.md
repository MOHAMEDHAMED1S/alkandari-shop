# دليل نظام الدفع - Payment System Guide

## نظرة عامة - Overview

تم تطوير نظام دفع متكامل يدعم MyFatoorah كبوابة دفع رئيسية مع واجهة مستخدم محسنة ومعالجة شاملة للـ callbacks.

A comprehensive payment system has been developed supporting MyFatoorah as the main payment gateway with an enhanced user interface and comprehensive callback handling.

## المكونات - Components

### Backend (Laravel)

#### 1. Payment Controller
- **الملف**: `app/Http/Controllers/Api/Customer/PaymentController.php`
- **الوظائف**:
  - `getPaymentMethods()` - جلب طرق الدفع المتاحة
  - `initiatePayment()` - بدء عملية الدفع
  - `checkPaymentStatus()` - فحص حالة الدفع
  - `handleCallback()` - معالجة callback من MyFatoorah
  - `handleSuccessCallback()` - معالجة الدفع الناجح
  - `handleFailureCallback()` - معالجة فشل الدفع
  - `handleError()` - معالجة الأخطاء

#### 2. Payment Service
- **الملف**: `app/Services/PaymentService.php`
- **الوظائف**:
  - `getPaymentMethods()` - الحصول على طرق الدفع من MyFatoorah
  - `initiatePayment()` - بدء الدفع مع MyFatoorah
  - `verifyPayment()` - التحقق من حالة الدفع
  - `callMyFatoorahAPI()` - استدعاء API MyFatoorah

#### 3. Routes
```php
// Payment APIs
Route::get('/payments/methods', [PaymentController::class, 'getPaymentMethods']);
Route::post('/payments/initiate', [PaymentController::class, 'initiatePayment']);
Route::get('/payments/status', [PaymentController::class, 'checkPaymentStatus']);
Route::post('/payments/callback', [PaymentController::class, 'handleCallback']);
Route::post('/payments/error', [PaymentController::class, 'handleError']);

// Payment Callbacks for Frontend
Route::get('/payments/success', [PaymentController::class, 'handleSuccessCallback']);
Route::get('/payments/failure', [PaymentController::class, 'handleFailureCallback']);
```

### Frontend (React + TypeScript)

#### 1. API Client
- **الملف**: `src/lib/api.ts`
- **الوظائف**:
  - `getPaymentMethods()` - جلب طرق الدفع
  - `initiatePayment()` - بدء الدفع
  - `verifyPayment()` - التحقق من الدفع
  - `getPaymentStatus()` - فحص حالة الدفع

#### 2. Payment Pages
- **Payment.tsx** - صفحة اختيار طريقة الدفع
- **PaymentSuccess.tsx** - صفحة نجاح الدفع
- **PaymentFailure.tsx** - صفحة فشل الدفع

#### 3. Features
- واجهة مستخدم محسنة مع حالات تحميل
- معالجة شاملة للأخطاء
- دعم متعدد اللغات (عربي/إنجليزي)
- تحقق تلقائي من حالة الدفع
- تنظيف البيانات المحلية

## تدفق الدفع - Payment Flow

### 1. بدء الدفع - Payment Initiation
```typescript
// Frontend
const response = await initiatePayment({
  order_id: orderData.order_id,
  payment_method: 'kn', // KNET
  customer_ip: customerIP,
  user_agent: navigator.userAgent
});

// Backend Response
{
  "success": true,
  "data": {
    "payment_id": 11,
    "invoice_id": 6142737,
    "payment_url": "https://demo.MyFatoorah.com/KWT/ia/...",
    "order_id": 18,
    "order_number": "ORD-20251004-C6ADDF",
    "amount": "56.000",
    "currency": "KWD",
    "redirect_url": "https://demo.MyFatoorah.com/KWT/ia/..."
  }
}
```

### 2. التوجيه لصفحة الدفع - Redirect to Payment
```typescript
// Frontend redirects to MyFatoorah
window.location.href = response.data.redirect_url;
```

### 3. معالجة Callback - Callback Handling
```php
// Backend handles MyFatoorah callbacks
public function handleSuccessCallback(Request $request)
{
    $paymentId = $request->get('paymentId');
    $orderId = $request->get('order_id');
    
    // Verify payment with MyFatoorah
    $paymentStatus = $this->paymentService->verifyPayment($paymentId);
    
    // Update order status
    if ($paymentStatus['data']['InvoiceStatus'] === 'Paid') {
        $order->update(['status' => 'paid']);
    }
    
    // Redirect to frontend
    return redirect()->away(config('app.frontend_url') . '/payment/success?order=' . $order->order_number);
}
```

### 4. التحقق من الدفع - Payment Verification
```typescript
// Frontend verifies payment status
const paymentStatus = await verifyPayment(orderData.order_id);

if (paymentStatus.success) {
    setOrderDetails(paymentStatus.data);
    setVerificationStatus('verified');
}
```

## إعدادات MyFatoorah - MyFatoorah Configuration

### Environment Variables
```env
MYFATOORAH_API_KEY=your_api_key_here
MYFATOORAH_BASE_URL=https://apitest.myfatoorah.com
FRONTEND_URL=http://localhost:3000
```

### Callback URLs
- **Success**: `http://localhost:8000/api/v1/payments/success`
- **Failure**: `http://localhost:8000/api/v1/payments/failure`
- **Error**: `http://localhost:8000/api/v1/payments/error`

## معالجة الأخطاء - Error Handling

### أنواع الأخطاء - Error Types
1. **missing_params** - معاملات مفقودة
2. **order_not_found** - الطلب غير موجود
3. **verification_failed** - فشل في التحقق
4. **processing_error** - خطأ في المعالجة
5. **initiation_failed** - فشل في بدء الدفع
6. **network_error** - خطأ في الشبكة

### معالجة الأخطاء في Frontend
```typescript
// PaymentFailure.tsx
switch (error) {
  case 'missing_params':
    setErrorMessage(t('payment.errors.missingParams'));
    break;
  case 'order_not_found':
    setErrorMessage(t('payment.errors.orderNotFound'));
    break;
  // ... other cases
}
```

## الأمان - Security

### 1. التحقق من الدفع
- التحقق من حالة الدفع مع MyFatoorah قبل تأكيد النجاح
- تسجيل جميع محاولات الدفع
- معالجة آمنة للـ callbacks

### 2. تنظيف البيانات
- تنظيف البيانات المحلية بعد اكتمال العملية
- عدم تخزين معلومات حساسة في localStorage
- التحقق من صحة البيانات المدخلة

### 3. معالجة الأخطاء
- تسجيل جميع الأخطاء
- عدم كشف معلومات حساسة للمستخدم
- إعادة توجيه آمنة في حالة الأخطاء

## الاختبار - Testing

### 1. اختبار الدفع
```bash
# Create test order
curl -X POST "http://localhost:8000/api/v1/checkout/create-order" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "customer_phone": "+96512345678",
    "shipping_address": {
      "street": "Test Street",
      "city": "Kuwait",
      "governorate": "Kuwait"
    },
    "items": [{"product_id": 1, "quantity": 2}],
    "shipping_amount": 5
  }'

# Initiate payment
curl -X POST "http://localhost:8000/api/v1/payments/initiate" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 18,
    "payment_method": "kn",
    "customer_ip": "127.0.0.1",
    "user_agent": "Test Agent"
  }'
```

### 2. اختبار Callbacks
- اختبار callback النجاح
- اختبار callback الفشل
- اختبار معالجة الأخطاء

## المراقبة - Monitoring

### 1. Logs
- تسجيل جميع طلبات الدفع
- تسجيل استجابات MyFatoorah
- تسجيل الأخطاء والاستثناءات

### 2. Notifications
- إشعارات للمدير عند نجاح الدفع
- إشعارات عند فشل الدفع
- إشعارات عند حدوث أخطاء

## الصيانة - Maintenance

### 1. تنظيف البيانات
- تنظيف البيانات المؤقتة
- أرشفة السجلات القديمة
- تنظيف ملفات الـ logs

### 2. التحديثات
- تحديث مكتبات MyFatoorah
- تحديث إعدادات الأمان
- مراجعة دورية للكود

## الدعم - Support

### 1. MyFatoorah Support
- [MyFatoorah Documentation](https://myfatoorah.readme.io/)
- [API Reference](https://myfatoorah.readme.io/reference)
- [Test Environment](https://apitest.myfatoorah.com)

### 2. Technical Support
- مراجعة الـ logs
- فحص إعدادات البيئة
- اختبار الاتصال مع MyFatoorah

---

## ملاحظات مهمة - Important Notes

1. **تأكد من إعداد FRONTEND_URL** في ملف `.env`
2. **اختبر في بيئة التطوير** قبل النشر
3. **راقب الـ logs** بانتظام
4. **احتفظ بنسخ احتياطية** من البيانات
5. **اختبر جميع طرق الدفع** المتاحة

---

*تم تطوير هذا النظام بواسطة فريق Expo Alkandaris - Developed by Expo Alkandaris Team*
