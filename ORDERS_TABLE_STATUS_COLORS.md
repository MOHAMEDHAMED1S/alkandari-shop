# ألوان جدول الطلبات حسب الحالة
## Orders Table Status Colors

---

## 🎨 نظرة عامة

تم تحديث جدول الطلبات لعرض **ألوان مميزة** لكل صف حسب حالة الطلب، مما يسهل التعرف السريع على حالة كل طلب.

---

## 🌈 الألوان المطبقة

### 1. **مدفوع** (paid) - 🟢 أخضر
```css
bg-green-50/50 dark:bg-green-900/20
hover:from-green-100/50 hover:to-green-50/50
dark:hover:from-green-800/30 dark:hover:to-green-900/30
```
**متى يُستخدم:**
- عندما يكون الطلب مدفوع بالكامل
- يشير إلى نجاح الدفع

---

### 2. **بانتظار الدفع** (awaiting_payment) - 🟠 برتقالي
```css
bg-orange-50/50 dark:bg-orange-900/20
hover:from-orange-100/50 hover:to-orange-50/50
dark:hover:from-orange-800/30 dark:hover:to-orange-900/30
```
**متى يُستخدم:**
- عندما يكون الطلب في انتظار الدفع
- يحتاج إلى متابعة

---

### 3. **قيد الانتظار** (pending) - 🟡 أصفر
```css
bg-yellow-50/50 dark:bg-yellow-900/20
hover:from-yellow-100/50 hover:to-yellow-50/50
dark:hover:from-yellow-800/30 dark:hover:to-yellow-900/30
```
**متى يُستخدم:**
- عندما يكون الطلب جديد وقيد المراجعة
- يحتاج إلى معالجة

---

### 4. **قيد الشحن** (shipped) - 🔵 أزرق
```css
bg-blue-50/50 dark:bg-blue-900/20
hover:from-blue-100/50 hover:to-blue-50/50
dark:hover:from-blue-800/30 dark:hover:to-blue-900/30
```
**متى يُستخدم:**
- عندما يكون الطلب قد تم شحنه
- في الطريق إلى العميل

---

### 5. **تم التوصيل** (delivered) - 🟣 بنفسجي
```css
bg-purple-50/50 dark:bg-purple-900/20
hover:from-purple-100/50 hover:to-purple-50/50
dark:hover:from-purple-800/30 dark:hover:to-purple-900/30
```
**متى يُستخدم:**
- عندما يكون الطلب قد وصل للعميل
- تم الانتهاء من الطلب بنجاح

---

### 6. **ملغى** (cancelled) - 🔴 أحمر
```css
bg-red-50/50 dark:bg-red-900/20
hover:from-red-100/50 hover:to-red-50/50
dark:hover:from-red-800/30 dark:hover:to-red-900/30
```
**متى يُستخدم:**
- عندما يكون الطلب ملغى
- لن يتم معالجة الطلب

---

### 7. **افتراضي** (default) - ⚪ رمادي
```css
bg-white/30 dark:bg-slate-800/30 (للصفوف الزوجية)
bg-slate-50/30 dark:bg-slate-700/30 (للصفوف الفردية)
```
**متى يُستخدم:**
- في حالة عدم وجود حالة محددة
- كخلفية بديلة

---

## 🔧 التنفيذ التقني

### الكود المستخدم:

```typescript
const getRowColors = () => {
  switch (order.status) {
    case 'paid':
      return 'bg-green-50/50 dark:bg-green-900/20 hover:from-green-100/50 hover:to-green-50/50 dark:hover:from-green-800/30 dark:hover:to-green-900/30';
    case 'awaiting_payment':
      return 'bg-orange-50/50 dark:bg-orange-900/20 hover:from-orange-100/50 hover:to-orange-50/50 dark:hover:from-orange-800/30 dark:hover:to-orange-900/30';
    case 'pending':
      return 'bg-yellow-50/50 dark:bg-yellow-900/20 hover:from-yellow-100/50 hover:to-yellow-50/50 dark:hover:from-yellow-800/30 dark:hover:to-yellow-900/30';
    case 'shipped':
      return 'bg-blue-50/50 dark:bg-blue-900/20 hover:from-blue-100/50 hover:to-blue-50/50 dark:hover:from-blue-800/30 dark:hover:to-blue-900/30';
    case 'delivered':
      return 'bg-purple-50/50 dark:bg-purple-900/20 hover:from-purple-100/50 hover:to-purple-50/50 dark:hover:from-purple-800/30 dark:hover:to-purple-900/30';
    case 'cancelled':
      return 'bg-red-50/50 dark:bg-red-900/20 hover:from-red-100/50 hover:to-red-50/50 dark:hover:from-red-800/30 dark:hover:to-red-900/30';
    default:
      return index % 2 === 0 ? 'bg-white/30 dark:bg-slate-800/30' : 'bg-slate-50/30 dark:bg-slate-700/30';
  }
};
```

### الاستخدام:

```tsx
<TableRow 
  key={order.id}
  className={`group hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50 transition-all duration-300 ${getRowColors()}`}
>
```

---

## ✨ المميزات

### 1. **تمييز بصري فوري**
- كل حالة لها لون فريد
- سهولة التعرف على الحالات بنظرة واحدة

### 2. **دعم الوضع الليلي**
- ألوان مخصصة للـ Dark Mode
- تباين مناسب في جميع الأوضاع

### 3. **تأثيرات Hover**
- تدرجات لونية عند المرور بالماوس
- تحسين التجربة التفاعلية

### 4. **Opacity محسّنة**
- استخدام `/50` و `/20` للشفافية
- ألوان ناعمة وغير مزعجة

### 5. **Transitions سلسة**
- `transition-all duration-300`
- تنقلات سلسة بين الحالات

---

## 📊 جدول مرجعي سريع

| الحالة | اللون | الكود | الاستخدام |
|--------|-------|------|-----------|
| `paid` | 🟢 أخضر | `green-*` | مدفوع |
| `awaiting_payment` | 🟠 برتقالي | `orange-*` | بانتظار الدفع |
| `pending` | 🟡 أصفر | `yellow-*` | قيد الانتظار |
| `shipped` | 🔵 أزرق | `blue-*` | قيد الشحن |
| `delivered` | 🟣 بنفسجي | `purple-*` | تم التوصيل |
| `cancelled` | 🔴 أحمر | `red-*` | ملغى |
| `default` | ⚪ رمادي | `slate-*` | افتراضي |

---

## 🎯 فوائد المستخدم

✅ **التعرف السريع**: معرفة حالة الطلب بنظرة واحدة
✅ **تنظيم أفضل**: تجميع بصري للطلبات المتشابهة
✅ **تقليل الأخطاء**: صعوبة الخلط بين الحالات
✅ **احترافية**: مظهر منظم وجذاب
✅ **إنتاجية أعلى**: معالجة أسرع للطلبات

---

## 🔄 التوافق

✅ **جميع المتصفحات الحديثة**
✅ **Responsive Design**
✅ **RTL/LTR Support**
✅ **Dark Mode**
✅ **أجهزة اللمس**

---

## 📁 الملف المعدل

```
✅ /front-end/src/pages/admin/AdminOrders.tsx
```

---

## 🚀 جاهز للاستخدام!

جميع ألوان الحالات مطبقة ومُختبرة. الجدول الآن أكثر وضوحاً وسهولة في الاستخدام! 🎨✨

