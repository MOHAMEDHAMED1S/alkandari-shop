import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategoryTree, getCategoryProducts, Category, Product } from '@/lib/api';
import { ProductCard } from '@/components/Products/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, ArrowLeft, ArrowLeft as BackIcon, Eye, Folder, Sparkles } from 'lucide-react';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProducts, setShowProducts] = useState(false);

  // Check if current language is RTL (Arabic)
  const isRTL = i18n.language === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        
        // Get category tree to find the category with its children
        const categoriesRes = await getCategoryTree();
        
        // Find the category by slug (search in both parent and child categories)
        let foundCategory: Category | null = null;
        let foundSubcategories: Category[] = [];
        
        // First, search in parent categories
        for (const cat of categoriesRes.data || []) {
          if (cat.slug === slug) {
            foundCategory = cat;
            foundSubcategories = cat.children || [];
            break;
          }
          
          // If not found in parents, search in children
          if (cat.children) {
            for (const child of cat.children) {
              if (child.slug === slug) {
                foundCategory = child;
                foundSubcategories = child.children || [];
                break;
              }
            }
          }
          
          if (foundCategory) break;
        }
        
        setCategory(foundCategory);
        setSubcategories(foundSubcategories);
        
        // If category has subcategories, show them instead of products
        // If no subcategories or user wants to see products, load products
        const hasSubcategories = foundSubcategories.length > 0;
        setShowProducts(!hasSubcategories);
        
        // Load products if needed
        if (!hasSubcategories || showProducts) {
          const productsRes = await getCategoryProducts(slug);
          setProducts(productsRes.products?.data || []);
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, showProducts]);

  const handleShowProducts = async () => {
    if (!slug) return;
    
    setShowProducts(true);
    try {
      const productsRes = await getCategoryProducts(slug);
      setProducts(productsRes.products?.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <Skeleton className="h-10 w-80 mb-6 rounded-2xl" />
            <Skeleton className="h-6 w-96 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-3xl" />
                <Skeleton className="h-5 w-3/4 rounded-xl" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-6xl">🔍</span>
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            {t('category.notFound', 'الفئة غير موجودة')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            {t('category.notFoundDescription', 'لم نتمكن من العثور على الفئة المطلوبة')}
          </p>
          <Link to="/categories">
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <BackIcon className="w-5 h-5 mr-3" />
              {t('category.backToCategories', 'العودة للفئات')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasSubcategories = subcategories.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Category Header */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-20 relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
            {isRTL ? (
              <div className="flex justify-end w-full">
                <Link 
                  to="/categories" 
                  className="group flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 flex-row-reverse"
                >
                  <BackIcon className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span className="relative">
                    {t('category.backToCategories', 'العودة للفئات')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
              </div>
            ) : (
              <Link 
                to="/categories" 
                className="group flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
              >
                <BackIcon className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="relative">
                  {t('category.backToCategories', 'Back to Categories')}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300" />
                </span>
              </Link>
            )}
          </div>
          
          {/* Category Info */}
          <div className="max-w-5xl">
            {isRTL ? (
              <div className="flex justify-end w-full">
                <div className="flex flex-col-reverse sm:flex-row-reverse items-center sm:items-start gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
                  <div className="text-right flex-1 text-center sm:text-right">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-3 sm:mb-4 justify-center sm:justify-end">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent leading-tight">
                        {category.name}
                      </h1>
                    </div>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto sm:mx-0">
                      {category.description || (hasSubcategories 
                        ? t('category.exploreSubcategories', 'استكشف الفئات الفرعية المتنوعة')
                        : t('category.exploreProducts', 'استكشف مجموعة منتجات هذه الفئة الرائعة')
                      )}
                    </p>
                   
                  </div>
                  {category.image && (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl flex-shrink-0 ring-2 sm:ring-4 ring-white/50 dark:ring-slate-700/50">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
                {category.image && (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl flex-shrink-0 ring-2 sm:ring-4 ring-white/50 dark:ring-slate-700/50">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="text-left flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-3 sm:mb-4 justify-center sm:justify-start">
                    <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-500" />
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent leading-tight">
                      {category.name}
                    </h1>
                  </div>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto sm:mx-0">
                    {category.description || (hasSubcategories 
                      ? t('category.exploreSubcategories', 'Explore our diverse subcategories')
                      : t('category.exploreProducts', 'Discover amazing products in this category')
                    )}
                  </p>
                  {hasSubcategories && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center sm:justify-start">
                      <Button
                        variant={showProducts ? "outline" : "default"}
                        size="sm"
                        onClick={() => setShowProducts(false)}
                        className={`${
                          showProducts 
                            ? "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800" 
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0"
                        } shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 text-xs sm:text-sm w-full sm:w-auto`}
                      >
                        <Folder className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                        <span className="truncate">{t('category.showSubcategories', 'Subcategories')} ({subcategories.length})</span>
                      </Button>
                      <Button
                        variant={showProducts ? "default" : "outline"}
                        size="sm"
                        onClick={handleShowProducts}
                        className={`${
                          showProducts 
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0" 
                            : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                        } shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 text-xs sm:text-sm w-full sm:w-auto`}
                      >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                        <span className="truncate">{t('category.showAllProducts', 'All Products')}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Subcategories or Products Grid */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {hasSubcategories && !showProducts ? (
            <>
              {/* Subcategories Grid */}
              <div className="mb-12 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  {t('category.subcategories', 'الفئات الفرعية')}
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                  {t('category.subcategoriesDescription', 'اختر فئة فرعية لاستكشاف المنتجات المميزة')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {subcategories.map((subcategory, index) => (
                  <Link
                    key={subcategory.id}
                    to={`/category/${subcategory.slug}`}
                    className="group animate-in fade-in slide-in-from-bottom duration-700"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-3">
                      {/* Background Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Image */}
                      <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-slate-700/50 dark:to-slate-800/50 rounded-2xl mb-6 overflow-hidden border border-slate-200/30 dark:border-slate-600/30 shadow-lg group-hover:shadow-xl transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                        
                        {subcategory.image ? (
                          <>
                            <img
                              src={subcategory.image}
                              alt={subcategory.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
                              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-full p-4 shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300 ring-2 ring-blue-500/20">
                                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl font-bold text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-500">
                              {subcategory.name[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="relative z-10 text-center">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 mb-3 leading-tight">
                          {subcategory.name}
                        </h3>
                        {subcategory.products_count !== undefined && subcategory.products_count > 0 && (
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-700/50 rounded-full px-4 py-2 inline-block">
                            {subcategory.products_count} {t('category.products', 'منتج')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : products.length > 0 ? (
            <>
              {/* Products Grid */}
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    {t('category.productsInCategory', 'منتجات الفئة')}
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                    {t('category.productsDescription', 'اكتشف مجموعة منتجاتنا المميزة')}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl px-6 py-3 shadow-lg">
                  <span className="text-lg font-bold text-blue-800 dark:text-blue-200">
                    {products.length} {t('category.productsFound', 'منتج')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-in fade-in slide-in-from-bottom duration-700"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-24">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center shadow-xl">
                <span className="text-6xl">📦</span>
              </div>
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                {t('category.noProducts', 'لا توجد منتجات في هذه الفئة')}
              </h3>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
                {t('category.noProductsDescription', 'لم يتم العثور على منتجات في هذه الفئة حالياً، تحقق مرة أخرى قريباً')}
              </p>
              <Link to="/categories">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-8"
                >
                  <BackIcon className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {t('category.backToCategories', 'العودة للفئات')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;