import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
} from 'lucide-react';

interface StatCard {
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

interface AdminDashboardLazyStatsProps {
  stats: StatCard[];
  className?: string;
  threshold?: number;
  rootMargin?: string;
  animationDelay?: number;
}

const AdminDashboardLazyStats: React.FC<AdminDashboardLazyStatsProps> = ({
  stats,
  className,
  threshold = 0.1,
  rootMargin = '50px',
  animationDelay = 0.1,
}) => {
  const { i18n } = useTranslation();
  const [isInView, setIsInView] = useState<boolean>(false);
  const [visibleStats, setVisibleStats] = useState<boolean[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (isInView) {
      // Animate stats one by one
      stats.forEach((_, index) => {
        setTimeout(() => {
          setVisibleStats(prev => {
            const newVisible = [...prev];
            newVisible[index] = true;
            return newVisible;
          });
        }, index * animationDelay * 1000);
      });
    }
  }, [isInView, stats.length, animationDelay]);

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-slate-600" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-slate-600 bg-slate-50';
      case 'decrease':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCardGradient = (color: string) => {
    if (color.includes('blue')) return 'from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10';
    if (color.includes('green')) return 'from-gray-50 to-gray-100/50 dark:from-gray-900/20 dark:to-gray-800/10';
    if (color.includes('purple')) return 'from-zinc-50 to-zinc-100/50 dark:from-zinc-900/20 dark:to-zinc-800/10';
    if (color.includes('orange')) return 'from-neutral-50 to-neutral-100/50 dark:from-neutral-900/20 dark:to-neutral-800/10';
    return 'from-gray-50 to-gray-100/50 dark:from-gray-950/20 dark:to-gray-900/10';
  };

  const getCardColor = (color: string) => {
    if (color.includes('blue')) return 'slate';
    if (color.includes('green')) return 'gray';
    if (color.includes('purple')) return 'zinc';
    if (color.includes('orange')) return 'neutral';
    return 'gray';
  };

  const getTextColor = (color: string) => {
    if (color.includes('blue')) return 'text-slate-600 dark:text-slate-400';
    if (color.includes('green')) return 'text-gray-600 dark:text-gray-400';
    if (color.includes('purple')) return 'text-zinc-600 dark:text-zinc-400';
    if (color.includes('orange')) return 'text-neutral-600 dark:text-neutral-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (!isInView) {
    return (
      <div ref={containerRef} className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
        {stats.map((_, index) => (
          <Card key={index} className="p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      <AnimatePresence>
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: visibleStats[index] ? 1 : 0, 
              y: visibleStats[index] ? 0 : 20,
              scale: visibleStats[index] ? 1 : 0.95
            }}
            transition={{ 
              duration: 0.5, 
              delay: index * animationDelay,
              ease: "easeOut"
            }}
            className="group"
          >
<Card className={`relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30`}>
  <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
  <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
  <CardContent className="p-6">
    <div className={`flex items-center justify-between mb-3 ${i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
      {i18n.language === 'ar' ? (
        <>
          <div className="w-14 h-14 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <div className={cn('text-slate-600 group-hover:text-slate-700 transition-colors duration-300', stat.color)}>
              {stat.icon}
            </div>
          </div>
          <div className="flex-1" style={{ textAlign: 'right' }}>
            <p className={`text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2`} style={{ textAlign: 'right' }}>
              {stat.title}
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleStats[index] ? 1 : 0 }}
              transition={{ delay: index * animationDelay + 0.2 }}
              className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300"
              style={{ textAlign: 'right' }}
            >
              {stat.loading ? (
                <Skeleton className="h-8 w-16" style={{ marginLeft: 'auto', marginRight: '0' }} />
              ) : (
                stat.value.toLocaleString()
              )}
            </motion.div>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1" style={{ textAlign: 'left' }}>
            <p className={`text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2`} style={{ textAlign: 'left' }}>
              {stat.title}
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleStats[index] ? 1 : 0 }}
              transition={{ delay: index * animationDelay + 0.2 }}
              className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300"
              style={{ textAlign: 'left' }}
            >
              {stat.loading ? (
                <Skeleton className="h-8 w-16" style={{ marginLeft: '0', marginRight: 'auto' }} />
              ) : (
                stat.value.toLocaleString()
              )}
            </motion.div>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <div className={cn('text-slate-600 group-hover:text-slate-700 transition-colors duration-300', stat.color)}>
              {stat.icon}
            </div>
          </div>
        </>
      )}
    </div>
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: visibleStats[index] ? 1 : 0, x: visibleStats[index] ? 0 : -10 }}
      transition={{ delay: index * animationDelay + 0.4 }}
      className="flex items-center gap-2 justify-between w-full"
    >
      {i18n.language === 'ar' ? (
        <>
          <Badge
            variant="secondary"
            className={cn('text-xs bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105', getChangeColor(stat.changeType))}
          >
            {getChangeIcon(stat.changeType)}
            <span className="mr-1">
              {stat.change > 0 ? '+' : ''}{stat.change}%
            </span>
          </Badge>
          <span className={`text-sm text-slate-600/80 dark:text-slate-400/80 font-medium`} style={{ textAlign: 'right' }}>
            من الشهر الماضي
          </span>
        </>
      ) : (
        <>
          <span className={`text-sm text-slate-600/80 dark:text-slate-400/80 font-medium`} style={{ textAlign: 'left' }}>
            from last month
          </span>
          <Badge
            variant="secondary"
            className={cn('text-xs bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105', getChangeColor(stat.changeType))}
          >
            {getChangeIcon(stat.changeType)}
            <span className="ml-1">
              {stat.change > 0 ? '+' : ''}{stat.change}%
            </span>
          </Badge>
        </>
      )}
    </motion.div>
  </CardContent>
</Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboardLazyStats;
