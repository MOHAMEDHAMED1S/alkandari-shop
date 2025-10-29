<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'المنتجات البلاستيكية',
                'slug' => 'plastic-products',
                'description' => 'منتجات بلاستيكية للاستخدام المنزلي',
                'image' => 'https://picsum.photos/300/200?random=1',
                'parent_id' => null,
                'children' => [
                    [
                        'name' => 'الصحون البلاستيكية',
                        'slug' => 'plastic-plates',
                        'description' => 'صحون بلاستيكية بمقاسات وأشكال مختلفة',
                        'image' => 'https://picsum.photos/300/200?random=2',
                    ],
                    [
                        'name' => 'الملاعق، الشوك، السكاكين البلاستيكية',
                        'slug' => 'plastic-cutlery',
                        'description' => 'أدوات طعام بلاستيكية عالية الجودة',
                        'image' => 'https://picsum.photos/300/200?random=3',
                    ],
                    [
                        'name' => 'الأكياس البلاستيكية',
                        'slug' => 'plastic-bags',
                        'description' => 'أكياس بلاستيكية سادة وملونة بأحجام مختلفة',
                        'image' => 'https://picsum.photos/300/200?random=4',
                    ],
                ]
            ],
            [
                'name' => 'منتجات الميكرويف',
                'slug' => 'microwave-products',
                'description' => 'منتجات مخصصة للاستخدام في الميكرويف',
                'image' => 'https://picsum.photos/300/200?random=5',
                'parent_id' => null,
                'children' => [
                    [
                        'name' => 'علب وأطباق الميكرويف',
                        'slug' => 'microwave-containers',
                        'description' => 'علب وأطباق مقاومة للحرارة للاستخدام في الميكرويف',
                        'image' => 'https://picsum.photos/300/200?random=6',
                    ],
                    [
                        'name' => 'أغطية الميكرويف',
                        'slug' => 'microwave-covers',
                        'description' => 'أغطية بلاستيكية لتغطية الطعام في الميكرويف',
                        'image' => 'https://picsum.photos/300/200?random=7',
                    ],
                    [
                        'name' => 'أوعية حفظ وتسخين الطعام',
                        'slug' => 'food-storage',
                        'description' => 'أوعية لحفظ وتسخين الطعام في الميكرويف',
                        'image' => 'https://picsum.photos/300/200?random=8',
                    ],
                ]
            ],
            [
                'name' => 'منتجات الألمنيوم والقصدير',
                'slug' => 'aluminum-products',
                'description' => 'منتجات ألمنيوم وقصدير للطهي والتغليف',
                'image' => 'https://picsum.photos/300/200?random=9',
                'parent_id' => null,
                'children' => [
                    [
                        'name' => 'صحون الألمنيوم',
                        'slug' => 'aluminum-plates',
                        'description' => 'صحون ألمنيوم للطهي أو التغليف',
                        'image' => 'https://picsum.photos/300/200?random=10',
                    ],
                    [
                        'name' => 'رول القصدير',
                        'slug' => 'aluminum-foil',
                        'description' => 'لفائف قصدير للتغليف والطهي',
                        'image' => 'https://picsum.photos/300/200?random=11',
                    ],
                    [
                        'name' => 'أواني وأغطية الألمنيوم',
                        'slug' => 'aluminum-pots-covers',
                        'description' => 'أواني وأغطية ألمنيوم متعددة الاستخدامات',
                        'image' => 'https://picsum.photos/300/200?random=12',
                    ],
                ]
            ],
            [
                'name' => 'المنتجات المنزلية',
                'slug' => 'household-products',
                'description' => 'منتجات منزلية متعددة الاستخدام',
                'image' => 'https://picsum.photos/300/200?random=13',
                'parent_id' => null,
                'children' => [
                    [
                        'name' => 'أوعية وأطباق متعددة الاستخدام',
                        'slug' => 'multi-purpose-bowls',
                        'description' => 'أوعية وأطباق للاستخدام اليومي',
                        'image' => 'https://picsum.photos/300/200?random=14',
                    ],
                    [
                        'name' => 'أدوات تنظيم المطبخ',
                        'slug' => 'kitchen-organization',
                        'description' => 'أدوات تنظيم وتخزين للمطبخ',
                        'image' => 'https://picsum.photos/300/200?random=15',
                    ],
                    [
                        'name' => 'مستلزمات تقديم الطعام',
                        'slug' => 'serving-essentials',
                        'description' => 'منتجات تقديم الطعام والمشروبات',
                        'image' => 'https://picsum.photos/300/200?random=16',
                    ],
                ]
            ]
        ];

        foreach ($categories as $categoryData) {
            $children = $categoryData['children'] ?? [];
            unset($categoryData['children']);
            
            $category = Category::updateOrCreate(
                ['slug' => $categoryData['slug']],
                $categoryData
            );
            
            foreach ($children as $childData) {
                $childData['parent_id'] = $category->id;
                Category::updateOrCreate(
                    ['slug' => $childData['slug']],
                    $childData
                );
            }
        }
    }
}
