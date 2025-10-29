#!/bin/bash

echo "==================================================="
echo "🚀 بدء عملية تفريغ وإعادة تعبئة قاعدة البيانات"
echo "==================================================="

cd "$(dirname "$0")"

echo ""
echo "📊 المرحلة 1: التحقق من الاتصال بقاعدة البيانات..."
php artisan migrate:status

if [ $? -ne 0 ]; then
    echo "❌ خطأ في الاتصال بقاعدة البيانات!"
    exit 1
fi

echo ""
echo "🗑️  المرحلة 2: تفريغ قاعدة البيانات..."

# حذف جميع المنتجات (بدلاً من truncate بسبب foreign keys)
php artisan tinker --execute="Product::query()->delete();"
if [ $? -ne 0 ]; then
    echo "⚠️  تحذير: فشل حذف Products"
fi

# حذف جميع التصنيفات
php artisan tinker --execute="Category::query()->delete();"
if [ $? -ne 0 ]; then
    echo "⚠️  تحذير: فشل حذف Categories"
fi

echo ""
echo "✅ تم تفريغ قاعدة البيانات"

echo ""
echo "🌱 المرحلة 3: تشغيل Seeders الجديدة..."

# تشغيل CategorySeeder أولاً
echo ""
echo "   📁 تشغيل CategorySeeder..."
php artisan db:seed --class=CategorySeeder
if [ $? -ne 0 ]; then
    echo "❌ فشل تشغيل CategorySeeder"
    exit 1
fi

# تشغيل ProductSeeder
echo ""
echo "   📦 تشغيل ProductSeeder..."
php artisan db:seed --class=ProductSeeder
if [ $? -ne 0 ]; then
    echo "❌ فشل تشغيل ProductSeeder"
    exit 1
fi

# تشغيل DiscountCodeSeeder
echo ""
echo "   🎫 تشغيل DiscountCodeSeeder..."
php artisan db:seed --class=DiscountCodeSeeder
if [ $? -ne 0 ]; then
    echo "⚠️  تحذير: فشل تشغيل DiscountCodeSeeder (اختياري)"
fi

echo ""
echo "==================================================="
echo "✅ تم الانتهاء بنجاح!"
echo "==================================================="

# عرض الإحصائيات
echo ""
echo "📊 إحصائيات قاعدة البيانات:"
echo "   - عدد التصنيفات: $(php artisan tinker --execute='echo Category::count();' 2>/dev/null || echo 'غير متاح')"
echo "   - عدد المنتجات: $(php artisan tinker --execute='echo Product::count();' 2>/dev/null || echo 'غير متاح')"
echo ""
echo "==================================================="

