import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuthError } from '@/hooks/useAuthError';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Users,
  UserCog,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Globe,
  User,
  ChevronDown,
  Home,
  FolderOpen,
  ShoppingBag,
  Percent,
  UserCheck,
  Shield,
  Bot,
  FileText,
  Sparkles,
  Zap,
  Megaphone,
  TrendingUp,
  Receipt,
  Warehouse,
} from 'lucide-react';
import { toast } from 'sonner';
import  NotificationBell from './notifications/NotificationBell';

const AdminLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, isLoading, token } = useAdmin();
  const { handleApiError } = useAuthError();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isRTL = i18n.language === 'ar';

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle authentication errors globally
  useEffect(() => {
    const handleGlobalError = (event: any) => {
      if (event.detail?.error) {
        handleApiError(event.detail.error);
      }
    };

    window.addEventListener('auth-error', handleGlobalError);
    return () => window.removeEventListener('auth-error', handleGlobalError);
  }, [handleApiError]);

  // Redirect to login if not authenticated (only when not loading)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && location.pathname !== '/admin/login') {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-6"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-primary/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{t('admin.common.loading')}</p>
            <div className="flex space-x-1">
              <motion.div className="w-2 h-2 bg-primary rounded-full" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
              <motion.div className="w-2 h-2 bg-primary rounded-full" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
              <motion.div className="w-2 h-2 bg-primary rounded-full" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success(t('admin.navigation.logoutSuccess'));
    navigate('/admin/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
  };

  const navigationItems = [
    {
      name: t('admin.navigation.dashboard'),
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/admin/dashboard',
    },
    {
      name: t('admin.navigation.categories'),
      href: '/admin/categories',
      icon: FolderOpen,
      current: location.pathname.startsWith('/admin/categories'),
    },
    {
      name: t('admin.navigation.products'),
      href: '/admin/products',
      icon: Package,
      current: location.pathname.startsWith('/admin/products'),
    },
    {
      name: t('admin.navigation.orders'),
      href: '/admin/orders',
      icon: ShoppingCart,
      current: location.pathname.startsWith('/admin/orders'),
    },
    {
      name: i18n.language === 'ar' ? 'تصحيح الدفعات' : 'Payment Verification',
      href: '/admin/payment-verification',
      icon: Receipt,
      current: location.pathname === '/admin/payment-verification',
    },
    {
      name: t('admin.navigation.discounts'),
      href: '/admin/discounts',
      icon: Percent,
      current: location.pathname === '/admin/discounts',
    },
    {
      name: i18n.language === 'ar' ? 'خصومات المنتجات' : 'Product Discounts',
      href: '/admin/product-discounts',
      icon: Tag,
      current: location.pathname.startsWith('/admin/product-discounts'),
    },
    {
      name: i18n.language === 'ar' ? 'إدارة المخزون' : 'Inventory Management',
      href: '/admin/inventory',
      icon: Warehouse,
      current: location.pathname.startsWith('/admin/inventory'),
    },
    {
      name: t('admin.navigation.customers'),
      href: '/admin/customers',
      icon: Users,
      current: location.pathname.startsWith('/admin/customers'),
    },
    {
      name: t('admin.navigation.users'),
      href: '/admin/users',
      icon: UserCog,
      current: location.pathname.startsWith('/admin/users'),
    },
    {
      name: t('admin.navigation.marketing'),
      href: '/admin/marketing',
      icon: Megaphone,
      current: location.pathname.startsWith('/admin/marketing'),
    },
    {
      name: t('admin.navigation.reports'),
      href: '/admin/reports',
      icon: BarChart3,
      current: location.pathname.startsWith('/admin/reports'),
    },
    {
      name: t('admin.navigation.analytics'),
      href: '/admin/analytics',
      icon: TrendingUp,
      current: location.pathname.startsWith('/admin/analytics'),
    },
    {
      name: i18n.language === 'ar' ? 'الشات بوت' : 'Chatbot',
      href: '/admin/chatbot',
      icon: Bot,
      current: location.pathname.startsWith('/admin/chatbot'),
    },
    {
      name: t('admin.navigation.settings'),
      href: '/admin/settings',
      icon: Settings,
      current: location.pathname.startsWith('/admin/settings'),
    },
  ];

  const Sidebar = ({ isMobile = false }: { isMobile?: boolean }) => {
    const Component = isMobile ? 'div' : 'div';
    
     return (
       <Component className={`${isMobile ? 'px-4 py-6 h-full flex flex-col' : 'flex flex-col h-full'}`}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center justify-between mb-6 px-2`}
        >
          <div className={`flex items-center w-full ${isRTL ? 'justify-end order-2' : 'justify-start order-1'}`}>
            <div className={`flex items-center`}>
              <div className={`relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center ${isRTL ? 'ms-3 sm:ms-4 order-2' : 'me-3 sm:me-4 order-1'}`}>
                <img 
                  src="/logo.png" 
                  alt="Soapy Bubble Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className={`flex flex-col ${isRTL ? 'text-right order-1' : 'text-left order-2'}`}>
                <span className={`text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent ${isRTL ? 'text-right' : 'text-left'}`}>
                  Soapy Bubble
                </span>
           
              </div>
            </div>
          </div>

          {isMobile && (
            <div className={`${isRTL ? 'order-1' : 'order-2'}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 hover:scale-105 border border-slate-300/60 dark:border-slate-600/60 shadow-none hover:shadow-sm"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-48 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border-slate-200/60 dark:border-slate-700/60 shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/30 rounded-xl">
                  <DropdownMenuItem 
                    onClick={() => {
                      navigate('/');
                      setIsMobileMenuOpen(false);
                    }} 
                    className="hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-[1.02] mx-1 my-1 rounded-lg"
                  >
                    <Home className="w-4 h-4 me-3 text-slate-600 dark:text-slate-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{t('nav.home')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
                  <DropdownMenuItem 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }} 
                    className="text-red-600 focus:text-red-600 focus:bg-gradient-to-r focus:from-red-50 focus:to-red-100 dark:focus:bg-red-900/20 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-[1.02] mx-1 my-1 rounded-lg"
                  >
                    <LogOut className="w-4 h-4 me-3" />
                    <span className="font-semibold">{t('admin.navigation.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-2 overflow-y-auto overflow-x-hidden scrollbar-thin pr-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div 
                key={item.name}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant={item.current ? 'default' : 'ghost'}
                  className={`group relative w-full h-12 px-4 font-medium transition-all duration-300 text-sm sm:text-base rounded-xl ${
                    isRTL ? 'justify-end flex-row-reverse' : 'justify-start'
                  } ${
                    item.current
                      ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]'
                      : 'hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:shadow-md hover:scale-[1.01] text-slate-700 dark:text-slate-300'
                  }`}
                  onClick={() => {
                    navigate(item.href);
                    if (isMobile) setIsMobileMenuOpen(false);
                  }}
                >
                  {item.current && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className={`relative flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {isRTL ? (
                      <>
                        <span className={`truncate font-medium text-right flex-1 mr-2`}>{item.name}</span>
                        <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110`} />
                      </>
                    ) : (
                      <>
                        <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 me-3`} />
                        <span className={`truncate font-medium text-left`}>{item.name}</span>
                      </>
                    )}
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </nav>


 
      </Component>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Mobile Header */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
        className="lg:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-4 py-3 flex items-center justify-between shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20 sticky top-0 z-50"
      >
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="relative w-10 h-10 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Soapy Bubble Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
            <span className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent ${isRTL ? 'text-right' : 'text-left'}`}>
              Soapy Bubble
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell token={token || ''} />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleLanguage} 
            className="h-10 w-10 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 hover:scale-105 group"
          >
            <Globe className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" />
          </Button>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 hover:scale-105">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? 'right' : 'left'} className="w-80 p-0 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
              <div className="h-full overflow-y-auto scrollbar-thin">
                <Sidebar isMobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </motion.div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <motion.div 
          initial={{ x: isRTL ? 100 : -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
          className={`hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0 z-40 ${isRTL ? 'lg:right-0' : 'lg:left-0'}`}
        >
          <div className={`flex flex-col flex-grow bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 pt-8 pb-6 overflow-y-auto shadow-2xl shadow-slate-200/20 dark:shadow-slate-900/20 ${isRTL ? 'border-s' : 'border-e'}`}>
            <Sidebar />
          </div>
        </motion.div>

        {/* Main Content */}
        <div className={`flex flex-col flex-1 ${isRTL ? 'lg:ml-0 lg:mr-80' : 'lg:ps-80'}`}>
          {/* Desktop Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className={`hidden lg:block bg-gradient-to-r from-white/95 via-slate-50/95 to-white/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-700/60 py-4 sticky top-0 z-30 shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/30 ${isRTL ? 'px-10 pr-0' : 'px-10'}`}
          >
            <div className="flex items-center justify-between">
              {i18n.language === 'ar' ? (
                <>
                  <div className="flex items-center gap-3 order-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="group flex items-center gap-4 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 rounded-2xl transition-all duration-300 hover:scale-105 px-4 py-3 shadow-lg hover:shadow-xl">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-sm"></div>
                            <Avatar className="relative w-10 h-10 shadow-xl ring-4 ring-white/70 dark:ring-slate-800/70">
                              <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white font-bold text-lg">
                                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 shadow-lg">
                              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          <div className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                            <p className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-300" style={{ textAlign: 'left' }}>{user?.name}</p>
                          </div>
                          <ChevronDown className="w-5 h-5 hidden xl:block text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors duration-300" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-72 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border-slate-200/60 dark:border-slate-700/60 shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/30 rounded-2xl">
                        <DropdownMenuLabel className="px-6 py-4">
                          <div className="flex flex-col space-y-2">
                            <p className="text-base font-bold text-slate-900 dark:text-white">{user?.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                            <div className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                            
                              <span className="text-xs text-primary font-semibold uppercase tracking-wide">{user?.role}</span>
                            </div>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
           
                        <DropdownMenuItem onClick={() => navigate('/')} className="hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-[1.02] mx-2 my-1 rounded-xl">
                          <Home className="w-5 h-5 ms-3 text-slate-600 dark:text-slate-400" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{t('nav.home')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-gradient-to-r focus:from-red-50 focus:to-red-100 dark:focus:bg-red-900/20 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-[1.02] mx-2 my-1 rounded-xl">
                          <LogOut className="w-5 h-5 ms-3" />
                          <span className="font-semibold">{t('admin.navigation.logout')}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleLanguage}
                      className="group w-full justify-between text-base font-medium hover:scale-[1.02] transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 rounded-2xl px-6 py-4 shadow-lg hover:shadow-xl"
                    >
                      <span className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-sm"></div>
                          <Globe className="relative w-6 h-6 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-primary to-primary/80 rounded-full animate-pulse shadow-lg"></div>
                        </div>
                      </span>
                      <Badge 
                        variant="secondary" 
                        className="font-bold bg-gradient-to-r from-primary/15 to-primary/25 text-primary border-primary/40 hover:bg-primary/25 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        {i18n.language.toUpperCase()}
                      </Badge>
                    </Button>
                    <NotificationBell token={token || ''} />
                  </div>
                </>
              ) : (
                <>
                  <div></div>
                  <div className="flex items-center gap-3 order-2">
                    <NotificationBell token={token || ''} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleLanguage}
                      className="group w-full justify-between text-base font-medium hover:scale-[1.02] transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 rounded-2xl order-1 px-6 py-4 shadow-lg hover:shadow-xl"
                    >
                      <span className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-sm"></div>
                          <Globe className="relative w-6 h-6 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-primary to-primary/80 rounded-full animate-pulse shadow-lg"></div>
                        </div>
                      </span>
                      <Badge 
                        variant="secondary" 
                        className="font-bold bg-gradient-to-r from-primary/15 to-primary/25 text-primary border-primary/40 hover:bg-primary/25 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        {i18n.language.toUpperCase()}
                      </Badge>
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="group flex items-center gap-4 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 rounded-2xl transition-all duration-300 hover:scale-105 order-2 px-4 py-3 shadow-lg hover:shadow-xl">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-sm"></div>
                            <Avatar className="relative w-12 h-12 shadow-xl ring-6 ring-white/70 dark:ring-slate-800/70">
                              <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white font-bold text-xl">
                                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 shadow-lg">
                              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          <div className="hidden xl:block text-start">
                            <p className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-300">{user?.name}</p>
                          </div>
                          <ChevronDown className="w-5 h-5 hidden xl:block text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors duration-300" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-72 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border-slate-200/60 dark:border-slate-700/60 shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/30 rounded-2xl">
                        <DropdownMenuLabel className="px-6 py-4">
                          <div className="flex flex-col space-y-2">
                            <p className="text-base font-bold text-slate-900 dark:text-white">{user?.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                            <div className="flex items-center gap-2">
                            
                              <span className="text-xs text-primary font-semibold uppercase tracking-wide">{user?.role}</span>
                            </div>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
          
                        <DropdownMenuItem onClick={() => navigate('/')} className="hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-[1.02] mx-2 my-1 rounded-xl">
                          <Home className="w-5 h-5 me-3 text-slate-600 dark:text-slate-400" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{t('nav.home')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-gradient-to-r focus:from-red-50 focus:to-red-100 dark:focus:bg-red-900/20 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-[1.02] mx-2 my-1 rounded-xl">
                          <LogOut className="w-5 h-5 me-3" />
                          <span className="font-semibold">{t('admin.navigation.logout')}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Page Content */}
          <main className={`flex-1 p-1 sm:p-4 lg:p-6 xl:p-8 ${isRTL ? 'lg:pl-0 lg:pr-0' : ''}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
