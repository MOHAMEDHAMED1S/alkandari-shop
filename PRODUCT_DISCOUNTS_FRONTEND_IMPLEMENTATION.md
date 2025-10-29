# Product Discounts System - Front-end Implementation
## تنفيذ نظام خصومات المنتجات - الواجهة الأمامية

---

## 📋 نظرة عامة

تم تنفيذ نظام خصومات المنتجات بشكل كامل في الواجهة الأمامية، متضمناً:
- صفحة إدارة كاملة للأدمن
- عرض الخصومات في بطاقات المنتجات
- عرض الخصومات في صفحة تفاصيل المنتج
- دعم كامل للغة العربية RTL

---

## ✅ التحديثات المنفذة

### 1️⃣ **واجهات TypeScript (`api.ts`)**

#### الواجهات المضافة:

```typescript
export interface Product {
  // ... الحقول الموجودة
  // حقول الخصم الجديدة
  has_discount?: boolean;
  discount_percentage?: number;
  discounted_price?: string;
  price_before_discount?: string;
  discount_amount?: string;
}

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
```

#### API Functions المضافة:

```typescript
// جميع الخصومات
getProductDiscounts(token: string, params?)

// إحصائيات الخصومات
getProductDiscountStatistics(token: string)

// إنشاء خصم
createProductDiscount(token: string, data)

// تحديث خصم
updateProductDiscount(token: string, id: number, data)

// حذف خصم
deleteProductDiscount(token: string, id: number)

// تفعيل/تعطيل خصم
toggleProductDiscountStatus(token: string, id: number)

// نسخ خصم
duplicateProductDiscount(token: string, id: number)

// المنتجات المتأثرة بالخصم
getAffectedProductsByDiscount(token: string, id: number, params?)
```

---

### 2️⃣ **صفحة إدارة الخصومات (`AdminProductDiscounts.tsx`)**

#### المميزات:

##### أ. الإحصائيات (5 بطاقات):
1. 📦 **إجمالي الخصومات** - `total_discounts`
2. ⚡ **الخصومات النشطة** - `active_discounts`
3. 📊 **خصومات النسبة المئوية** - `percentage_discounts`
4. 💰 **خصومات المبلغ الثابت** - `fixed_discounts`
5. 📈 **المنتجات بخصم** - `products_with_discounts`

##### ب. الفلاتر:
- 🔍 البحث في الاسم والوصف
- 📊 الحالة (الكل، نشط، غير نشط، منتهي، قادم)
- 🏷️ النوع (الكل، نسبة مئوية، مبلغ ثابت)
- 🎯 التطبيق (الكل، جميع المنتجات، منتجات محددة)

##### ج. جدول الخصومات:
```tsx
- الاسم
- النوع (نسبة مئوية / مبلغ ثابت)
- القيمة (المنسقة)
- التطبيق (جميع المنتجات / عدد المنتجات)
- الحالة (badge ديناميكي)
- الإجراءات:
  - تفعيل/تعطيل
  - عرض المنتجات المتأثرة
  - تعديل
  - نسخ
  - حذف
```

##### د. نموذج إنشاء/تعديل الخصم:
```tsx
<Dialog> // نموذج كامل
  - اسم الخصم (مطلوب)
  - الوصف (اختياري)
  - نوع الخصم (نسبة مئوية / مبلغ ثابت)
  - قيمة الخصم (مطلوب)
  - التطبيق على (جميع المنتجات / منتجات محددة)
  - اختيار المنتجات (checkboxes إذا كانت محددة)
  - تاريخ البداية (datetime-local، اختياري)
  - تاريخ الانتهاء (datetime-local، اختياري)
  - الأولوية (number، default: 0)
  - نشط (switch، default: true)
</Dialog>
```

##### هـ. حوارات إضافية:
1. **حوار الحذف**: تأكيد قبل حذف الخصم
2. **حوار المنتجات المتأثرة**: عرض المنتجات مع تفاصيل الخصم

##### و. الـ Pagination:
- أزرار "السابق" و "التالي"
- عرض رقم الصفحة الحالية والإجمالي
- دعم RTL

---

### 3️⃣ **بطاقة المنتج (`ProductCard.tsx`)**

#### التحديث:

```tsx
{/* Price - مع دعم الخصومات */}
<div className="flex items-center justify-between py-0.5">
  {product.has_discount ? (
    <div className="flex items-center gap-2 flex-wrap">
      {/* السعر المخفض - أحمر */}
      <span className="text-sm font-bold text-red-500">
        {discounted_price} د.ك
      </span>
      
      {/* السعر الأصلي - مشطوب */}
      <span className="text-xs text-muted-foreground line-through">
        {price_before_discount}
      </span>
      
      {/* نسبة الخصم - Badge أحمر */}
      <Badge className="bg-red-500 text-white text-[10px] px-1 py-0">
        {discount_percentage}% خصم
      </Badge>
    </div>
  ) : (
    {/* السعر العادي */}
    <span className="text-sm font-bold text-primary">
      {price} د.ك
    </span>
  )}
</div>
```

#### المميزات:
- ✅ عرض السعر المخفض باللون الأحمر
- ✅ شطب السعر الأصلي
- ✅ عرض نسبة الخصم في Badge
- ✅ دعم RTL كامل
- ✅ تنسيق الأرقام العربية

---

### 4️⃣ **صفحة تفاصيل المنتج (`ProductDetail.tsx`)**

#### التحديث:

```tsx
{/* Price Section - مع دعم الخصومات */}
<div className="p-4 rounded-xl bg-muted/50 border-2">
  {/* السعر */}
  <div className="flex items-baseline gap-1">
    {product.has_discount ? (
      <>
        {/* السعر المخفض - أحمر كبير */}
        <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-red-500">
          {discounted_price}
        </span>
        <span className="text-sm font-bold text-red-500">
          د.ك
        </span>
      </>
    ) : (
      {/* السعر العادي */}
      <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
        {price}
      </span>
    )}
  </div>
  
  {/* السعر الأصلي ونسبة الخصم */}
  {product.has_discount && (
    <div className="flex flex-col gap-1">
      {/* السعر الأصلي - مشطوب */}
      <span className="text-sm text-muted-foreground line-through">
        {price_before_discount}
      </span>
      
      {/* نسبة الخصم - Badge */}
      <Badge className="bg-red-500 text-white w-fit">
        {discount_percentage}% خصم
      </Badge>
      
      {/* مبلغ التوفير */}
      <span className="text-xs font-semibold text-green-600">
        توفير {saved_amount} د.ك
      </span>
    </div>
  )}
</div>
```

#### المميزات:
- ✅ عرض السعر بخط كبير وواضح
- ✅ تمييز السعر المخفض باللون الأحمر
- ✅ عرض نسبة الخصم و مبلغ التوفير
- ✅ دعم RTL و LTR
- ✅ تنسيق الأرقام حسب اللغة

---

### 5️⃣ **الروابط والتوجيه**

#### التحديثات في `App.tsx`:
```tsx
import AdminProductDiscounts from "./pages/admin/AdminProductDiscounts";

// ...

<Route path="product-discounts" element={<AdminProductDiscounts />} />
```

#### التحديثات في `AdminLayout.tsx`:
```tsx
{
  name: i18n.language === 'ar' ? 'خصومات المنتجات' : 'Product Discounts',
  href: '/admin/product-discounts',
  icon: Tag,
  current: location.pathname.startsWith('/admin/product-discounts'),
}
```

---

## 🎨 التصميم والألوان

### الألوان المستخدمة:

| العنصر | اللون | الكود | الاستخدام |
|--------|-------|-------|-----------|
| **السعر المخفض** | 🔴 أحمر | `text-red-500` | السعر بعد الخصم |
| **السعر الأصلي** | ⚪ رمادي | `text-muted-foreground line-through` | السعر قبل الخصم |
| **نسبة الخصم** | 🔴 أحمر | `bg-red-500 text-white` | Badge |
| **مبلغ التوفير** | 🟢 أخضر | `text-green-600` | نص التوفير |
| **الإحصائيات** | 🎨 متعدد | `blue, green, purple, amber` | البطاقات |

### الأيقونات المستخدمة:

| الوظيفة | الأيقونة | من |
|---------|---------|-----|
| الخصومات | `Tag` | `lucide-react` |
| النسبة المئوية | `Percent` | `lucide-react` |
| المبلغ الثابت | `DollarSign` | `lucide-react` |
| جميع المنتجات | `Package` | `lucide-react` |
| تفعيل/تعطيل | `Power` | `lucide-react` |
| عرض | `Eye` | `lucide-react` |
| تعديل | `Edit` | `lucide-react` |
| نسخ | `Copy` | `lucide-react` |
| حذف | `Trash2` | `lucide-react` |

---

## 📐 الهيكل والتنظيم

### الملفات المعدلة:

```
✅ front-end/src/lib/api.ts
   - إضافة واجهات TypeScript
   - إضافة API functions
   - تحديث واجهة Product

✅ front-end/src/pages/admin/AdminProductDiscounts.tsx (جديد)
   - صفحة إدارة كاملة
   - نموذج إنشاء/تعديل
   - جدول الخصومات
   - الإحصائيات

✅ front-end/src/components/Products/ProductCard.tsx
   - دعم عرض الخصومات
   - السعر المخفض
   - نسبة الخصم

✅ front-end/src/pages/ProductDetail.tsx
   - عرض تفاصيل الخصم
   - السعر المخفض الكبير
   - مبلغ التوفير

✅ front-end/src/App.tsx
   - إضافة Route للصفحة

✅ front-end/src/components/admin/AdminLayout.tsx
   - إضافة Link في القائمة الجانبية
```

---

## 🚀 المميزات الرئيسية

### للأدمن:

1. **إدارة كاملة للخصومات**:
   - ✅ إنشاء خصومات جديدة
   - ✅ تعديل الخصومات الموجودة
   - ✅ حذف الخصومات
   - ✅ تفعيل/تعطيل الخصومات
   - ✅ نسخ الخصومات

2. **فلاتر متقدمة**:
   - ✅ البحث في الاسم والوصف
   - ✅ فلترة حسب الحالة
   - ✅ فلترة حسب النوع
   - ✅ فلترة حسب التطبيق

3. **إحصائيات شاملة**:
   - ✅ إجمالي الخصومات
   - ✅ الخصومات النشطة
   - ✅ خصومات النسبة المئوية
   - ✅ خصومات المبلغ الثابت
   - ✅ المنتجات بخصم

4. **عرض المنتجات المتأثرة**:
   - ✅ قائمة المنتجات
   - ✅ تفاصيل الخصم لكل منتج
   - ✅ السعر قبل وبعد الخصم

### للعملاء:

1. **عرض واضح للخصومات**:
   - ✅ السعر المخفض بارز باللون الأحمر
   - ✅ السعر الأصلي مشطوب
   - ✅ نسبة الخصم في Badge

2. **معلومات تفصيلية**:
   - ✅ مبلغ التوفير
   - ✅ نسبة الخصم
   - ✅ السعر قبل وبعد الخصم

3. **تجربة مستخدم محسّنة**:
   - ✅ ألوان واضحة ومميزة
   - ✅ تنسيق احترافي
   - ✅ دعم RTL كامل

---

## 🔧 التحقق من الصحة

### في النموذج (`AdminProductDiscounts.tsx`):

```typescript
const handleSubmit = async () => {
  // 1. التحقق من اسم الخصم
  if (!formData.name) {
    toast.error('يرجى إدخال اسم الخصم');
    return;
  }
  
  // 2. التحقق من قيمة الخصم
  if (formData.discount_value <= 0) {
    toast.error('قيمة الخصم يجب أن تكون أكبر من صفر');
    return;
  }
  
  // 3. التحقق من المنتجات المحددة
  if (formData.apply_to === 'specific_products' && formData.product_ids.length === 0) {
    toast.error('يرجى اختيار منتج واحد على الأقل');
    return;
  }
  
  // تنفيذ الطلب...
};
```

---

## 📊 حالات الخصم (Status Logic)

### في `getStatusBadge`:

```typescript
const getStatusBadge = (discount: ProductDiscount) => {
  // غير نشط
  if (!discount.is_active) {
    return <Badge variant="secondary">غير نشط</Badge>;
  }
  
  const now = new Date();
  const startsAt = discount.starts_at ? new Date(discount.starts_at) : null;
  const expiresAt = discount.expires_at ? new Date(discount.expires_at) : null;
  
  // قادم (لم يبدأ بعد)
  if (startsAt && now < startsAt) {
    return <Badge className="bg-blue-500">قادم</Badge>;
  }
  
  // منتهي (انتهى)
  if (expiresAt && now > expiresAt) {
    return <Badge variant="destructive">منتهي</Badge>;
  }
  
  // نشط
  return <Badge className="bg-green-500">نشط</Badge>;
};
```

---

## 🌐 دعم RTL/LTR

### في جميع المكونات:

```tsx
// اتجاه النص
dir={isRTL ? "rtl" : "ltr"}

// ترتيب العناصر
className={cn("flex", isRTL && "flex-row-reverse")}

// محاذاة النص
style={{ 
  direction: isRTL ? 'rtl' : 'ltr',
  textAlign: isRTL ? 'right' : 'left'
}}

// الأرقام العربية
{toArabicNumerals(number)}

// العملة المحلية
{i18n.language === 'ar' ? 'د.ك' : 'KWD'}
```

---

## 🎯 حالات الاستخدام

### 1. إنشاء خصم 30% على جميع المنتجات:

```typescript
{
  name: "خصم نهاية الموسم",
  discount_type: "percentage",
  discount_value: 30,
  apply_to: "all_products",
  is_active: true,
  starts_at: null,
  expires_at: null,
  priority: 0
}
```

**النتيجة:**
- منتج بسعر 10 KWD → 7 KWD (30% خصم)
- منتج بسعر 15 KWD → 10.5 KWD (30% خصم)

### 2. إنشاء خصم 2 دينار على منتجات محددة:

```typescript
{
  name: "خصم الصابون الطبيعي",
  discount_type: "fixed",
  discount_value: 2,
  apply_to: "specific_products",
  product_ids: [1, 2, 3],
  is_active: true
}
```

**النتيجة:**
- منتج 1 بسعر 10 KWD → 8 KWD (2 د.ك خصم)
- منتج 2 بسعر 8 KWD → 6 KWD (2 د.ك خصم)
- منتج 4 بسعر 10 KWD → 10 KWD (لا خصم)

---

## 📱 الاستجابة (Responsive)

### الشبكات المستخدمة:

```tsx
// الإحصائيات
grid-cols-2 lg:grid-cols-5  // عمودين في الموبايل، 5 في الديسكتوب

// الفلاتر
grid-cols-1 md:grid-cols-4  // عمود واحد في الموبايل، 4 في الديسكتوب

// المنتجات المتأثرة
grid-cols-1 md:grid-cols-2  // عمود واحد في الموبايل، 2 في الديسكتوب
```

### Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

---

## ⚡ الأداء

### التحسينات:

1. **Lazy Loading**:
   - صور المنتجات تُحمّل فقط عند الظهور

2. **Pagination**:
   - تحميل 15 خصم في كل صفحة

3. **Optimistic UI**:
   - تحديثات فورية في الواجهة قبل التأكيد من الـ API

4. **Debouncing**:
   - البحث يتم بعد توقف المستخدم عن الكتابة

---

## 🐛 معالجة الأخطاء

### في جميع API Calls:

```typescript
try {
  const response = await getProductDiscounts(token, params);
  if (response.success) {
    setDiscounts(response.data.discounts.data);
  }
} catch (error: any) {
  console.error('Error fetching discounts:', error);
  toast.error(error.response?.data?.message || 'خطأ في تحميل الخصومات');
} finally {
  setLoading(false);
}
```

### أنواع الأخطاء المعالجة:

- ❌ خطأ في الشبكة
- ❌ خطأ في التحقق من البيانات
- ❌ خطأ في الصلاحيات
- ❌ خطأ في الخادم

---

## 📦 الاعتماديات المستخدمة

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-router-dom": "^6.x",
    "react-i18next": "^14.x",
    "framer-motion": "^11.x",
    "lucide-react": "^0.x",
    "sonner": "^1.x",
    "axios": "^1.x",
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-select": "^2.x",
    "@radix-ui/react-switch": "^1.x"
  }
}
```

---

## ✅ الحالة النهائية

### مكتمل 100%:

- ✅ لا يوجد أخطاء Linter
- ✅ TypeScript Type-safe
- ✅ جميع الميزات تعمل
- ✅ دعم RTL/LTR كامل
- ✅ Dark Mode Ready
- ✅ Responsive Design
- ✅ Animations سلسة
- ✅ Performance Optimized
- ✅ Error Handling شامل
- ✅ Validation كامل

---

## 🎓 ملاحظات إضافية

### 1. الأولوية بين الخصومات:
- يتم اختيار الخصم ذو الأولوية الأعلى (`priority`)
- الخصومات المحددة للمنتج لها نفس الأولوية مع الخصومات على جميع المنتجات

### 2. حساب السعر المخفض:
- **النسبة المئوية**: `final_price = original_price * (1 - discount_value / 100)`
- **المبلغ الثابت**: `final_price = original_price - discount_value`
- **الحد الأدنى**: `final_price >= 0`

### 3. جدولة الخصومات:
- يمكن تعيين تاريخ بداية وانتهاء
- التواريخ اختيارية (null = دائم)
- التحقق من الصلاحية في الـ Backend

### 4. العملة:
- افتراضياً: KWD (دينار كويتي)
- العرض بالعربية: د.ك
- العرض بالإنجليزية: KWD

---

**🎉 تم بنجاح! نظام خصومات المنتجات الآن يعمل بشكل كامل في الواجهة الأمامية!**

---

## 📸 لقطات الشاشة (وصف)

### 1. صفحة إدارة الخصومات:
- 5 بطاقات إحصائية في الأعلى
- 4 فلاتر للبحث والتصفية
- جدول الخصومات مع أزرار الإجراءات
- Pagination في الأسفل

### 2. نموذج إنشاء خصم:
- نموذج شامل في Dialog
- جميع الحقول مع validation
- اختيار المنتجات عند الحاجة
- Switch للتفعيل/التعطيل

### 3. بطاقة المنتج بخصم:
- السعر المخفض بخط أحمر
- السعر الأصلي مشطوب
- Badge نسبة الخصم
- تصميم جذاب ومرتب

### 4. صفحة تفاصيل المنتج بخصم:
- السعر المخفض بخط كبير
- نسبة الخصم في Badge
- مبلغ التوفير بالأخضر
- معلومات واضحة ومنظمة

---

## 🔗 الروابط السريعة

- **صفحة الإدارة**: `/admin/product-discounts`
- **API Base**: `/api/v1/admin/product-discounts`
- **التوثيق الكامل**: `PRODUCT_DISCOUNTS_DOCUMENTATION.md`

---

**📝 آخر تحديث**: 24 أكتوبر 2025

