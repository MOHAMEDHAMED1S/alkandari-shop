# 🚀 دليل سريع للـ Seeders | Seeders Quick Reference

## تشغيل سريع | Quick Run

```bash
cd back-end

# تشغيل جميع الـ Seeders
./seed-database.sh

# أو يدوياً
php artisan db:seed --class=CategorySeeder
php artisan db:seed --class=ProductSeeder
php artisan db:seed --class=DiscountCodeSeeder
```

## النتائج المتوقعة | Expected Results

| البند | العدد |
|-------|-------|
| **فئات رئيسية** | 6 |
| **فئات فرعية** | 20 |
| **منتجات** | 20 |
| **أكواد خصم** | 11 |

## الفئات الرئيسية | Main Categories

1. **التعبئة والتغليف** (`packaging`)
   - أكياس بلاستيك
   - أكياس ورقية
   - علب كرتون
   - أكياس فاخرة

2. **أدوات المطبخ** (`kitchen-tools`)
   - أدوات الطبخ
   - أدوات التقطيع
   - أدوات القياس
   - أدوات الخبز

3. **الأوعية والحاويات** (`containers`)
   - حاويات بلاستيك
   - حاويات زجاج
   - علب حفظ الطعام

4. **أدوات التنظيف** (`cleaning-tools`)
   - الإسفنج والليف
   - المماسح والممسحات
   - فرش التنظيف

5. **أدوات المائدة** (`tableware`)
   - الأطباق والصحون
   - الأكواب والفناجين
   - أدوات الطعام

6. **المناديل والورق** (`tissues-paper`)
   - مناديل ورقية
   - ورق ألمنيوم وتغليف
   - مناديل مبللة

## أمثلة على المنتجات | Product Examples

### التعبئة والتغليف
- أكياس بلاستيك شفافة - **3.500 د.ك**
- أكياس قمامة سوداء - **4.250 د.ك**
- أكياس ورقية كرافت - **5.500 د.ك**
- علب كرتون للشحن - **8.000 د.ك**
- أكياس هدايا فاخرة - **12.500 د.ك**

### أدوات المطبخ
- طقم ملاعق سيليكون 10 قطع - **15.750 د.ك**
- طقم سكاكين احترافي - **28.000 د.ك**
- لوح تقطيع خيزران - **12.000 د.ك**
- طقم أكواب قياس - **6.500 د.ك**
- قوالب خبز سيليكون - **9.750 د.ك**

### الأوعية والحاويات
- طقم حاويات طعام 20 قطعة - **18.500 د.ك**
- علب زجاج 6 قطع - **16.000 د.ك**

### أدوات التنظيف
- إسفنج جلي مزدوج - **4.500 د.ك**
- طقم فرش تنظيف - **7.250 د.ك**

### أدوات المائدة
- طقم أطباق ميلامين 36 قطعة - **32.000 د.ك**
- طقم أكواب زجاج حراري - **14.500 د.ك**
- طقم أدوات مائدة 48 قطعة - **38.000 د.ك**

### المناديل والورق
- مناديل ورقية 3 طبقات - **8.500 د.ك**
- ورق ألمنيوم 150 متر - **11.500 د.ك**
- مناديل مبللة معقمة - **9.000 د.ك**

## اختبار سريع | Quick Test

```bash
# عرض الإحصائيات
cd back-end
php artisan tinker --execute="
echo 'Categories: ' . \App\Models\Category::count() . PHP_EOL;
echo 'Products: ' . \App\Models\Product::count() . PHP_EOL;
echo 'Discount Codes: ' . \App\Models\DiscountCode::count() . PHP_EOL;
"

# اختبار API
curl http://back-end.test/api/v1/categories
curl http://back-end.test/api/v1/products
```

## إعادة البناء | Rebuild

```bash
# ⚠️ هذا سيحذف جميع البيانات!
php artisan migrate:fresh --seed
```

## الملفات المحدثة | Updated Files

```
back-end/database/seeders/
├── CategorySeeder.php ✅
├── ProductSeeder.php ✅
└── DiscountCodeSeeder.php ✅

back-end/
└── seed-database.sh ✅

root/
├── DATABASE_SEEDERS_GUIDE.md ✅
└── SEEDERS_QUICK_REFERENCE.md ✅
```

## روابط مفيدة | Useful Links

- 📚 [دليل كامل](./DATABASE_SEEDERS_GUIDE.md)
- 🌐 [API Documentation](http://back-end.test/api/documentation)

---

**آخر تحديث:** أكتوبر 2025

