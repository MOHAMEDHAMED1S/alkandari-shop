# تحديث عرض الفئات الهرمي | Categories Hierarchy Update

## 📋 نظرة عامة | Overview

تم تحديث نظام عرض الفئات ليدعم العرض الهرمي (الآباء والأبناء) بدلاً من عرض جميع الفئات في قائمة واحدة.

The categories display system has been updated to support hierarchical display (parent and child categories) instead of showing all categories in a single flat list.

---

## ✅ التغييرات المنفذة | Changes Implemented

### 1. Frontend - TypeScript/React

#### أ. تحديث `api.ts`
**الموقع:** `/front-end/src/lib/api.ts`

**التغييرات:**
- ✅ تحديث `Category` interface لإضافة الحقول الهرمية:
  - `parent_id`: رقم الفئة الأب
  - `children`: قائمة الفئات الفرعية
  - `is_active`: حالة الفئة
  - `sort_order`: ترتيب العرض

- ✅ تحديث `getCategories()` لدعم parameters:
  - `parents_only`: لإرجاع الفئات الأب فقط
  - `with_children`: لإرجاع الفئات مع الأبناء

- ✅ إضافة `getCategoryTree()`:
  - وظيفة جديدة لجلب الفئات بشكل هرمي كامل
  - تستخدم endpoint `/categories/tree`

- ✅ إعادة تسمية `getCategoryTree()` الخاصة بالـ Admin إلى `getAdminCategoryTree()`

```typescript
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  products_count?: number;
  parent_id?: number | null;
  children?: Category[];
  is_active?: boolean;
  sort_order?: number;
}

export const getCategories = async (params?: { 
  parents_only?: boolean; 
  with_children?: boolean 
}) => {
  const response = await api.get<{ success: boolean; data: Category[] }>('/categories', { params });
  return response.data;
};

export const getCategoryTree = async () => {
  const response = await api.get<{ success: boolean; data: Category[] }>('/categories/tree');
  return response.data;
};
```

---

#### ب. تحديث صفحة `Categories.tsx`
**الموقع:** `/front-end/src/pages/Categories.tsx`

**التغييرات:**
- ✅ استخدام `getCategoryTree()` بدلاً من `getCategories()`
- ✅ إضافة state لتتبع الفئات المفتوحة: `expandedCategories`
- ✅ إضافة دالة `toggleCategory()` لفتح/إغلاق الفئات الفرعية
- ✅ إضافة دالة `renderCategory()` العودية لعرض الفئات بشكل هرمي
- ✅ تصميم جديد يظهر:
  - أيقونات Folder/FolderOpen للفئات التي لها أبناء
  - زر لإظهار/إخفاء الفئات الفرعية
  - عدد الفئات الفرعية
  - عدد المنتجات في كل فئة

**الميزات الجديدة:**
- 📁 عرض الفئات الأب مع إمكانية توسيعها
- 🔽 أزرار لفتح/إغلاق الفئات الفرعية
- 🎨 تصميم أنيق مع animations
- 📊 عرض عدد المنتجات والفئات الفرعية
- 🌐 دعم RTL/LTR كامل

---

#### ج. تحديث صفحة `Home.tsx`
**الموقع:** `/front-end/src/pages/Home.tsx`

**التغييرات:**
- ✅ استخدام `getCategories({ parents_only: true })` 
- ✅ عرض الفئات الأب فقط في الصفحة الرئيسية

**السبب:** لتجنب ازدحام الصفحة الرئيسية بجميع الفئات

---

#### د. تحديث صفحة `Products.tsx`
**الموقع:** `/front-end/src/pages/Products.tsx`

**التغييرات:**
- ✅ استخدام `getCategories({ parents_only: true })` في قائمة التصفية
- ✅ عرض الفئات الأب فقط في القائمة المنسدلة

**السبب:** تبسيط قائمة التصفية

---

#### هـ. تحديث الترجمات
**الموقع:** `/front-end/src/i18n/locales/`

**ملف `ar.json`:**
```json
"categories": {
  "showSubcategories": "عرض الفئات الفرعية",
  "hideSubcategories": "إخفاء الفئات الفرعية",
  "noCategories": "لا توجد فئات متاحة"
}
```

**ملف `en.json`:**
```json
"categories": {
  "showSubcategories": "Show Subcategories",
  "hideSubcategories": "Hide Subcategories",
  "noCategories": "No categories available"
}
```

---

### 2. Backend - Laravel/PHP

**الموقع:** `/back-end/app/Http/Controllers/Api/CategoryController.php`

**الوضع:** ✅ جاهز بالفعل (لا يحتاج تحديثات)

**الـ Endpoints المتاحة:**

#### أ. `/api/v1/categories`
- **Method:** GET
- **Parameters:**
  - `parents_only` (boolean): إرجاع الفئات الأب فقط
  - `with_children` (boolean): إرجاع الفئات مع الأبناء
- **الاستخدام:** للحصول على قائمة الفئات مع تصفية

#### ب. `/api/v1/categories/tree`
- **Method:** GET
- **الاستخدام:** للحصول على شجرة الفئات الكاملة بشكل هرمي
- **الإرجاع:** 
  - الفئات الأب فقط (`whereNull('parent_id')`)
  - مع الأبناء المفعلين (`with('children')`)
  - مرتبة حسب `sort_order` و `name`

---

## 🔧 كيفية الاستخدام | How to Use

### للمستخدم العادي:

1. انتقل إلى صفحة الفئات: `/categories`
2. سترى الفئات الأب فقط بشكل افتراضي
3. اضغط على زر "عرض الفئات الفرعية" لرؤية الفئات الفرعية
4. اضغط على أي فئة للانتقال إلى صفحة المنتجات

### للمطور:

```typescript
// جلب الفئات الأب فقط
const categories = await getCategories({ parents_only: true });

// جلب الفئات مع الأبناء
const categoriesWithChildren = await getCategories({ 
  parents_only: true, 
  with_children: true 
});

// جلب شجرة الفئات الكاملة
const categoryTree = await getCategoryTree();
```

---

## 📊 بنية البيانات | Data Structure

### قاعدة البيانات:
```
categories
├── id (PK)
├── name
├── slug
├── description
├── image
├── parent_id (FK → categories.id)
├── is_active
├── sort_order
└── timestamps
```

### العلاقات:
- **parent()**: BelongsTo → Category
- **children()**: HasMany → Category
- **products()**: HasMany → Product

---

## 🎨 التصميم | Design

### الفئات الأب:
- حجم أكبر
- صورة 28×28 (7rem)
- أيقونة Folder/FolderOpen
- زر للتوسيع/الطي

### الفئات الفرعية:
- حجم أصغر قليلاً
- صورة 20×20 (5rem)
- مسافة بادئة (margin) من اليمين/اليسار
- تظهر/تختفي عند الضغط على الزر

---

## ✨ الميزات | Features

✅ **عرض هرمي للفئات**
- الفئات الأب والأبناء منفصلة
- توسيع/طي الفئات الفرعية
  
✅ **تصميم أنيق**
- Animations سلسة
- Hover effects
- Responsive design
  
✅ **دعم RTL/LTR**
- يعمل بشكل مثالي مع العربية والإنجليزية
  
✅ **معلومات شاملة**
- عدد المنتجات
- عدد الفئات الفرعية
- وصف الفئة
  
✅ **أداء محسّن**
- Lazy loading للصور
- استخدام React state بكفاءة

---

## 🧪 الاختبار | Testing

### اختبار Frontend:
```bash
cd front-end
npm run dev
```

ثم:
1. انتقل إلى `/categories`
2. تحقق من عرض الفئات الأب
3. اضغط على "عرض الفئات الفرعية"
4. تحقق من ظهور الفئات الفرعية
5. اضغط على "إخفاء الفئات الفرعية"
6. تحقق من اختفاء الفئات الفرعية

### اختبار Backend:
```bash
# اختبار endpoint الفئات العادي
curl http://back-end.test/api/v1/categories

# اختبار الفئات الأب فقط
curl "http://back-end.test/api/v1/categories?parents_only=true"

# اختبار شجرة الفئات
curl http://back-end.test/api/v1/categories/tree
```

---

## 📝 ملاحظات | Notes

1. **الأداء:**
   - استخدام `getCategoryTree()` يجلب جميع البيانات دفعة واحدة
   - أفضل للأداء من عمل طلبات متعددة

2. **الصيانة:**
   - يمكن التحكم في عمق الشجرة من الـ Backend
   - حالياً يدعم مستويين فقط (أب وابن)

3. **التوسع المستقبلي:**
   - يمكن إضافة دعم لمستويات أعمق (أحفاد)
   - يمكن إضافة drag & drop لإعادة ترتيب الفئات

---

## ✅ الملفات المحدثة | Updated Files

```
front-end/
├── src/
│   ├── lib/
│   │   └── api.ts ✅
│   ├── pages/
│   │   ├── Categories.tsx ✅ (تحديث كامل)
│   │   ├── Home.tsx ✅
│   │   └── Products.tsx ✅
│   └── i18n/
│       └── locales/
│           ├── ar.json ✅
│           └── en.json ✅
```

**Backend:** لا يحتاج تحديثات ✅

---

## 🎯 النتيجة | Result

الآن، صفحة الفئات تعرض:
- ✅ الفئات الأب بشكل بارز
- ✅ إمكانية فتح/إغلاق الفئات الفرعية
- ✅ تصميم أنيق وسلس
- ✅ معلومات شاملة عن كل فئة
- ✅ دعم كامل للغة العربية والإنجليزية
- ✅ responsive على جميع الأجهزة

---

## 📞 الدعم | Support

إذا واجهت أي مشكلة، يرجى التحقق من:
1. الـ Backend يعمل على `http://back-end.test/api/v1/`
2. الفئات في قاعدة البيانات لها `parent_id` صحيح
3. الفئات `is_active = true`

---

**تاريخ التحديث:** أكتوبر 2025
**الإصدار:** 2.0

