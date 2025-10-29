import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategoryTree, getCategoryProducts, Category, Product } from '@/lib/api';
import { ProductCard } from '@/components/Products/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, ArrowLeft, ArrowLeft as BackIcon, Eye, Folder } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('category.notFound', 'الفئة غير موجودة')}</h1>
          <Link to="/categories">
            <Button variant="outline">
              <BackIcon className="w-4 h-4 mr-2" />
              {t('category.backToCategories', 'العودة للفئات')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasSubcategories = subcategories.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Category Header */}
      <section className="relative bg-gradient-to-br from-background via-primary/5 to-background border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative">
          <div className="flex items-center gap-4 mb-6">
            {isRTL ? (
              <div className="flex justify-end w-full">
                <Link 
                  to="/categories" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors flex-row-reverse"
                >
                  <BackIcon className="w-4 h-4" />
                  {t('category.backToCategories', 'العودة للفئات')}
                </Link>
              </div>
            ) : (
              <Link 
                to="/categories" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <BackIcon className="w-4 h-4" />
                {t('category.backToCategories', 'Back to Categories')}
              </Link>
            )}
          </div>
          
          <div className="max-w-4xl">
            {isRTL ? (
              <div className="flex justify-end w-full">
                <div className="flex items-center gap-2 mb-2 flex-row-reverse">
                  <div className="text-right">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">
                      {category.name}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      {category.description || (hasSubcategories 
                        ? t('category.exploreSubcategories', 'استكشف الفئات الفرعية')
                        : t('category.exploreProducts', 'استكشف منتجات هذه الفئة')
                      )}
                    </p>
                    {hasSubcategories && (
                      <div className="flex gap-2 mt-4 justify-end">
                        <Button
                          variant={showProducts ? "outline" : "default"}
                          size="sm"
                          onClick={() => setShowProducts(false)}
                        >
                          <Folder className="w-4 h-4 ml-2" />
                          {t('category.showSubcategories', 'الفئات الفرعية')} ({subcategories.length})
                        </Button>
                        <Button
                          variant={showProducts ? "default" : "outline"}
                          size="sm"
                          onClick={handleShowProducts}
                        >
                          {t('category.showAllProducts', 'جميع المنتجات')}
                        </Button>
                      </div>
                    )}
                  </div>
                  {category.image && (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-border/30 shadow-lg flex-shrink-0">
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
              <div className="flex items-center gap-4 mb-2">
                {category.image && (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-border/30 shadow-lg flex-shrink-0">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="text-left flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">
                    {category.name}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {category.description || (hasSubcategories 
                      ? t('category.exploreSubcategories', 'Explore subcategories')
                      : t('category.exploreProducts', 'Explore products in this category')
                    )}
                  </p>
                  {hasSubcategories && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant={showProducts ? "outline" : "default"}
                        size="sm"
                        onClick={() => setShowProducts(false)}
                      >
                        <Folder className="w-4 h-4 mr-2" />
                        {t('category.showSubcategories', 'Subcategories')} ({subcategories.length})
                      </Button>
                      <Button
                        variant={showProducts ? "default" : "outline"}
                        size="sm"
                        onClick={handleShowProducts}
                      >
                        {t('category.showAllProducts', 'All Products')}
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
      <section className="relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {hasSubcategories && !showProducts ? (
            <>
              {/* Subcategories Grid */}
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  {t('category.subcategories', 'الفئات الفرعية')}
                </h2>
                <p className="text-muted-foreground">
                  {t('category.subcategoriesDescription', 'اختر فئة فرعية لعرض المنتجات')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {subcategories.map((subcategory, index) => (
                  <Link
                    key={subcategory.id}
                    to={`/category/${subcategory.slug}`}
                    className="group animate-in fade-in slide-in-from-bottom duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-primary/30 transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2">
                      {/* Background Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Image */}
                      <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-700/50 dark:to-slate-800/50 rounded-2xl mb-4 overflow-hidden border border-slate-200/30 dark:border-slate-600/30 shadow-inner group-hover:shadow-lg transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                        
                        {subcategory.image ? (
            <>
                            <img
                              src={subcategory.image}
                              alt={subcategory.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
                              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-4 shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                <Eye className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl font-bold text-slate-400 dark:text-slate-500 group-hover:text-primary/60 transition-colors duration-500">
                              {subcategory.name[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="relative z-10 text-center">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors duration-300 mb-2">
                          {subcategory.name}
                        </h3>
                        {subcategory.products_count !== undefined && subcategory.products_count > 0 && (
                          <p className="text-sm text-muted-foreground">
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
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold">
                  {t('category.productsInCategory', 'منتجات الفئة')}
                </h2>
                <div className="text-sm text-muted-foreground">
                  {products.length} {t('category.productsFound', 'منتج موجود')}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-in fade-in slide-in-from-bottom duration-500"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-muted/50 rounded-full flex items-center justify-center">
                <span className="text-4xl opacity-50">📦</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('category.noProducts', 'لا توجد منتجات في هذه الفئة')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('category.noProductsDescription', 'لم يتم العثور على منتجات في هذه الفئة حالياً')}
              </p>
              <Link to="/categories">
                <Button variant="outline">
                  <BackIcon className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
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
