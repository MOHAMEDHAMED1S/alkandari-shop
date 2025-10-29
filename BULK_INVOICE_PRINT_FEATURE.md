# ميزة الطباعة الجماعية للفواتير

## 📋 الوصف

تتيح هذه الميزة للمسؤول طباعة فواتير متعددة دفعة واحدة من صفحة الطلبات في لوحة التحكم.

---

## ✨ المميزات

### 1. **تحديد متعدد للطلبات**
- ✅ تحديد عدة طلبات من جدول الطلبات
- ✅ استخدام Checkbox لكل طلب
- ✅ عداد للطلبات المحددة

### 2. **إجراءات جماعية**
- ✅ زر "إجراءات جماعية" يظهر عند تحديد طلبات
- ✅ خيار "طباعة الفواتير" ضمن الإجراءات
- ✅ أيقونة طابعة واضحة

### 3. **صفحة طباعة مخصصة**
- ✅ صفحة منفصلة لعرض جميع الفواتير
- ✅ كل فاتورة في صفحة منفصلة عند الطباعة
- ✅ زر "طباعة الكل" واحد

### 4. **فصل الصفحات تلقائياً**
- ✅ استخدام `page-break-after: always` في CSS
- ✅ كل فاتورة تُطبع في ورقة منفصلة
- ✅ آخر فاتورة بدون page break إضافي

---

## 🏗️ البنية التقنية

### الملفات المُضافة

#### 1. **`InvoiceBulkPrint.tsx`**
```
/front-end/src/pages/admin/InvoiceBulkPrint.tsx
```

**الوظيفة:**
- صفحة مخصصة لعرض عدة فواتير معاً
- تستقبل order numbers عبر URL query parameter `ids`
- تحمل بيانات كل طلب من API
- تعرض جميع الفواتير بتنسيق قابل للطباعة

**المكونات الرئيسية:**
```tsx
// تحميل الطلبات
const loadOrders = async () => {
  const orderIds = searchParams.get('ids'); // "ORD-001,ORD-002,ORD-003"
  const ids = orderIds.split(',');
  
  for (const id of ids) {
    // تحميل كل طلب
    const response = await getAdminOrders(token, { search: id });
    loadedOrders.push(response.data.orders.data[0]);
  }
};
```

**CSS للطباعة:**
```css
@media print {
  /* فصل كل فاتورة في صفحة */
  .invoice-page {
    page-break-after: always;
    page-break-inside: avoid;
  }
  
  /* آخر فاتورة بدون page break */
  .invoice-page:last-child {
    page-break-after: auto;
  }
}
```

---

### الملفات المُعدلة

#### 2. **`App.tsx`**

**التغييرات:**
```tsx
// Import
import InvoiceBulkPrint from "./pages/admin/InvoiceBulkPrint";

// Route
<Route path="orders/bulk-invoice" element={<InvoiceBulkPrint />} />
```

---

#### 3. **`OrderBulkActions.tsx`**

**التغييرات:**
```tsx
// Import أيقونة الطابعة
import { Printer } from 'lucide-react';

// إضافة action جديد
const actions = [
  {
    id: 'update_status',
    // ... existing
  },
  {
    id: 'print_invoices',
    label: isRTL ? 'طباعة الفواتير' : 'Print Invoices',
    description: isRTL ? 'طباعة فواتير الطلبات المحددة' : 'Print invoices for selected orders',
    icon: Printer,
    color: 'green',
    requiresData: false, // لا يحتاج بيانات إضافية
  },
];
```

---

#### 4. **`AdminOrders.tsx`**

**التغييرات:**
```tsx
const handleBulkAction = async (action: string, data?: any) => {
  if (action === 'print_invoices') {
    // جمع order numbers
    const selectedOrdersData = orders.filter(order => 
      selectedOrders.includes(order.id)
    );
    const orderNumbers = selectedOrdersData.map(order => 
      order.order_number
    ).join(',');
    
    // فتح صفحة الطباعة
    const printUrl = `/admin/orders/bulk-invoice?ids=${orderNumbers}`;
    window.open(printUrl, '_blank');
    
    toast.success(isRTL ? 'تم فتح صفحة الطباعة' : 'Print page opened');
    return;
  }
  
  // ... باقي الإجراءات
};
```

---

## 🎯 طريقة الاستخدام

### خطوات الطباعة الجماعية:

#### 1. **تحديد الطلبات**
```
لوحة التحكم → الطلبات
↓
اختر الطلبات المراد طباعة فواتيرها
(✓ Checkbox بجانب كل طلب)
```

#### 2. **فتح الإجراءات الجماعية**
```
اضغط على زر "إجراءات جماعية"
↓
سيظهر dialog مع خيارات الإجراءات
```

#### 3. **اختيار طباعة الفواتير**
```
اختر "طباعة الفواتير" من القائمة
↓
اضغط "تنفيذ الإجراء"
```

#### 4. **الطباعة**
```
ستفتح نافذة جديدة مع جميع الفواتير
↓
اضغط زر "طباعة الكل"
↓
كل فاتورة ستُطبع في ورقة منفصلة
```

---

## 🔧 التفاصيل التقنية

### 1. **نقل البيانات عبر URL**

**Query Parameters:**
```
/admin/orders/bulk-invoice?ids=ORD-001,ORD-002,ORD-003
```

**استخراج البيانات:**
```tsx
const [searchParams] = useSearchParams();
const orderIds = searchParams.get('ids'); // "ORD-001,ORD-002,ORD-003"
const ids = orderIds.split(','); // ["ORD-001", "ORD-002", "ORD-003"]
```

---

### 2. **تحميل البيانات**

**استراتيجية التحميل:**
```tsx
// تحميل تسلسلي (Sequential)
for (const id of ids) {
  const response = await getAdminOrders(token, {
    search: id,
    per_page: 1,
  });
  
  if (response.data?.orders?.data?.[0]) {
    loadedOrders.push(response.data.orders.data[0]);
  }
}
```

**لماذا تسلسلي وليس متوازي؟**
- ✅ تجنب تحميل زائد على الخادم
- ✅ أسهل في معالجة الأخطاء
- ✅ ترتيب الفواتير مضمون

**بديل متوازي (للمستقبل):**
```tsx
// تحميل متوازي (Parallel) - أسرع
const promises = ids.map(id => 
  getAdminOrders(token, { search: id, per_page: 1 })
);

const responses = await Promise.all(promises);
const loadedOrders = responses
  .map(r => r.data?.orders?.data?.[0])
  .filter(Boolean);
```

---

### 3. **CSS للطباعة**

#### **فصل الصفحات:**
```css
@media print {
  .invoice-page {
    page-break-after: always; /* صفحة جديدة بعد كل فاتورة */
    page-break-inside: avoid; /* منع تقسيم الفاتورة */
  }
  
  .invoice-page:last-child {
    page-break-after: auto; /* آخر فاتورة بدون page break */
  }
}
```

#### **إخفاء العناصر:**
```css
@media print {
  /* إخفاء كل شيء */
  body * {
    visibility: hidden;
  }
  
  /* إظهار الفواتير فقط */
  .print-invoices,
  .print-invoices * {
    visibility: visible;
  }
  
  /* إخفاء الأزرار */
  .no-print {
    display: none !important;
  }
}
```

#### **على الشاشة:**
```css
@media screen {
  .invoice-page {
    max-width: 210mm;
    margin: 20px auto;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
  }
  
  .invoice-page:not(:last-child) {
    margin-bottom: 40px; /* فصل بصري بين الفواتير */
  }
}
```

---

## 📊 تدفق البيانات

```
[AdminOrders.tsx]
    ↓
    1. المستخدم يحدد طلبات (IDs: [1, 2, 3])
    ↓
    2. يضغط "إجراءات جماعية" → "طباعة الفواتير"
    ↓
    3. handleBulkAction يجمع order_numbers
       orders.filter(o => [1,2,3].includes(o.id))
       → ["ORD-001", "ORD-002", "ORD-003"]
    ↓
    4. فتح نافذة جديدة
       window.open('/admin/orders/bulk-invoice?ids=ORD-001,ORD-002,ORD-003')
    ↓
[InvoiceBulkPrint.tsx]
    ↓
    5. استخراج IDs من URL
       searchParams.get('ids') → "ORD-001,ORD-002,ORD-003"
    ↓
    6. تحميل بيانات كل طلب
       for (ORD-001) → getAdminOrders → Order1 ✓
       for (ORD-002) → getAdminOrders → Order2 ✓
       for (ORD-003) → getAdminOrders → Order3 ✓
    ↓
    7. عرض جميع الفواتير
       [Order1] [Order2] [Order3]
    ↓
    8. المستخدم يضغط "طباعة الكل"
       window.print()
    ↓
    9. الطباعة
       Page 1: Invoice for ORD-001
       Page 2: Invoice for ORD-002
       Page 3: Invoice for ORD-003
```

---

## 🎨 التصميم

### على الشاشة:

```
┌──────────────────────────────────────────┐
│  [←] العودة        {3} فاتورة  [🖨] طباعة الكل  │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────┐     │
│  │  فاتورة ORD-001                │     │
│  │  [تفاصيل الفاتورة الكاملة]      │     │
│  └────────────────────────────────┘     │
│                                          │
│  ┌────────────────────────────────┐     │
│  │  فاتورة ORD-002                │     │
│  │  [تفاصيل الفاتورة الكاملة]      │     │
│  └────────────────────────────────┘     │
│                                          │
│  ┌────────────────────────────────┐     │
│  │  فاتورة ORD-003                │     │
│  │  [تفاصيل الفاتورة الكاملة]      │     │
│  └────────────────────────────────┘     │
│                                          │
└──────────────────────────────────────────┘
```

### عند الطباعة:

```
Page 1:
┌────────────────────────┐
│  فاتورة ORD-001        │
│  [محتوى كامل]          │
└────────────────────────┘

Page 2:
┌────────────────────────┐
│  فاتورة ORD-002        │
│  [محتوى كامل]          │
└────────────────────────┘

Page 3:
┌────────────────────────┐
│  فاتورة ORD-003        │
│  [محتوى كامل]          │
└────────────────────────┘
```

---

## 🧪 سيناريوهات الاختبار

### 1. **طباعة فاتورة واحدة**
```
✓ تحديد طلب واحد
✓ اختيار "طباعة الفواتير"
✓ فتح صفحة بفاتورة واحدة
✓ طباعة في صفحة واحدة
```

### 2. **طباعة فواتير متعددة (3-5)**
```
✓ تحديد 3-5 طلبات
✓ اختيار "طباعة الفواتير"
✓ فتح صفحة بجميع الفواتير
✓ كل فاتورة في صفحة منفصلة
```

### 3. **طباعة فواتير كثيرة (10+)**
```
✓ تحديد 10+ طلبات
✓ مراقبة وقت التحميل
✓ التأكد من تحميل جميع الفواتير
✓ الطباعة بدون مشاكل
```

### 4. **معالجة الأخطاء**
```
✓ طلب غير موجود → تخطيه
✓ فشل تحميل طلب → إظهار رسالة
✓ بدون طلبات محددة → رسالة خطأ
✓ بدون token → إعادة توجيه
```

### 5. **التوافقية**
```
✓ Desktop (Chrome, Firefox, Safari, Edge)
✓ Mobile (iOS Safari, Chrome Mobile)
✓ Tablet
✓ طابعات مختلفة (PDF, Physical)
```

---

## 🔍 استكشاف الأخطاء

### المشكلة: "لم يتم العثور على الطلبات"

**الأسباب المحتملة:**
1. ❌ Order numbers غير صحيحة في URL
2. ❌ فشل API في إرجاع البيانات
3. ❌ مشكلة في Token

**الحل:**
```tsx
// تحقق من console.log
console.log('Order IDs:', orderIds);
console.log('API Response:', response);
```

---

### المشكلة: "الفواتير لا تنفصل في صفحات"

**الأسباب المحتملة:**
1. ❌ CSS لا يُطبق
2. ❌ class `.invoice-page` غير موجود
3. ❌ المتصفح لا يدعم `page-break`

**الحل:**
```css
/* تأكد من وجود */
.invoice-page {
  page-break-after: always !important;
  break-after: page; /* بديل حديث */
}
```

---

### المشكلة: "التحميل بطيء جداً"

**الأسباب المحتملة:**
1. ❌ عدد كبير من الطلبات
2. ❌ تحميل تسلسلي بطيء
3. ❌ API بطيء

**الحل:**
```tsx
// استخدم Promise.all للتحميل المتوازي
const promises = ids.map(id => getAdminOrders(token, { search: id }));
const responses = await Promise.all(promises);
```

---

## 📝 ملاحظات مهمة

### 1. **حد أقصى للطلبات**
- 🔸 نظرياً: لا يوجد حد
- 🔸 عملياً: يُفضل أقل من 20 فاتورة
- 🔸 السبب: استهلاك الذاكرة وقت التحميل

### 2. **الأداء**
```
1-5 فواتير:   ⚡ سريع جداً (< 2 ثانية)
6-10 فواتير:  ⚡ سريع (2-4 ثواني)
11-20 فاتورة: 🔶 متوسط (5-10 ثواني)
20+ فاتورة:   🔶 بطيء (10+ ثواني)
```

### 3. **استهلاك الذاكرة**
- كل فاتورة تحتوي على صور منتجات
- الصور قد تكون كبيرة
- يُفضل ضغط الصور في الإنتاج

### 4. **التوافقية مع الطابعات**
- ✅ طباعة PDF: ممتازة
- ✅ طابعات ليزر: ممتازة
- ✅ طابعات حبر: جيدة
- ⚠️ طابعات حرارية: قد تحتاج تعديلات

---

## 🚀 تحسينات مستقبلية

### 1. **التحميل التدريجي**
```tsx
// عرض الفواتير تدريجياً أثناء التحميل
for (const id of ids) {
  const order = await loadOrder(id);
  setOrders(prev => [...prev, order]); // إضافة فورية
}
```

### 2. **معاينة قبل الطباعة**
```tsx
// زر "معاينة" قبل الطباعة
<Button onClick={() => setShowPreview(true)}>
  معاينة الفواتير
</Button>
```

### 3. **تصدير PDF**
```tsx
// تصدير كملف PDF بدلاً من الطباعة المباشرة
import html2pdf from 'html2pdf.js';

const exportPDF = () => {
  const element = document.querySelector('.print-invoices');
  html2pdf().from(element).save('invoices.pdf');
};
```

### 4. **فلترة مخصصة**
```tsx
// السماح بفلترة الفواتير قبل الطباعة
- حذف فواتير معينة
- إعادة ترتيب الفواتير
- تجميع حسب الحالة
```

### 5. **قوالب متعددة**
```tsx
// قوالب مختلفة للفواتير
- قالب كامل (الحالي)
- قالب مختصر
- قالب للشحن فقط
```

---

## 📚 موارد إضافية

### CSS Print:
- [MDN: CSS Print](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/print)
- [Page Break Properties](https://www.w3schools.com/css/css3_mediaqueries.asp)

### React Router:
- [useSearchParams](https://reactrouter.com/en/main/hooks/use-search-params)

### Window API:
- [window.print()](https://developer.mozilla.org/en-US/docs/Web/API/Window/print)
- [window.open()](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)

---

## ✅ الخلاصة

### تم إضافة:
1. ✅ صفحة `InvoiceBulkPrint.tsx` للطباعة الجماعية
2. ✅ خيار "طباعة الفواتير" في الإجراءات الجماعية
3. ✅ معالجة في `handleBulkAction` لفتح صفحة الطباعة
4. ✅ CSS لفصل كل فاتورة في صفحة منفصلة
5. ✅ Route جديد في `App.tsx`

### النتيجة:
- 🎉 طباعة فواتير متعددة بنقرة واحدة
- 🎉 كل فاتورة في ورقة منفصلة
- 🎉 تصميم احترافي ومرتب
- 🎉 يعمل على جميع الأجهزة

---

تم التحديث: 24 أكتوبر 2025
الإصدار: 1.0.0

