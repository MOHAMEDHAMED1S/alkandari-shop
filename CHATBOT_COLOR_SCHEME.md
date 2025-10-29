# نظام الألوان - Chatbot Color Scheme

## 🎨 الألوان المستخدمة في التصميم الجديد

### الألوان الرئيسية

```css
/* الرمادي الغامق - للأزرار والعناصر الرئيسية */
bg-gray-800     /* #1F2937 */
bg-gray-900     /* #111827 */ /* عند التمرير */
bg-gray-700     /* #374151 */ /* رسائل المستخدم */

/* الرمادي الفاتح - للخلفيات */
bg-gray-50      /* #F9FAFB */
bg-gray-100     /* #F3F4F6 */

/* الأبيض - للبطاقات */
bg-white        /* #FFFFFF */

/* الحدود */
border-gray-200 /* #E5E7EB */
border-gray-300 /* #D1D5DB */

/* النصوص */
text-gray-900   /* #111827 */ /* نص رئيسي */
text-gray-800   /* #1F2937 */ /* نص عادي */
text-gray-700   /* #374151 */ /* نص متوسط */
text-gray-600   /* #4B5563 */ /* نص ثانوي */
text-gray-500   /* #6B7280 */ /* نص خفيف */
text-gray-400   /* #9CA3AF */ /* نص خفيف جداً */

/* الألوان الإضافية */
bg-green-400    /* #4ADE80 */ /* مؤشر الاتصال */
bg-red-500      /* #EF4444 */ /* مؤشر الإشعارات */
bg-red-50       /* #FEF2F2 */ /* خلفية الخطأ */
text-red-600    /* #DC2626 */ /* نص الخطأ */
```

---

## 🖼️ استخدام الألوان في المكونات

### 1. FloatingChatbot.tsx

```tsx
// الزر العائم
bg-gray-800 hover:bg-gray-900

// شريط العنوان
bg-gray-800

// خلفية النافذة
bg-white

// منطقة الإدخال
bg-gray-50

// حقل الإدخال
bg-white border-gray-300

// زر الإرسال
bg-gray-800 hover:bg-gray-900
```

### 2. ChatMessage.tsx

```tsx
// رسالة المستخدم
bg-gray-700 text-white

// رسالة البوت
bg-white border-gray-200 text-gray-800

// الوقت
text-gray-400

// الروابط
text-gray-700 hover:text-gray-900

// الكود المضمن
bg-gray-100 text-gray-800

// الكود البلوك
bg-gray-50 border-gray-200

// الاقتباسات
border-gray-300 bg-gray-50
```

### 3. ProductRecommendations.tsx

```tsx
// خلفية رئيسية
bg-gray-50

// الحدود
border-gray-200

// البطاقات
bg-white

// الأزرار
bg-gray-800 hover:bg-gray-900

// النصوص
text-gray-800 / text-gray-600 / text-gray-500
```

---

## 🔄 مقارنة سريعة

### قبل (ملون):
```
✗ bg-gradient-to-r from-blue-600 to-purple-600
✗ bg-gradient-to-br from-blue-50 to-purple-50
✗ text-blue-600, text-purple-600
✗ border-blue-200
```

### بعد (محايد):
```
✓ bg-gray-800
✓ bg-gray-50
✓ text-gray-600
✓ border-gray-200
```

---

## 🎯 فلسفة التصميم

### لماذا الألوان المحايدة؟

1. **الأناقة** - تصميم احترافي يناسب أي علامة تجارية
2. **البساطة** - سهل على العين ولا يشتت الانتباه
3. **المرونة** - يمكن تخصيصه بسهولة
4. **الوضوح** - النص واضح والعناصر مميزة

### التدرج اللوني:

```
الأغمق (900) → الأفتح (50)
━━━━━━━━━━━━━━━━━━━━━━━━━━
gray-900  (أسود تقريباً)
gray-800  (رمادي غامق جداً) ← الأزرار الرئيسية
gray-700  (رمادي غامق)       ← رسائل المستخدم
gray-600  (رمادي متوسط)      ← نصوص ثانوية
gray-500  (رمادي)            ← نصوص خفيفة
gray-400  (رمادي فاتح)       ← نصوص خفيفة جداً
gray-300  (رمادي فاتح جداً)  ← حدود
gray-200  (رمادي باهت)       ← حدود فاتحة
gray-100  (رمادي باهت جداً)  ← خلفيات
gray-50   (أبيض تقريباً)     ← خلفيات فاتحة
white     (أبيض نقي)         ← بطاقات
```

---

## ✨ نصائح للتخصيص

### إذا أردت تغيير الألوان:

1. **ابحث واستبدل:**
   ```bash
   # مثال: تغيير من رمادي إلى أزرق
   bg-gray-800  →  bg-blue-800
   bg-gray-900  →  bg-blue-900
   ```

2. **احتفظ بالتباين:**
   - نص داكن على خلفية فاتحة
   - نص فاتح على خلفية داكنة

3. **اختبر الوضوح:**
   - تأكد من وضوح النصوص
   - اختبر على شاشات مختلفة

---

## 🌈 ألوان بديلة مقترحة

### خيار 1: الأزرق الكلاسيكي
```
bg-blue-800  hover:bg-blue-900
bg-blue-50
text-blue-600
border-blue-200
```

### خيار 2: الأخضر الطبيعي
```
bg-green-800  hover:bg-green-900
bg-green-50
text-green-600
border-green-200
```

### خيار 3: البنفسجي الملكي
```
bg-purple-800  hover:bg-purple-900
bg-purple-50
text-purple-600
border-purple-200
```

### خيار 4: البني الدافئ
```
bg-amber-800  hover:bg-amber-900
bg-amber-50
text-amber-600
border-amber-200
```

---

## 📊 جدول الألوان الشامل

| العنصر | اللون الحالي | بديل 1 | بديل 2 |
|--------|--------------|---------|---------|
| الزر الرئيسي | gray-800 | blue-800 | purple-800 |
| الخلفية الفاتحة | gray-50 | blue-50 | purple-50 |
| الحدود | gray-200 | blue-200 | purple-200 |
| النص الرئيسي | gray-800 | blue-900 | purple-900 |
| النص الثانوي | gray-600 | blue-700 | purple-700 |

---

## 🎨 Palette سداسي عشري

```
Gray Scale:
#111827  (gray-900)
#1F2937  (gray-800)
#374151  (gray-700)
#4B5563  (gray-600)
#6B7280  (gray-500)
#9CA3AF  (gray-400)
#D1D5DB  (gray-300)
#E5E7EB  (gray-200)
#F3F4F6  (gray-100)
#F9FAFB  (gray-50)
#FFFFFF  (white)
```

```
Accent Colors:
#4ADE80  (green-400) - Connected indicator
#EF4444  (red-500)   - Notifications badge
#FEF2F2  (red-50)    - Error background
#DC2626  (red-600)   - Error text
```

---

## 🔧 كيفية التطبيق

### في VSCode:
1. فتح البحث والاستبدال (Ctrl+Shift+F)
2. ابحث عن: `bg-gray-800`
3. استبدل بـ: `bg-[your-color]-800`
4. كرر لجميع الألوان

### في الكود:
```tsx
// الطريقة الأفضل: استخدام متغيرات
const COLORS = {
  primary: 'bg-gray-800',
  primaryHover: 'bg-gray-900',
  background: 'bg-gray-50',
  border: 'border-gray-200',
};

// ثم استخدمها
className={COLORS.primary}
```

---

**ملحوظة:** جميع الألوان متوافقة مع Tailwind CSS v3

**آخر تحديث:** 21 أكتوبر 2025

