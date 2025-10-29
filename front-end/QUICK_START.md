# 🚀 دليل البدء السريع - Quick Start Guide

## 📋 المتطلبات / Requirements

```bash
Node.js: >= 18.0.0
npm: >= 9.0.0
```

---

## 🎯 التشغيل / Running

### 1. **تشغيل المشروع**
```bash
cd front-end
npm run dev
```

المشروع سيعمل على: `http://localhost:5173`

### 2. **Build للإنتاج**
```bash
npm run build
```

الملفات ستكون في: `dist/`

---

## 🌐 تبديل اللغة / Language Toggle

### في الواجهة العامة:
- اضغط على زر اللغة في الهيدر (أعلى اليمين)
- يتم الحفظ تلقائياً في `localStorage`

### في لوحة الأدمن:
- زر اللغة في أعلى الهيدر مع badge
- يتم التبديل فوراً مع تغيير الاتجاه

---

## 🔐 تسجيل الدخول للأدمن / Admin Login

### الوصول:
```
URL: /admin/login
```

### البيانات الافتراضية:
```
Email: admin@example.com
Password: password
```

### صفحات الأدمن:
```
- /admin/dashboard       - الصفحة الرئيسية
- /admin/products        - المنتجات
- /admin/categories      - الفئات
- /admin/orders          - الطلبات
- /admin/customers       - العملاء
- /admin/users           - المستخدمين
- /admin/discounts       - الخصومات
- /admin/reports         - التقارير
```

---

## 📁 هيكل المشروع / Project Structure

```
src/
├── components/           # المكونات
│   ├── admin/           # مكونات الأدمن
│   ├── Layout/          # Header, Footer
│   ├── Products/        # مكونات المنتجات
│   └── ui/              # مكونات UI العامة
├── pages/               # الصفحات
│   ├── admin/          # صفحات الأدمن
│   ├── Home.tsx        # الصفحة الرئيسية
│   ├── Products.tsx    # صفحة المنتجات
│   └── ...
├── contexts/            # React Contexts
├── hooks/               # Custom Hooks
├── i18n/               # الترجمات
│   ├── config.ts       # إعدادات i18n
│   └── locales/        # ملفات الترجمة
│       ├── ar.json     # العربية
│       └── en.json     # الإنجليزية
└── lib/                # Utilities & API
```

---

## 🎨 التصميم / Styling

### Tailwind CSS
جميع الأنماط تستخدم Tailwind utility classes:

```tsx
// مثال
<div className="flex items-center gap-4 px-6 py-4">
  <Button className="bg-primary hover:bg-primary/90">
    Button Text
  </Button>
</div>
```

### RTL Support
استخدم `start`/`end` بدل `left`/`right`:

```tsx
// ✅ صح
<div className="ps-4 me-2">

// ❌ خطأ
<div className="pl-4 mr-2">
```

---

## 🌍 الترجمة / Translation

### استخدام الترجمة:
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <h1>{t('welcome.title')}</h1>
  );
}
```

### إضافة ترجمة جديدة:
1. افتح `src/i18n/locales/ar.json`
2. أضف المفتاح والقيمة:
```json
{
  "myNewKey": "النص بالعربية"
}
```
3. كرر في `en.json`

---

## 📱 Responsive Design

### Breakpoints:
```css
sm: 640px   - Small devices
md: 768px   - Medium devices
lg: 1024px  - Large devices
xl: 1280px  - Extra large
2xl: 1400px - 2X Extra large
```

### استخدام:
```tsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive Text
</div>
```

---

## ✨ الميزات الرئيسية / Key Features

### للعملاء:
- ✅ تصفح المنتجات والفئات
- ✅ سلة التسوق
- ✅ المفضلة (Wishlist)
- ✅ الدفع الآمن
- ✅ تتبع الطلبات

### للأدمن:
- ✅ لوحة تحكم شاملة
- ✅ إدارة المنتجات والفئات
- ✅ إدارة الطلبات
- ✅ إدارة العملاء
- ✅ نظام الخصومات
- ✅ التقارير والإحصائيات

---

## 🔧 التخصيص / Customization

### تغيير الألوان:
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#your-color",
          // ...
        }
      }
    }
  }
}
```

### تغيير Logo:
```tsx
// components/Layout/Header.tsx
<div className="logo">
  {/* ضع logo الخاص بك هنا */}
</div>
```

---

## 🐛 استكشاف الأخطاء / Troubleshooting

### المشروع لا يعمل:
```bash
# احذف node_modules وأعد التثبيت
rm -rf node_modules
npm install
npm run dev
```

### خطأ في الترجمة:
- تأكد من وجود المفتاح في كلا الملفين (`ar.json` و `en.json`)
- تحقق من صحة JSON syntax

### مشاكل في التصميم:
- تأكد من تشغيل Tailwind بشكل صحيح
- افحص `tailwind.config.ts`
- نظف cache: `npm run build -- --no-cache`

---

## 📚 الوثائق / Documentation

- [TRANSLATION_GUIDE.md](./TRANSLATION_GUIDE.md) - دليل الترجمة الكامل
- [ADMIN_IMPROVEMENTS.md](./ADMIN_IMPROVEMENTS.md) - تحسينات الأدمن
- [FRONTEND_COMPLETE_IMPROVEMENTS.md](./FRONTEND_COMPLETE_IMPROVEMENTS.md) - جميع التحسينات

---

## 💡 نصائح / Tips

### Performance:
```tsx
// استخدم lazy loading للصور
<img loading="lazy" src="..." />

// استخدم React.memo للمكونات الثقيلة
export default React.memo(MyComponent);
```

### Accessibility:
```tsx
// استخدم semantic HTML
<button> بدل <div onClick>
<nav> للقوائم
<main> للمحتوى الرئيسي
```

### Best Practices:
```tsx
// ✅ Good
const MyComponent = () => {
  const { t } = useTranslation();
  return <div>{t('key')}</div>;
};

// ❌ Bad
const MyComponent = () => {
  return <div>Hard coded text</div>;
};
```

---

## 🎯 الخطوات التالية / Next Steps

1. ✅ جرب تسجيل الدخول للأدمن
2. ✅ استكشف الصفحات المختلفة
3. ✅ جرب تبديل اللغة
4. ✅ افحص responsive design على أجهزة مختلفة
5. ✅ اقرأ الوثائق الكاملة

---

## 📞 المساعدة / Support

### الموارد:
- 📚 Documentation في مجلد المشروع
- 💬 فريق التطوير
- 🐛 GitHub Issues

### التواصل:
- Email: dev@soapy.com
- Support: support@soapy.com

---

## ✅ Checklist للبدء

- [ ] تثبيت dependencies
- [ ] تشغيل المشروع
- [ ] تجربة تبديل اللغة
- [ ] الوصول للوحة الأدمن
- [ ] قراءة الوثائق
- [ ] فهم هيكل المشروع

---

**جاهز للبدء؟ ابدأ الآن! 🚀**

```bash
npm run dev
```

---

© 2024 Soapy - E-Commerce Platform

