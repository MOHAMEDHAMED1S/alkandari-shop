# Cart & Checkout Discounts Integration
## دعم الخصومات في السلة والدفع

---

## 📋 نظرة عامة

تم تحديث صفحات السلة (Cart) والدفع (Checkout) لدعم نظام الخصومات بشكل كامل، بحيث تظهر المنتجات بأسعارها المخفضة مع عرض السعر الأصلي ونسبة الخصم.

---

## ✅ التحديثات المنفذة

### 1️⃣ **CartContext (`CartContext.tsx`)**

#### تحديث دالة `getSubtotal()`:

```typescript
const getSubtotal = () => {
  return cart.reduce((total, item) => {
    const itemPrice = item.has_discount && item.discounted_price
      ? parseFloat(item.discounted_price.toString())
      : parseFloat(item.price.toString());
    return total + itemPrice * item.quantity;
  }, 0);
};
```

**المميزات:**
- ✅ تحسب المجموع الفرعي باستخدام السعر المخفض إذا كان موجوداً
- ✅ تعمل تلقائياً مع جميع المكونات التي تستخدم `getSubtotal()`

---

### 2️⃣ **صفحة السلة (`Cart.tsx`)**

#### أ. تحديث حساب المجموع الفرعي:

```typescript
const subtotal = cart.reduce((total, item) => {
  const itemPrice = item.has_discount && item.discounted_price
    ? parseFloat(item.discounted_price.toString())
    : parseFloat(item.price.toString());
  return total + itemPrice * item.quantity;
}, 0);
```

#### ب. تحديث عرض سعر المنتج:

```tsx
{/* Price Section */}
<div className="mb-2 sm:mb-3 md:mb-4">
  {item.has_discount ? (
    <>
      {/* Discounted Price - أحمر */}
      <div className="flex items-baseline gap-1 sm:gap-2 mb-1">
        <span className="text-lg sm:text-2xl md:text-3xl font-bold text-red-500">
          {discounted_price}
        </span>
        <span className="text-sm sm:text-base md:text-lg font-semibold text-red-500">
          KWD
        </span>
      </div>
      
      {/* Original Price & Discount Badge */}
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className="text-xs sm:text-sm text-muted-foreground line-through">
          {price_before_discount} KWD
        </span>
        <span className="bg-red-500 text-white text-xs font-bold rounded-md px-2 py-0.5">
          {discount_percentage}% خصم
        </span>
      </div>
    </>
  ) : (
    {/* Regular Price */}
    <div className="flex items-baseline gap-1 sm:gap-2 mb-1">
      <span className="text-lg sm:text-2xl md:text-3xl font-bold text-primary">
        {price}
      </span>
      <span className="text-sm sm:text-base md:text-lg font-semibold text-primary/70">
        KWD
      </span>
    </div>
  )}
  
  {/* Per Piece Badge */}
  <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-primary/10 rounded-md sm:rounded-lg">
    <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
    <span className="text-xs font-medium text-primary">للقطعة</span>
  </div>
</div>
```

#### ج. تحديث عرض الإجمالي لكل منتج:

```tsx
{/* Total for this item */}
<div className="flex items-center gap-1 sm:gap-2">
  {(() => {
    const itemPrice = item.has_discount && item.discounted_price
      ? parseFloat(item.discounted_price.toString())
      : parseFloat(item.price.toString());
    const itemTotal = (itemPrice * item.quantity).toFixed(3);
    
    return (
      <span className={cn("font-bold", item.has_discount ? "text-red-500" : "text-primary")}>
        {itemTotal} KWD
      </span>
    );
  })()}
</div>
```

**المميزات:**
- 🔴 السعر المخفض باللون الأحمر وبارز
- ~~السعر الأصلي مشطوب~~
- 🏷️ Badge نسبة الخصم
- ✅ الإجمالي لكل منتج باللون الأحمر إذا كان مخفضاً
- ✅ دعم RTL/LTR كامل
- ✅ Responsive على جميع الشاشات

---

### 3️⃣ **صفحة الدفع (`Checkout.tsx`)**

#### تحديث عرض المنتجات في ملخص الطلب:

```tsx
{/* Cart Items */}
<div className="space-y-3 sm:space-y-4 md:space-y-5">
  {cart.map((item) => {
    const itemPrice = item.has_discount && item.discounted_price
      ? Number(item.discounted_price)
      : Number(item.price);
    const itemTotal = (itemPrice * Number(item.quantity)).toFixed(3);
    
    return (
      <div key={item.id} className="py-2 sm:py-3 border-b">
        {/* Item Title and Quantity */}
        <div className="flex justify-between items-start mb-1">
          <span className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
            {item.title} × {item.quantity}
          </span>
          
          {/* Price Section */}
          <div className="flex flex-col items-end">
            {/* Price with discount styling */}
            <span className={cn("font-bold text-sm sm:text-base md:text-lg", 
              item.has_discount ? "text-red-500" : "text-gray-900 dark:text-white")}>
              {itemTotal} KWD
            </span>
            
            {/* Show original price and discount badge if discounted */}
            {item.has_discount && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground line-through">
                  {(Number(item.price_before_discount || item.price) * Number(item.quantity)).toFixed(3)}
                </span>
                {item.discount_percentage && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded px-1.5 py-0.5">
                    {Math.round(item.discount_percentage)}% خصم
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  })}
</div>
```

**المميزات:**
- 🔴 السعر المخفض باللون الأحمر
- ~~السعر الأصلي مشطوب~~ (تحت السعر المخفض)
- 🏷️ Badge صغير لنسبة الخصم
- ✅ التخطيط مُحسّن لعرض معلومات الخصم
- ✅ دعم RTL/LTR كامل
- ✅ Responsive على جميع الشاشات

---

## 🎨 التصميم والألوان

### في صفحة السلة (Cart):

| العنصر | التنسيق | اللون |
|--------|---------|-------|
| **السعر المخفض (كبير)** | `text-lg sm:text-2xl md:text-3xl font-bold` | 🔴 `text-red-500` |
| **العملة (المخفضة)** | `text-sm sm:text-base md:text-lg font-semibold` | 🔴 `text-red-500` |
| **السعر الأصلي** | `text-xs sm:text-sm` | ⚪ `text-muted-foreground line-through` |
| **نسبة الخصم** | `text-xs font-bold px-2 py-0.5 rounded-md` | 🔴 `bg-red-500 text-white` |
| **إجمالي المنتج** | `text-sm sm:text-lg md:text-xl font-bold` | 🔴 `text-red-500` (إذا مخفض) |
| **السعر العادي** | `text-lg sm:text-2xl md:text-3xl font-bold` | 🔵 `text-primary` (gradient) |

### في صفحة الدفع (Checkout):

| العنصر | التنسيق | اللون |
|--------|---------|-------|
| **السعر المخفض** | `text-sm sm:text-base md:text-lg font-bold` | 🔴 `text-red-500` |
| **السعر الأصلي** | `text-xs` | ⚪ `text-muted-foreground line-through` |
| **نسبة الخصم** | `text-[10px] font-bold px-1.5 py-0.5 rounded` | 🔴 `bg-red-500 text-white` |
| **السعر العادي** | `text-sm sm:text-base md:text-lg font-bold` | ⚫ `text-gray-900 dark:text-white` |

---

## 📐 التخطيط (Layout)

### في صفحة السلة:

```
┌─────────────────────────────────────┐
│ [صورة المنتج]                      │
│                                     │
│ اسم المنتج                          │
│                                     │
│ 🔴 7.000 د.ك  (سعر مخفض كبير)      │
│ ~~10.000 د.ك~~  [30% خصم]          │
│ [للقطعة]                            │
│                                     │
│ الإجمالي: 🔴 14.000 د.ك            │
│                                     │
│ الكمية: [-] 2 [+]  [🗑️]           │
└─────────────────────────────────────┘
```

### في صفحة الدفع:

```
┌─────────────────────────────────────┐
│ صابون طبيعي × 2         🔴 14.000   │
│                        ~~20.000~~    │
│                        [30% خصم]     │
├─────────────────────────────────────┤
│ صابون زيت الزيتون × 1      5.000   │
├─────────────────────────────────────┤
│ المجموع الفرعي:              19.000 │
│ الشحن:                        3.000 │
│ الإجمالي:                    22.000 │
└─────────────────────────────────────┘
```

---

## 🧮 حسابات الأسعار

### المنطق المستخدم:

```typescript
// حساب سعر المنتج الواحد
const itemPrice = item.has_discount && item.discounted_price
  ? parseFloat(item.discounted_price.toString())
  : parseFloat(item.price.toString());

// حساب إجمالي المنتج
const itemTotal = itemPrice * item.quantity;

// حساب المجموع الفرعي
const subtotal = cart.reduce((total, item) => {
  const itemPrice = item.has_discount && item.discounted_price
    ? parseFloat(item.discounted_price.toString())
    : parseFloat(item.price.toString());
  return total + itemPrice * item.quantity;
}, 0);

// حساب الإجمالي النهائي
const total = subtotal + shipping + tax - discountAmount;
```

---

## 🔄 التدفق (Flow)

### 1. إضافة منتج إلى السلة:
```
ProductCard/ProductDetail
  → addToCart(product)  // يحفظ جميع بيانات الخصم
    → CartContext.cart.push(product)  // يتضمن has_discount, discounted_price, etc.
      → localStorage.setItem('cart', ...)  // يحفظ في التخزين المحلي
```

### 2. عرض السلة:
```
Cart.tsx
  → cart.map(item => ...)
    → إذا item.has_discount === true:
      - عرض السعر المخفض بالأحمر
      - عرض السعر الأصلي مشطوباً
      - عرض Badge الخصم
    → إلا:
      - عرض السعر العادي بالأزرق
```

### 3. صفحة الدفع:
```
Checkout.tsx
  → cart.map(item => ...)
    → حساب itemPrice (مخفض أو عادي)
    → عرض في ملخص الطلب
      → مع التنسيق المناسب (أحمر للمخفض، عادي للآخر)
```

### 4. إنشاء الطلب:
```
Checkout.tsx
  → createOrder({ items: cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity
    })) })
    → Backend يطبق الخصومات من قاعدة البيانات
```

---

## 🌐 دعم RTL/LTR

### في جميع المكونات:

```tsx
// اتجاه الصفوف
className={cn("flex", isRTL && "flex-row-reverse")}

// محاذاة النص
className={cn("flex flex-col items-end", isRTL && "items-start")}

// الأرقام العربية
{toArabicNumerals(price)}

// العملة المحلية
{i18n.language === 'ar' ? 'د.ك' : 'KWD'}
```

---

## 📊 مثال عملي

### منتج بخصم 30%:

**البيانات:**
```typescript
{
  id: 1,
  title: "صابون طبيعي",
  price: "10.000",
  has_discount: true,
  discount_percentage: 30,
  discounted_price: "7.000",
  price_before_discount: "10.000",
  quantity: 2
}
```

**في السلة:**
```
السعر: 🔴 7.000 د.ك
~~10.000 د.ك~~  [30% خصم]
الإجمالي: 🔴 14.000 د.ك
```

**في ملخص الدفع:**
```
صابون طبيعي × 2         🔴 14.000
                       ~~20.000~~
                       [30% خصم]
```

**الحسابات:**
- السعر بعد الخصم: 7.000 د.ك
- الكمية: 2
- الإجمالي: 7.000 × 2 = 14.000 د.ك
- التوفير: (10.000 - 7.000) × 2 = 6.000 د.ك

---

## ✅ الحالة النهائية

```
✅ CartContext.getSubtotal()       - يحسب السعر المخفض
✅ Cart.tsx - عرض المنتجات        - يعرض الخصم بالكامل
✅ Cart.tsx - حساب المجموع         - يستخدم السعر المخفض
✅ Checkout.tsx - ملخص الطلب       - يعرض الخصم بالكامل
✅ RTL/LTR Support                 - دعم كامل
✅ Responsive Design               - جميع الشاشات
✅ No Linter Errors                - لا يوجد أخطاء
✅ Type-Safe                       - TypeScript كامل
```

---

## 📁 الملفات المعدلة

```
✅ front-end/src/contexts/CartContext.tsx
   - تحديث دالة getSubtotal()

✅ front-end/src/pages/Cart.tsx
   - تحديث حساب subtotal
   - تحديث عرض سعر المنتج
   - تحديث عرض إجمالي المنتج

✅ front-end/src/pages/Checkout.tsx
   - تحديث عرض المنتجات في ملخص الطلب
   - عرض السعر المخفض والأصلي ونسبة الخصم
```

---

## 🎯 المميزات الرئيسية

### للعميل:

1. **رؤية واضحة للخصم**:
   - ✅ السعر المخفض بارز باللون الأحمر
   - ✅ السعر الأصلي مشطوب
   - ✅ نسبة الخصم في Badge

2. **معلومات تفصيلية**:
   - ✅ السعر لكل قطعة
   - ✅ الإجمالي لكل منتج
   - ✅ المجموع الفرعي
   - ✅ الإجمالي النهائي

3. **تجربة مستخدم محسّنة**:
   - ✅ ألوان واضحة ومميزة
   - ✅ تنسيق احترافي
   - ✅ سهولة في القراءة
   - ✅ responsive على جميع الأجهزة

---

## 🔧 التحقق من الصحة

### التحقق الآلي:

```typescript
// في CartContext و Cart.tsx و Checkout.tsx
const itemPrice = item.has_discount && item.discounted_price
  ? parseFloat(item.discounted_price.toString())
  : parseFloat(item.price.toString());
```

**يضمن:**
- ✅ استخدام السعر المخفض إذا كان موجوداً
- ✅ العودة للسعر العادي إذا لم يكن هناك خصم
- ✅ عدم حدوث أخطاء في الحسابات

---

## 📱 الاستجابة (Responsive)

### Breakpoints المستخدمة:

| Breakpoint | الحجم | التطبيق |
|-----------|-------|---------|
| Default | < 640px | موبايل (نصوص صغيرة) |
| `sm:` | ≥ 640px | موبايل كبير (نصوص متوسطة) |
| `md:` | ≥ 768px | تابلت (نصوص أكبر) |
| `lg:` | ≥ 1024px | ديسكتوب (نصوص كبيرة) |

### أمثلة:

```tsx
// السعر المخفض
className="text-lg sm:text-2xl md:text-3xl"
// موبايل: text-lg (1.125rem)
// sm: text-2xl (1.5rem)
// md: text-3xl (1.875rem)

// Badge الخصم
className="text-xs sm:text-sm"
// موبايل: text-xs (0.75rem)
// sm: text-sm (0.875rem)
```

---

## 🚀 جاهز للاستخدام!

النظام الآن يدعم الخصومات بشكل كامل في:
- ✅ صفحة السلة (Cart)
- ✅ صفحة الدفع (Checkout)
- ✅ حسابات المجموع الفرعي والإجمالي
- ✅ عرض بصري واضح وجذاب
- ✅ دعم كامل للغة العربية RTL
- ✅ responsive على جميع الأجهزة

---

**🎉 تم بنجاح! الخصومات الآن تعمل في السلة والدفع!**

---

**📅 آخر تحديث**: 24 أكتوبر 2025

