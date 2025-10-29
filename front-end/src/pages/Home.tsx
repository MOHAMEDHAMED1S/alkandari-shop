import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategories, getFeaturedProducts, Category, Product } from '@/lib/api';
import { ProductCard } from '@/components/Products/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const Home = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if current language is RTL (Arabic)
  const isRTL = i18n.language === 'ar';
  // Use ArrowLeft for RTL, ArrowRight for LTR
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          getCategories({ parents_only: true }),
          getFeaturedProducts(),
        ]);
        setCategories(categoriesRes.data || []);
        setFeaturedProducts(productsRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/3 to-background">
        {/* Background Image with Low Opacity */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.8]"
              style={{ backgroundImage: `url(/hero.png` }}
            />
          
          {/* Glass Layer Overlay */}
          <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-[2px] border border-white/20 dark:border-white/10" />
          
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/8 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
        
        {/* White Fog Effect at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-10" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 relative">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            {/* Main Title */}
            <div className="space-y-6">
              <h1 className="text-slate-900 dark:text-slate-100 text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                {t('home.hero.title')}
              </h1>
              
              <p className="text-slate-800 dark:text-slate-200 text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
                {t('home.hero.subtitle')}
              </p>
            </div>
            
            {/* CTA Button */}
            <div className="flex justify-center pt-4">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-slate-900 dark:text-slate-100 group relative overflow-hidden h-12 px-24 rounded-full border-2 border-slate-400/50 dark:border-slate-600/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md hover:bg-primary hover:border-primary shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.4)] transition-all duration-500 hover:scale-105"
              >
                <Link
                  to="/products"
                  className="flex items-center gap-2 z-10 relative font-medium group-hover:text-white transition-colors duration-500"
                >
                  {isRTL ? (
                    <>
                      <ArrowIcon className="w-5 h-5 transition-transform duration-500 group-hover:-translate-x-1 group-hover:scale-110" />
                      {t('home.hero.cta')}
                    </>
                  ) : (
                    <>
                      {t('home.hero.cta')}
                      <ArrowIcon className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1 group-hover:scale-110" />
                    </>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative py-4 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t('home.categories')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              {t('home.categories.subtitle', isRTL ? 'استكشف مجموعتنا المتنوعة' : 'Explore our diverse collection')}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] rounded-2xl" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {categories.slice(0, 4).map((category, index) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group animate-in fade-in slide-in-from-bottom duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 shadow-md hover:shadow-xl transition-all duration-500 hover:scale-[1.02]">
                    <div className="aspect-[4/3] relative">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <span className="text-5xl font-bold text-primary/20 group-hover:text-primary/30 transition-colors">
                            {category.name[0]}
                          </span>
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                      
                      {/* Category Name */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white text-lg font-bold mb-1 drop-shadow-lg">
                          {category.name}
                        </h3>

                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* View All Link */}
          <div className="text-center mt-12 ">
            <Link 
              to="/categories" 
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-border/50 hover:border-primary/50 bg-background/50 hover:bg-primary/5 backdrop-blur-sm font-medium transition-all duration-300 hover:scale-105 bg-header"
            >
              {t('home.viewAll')}
              <ArrowIcon className={`w-5 h-5 transition-transform ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="relative py-4 md:py-20 lg:py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t('home.featured')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              {t('home.featured.subtitle', isRTL ? 'منتجات مختارة بعناية لك' : 'Carefully selected products for you')}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.slice(0, 8).map((product, index) => (
                <div
                  key={product.id}
                  className="animate-in fade-in slide-in-from-bottom duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {/* View All Link */}
          <div className="text-center mt-12">
            <Link 
              to="/products" 
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-border/50 hover:border-primary/50 bg-background/50 hover:bg-primary/5 backdrop-blur-sm font-medium transition-all duration-300 hover:scale-105 bg-header"
            >
              {t('home.viewAll')}
              <ArrowIcon className={`w-5 h-5 transition-transform ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;