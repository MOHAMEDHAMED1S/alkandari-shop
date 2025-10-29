import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Menu, X, Home, Store, Languages, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

export const Header = () => {
  const { t, i18n } = useTranslation();
  const { getTotalItems } = useCart();
  const isRTL = i18n.language === 'ar';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLang);
    localStorage.setItem('language', newLang);
  };

  useEffect(() => {
    // Load saved language preference
    const savedLang = localStorage.getItem('language') || 'ar';
    if (savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
      document.documentElement.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', savedLang);
    }
  }, [i18n]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const totalItems = getTotalItems();

  return (
    <header className="border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-lg supports-[backdrop-filter] z-50 shadow-sm bg-header">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="group flex items-center gap-2 text-xl font-bold tracking-wider uppercase hover:opacity-70 transition-opacity"
          >
            <img 
              src="/logo.png" 
              alt="Al-Kandari" 
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm sm:text-xl">Al-Kandari</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-all hover:scale-105 ${isRTL ? 'justify-end' : ''}`}
            >
              <Home className={`w-4 h-4 ${isRTL ? 'order-2' : 'order-1'}`} />
              <span className={`${isRTL ? 'order-1' : 'order-2'}`}>{t('nav.home')}</span>
            </Link>
            <Link
              to="/products"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-all hover:scale-105 ${isRTL ? 'justify-end' : ''}`}
            >
              <Store className={`w-4 h-4 ${isRTL ? 'order-2' : 'order-1'}`} />
              <span className={`${isRTL ? 'order-1' : 'order-2'}`}>{t('nav.products')}</span>
            </Link>
            <Link
              to="/track-order"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-all hover:scale-105 ${isRTL ? 'justify-end' : ''}`}
            >
              <Package className={`w-4 h-4 ${isRTL ? 'order-2' : 'order-1'}`} />
              <span className={`${isRTL ? 'order-1' : 'order-2'}`}>{t('nav.trackOrder')}</span>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="relative p-2.5 rounded-lg hover:bg-muted/80 transition-all hover:scale-110 group"
            >
              <div className="relative">
                <Languages className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              </div>
          
              <Badge 
                variant="secondary" 
                className="text-xs font-bold bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
              >
                {i18n.language.toUpperCase()}
              </Badge>
            </Button>

            <Link 
              to="/cart" 
              className="relative p-2.5 rounded-lg hover:bg-muted/80 transition-all hover:scale-110 group"
            >
              <ShoppingBag className="w-5 h-5 group-hover:text-primary transition-colors" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs animate-pulse">
                  {totalItems}
                </Badge>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link 
              to="/cart" 
              className="relative p-2 rounded-lg hover:bg-muted/80 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
                  {totalItems}
                </Badge>
              )}
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg animate-in slide-in-from-top duration-200">
            <nav className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium hover:bg-muted/80 transition-colors ${isRTL ? 'justify-end' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className={`w-5 h-5 ${isRTL ? 'order-2' : 'order-1'}`} />
                <span className={`${isRTL ? 'order-1' : 'order-2'}`}>{t('nav.home')}</span>
              </Link>
              <Link
                to="/products"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium hover:bg-muted/80 transition-colors ${isRTL ? 'justify-end' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Store className={`w-5 h-5 ${isRTL ? 'order-2' : 'order-1'}`} />
                <span className={`${isRTL ? 'order-1' : 'order-2'}`}>{t('nav.products')}</span>
              </Link>
              <Link
                to="/track-order"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium hover:bg-muted/80 transition-colors ${isRTL ? 'justify-end' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Package className={`w-5 h-5 ${isRTL ? 'order-2' : 'order-1'}`} />
                <span className={`${isRTL ? 'order-1' : 'order-2'}`}>{t('nav.trackOrder')}</span>
              </Link>
              <div className="px-2 py-2 border-t border-border/50 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    toggleLanguage();
                    setIsMobileMenuOpen(false);
                  }}
                  className="group w-full justify-between text-base font-medium hover:scale-[1.02] transition-all duration-200 hover:bg-muted/50"
                >
                  <span className="flex items-center gap-3">
                    <div className="relative">
                      <Globe className="w-5 h-5 transition-transform duration-200 group-hover:rotate-12" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    </div>
                    <span className="font-semibold">{t('nav.language')}</span>
                  </span>
                  <Badge 
                    variant="secondary" 
                    className="font-bold bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    {i18n.language.toUpperCase()}
                  </Badge>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
