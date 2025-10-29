#!/bin/bash

echo "================================================="
echo "🌱 تشغيل Database Seeders"
echo "🌱 Running Database Seeders"
echo "================================================="
echo ""

# Check if we're in the back-end directory
if [ ! -f "artisan" ]; then
    echo "❌ خطأ: يجب تشغيل هذا السكريبت من مجلد back-end"
    echo "❌ Error: This script must be run from the back-end directory"
    exit 1
fi

echo "📋 الخطوة 1: التحقق من الاتصال بقاعدة البيانات..."
echo "📋 Step 1: Checking database connection..."
php artisan db:show 2>&1 | head -5
if [ $? -ne 0 ]; then
    echo "❌ خطأ: فشل الاتصال بقاعدة البيانات"
    echo "❌ Error: Failed to connect to database"
    exit 1
fi
echo "✅ الاتصال بقاعدة البيانات ناجح"
echo ""

echo "📋 الخطوة 2: تشغيل الـ Seeders..."
echo "📋 Step 2: Running Seeders..."
echo ""

# Run individual seeders
echo "🗂️  1. CategorySeeder - إنشاء الفئات..."
php artisan db:seed --class=CategorySeeder
echo ""

echo "📦 2. ProductSeeder - إنشاء المنتجات..."
php artisan db:seed --class=ProductSeeder
echo ""

echo "🎫 3. DiscountCodeSeeder - إنشاء أكواد الخصم..."
php artisan db:seed --class=DiscountCodeSeeder
echo ""

echo "👤 4. AdminUserSeeder - إنشاء مستخدم الأدمن..."
php artisan db:seed --class=AdminUserSeeder
echo ""

echo "💳 5. PaymentMethodSettingsSeeder - إعدادات الدفع..."
php artisan db:seed --class=PaymentMethodSettingsSeeder
echo ""

echo "🚚 6. ShippingCostSeeder - تكاليف الشحن..."
php artisan db:seed --class=ShippingCostSeeder
echo ""

echo "📱 7. WhatsAppSettingsSeeder - إعدادات واتساب..."
php artisan db:seed --class=WhatsAppSettingsSeeder
echo ""

echo "================================================="
echo "✅ تم تشغيل جميع الـ Seeders بنجاح!"
echo "✅ All Seeders completed successfully!"
echo "================================================="
echo ""

echo "📊 إحصائيات قاعدة البيانات:"
echo "📊 Database Statistics:"
echo ""
echo "الفئات (Categories):"
php artisan tinker --execute="echo 'إجمالي: ' . \App\Models\Category::count() . ' فئة';"
php artisan tinker --execute="echo 'فئات أب: ' . \App\Models\Category::whereNull('parent_id')->count();"
php artisan tinker --execute="echo 'فئات فرعية: ' . \App\Models\Category::whereNotNull('parent_id')->count();"
echo ""

echo "المنتجات (Products):"
php artisan tinker --execute="echo 'إجمالي: ' . \App\Models\Product::count() . ' منتج';"
php artisan tinker --execute="echo 'متوفرة: ' . \App\Models\Product::where('is_available', true)->count();"
echo ""

echo "أكواد الخصم (Discount Codes):"
php artisan tinker --execute="echo 'إجمالي: ' . \App\Models\DiscountCode::count() . ' كود';"
php artisan tinker --execute="echo 'نشطة: ' . \App\Models\DiscountCode::where('is_active', true)->count();"
echo ""

echo "================================================="
echo "🎉 انتهى! يمكنك الآن استخدام الموقع"
echo "🎉 Done! You can now use the website"
echo "================================================="
