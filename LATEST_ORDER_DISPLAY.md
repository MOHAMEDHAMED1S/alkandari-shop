# عرض آخر طلب في تفاصيل العميل
## Latest Order Display in Customer Details

---

## 📋 نظرة عامة

تم إضافة قسم جديد في صفحة تفاصيل العميل لعرض معلومات آخر طلب للعميل (`latest_order`) من API بشكل كامل ومنظم.

---

## ✅ التحديث المنفذ

### قسم "آخر طلب" الجديد

تم إضافة بطاقة كاملة لعرض تفاصيل آخر طلب للعميل، تظهر فقط إذا كان `customer.latest_order` موجوداً.

---

## 📊 البيانات المعروضة

### 1. **معلومات الطلب الأساسية (4 بطاقات)**

#### أ. رقم الطلب (Order Number):
```tsx
<div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
  <span>{isRTL ? 'رقم الطلب' : 'Order Number'}</span>
  <div>#{customer.latest_order.order_number}</div>
</div>
```

**البيانات:**
- `customer.latest_order.order_number`
- **اللون**: أزرق (Blue)
- **الأيقونة**: `FileText`

---

#### ب. حالة الطلب (Order Status):
```tsx
<Badge className={`
  ${customer.latest_order.status === 'paid' ? 'bg-green-500 text-white' : ''}
  ${customer.latest_order.status === 'delivered' ? 'bg-purple-500 text-white' : ''}
  ${customer.latest_order.status === 'pending' ? 'bg-yellow-500 text-white' : ''}
  ${customer.latest_order.status === 'awaiting_payment' ? 'bg-orange-500 text-white' : ''}
`}>
  {/* نص مترجم حسب الحالة */}
</Badge>
```

**البيانات:**
- `customer.latest_order.status`
- **الألوان الديناميكية**:
  - 🟢 `paid` → أخضر
  - 🟣 `delivered` → بنفسجي
  - 🟡 `pending` → أصفر
  - 🟠 `awaiting_payment` → برتقالي
- **الترجمة العربية**: مدفوع، تم التوصيل، قيد الانتظار، بانتظار الدفع
- **الأيقونة**: `Activity`

---

#### ج. المبلغ الإجمالي (Total Amount):
```tsx
<div className="text-sm sm:text-base font-bold text-purple-900">
  {toArabicNumerals(parseFloat(customer.latest_order.total_amount).toFixed(1))} 
  {getLocalizedCurrency(customer.latest_order.currency)}
</div>
```

**البيانات:**
- `customer.latest_order.total_amount`
- `customer.latest_order.currency`
- **التنسيق**: أرقام عربية + عملة محلية (د.ك / KWD)
- **اللون**: بنفسجي (Purple)
- **الأيقونة**: `DollarSign`

---

#### د. تاريخ الطلب (Order Date):
```tsx
<div className="text-sm sm:text-base font-bold text-indigo-900">
  {new Date(customer.latest_order.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
</div>
```

**البيانات:**
- `customer.latest_order.created_at`
- **التنسيق**: تاريخ محلي (عربي/إنجليزي)
- **اللون**: نيلي (Indigo)
- **الأيقونة**: `Calendar`

---

### 2. **رقم التتبع (Tracking Number) - اختياري**

```tsx
{customer.latest_order.tracking_number && (
  <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-slate-50">
    <div className="flex items-center justify-between">
      <div>
        <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>{isRTL ? 'رقم التتبع' : 'Tracking Number'}</span>
        <div>{customer.latest_order.tracking_number}</div>
      </div>
      <Button onClick={() => copyToClipboard(...)}>
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  </div>
)}
```

**المميزات:**
- عرض رقم التتبع مع زر نسخ
- يظهر فقط إذا كان `tracking_number` موجوداً
- **الأيقونة**: `Activity` + `Copy`
- **اللون**: رمادي (Slate)

---

### 3. **عنوان الشحن (Shipping Address) - اختياري**

```tsx
{customer.latest_order.shipping_address && (
  <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-teal-50">
    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
    <span>{isRTL ? 'عنوان الشحن' : 'Shipping Address'}</span>
    <div>
      {customer.latest_order.shipping_address.street && <div>{street}</div>}
      {customer.latest_order.shipping_address.city && <div>{city}</div>}
      {customer.latest_order.shipping_address.governorate && <div>{governorate}</div>}
      {customer.latest_order.shipping_address.postal_code && <div>{postal_code}</div>}
    </div>
  </div>
)}
```

**البيانات المعروضة:**
- `customer.latest_order.shipping_address.street` - الشارع (font-bold)
- `customer.latest_order.shipping_address.city` - المدينة (font-medium)
- `customer.latest_order.shipping_address.governorate` - المحافظة
- `customer.latest_order.shipping_address.postal_code` - الرمز البريدي (text-xs)

**المميزات:**
- يظهر فقط إذا كان `shipping_address` موجوداً
- **الأيقونة**: `MapPin`
- **اللون**: تيل/أخضر مزرق (Teal)

---

## 🎨 التصميم

### البطاقة الرئيسية:
```css
- Border: border-r-4 border-r-amber-500 (حد أيمن كهرماني)
- Background: bg-gradient-to-br from-slate-50 to-slate-100/50
- Shadow: shadow-lg hover:shadow-xl
- Rounded: rounded-2xl
```

### الألوان المستخدمة:
| العنصر | اللون | الاستخدام |
|--------|-------|-----------|
| **رقم الطلب** | 🔵 أزرق (Blue) | معلومات تعريفية |
| **الحالة** | 🎨 ديناميكي | حسب حالة الطلب |
| **المبلغ** | 🟣 بنفسجي (Purple) | معلومات مالية |
| **التاريخ** | 🔵 نيلي (Indigo) | معلومات زمنية |
| **رقم التتبع** | ⚪ رمادي (Slate) | معلومات إضافية |
| **العنوان** | 🟦 تيل (Teal) | معلومات مكانية |

---

## 🎯 حالات الطلب (Status) المدعومة

### الترجمة والألوان:

| Status | العربية | اللون | الكود |
|--------|---------|-------|------|
| `paid` | مدفوع | 🟢 أخضر | `bg-green-500` |
| `delivered` | تم التوصيل | 🟣 بنفسجي | `bg-purple-500` |
| `pending` | قيد الانتظار | 🟡 أصفر | `bg-yellow-500` |
| `awaiting_payment` | بانتظار الدفع | 🟠 برتقالي | `bg-orange-500` |

---

## 📐 Layout

### الشبكة (Grid):
```css
grid grid-cols-1 sm:grid-cols-2 gap-4
```

**البطاقات الأساسية (4):**
- 📱 موبايل: عمود واحد
- 💻 ديسكتوب: عمودين

**العناصر الإضافية:**
- رقم التتبع: عرض كامل
- عنوان الشحن: عرض كامل

---

## ✨ المميزات

### 1. **شرطية العرض**:
```tsx
{customer.latest_order && (
  // يظهر القسم فقط إذا كان هناك طلب أخير
)}
```

### 2. **نسخ رقم التتبع**:
```tsx
<Button onClick={() => copyToClipboard(
  customer.latest_order!.tracking_number, 
  isRTL ? 'رقم التتبع' : 'Tracking Number'
)}>
  <Copy />
</Button>
```

### 3. **تنسيق محلي**:
- أرقام عربية في الواجهة العربية
- عملة محلية (د.ك / KWD)
- تاريخ بتنسيق محلي (ar-SA / en-US)

### 4. **Animations**:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4, duration: 0.6 }}
>
```

---

## 🔧 البيانات المستخدمة من API

### من `customer.latest_order`:

```typescript
interface CustomerLatestOrder {
  id: number;                        // ❌ غير معروض
  customer_id: number;               // ❌ غير معروض
  order_number: string;              // ✅ معروض
  customer_name: string;             // ❌ غير معروض (لأنه نفس اسم العميل)
  customer_phone: string;            // ❌ غير معروض
  customer_email: string | null;     // ❌ غير معروض
  shipping_address: {                // ✅ معروض كاملاً
    city: string;
    street: string;
    governorate: string;
    postal_code: string | null;
  };
  total_amount: string;              // ✅ معروض
  currency: string;                  // ✅ معروض
  status: string;                    // ✅ معروض مع ترجمة
  tracking_number: string;           // ✅ معروض
  shipping_date: string | null;      // ❌ غير معروض
  delivery_date: string | null;      // ❌ غير معروض
  payment_id: number | null;         // ❌ غير معروض
  notes: string | null;              // ❌ غير معروض
  discount_code: string | null;      // ❌ غير معروض
  discount_amount: string;           // ❌ غير معروض
  subtotal_amount: string;           // ❌ غير معروض
  shipping_amount: string;           // ❌ غير معروض
  free_shipping: boolean;            // ❌ غير معروض
  admin_notes: string | null;        // ❌ غير معروض
  created_at: string;                // ✅ معروض
  updated_at: string;                // ❌ غير معروض
}
```

**البيانات المعروضة:**
- ✅ `order_number`
- ✅ `status` (مع ترجمة وألوان)
- ✅ `total_amount` (مع تنسيق)
- ✅ `currency` (محلي)
- ✅ `created_at` (تاريخ محلي)
- ✅ `tracking_number` (اختياري + نسخ)
- ✅ `shipping_address` (كامل، اختياري)

---

## 📁 الملف المعدل

```
✅ front-end/src/components/admin/CustomerDetails.tsx
   - إضافة قسم "آخر طلب" كامل
   - عرض 4 بطاقات أساسية
   - عرض رقم التتبع (اختياري)
   - عرض عنوان الشحن (اختياري)
   - دعم نسخ رقم التتبع
   - تنسيق محلي للأرقام والتواريخ
   - ألوان ديناميكية للحالات
```

---

## 🚀 جاهز للاستخدام!

- ✅ لا يوجد أخطاء Linter
- ✅ عرض شرطي (يظهر فقط إذا كان هناك طلب)
- ✅ تنسيق محلي كامل
- ✅ دعم RTL/LTR
- ✅ Dark Mode Ready
- ✅ Responsive Design
- ✅ Animations سلسة
- ✅ Copy to clipboard للتتبع

---

**🎉 تم بنجاح! الآن يمكن رؤية آخر طلب للعميل بتفاصيل كاملة!**

