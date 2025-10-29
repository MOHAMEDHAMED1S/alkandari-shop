# دليل Database Seeders | Database Seeders Guide

## 📋 نظرة عامة | Overview

تم تحديث جميع الـ Seeders لتناسب محتوى الموقع الجديد: **منتجات التعبئة والتغليف والأدوات المنزلية**

All Seeders have been updated to match the new website content: **Packaging and Household Supplies Products**

---

## 📂 الـ Seeders المحدثة | Updated Seeders

### 1. CategorySeeder ✅

**الفئات الرئيسية (6 فئات):**

| # | الاسم العربي | English Name | Slug | الفئات الفرعية |
|---|-------------|--------------|------|----------------|
| 1 | التعبئة والتغليف | Packaging | `packaging` | 4 فئات |
| 2 | أدوات المطبخ | Kitchen Tools | `kitchen-tools` | 4 فئات |
| 3 | الأوعية والحاويات | Containers | `containers` | 3 فئات |
| 4 | أدوات التنظيف | Cleaning Tools | `cleaning-tools` | 3 فئات |
| 5 | أدوات المائدة | Tableware | `tableware` | 3 فئات |
| 6 | المناديل والورق | Tissues & Paper | `tissues-paper` | 3 فئات |

**إجمالي الفئات:** 6 فئات أب + 20 فئة فرعية = **26 فئة**

#### تفاصيل الفئات الفرعية:

##### 📦 التعبئة والتغليف (Packaging)
1. **أكياس بلاستيك** - `plastic-bags`
2. **أكياس ورقية** - `paper-bags`
3. **علب كرتون** - `cardboard-boxes`
4. **أكياس فاخرة** - `luxury-bags`

##### 🍳 أدوات المطبخ (Kitchen Tools)
1. **أدوات الطبخ** - `cooking-utensils`
2. **أدوات التقطيع** - `cutting-tools`
3. **أدوات القياس** - `measuring-tools`
4. **أدوات الخبز** - `baking-tools`

##### 📦 الأوعية والحاويات (Containers)
1. **حاويات بلاستيك** - `plastic-containers`
2. **حاويات زجاج** - `glass-containers`
3. **علب حفظ الطعام** - `food-storage`

##### 🧹 أدوات التنظيف (Cleaning Tools)
1. **الإسفنج والليف** - `sponges-scrubbers`
2. **المماسح والممسحات** - `mops-brooms`
3. **فرش التنظيف** - `cleaning-brushes`

##### 🍽️ أدوات المائدة (Tableware)
1. **الأطباق والصحون** - `plates-dishes`
2. **الأكواب والفناجين** - `cups-mugs`
3. **أدوات الطعام** - `cutlery`

##### 🧻 المناديل والورق (Tissues & Paper)
1. **مناديل ورقية** - `paper-napkins`
2. **ورق ألمنيوم وتغليف** - `foil-wrap`
3. **مناديل مبللة** - `wet-wipes`

---

### 2. ProductSeeder ✅

**عدد المنتجات:** 25 منتج متنوع

#### المنتجات حسب الفئة:

| الفئة الفرعية | عدد المنتجات | أمثلة |
|---------------|--------------|-------|
| أكياس بلاستيك | 2 | أكياس شفافة، أكياس قمامة |
| أكياس ورقية | 1 | أكياس كرافت بنية |
| علب كرتون | 1 | علب شحن متوسطة |
| أكياس فاخرة | 1 | أكياس هدايا ذهبية |
| أدوات الطبخ | 1 | طقم سيليكون 10 قطع |
| أدوات التقطيع | 2 | طقم سكاكين، لوح تقطيع |
| أدوات القياس | 1 | طقم أكواب قياس |
| أدوات الخبز | 1 | قوالب سيليكون |
| حاويات بلاستيك | 1 | طقم 20 قطعة |
| حاويات زجاج | 1 | علب زجاج 6 قطع |
| الإسفنج والليف | 1 | إسفنج مزدوج |
| فرش التنظيف | 1 | طقم 6 فرش |
| الأطباق | 1 | طقم ميلامين 36 قطعة |
| الأكواب | 1 | أكواب حرارية 6 قطع |
| أدوات الطعام | 1 | طقم استانلس 48 قطعة |
| مناديل ورقية | 1 | مناديل 3 طبقات |
| ورق ألمنيوم | 1 | لفة 150 متر |
| مناديل مبللة | 1 | معقمة 10 عبوات |

#### نطاق الأسعار:

- **الأدنى:** 3.500 د.ك (أكياس بلاستيك)
- **الأعلى:** 38.000 د.ك (طقم أدوات مائدة)
- **المتوسط:** ~15 د.ك

#### الميزات:

✅ جميع المنتجات متوفرة (`is_available: true`)  
✅ معظم المنتجات لديها مخزون (`has_inventory: true`)  
✅ كمية المخزون من 25 إلى 200 قطعة  
✅ وصف كامل بالعربية  
✅ صور عشوائية من Picsum  
✅ معلومات تفصيلية في `meta` (العلامة، الحجم، المواد، إلخ)

---

### 3. DiscountCodeSeeder ✅

تم تحديث الأوصاف لتناسب المنتجات الجديدة. جميع أكواد الخصم الموجودة تعمل بشكل صحيح.

---

### 4. Seeders الأخرى (لا تحتاج تعديل)

- ✅ **AdminUserSeeder** - جاهز
- ✅ **PaymentMethodSettingsSeeder** - جاهز
- ✅ **ShippingCostSeeder** - جاهز
- ✅ **WhatsAppSettingsSeeder** - جاهز

---

## 🚀 كيفية تشغيل الـ Seeders | How to Run Seeders

### الطريقة 1: باستخدام السكريبت (موصى بها)

```bash
cd back-end
./seed-database.sh
```

هذا السكريبت سيقوم بـ:
- ✅ التحقق من الاتصال بقاعدة البيانات
- ✅ تشغيل جميع الـ Seeders بالترتيب الصحيح
- ✅ عرض إحصائيات النتائج

### الطريقة 2: يدوياً (Manual)

```bash
cd back-end

# تشغيل جميع الـ Seeders
php artisan db:seed

# أو تشغيل seeder محدد
php artisan db:seed --class=CategorySeeder
php artisan db:seed --class=ProductSeeder
php artisan db:seed --class=DiscountCodeSeeder
```

### الطريقة 3: إعادة بناء قاعدة البيانات (Fresh Migration)

⚠️ **تحذير:** هذا سيحذف جميع البيانات الموجودة!

```bash
cd back-end
php artisan migrate:fresh --seed
```

---

## 📊 التحقق من النتائج | Verify Results

### 1. عرض الإحصائيات

```bash
# عدد الفئات
php artisan tinker --execute="echo 'Categories: ' . \App\Models\Category::count();"

# عدد المنتجات
php artisan tinker --execute="echo 'Products: ' . \App\Models\Product::count();"

# عدد أكواد الخصم
php artisan tinker --execute="echo 'Discount Codes: ' . \App\Models\DiscountCode::count();"
```

### 2. اختبار API

```bash
# جلب جميع الفئات
curl http://back-end.test/api/v1/categories

# جلب شجرة الفئات
curl http://back-end.test/api/v1/categories/tree

# جلب جميع المنتجات
curl http://back-end.test/api/v1/products

# جلب منتجات فئة معينة
curl http://back-end.test/api/v1/categories/plastic-bags/products
```

---

## 📝 البيانات المتوقعة | Expected Data

بعد تشغيل الـ Seeders بنجاح، يجب أن يكون لديك:

| الجدول | العدد المتوقع |
|--------|---------------|
| Categories (فئات أب) | 6 |
| Categories (فئات فرعية) | 20 |
| Categories (إجمالي) | **26** |
| Products | **25** |
| Discount Codes | ~10 |
| Admin Users | 1 |
| Payment Methods | متعدد |
| Shipping Costs | 1 |
| WhatsApp Settings | متعدد |

---

## 🎯 نقاط مهمة | Important Notes

### 1. updateOrCreate()

جميع الـ Seeders تستخدم `updateOrCreate()` بدلاً من `create()`:
- ✅ يمكن تشغيلها عدة مرات دون أخطاء
- ✅ تحدث البيانات الموجودة بدلاً من إنشاء نسخ مكررة
- ✅ آمنة للاستخدام في التطوير

### 2. Slug

كل فئة ومنتج لديه `slug` فريد:
- مناسب لـ SEO
- مستخدم في URLs
- يجب أن يكون فريداً

### 3. المخزون (Inventory)

- المنتجات مع `has_inventory: true` تتطلب `stock_quantity`
- المنتجات مع `has_inventory: false` متوفرة دائماً
- يتم تتبع المخزون تلقائياً عند الطلب

### 4. الصور

- حالياً تستخدم صور عشوائية من Picsum
- يمكن استبدالها بصور حقيقية لاحقاً
- الصور في مصفوفة `images` (يدعم متعدد)

---

## 🔄 تحديث البيانات | Update Data

لتحديث البيانات الموجودة:

```bash
# تحديث الفئات فقط
php artisan db:seed --class=CategorySeeder

# تحديث المنتجات فقط
php artisan db:seed --class=ProductSeeder
```

بسبب `updateOrCreate()`:
- ✅ البيانات الموجودة سيتم تحديثها
- ✅ البيانات الجديدة سيتم إضافتها
- ✅ لن يتم حذف أي بيانات

---

## 🧪 الاختبار | Testing

### 1. اختبار Frontend

```bash
cd front-end
npm run dev
```

ثم:
1. انتقل إلى `/categories` - يجب أن ترى 6 فئات رئيسية
2. اضغط على فئة → يجب أن ترى الفئات الفرعية
3. اضغط على فئة فرعية → يجب أن ترى المنتجات
4. انتقل إلى `/products` - يجب أن ترى 25 منتج

### 2. اختبار الفئات الهرمية

```bash
# الفئات الأب
curl http://back-end.test/api/v1/categories?parents_only=true

# الفئات مع الأبناء
curl http://back-end.test/api/v1/categories?parents_only=true&with_children=true

# شجرة الفئات كاملة
curl http://back-end.test/api/v1/categories/tree
```

### 3. اختبار المنتجات

```bash
# جميع المنتجات
curl http://back-end.test/api/v1/products

# المنتجات المميزة
curl http://back-end.test/api/v1/products/featured

# منتجات فئة معينة
curl http://back-end.test/api/v1/categories/kitchen-tools/products
```

---

## 🐛 حل المشاكل | Troubleshooting

### مشكلة: خطأ في الاتصال بقاعدة البيانات

```bash
# تحقق من ملف .env
cat .env | grep DB_

# اختبر الاتصال
php artisan db:show
```

### مشكلة: Foreign Key Constraint

```bash
# احذف جميع البيانات وابدأ من جديد
php artisan migrate:fresh --seed
```

### مشكلة: Duplicate Entry

الـ Seeders تستخدم `updateOrCreate()` لذا هذه المشكلة لا يجب أن تحدث.
إذا حدثت:
```bash
# احذف البيانات المكررة يدوياً من قاعدة البيانات
# أو أعد بناء قاعدة البيانات
php artisan migrate:fresh --seed
```

---

## 📋 الملفات المحدثة | Updated Files

```
back-end/database/seeders/
├── CategorySeeder.php ✅ محدث بالكامل
├── ProductSeeder.php ✅ محدث بالكامل
├── DiscountCodeSeeder.php ✅ تحديث بسيط
├── AdminUserSeeder.php ✅ جاهز
├── PaymentMethodSettingsSeeder.php ✅ جاهز
├── ShippingCostSeeder.php ✅ جاهز
└── WhatsAppSettingsSeeder.php ✅ جاهز

back-end/
└── seed-database.sh ✅ جديد - سكريبت تشغيل الـ Seeders
```

---

## 🎉 النتيجة النهائية | Final Result

بعد تشغيل الـ Seeders، سيكون لديك:

✅ **26 فئة** (6 رئيسية + 20 فرعية)  
✅ **25 منتج** متنوع  
✅ **~10 أكواد خصم** جاهزة  
✅ **حساب أدمن** للوحة التحكم  
✅ **إعدادات كاملة** للدفع والشحن وواتساب

---

## 📞 الدعم | Support

إذا واجهت أي مشاكل:

1. تحقق من ملف `.env`
2. تأكد من تشغيل قاعدة البيانات
3. شغل `php artisan migrate` أولاً
4. ثم شغل الـ Seeders

---

**تاريخ التحديث:** أكتوبر 2025  
**الإصدار:** 1.0

