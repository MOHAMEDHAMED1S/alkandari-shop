<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // إضافة حقل المقاسات كـ JSON
            $table->json('sizes')->nullable()->after('meta');
            // حقل لتحديد إذا كان المنتج يحتاج مقاس
            $table->boolean('has_sizes')->default(false)->after('has_inventory');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['sizes', 'has_sizes']);
        });
    }
};
