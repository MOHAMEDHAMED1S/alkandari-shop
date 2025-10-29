import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategoryTree, Category } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, ChevronDown, ChevronUp, FolderOpen, Folder } from 'lucide-react';

const Categories = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Check if current language is RTL (Arabic)
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesRes = await getCategoryTree();
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const renderCategory = (category: Category, index: number, isChild: boolean = false) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div
        key={category.id}
        className={`animate-in fade-in slide-in-from-bottom duration-500 ${isChild ? 'ml-4 md:ml-6' : ''}`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {/* Parent Category Card */}
        <div className={`relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-primary/30 transition-all duration-500 group ${isChild ? 'mb-4' : 'mb-6'}`}>
          {/* Background Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex items-center gap-4">
            {/* Category Image Container */}
              <Link 
                to={`/category/${category.slug}`}
                className="flex-shrink-0"
              >
              <div className={`relative ${isChild ? 'w-20 h-20' : 'w-28 h-28'} bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-700/50 dark:to-slate-800/50 rounded-2xl overflow-hidden border border-slate-200/30 dark:border-slate-600/30 shadow-inner group-hover:shadow-lg transition-all duration-500`}>
                {/* Image Overlay Effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                
                {category.image ? (
                  <>
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    {/* Hover Overlay with Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
                      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-3 shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Eye className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-slate-700/50 dark:to-slate-800/50 relative">
                    {/* Decorative Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
                    </div>
                    
                    <div className="relative z-10 text-center">
                      <span className={`${isChild ? 'text-4xl' : 'text-5xl'} font-bold text-slate-400 dark:text-slate-500 group-hover:text-primary/60 transition-colors duration-500 block mb-1`}>
                        {category.name[0]}
                      </span>
                      <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto group-hover:from-primary/50 group-hover:via-primary group-hover:to-primary/50 transition-all duration-500" />
                    </div>
                  </div>
                )}
              </div>
            </Link>
            
            {/* Category Content */}
            <div className="relative z-10 flex-1 min-w-0">
              <Link 
                to={`/category/${category.slug}`}
                className="block"
              >
                <div className="flex items-center gap-2 mb-2">

                  <h3 className={`${isChild ? 'text-lg' : 'text-xl md:text-2xl'} font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors duration-300 leading-tight truncate`}>
                    {category.name}
                  </h3>
                  {category.products_count !== undefined && category.products_count > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary flex-shrink-0">
                      {category.products_count}
                    </span>
                  )}
                </div>
                {category.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-2">
                    {category.description}
                  </p>
                )}
              </Link>
              
              {/* Expand/Collapse Button for Parent Categories */}
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCategory(category.id)}
                  className={`mt-2 text-primary hover:text-primary hover:bg-primary/10 ${isRTL ? 'mr-0' : 'ml-0'}`}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {t('categories.hideSubcategories', 'إخفاء الفئات الفرعية')}
                    </>
                  ) : (
                    <>
                      <ChevronDown className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {t('categories.showSubcategories', `عرض الفئات الفرعية (${category.children?.length})`)}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          
          {/* Decorative Corner Elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-4 left-4 w-1 h-1 bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>

        {/* Child Categories */}
        {hasChildren && isExpanded && (
          <div className={`space-y-4 ${isRTL ? 'mr-4 md:mr-8' : 'ml-4 md:ml-8'} mb-6`}>
            {category.children!.map((child, childIndex) => renderCategory(child, childIndex, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/3 to-background">
        {/* Background Image with Low Opacity */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat "
              style={{ backgroundImage: `url(/hero_blue.png` }}
            />
          
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/8 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
        
        {/* White Fog Effect at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-10" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-white/90 text-4xl pb-2 md:text-5xl lg:text-6xl font-black mb-6 pb-1 leading-tight tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-700 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t('categories.title', 'تصفح جميع الفئات')}
            </h1>
            
            <p className="text-white/90 text-lg md:text-xl text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-900 max-w-xl mx-auto">
              {t('categories.subtitle', 'اكتشف مجموعتنا المتنوعة من المنتجات المصنفة حسب الفئات')}
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          {loading ? (
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 rounded-3xl p-6 shadow-lg">
                  <Skeleton className="w-28 h-28 rounded-2xl flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                {t('categories.noCategories', 'لا توجد فئات متاحة')}
              </p>
                            </div>
                      ) : (
            <div className="max-w-5xl mx-auto space-y-6">
              {categories.map((category, index) => renderCategory(category, index))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Categories;
