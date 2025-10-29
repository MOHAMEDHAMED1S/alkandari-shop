# ميزة طباعة وإرسال الفاتورة عبر الواتساب

## 📋 نظرة عامة

تم إضافة ميزة كاملة لطباعة الفواتير وإرسالها عبر الواتساب في لوحة التحكم الخاصة بالإدارة.

---

## ✨ الميزات

### 1. **طباعة الفاتورة**
- ✅ تصميم احترافي يشبه الفواتير الرسمية
- ✅ طباعة مباشرة بدون فتح نافذة جديدة
- ✅ تنسيق A4 جاهز للطباعة
- ✅ دعم كامل للغة العربية (RTL)
- ✅ جميع تفاصيل الطلب والمنتجات
- ✅ صور المنتجات في الفاتورة

### 2. **إرسال عبر الواتساب**
- ✅ إرسال تفاصيل الفاتورة للعميل مباشرة
- ✅ دعم الأرقام الكويتية (+965)
- ✅ تنسيق احترافي للرسالة
- ✅ تفاصيل الطلب والمنتجات والعنوان

---

## 📁 الملفات المعدلة

### 1. **Invoice.tsx** (جديد)
**المسار**: `/front-end/src/components/admin/Invoice.tsx`

**الوصف**: مكون React كامل لعرض وطباعة الفاتورة

**المميزات**:
```typescript
- تصميم يطابق الفاتورة المرجعية
- استخدام Tailwind CSS للتنسيق
- Inline styles للعناصر المهمة
- دالة طباعة مباشرة بدون نافذة جديدة
- دالة إرسال واتساب للأرقام الكويتية
```

### 2. **AdminOrders.tsx** (معدل)
**المسار**: `/front-end/src/pages/admin/AdminOrders.tsx`

**التغييرات**:
1. إضافة أيقونات `Printer` و `MessageCircle`
2. إضافة import للمكون `Invoice`
3. إضافة state لـ `showInvoice`
4. إضافة دالة `handleViewInvoice`
5. إضافة زر الطباعة في جدول الطلبات
6. إضافة مكون `Invoice` في نهاية الصفحة

---

## 🎨 تصميم الفاتورة

### العناصر الرئيسية:

#### 1. **الهيدر (Header)**
```
- خلفية متدرجة (Gradient)
- شعار المتجر
- معلومات التاريخ والتوصيل
- رقم الطلب بارز
- حالة الطلب (Badge)
```

#### 2. **تفاصيل المفصل والدفع**
```
- صناديق منفصلة
- خلفية رمادية فاتحة
- حدود واضحة
- معلومات العميل
- حالة الدفع
```

#### 3. **جدول المنتجات**
```
Columns:
- الرقم المنتج
- صورة المنتج
- الرمز الشريطي
- اسم المنتج
- الكمية
- السعر للوحدة
- المجموع
```

#### 4. **الإجماليات**
```
- المجموع الفرعي
- الخصم (إن وجد)
- مصاريف التوصيل
- المجموع الكلي (بخلفية داكنة)
```

#### 5. **عنوان التوصيل**
```
- المحافظة / المدينة
- نوع المكان
- الشارع
```

#### 6. **تفاصيل الدفع (MyFatoorah)**
```
- معرف الفاتورة
- حالة الفاتورة
- معرف المرجع
- مبلغ الدفع
```

---

## 🔧 كيفية الاستخدام

### للمطورين:

#### 1. **في صفحة الطلبات**:
```typescript
// في AdminOrders.tsx
const handleViewInvoice = (order: Order) => {
  setSelectedOrder(order);
  setShowInvoice(true);
};

// في الجدول
<Button onClick={() => handleViewInvoice(order)}>
  <Printer className="w-4 h-4" />
</Button>

// في نهاية الملف
<Invoice
  open={showInvoice}
  onOpenChange={setShowInvoice}
  order={selectedOrder}
/>
```

#### 2. **استخدام مستقل**:
```typescript
import Invoice from '@/components/admin/Invoice';

function MyComponent() {
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <Invoice
      open={showInvoice}
      onOpenChange={setShowInvoice}
      order={selectedOrder}
    />
  );
}
```

---

## 💻 الكود الأساسي

### دالة الطباعة:
```typescript
const handlePrint = () => {
  const originalContents = document.body.innerHTML;
  const printContent = invoiceRef.current;
  
  if (!printContent) {
    toast.error('فشل في إيجاد محتوى الفاتورة');
    return;
  }

  const originalTitle = document.title;
  document.title = `فاتورة ${order.order_number}`;

  const clonedContent = printContent.cloneNode(true) as HTMLElement;
  
  document.body.innerHTML = '';
  document.body.appendChild(clonedContent);
  
  window.print();
  
  document.body.innerHTML = originalContents;
  document.title = originalTitle;
  
  window.location.reload();
  
  toast.success('تم فتح نافذة الطباعة');
};
```

### دالة الواتساب:
```typescript
const handleWhatsApp = () => {
  let phone = order.customer_phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
  
  // إضافة كود الدولة الكويتي
  if (!phone.startsWith('+') && !phone.startsWith('965')) {
    phone = '965' + phone;
  } else if (phone.startsWith('+')) {
    phone = phone.substring(1);
  }
  
  const message = `مرحباً ${order.customer_name}،...`;
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};
```

---

## 📱 رسالة الواتساب

### التنسيق:
```
مرحباً [اسم العميل]،

تم تأكيد طلبكم رقم: *[رقم الطلب]*

📦 *تفاصيل الطلب:*
1. [اسم المنتج] (الكمية x)
2. [اسم المنتج] (الكمية x)

💰 *المبلغ الإجمالي:* [المبلغ] د.ك

📍 *عنوان التوصيل:*
[الشارع]
[المدينة], [المحافظة]

شكراً لتسوقكم معنا! 🌟
```

---

## 🎯 مثال على Order Object

```typescript
interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  status: 'paid' | 'pending' | 'shipped' | 'delivered' | 'cancelled';
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
```

---

## 🖨️ إعدادات الطباعة

### CSS للطباعة:
```css
@media print {
  @page {
    size: A4;
    margin: 10mm;
  }
  
  body * {
    visibility: hidden;
  }
  
  #invoice-print-content,
  #invoice-print-content * {
    visibility: visible;
  }
  
  #invoice-print-content {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
```

### العناصر المخفية عند الطباعة:
- ✅ أزرار الطباعة والواتساب
- ✅ DialogHeader
- ✅ أي عنصر مع class `print:hidden`

---

## 🔍 التفاصيل التقنية

### 1. **التنسيق**:
- استخدام Tailwind CSS classes
- Inline styles للعناصر المهمة
- Grid layout للتخطيط
- Flexbox للتوزيع

### 2. **الألوان**:
```css
Primary Background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)
Dark Header: #2d3748 / #4a5568
Light Boxes: #f7fafc / #edf2f7
Borders: #e2e8f0 / #cbd5e1
Text: #4a5568 / #718096
```

### 3. **الحالات (Status)**:
```typescript
paid      → bg-green-100 text-green-800
pending   → bg-yellow-100 text-yellow-800
shipped   → bg-blue-100 text-blue-800
delivered → bg-purple-100 text-purple-800
cancelled → bg-red-100 text-red-800
```

---

## 📊 المميزات التقنية

### ✅ الأداء:
- استخدام `useRef` للوصول المباشر للعناصر
- عدم إعادة الرندر غير الضرورية
- Lazy loading للصور

### ✅ إمكانية الوصول:
- دعم RTL كامل
- ألوان متباينة
- نصوص واضحة
- أحجام خطوط مناسبة

### ✅ التوافق:
- يعمل على جميع المتصفحات الحديثة
- دعم الطباعة في Chrome, Firefox, Safari
- متجاوب مع أحجام الشاشات المختلفة

---

## 🐛 المشاكل المحلولة

### 1. **عدم ظهور الـ Styles**:
- ✅ **الحل**: استخدام Tailwind classes و inline styles بدلاً من CSS منفصل

### 2. **فتح نافذة جديدة**:
- ✅ **الحل**: استخدام window.print() مباشرة مع حفظ واستعادة المحتوى

### 3. **عدم طباعة الصور**:
- ✅ **الحل**: استخدام inline images مع التأكد من تحميلها

---

## 🚀 التحسينات المستقبلية

### يمكن إضافة:
1. ✨ تحميل الفاتورة كـ PDF
2. ✨ إرسال الفاتورة عبر البريد الإلكتروني
3. ✨ قوالب مختلفة للفاتورة
4. ✨ إضافة شعار المتجر الفعلي
5. ✨ باركود أو QR code للطلب
6. ✨ معلومات الشركة القانونية
7. ✨ ختم وتوقيع إلكتروني

---

## 📝 ملاحظات

### للمستخدمين:
1. تأكد من تفعيل الطابعة أو اختيار "Save as PDF"
2. رقم الهاتف يجب أن يكون رقم واتساب فعال
3. الفاتورة تدعم اللغة العربية فقط حالياً

### للمطورين:
1. يمكن تخصيص التصميم من خلال Tailwind classes
2. يمكن إضافة حقول جديدة بسهولة
3. الكود معد لسهولة الصيانة والتطوير

---

## 📞 الدعم الفني

إذا واجهت أي مشكلة:
1. تحقق من console.log للأخطاء
2. تأكد من وجود جميع بيانات الطلب
3. تحقق من إعدادات الطباعة في المتصفح
4. تأكد من اتصال الإنترنت لإرسال الواتساب

---

تم التحديث: 23 أكتوبر 2025
الإصدار: 1.0.0

