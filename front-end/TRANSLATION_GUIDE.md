# دليل الترجمة والـ RTL - Translation & RTL Guide

## نظرة عامة / Overview

تم تحسين الفرونت إند بالكامل لدعم اللغتين العربية والإنجليزية مع دعم كامل لـ RTL (Right-to-Left).

The front-end has been fully enhanced to support both Arabic and English with full RTL (Right-to-Left) support.

---

## الميزات الجديدة / New Features

### 1. **نظام الترجمة الكامل / Complete Translation System**
- ✅ جميع النصوص تستخدم نظام i18n
- ✅ ملفات ترجمة محدثة ومنظمة
- ✅ دعم fallback للنصوص المفقودة

### 2. **دعم RTL كامل / Full RTL Support**
- ✅ Tailwind CSS RTL plugin مضاف
- ✅ التبديل التلقائي للاتجاه عند تغيير اللغة
- ✅ حفظ اللغة المختارة في localStorage

### 3. **تحسينات التصميم / Design Improvements**

#### **Header / الهيدر**
- 🎨 لوغو أنيق مع أيقونة دائرية
- 🌍 زر تبديل اللغة محسّن مع badge
- 🔔 إشعار عدد المنتجات في السلة
- 📱 قائمة موبايل محسّنة مع تأثيرات

#### **Product Card / كرت المنتج**
- ❤️ زر إضافة للمفضلة مع تأثيرات
- 👁️ زر عرض سريع
- 🎭 تأثيرات hover متقدمة
- 🖼️ overlay على الصور عند المرور
- 🏷️ badges محسّنة للتوفر

#### **Footer / الفوتر**
- 📞 معلومات الاتصال الكاملة
- 🔗 روابط سريعة منظمة
- 🌐 أيقونات السوشيال ميديا
- 📱 responsive تماماً

### 4. **الصفحات المحدّثة / Updated Pages**
- ✅ Home - الصفحة الرئيسية
- ✅ Products - صفحة المنتجات
- ✅ Product Detail - تفاصيل المنتج
- ✅ Cart - سلة التسوق
- ✅ Checkout - إتمام الشراء
- ✅ Order Tracking - تتبع الطلبات

---

## كيفية الاستخدام / How to Use

### تثبيت المكتبات الجديدة / Install New Dependencies

```bash
cd front-end
npm install tailwindcss-rtl
```

### تشغيل المشروع / Run the Project

```bash
npm run dev
```

---

## إضافة ترجمات جديدة / Adding New Translations

### الخطوات / Steps:

1. **افتح ملفات الترجمة:**
   ```
   front-end/src/i18n/locales/ar.json
   front-end/src/i18n/locales/en.json
   ```

2. **أضف المفتاح الجديد في كلا الملفين:**
   ```json
   {
     "yourSection": {
       "newKey": "النص بالعربية"
     }
   }
   ```

3. **استخدم المفتاح في الكود:**
   ```tsx
   const { t } = useTranslation();
   <h1>{t('yourSection.newKey')}</h1>
   ```

---

## المكونات المحسّنة / Enhanced Components

### 1. Header
- `Languages` icon للتبديل بين اللغات
- `Badge` يظهر اللغة الحالية
- حفظ تلقائي للغة المختارة

### 2. ProductCard
- تصميم حديث مع animations
- أزرار quick actions على hover
- دعم RTL كامل

### 3. Footer
- معلومات شاملة ومنظمة
- روابط سوشيال ميديا
- responsive على جميع الشاشات

---

## التأثيرات والـ Animations

### Tailwind Animations المضافة:
```css
- fade-in
- slide-in-from-top
- slide-in-from-bottom
- animate-pulse
```

### Framer Motion:
- Product cards animations
- Stagger animations للقوائم
- Hover effects محسّنة

---

## اختبار RTL / Testing RTL

### للتأكد من RTL:
1. غيّر اللغة للعربية
2. تحقق من:
   - اتجاه النصوص
   - موضع الأيقونات
   - محاذاة العناصر
   - padding/margin

---

## الملفات المحدثة / Updated Files

```
✅ tailwind.config.ts - إضافة RTL plugin
✅ src/components/Layout/Header.tsx - تحسين كامل
✅ src/components/Layout/Footer.tsx - تصميم جديد
✅ src/components/Products/ProductCard.tsx - تحسينات
✅ src/pages/Home.tsx - animations جديدة
✅ src/i18n/locales/ar.json - ترجمات محدثة
✅ src/i18n/locales/en.json - ترجمات محدثة
```

---

## نصائح مهمة / Important Tips

### للمطورين / For Developers:

1. **استخدم دائماً `t()` للنصوص:**
   ❌ `<h1>مرحباً</h1>`
   ✅ `<h1>{t('welcome')}</h1>`

2. **استخدم `start`/`end` بدل `left`/`right`:**
   ❌ `className="ml-4"`
   ✅ `className="ms-4"` (margin-start)

3. **اختبر على اللغتين:**
   - تأكد من أن التصميم يعمل على العربية والإنجليزية

4. **استخدم Framer Motion للـ animations:**
   ```tsx
   import { motion } from 'framer-motion';
   <motion.div animate={{ opacity: 1 }}>
   ```

---

## الدعم / Support

إذا واجهت أي مشاكل:
1. تحقق من ملفات الترجمة
2. تأكد من تثبيت `tailwindcss-rtl`
3. افحص console للأخطاء
4. تأكد من أن `dir` attribute مضبوط بشكل صحيح

---

## المميزات القادمة / Future Features

- [ ] Dark mode support
- [ ] المزيد من اللغات
- [ ] تحسينات accessibility
- [ ] المزيد من الـ animations

---

**تم إنجاز جميع المهام بنجاح! ✨**
**All tasks completed successfully! ✨**

