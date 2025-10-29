import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProducts, getCategories, Product, Category } from '@/lib/api';
import { ProductCard } from '@/components/Products/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedButton } from '@/components/ui/animated-button';
import { AnimatedInput } from '@/components/ui/animated-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const Products = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  // Ref for infinite scroll observer
  const observerTarget = useRef<HTMLDivElement>(null);

  const currentCategorySlug = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  
  // Find the current category ID based on slug
  const currentCategory = currentCategorySlug === 'all' 
    ? 'all' 
    : categories.find(cat => cat.slug === currentCategorySlug)?.id.toString() || 'all';

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories({ parents_only: true });
        setCategories(data.data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts({
          category: currentCategorySlug === 'all' ? undefined : currentCategorySlug,
          search: searchQuery,
          sort: sortBy,
          page: 1
        });
        setProducts(data.data.products || []);
        setHasMore(data.data.hasMore || false);
        setPage(1);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [currentCategorySlug, searchQuery, sortBy]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const data = await getProducts({
        category: currentCategorySlug === 'all' ? undefined : currentCategorySlug,
        search: searchQuery,
        sort: sortBy,
        page: page + 1
      });
      setProducts(prev => [...prev, ...(data.data.products || [])]);
      setHasMore(data.data.hasMore || false);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more products:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentCategorySlug, searchQuery, sortBy, page]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          handleLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px', // Start loading 100px before reaching the element
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, handleLoadMore]);

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      // Find the category by ID and use its slug
      const selectedCategory = categories.find(cat => cat.id.toString() === value);
      if (selectedCategory) {
        params.set('category', selectedCategory.slug);
      }
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('sort', value);
    } else {
      params.delete('sort');
    }
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/3 to-background">
        {/* Background Image with Low Opacity */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.13]"
              style={{ backgroundImage: `url(/hero-natural.jpg` }}
            />
          
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/8 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
        
        {/* White Fog Effect at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-10" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-12 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-4">
              <h1 className="text-3xl pb-2 md:text-4xl lg:text-5xl font-black mb-4 pb-1 leading-tight tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-700 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                {t('products.title', 'Our Products')}
              </h1>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative max-w-2xl mx-auto">
                <Search className={`absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground ${i18n.language === 'ar' ? 'left-4' : 'right-4'}`} />
                <AnimatedInput
                  type="text"
                  placeholder={t('products.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className={`w-full h-14 text-base rounded-2xl border-2 border-border/30 focus:border-primary/50 transition-all duration-300 ${i18n.language === 'ar' ? 'pl-12 pr-4' : 'pr-12 pl-4'}`}
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch max-w-4xl mx-auto">
              {/* Category Filter */}
              <div className="flex-1 min-w-0">
                <Select value={currentCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full h-12 bg-background border-2 border-border/30 hover:border-primary/50 transition-all duration-300 rounded-2xl">
                    <div className="flex items-center gap-3 w-full">
                      <Filter className="h-4 w-4 flex-shrink-0 text-primary" />
                      <span className="truncate font-medium text-sm sm:text-base">
                        <SelectValue placeholder={t('products.allCategories')} />
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    <SelectItem value="all" className="rounded-lg">{t('products.allCategories')}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()} className="rounded-lg">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sort Filter */}
              <div className="flex-1 min-w-0">
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full h-12 bg-background border-2 border-border/30 hover:border-primary/50 transition-all duration-300 rounded-2xl">
                    <div className="flex items-center gap-3 w-full">
                      <SlidersHorizontal className="h-4 w-4 flex-shrink-0 text-primary" />
                      <span className="truncate font-medium text-sm sm:text-base">
                        <SelectValue placeholder={t('products.sortBy')} />
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    <SelectItem value="newest" className="rounded-lg">{t('products.newest')}</SelectItem>
                    <SelectItem value="price_low" className="rounded-lg">{t('products.priceLowToHigh')}</SelectItem>
                    <SelectItem value="price_high" className="rounded-lg">{t('products.priceHighToLow')}</SelectItem>
                    <SelectItem value="popular" className="rounded-lg">{t('products.mostPopular')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="space-y-2 sm:space-y-3">
                <Skeleton className="aspect-video rounded-xl" />
                <Skeleton className="h-3 sm:h-4 w-3/4 mx-auto" />
                <Skeleton className="h-3 sm:h-4 w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
          >
            <AnimatePresence>
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  layout
                  className="product-card-wrapper"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Infinite Scroll Trigger & Load More Button */}
        {!loading && products.length > 0 && (
          <div className="mt-12">
            {/* Invisible trigger for infinite scroll */}
            <div ref={observerTarget} className="h-20 flex items-center justify-center">
              {loadingMore && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-primary border-t-transparent" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {t('products.loading')}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Manual Load More Button (fallback) */}
            {hasMore && !loadingMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <AnimatedButton
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  variant="outline"
                  size="lg"
                  className="rounded-2xl px-8 py-3 border-2 hover:border-primary/50 transition-all duration-300"
                >
                  {t('products.loadMore')}
                </AnimatedButton>
                <p className="text-xs text-muted-foreground mt-3">
                  {i18n.language === 'ar' 
                    ? 'أو قم بالتمرير لأسفل للتحميل التلقائي' 
                    : 'Or scroll down to load automatically'}
                </p>
              </motion.div>
            )}

            {/* End of products message */}
            {!hasMore && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="bg-muted/30 rounded-2xl px-6 py-4 inline-block">
                  <p className="text-muted-foreground font-medium">{t('products.noMoreProducts')}</p>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* No Results */}
        {!loading && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-muted/20 rounded-3xl p-12 max-w-md mx-auto">
              <Search className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
              <h3 className="text-xl font-semibold mb-3">{t('products.noResults')}</h3>
              <p className="text-muted-foreground leading-relaxed">{t('products.tryAdjustingFilters')}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Products;