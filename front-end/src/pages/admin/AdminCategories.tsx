import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { useAdmin } from '@/contexts/AdminContext';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Badge } from '@/components/ui/badge';

import { Skeleton } from '@/components/ui/skeleton';

import LazyImageContainer from '@/components/ui/LazyImageContainer';

import AdminLazyImage from '@/components/admin/AdminLazyImage';
import CategoryImageUpload from '@/components/admin/CategoryImageUpload';

import {

  Table,

  TableBody,

  TableCell,

  TableHead,

  TableHeader,

  TableRow,

} from '@/components/ui/table';

import {

  Dialog,

  DialogContent,

  DialogDescription,

  DialogFooter,

  DialogHeader,

  DialogTitle,

  DialogTrigger,

} from '@/components/ui/dialog';

import {

  AlertDialog,

  AlertDialogAction,

  AlertDialogCancel,

  AlertDialogContent,

  AlertDialogDescription,

  AlertDialogFooter,

  AlertDialogHeader,

  AlertDialogTitle,

} from '@/components/ui/alert-dialog';

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from '@/components/ui/select';

import { Label } from '@/components/ui/label';

import { Textarea } from '@/components/ui/textarea';

import { Switch } from '@/components/ui/switch';

import {

  Plus,

  Search,

  Filter,

  MoreHorizontal,

  Edit,

  Trash2,

  Eye,

  EyeOff,

  FolderOpen,

  Folder,

  BarChart3,

  RefreshCw,

  ChevronDown,

  ChevronRight,

  Package,

  List,

  FolderTree,

} from 'lucide-react';

import {

  DropdownMenu,

  DropdownMenuContent,

  DropdownMenuItem,

  DropdownMenuLabel,

  DropdownMenuSeparator,

  DropdownMenuTrigger,

} from '@/components/ui/dropdown-menu';

import {

  getAdminCategories,

  getCategoryTree,

  getCategoryStatistics,

  createCategory,

  updateCategory,

  deleteCategory,

  toggleCategoryStatus,

  updateCategorySortOrder,

} from '@/lib/api';

import { toast } from 'sonner';

import { useCategoryTranslation } from '@/lib/categoryTranslations';



interface Category {

  id: number;

  name: string;

  slug: string;

  description?: string;

  parent_id?: number;

  image?: string;

  is_active: boolean;

  sort_order: number;

  meta_title?: string;

  meta_description?: string;

  created_at: string;

  updated_at: string;

  parent?: Category;

  children?: Category[];

  products_count?: number;

}



interface CategoryFormData {

  name: string;

  description: string;

  parent_id?: number;

  image: string;

  is_active: boolean;

  sort_order: number;

  meta_title: string;

  meta_description: string;

}



const AdminCategories: React.FC = () => {

  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const { translateCategoryName } = useCategoryTranslation();

  const [categories, setCategories] = useState<Category[]>([]);

  const [categoryTree, setCategoryTree] = useState<Category[]>([]);

  const [statistics, setStatistics] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [parentFilter, setParentFilter] = useState<string>('all');

  const [sortBy, setSortBy] = useState<string>('created_at');

  const [sortDirection, setSortDirection] = useState<string>('desc');

  const [currentPage, setCurrentPage] = useState(1);

  const [perPage, setPerPage] = useState(10);

  const [totalPages, setTotalPages] = useState(1);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const [viewMode, setViewMode] = useState<'table' | 'tree'>('tree');



  const [formData, setFormData] = useState<CategoryFormData>({

    name: '',

    description: '',

    parent_id: undefined,

    image: '',

    is_active: true,

    sort_order: 0,

    meta_title: '',

    meta_description: '',

  });



  // Helper function to build tree structure from flat list

  const buildCategoryTree = (categories: Category[]): Category[] => {

    const categoryMap = new Map<number, Category>();

    const rootCategories: Category[] = [];



    console.log('Building tree from categories:', categories.map(c => ({ id: c.id, name: c.name, parent_id: c.parent_id, is_active: c.is_active })));



    // First pass: create map of all categories

    categories.forEach(category => {

      categoryMap.set(category.id, { ...category, children: [] });

    });



    // Second pass: build tree structure

    categories.forEach(category => {

      const categoryWithChildren = categoryMap.get(category.id)!;

      

      if (category.parent_id && categoryMap.has(category.parent_id)) {

        // Add to parent's children

        const parent = categoryMap.get(category.parent_id)!;

        if (!parent.children) parent.children = [];

        parent.children.push(categoryWithChildren);

        console.log(`Added ${category.name} (${category.id}) to parent ${parent.name} (${parent.id})`);

      } else {

        // Root category

        rootCategories.push(categoryWithChildren);

        console.log(`Added root category: ${category.name} (${category.id})`);

      }

    });



    console.log('Final tree structure:', rootCategories.map(c => ({ 

      id: c.id, 

      name: c.name, 

      children_count: c.children?.length || 0,

      children: c.children?.map(child => ({ id: child.id, name: child.name })) || []

    })));



    return rootCategories;

  };



  // Helper functions for filtering tree data

  const filterTreeByStatus = (categories: Category[], isActive: boolean): Category[] => {

    return categories.map(category => {

      const filteredChildren = category.children ? filterTreeByStatus(category.children, isActive) : [];

      const matchesStatus = category.is_active === isActive;

      const hasMatchingChildren = filteredChildren.length > 0;

      

      // Include category if it matches status OR has matching children

      if (matchesStatus || hasMatchingChildren) {

        return {

          ...category,

          children: filteredChildren

        };

      }

      return null;

    }).filter(Boolean) as Category[];

  };



  const filterTreeBySearch = (categories: Category[], searchTerm: string): Category[] => {

    return categories.map(category => {

      const filteredChildren = category.children ? filterTreeBySearch(category.children, searchTerm) : [];

      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||

                           (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const hasMatchingChildren = filteredChildren.length > 0;

      

      // Include category if it matches search OR has matching children

      if (matchesSearch || hasMatchingChildren) {

        return {

          ...category,

          children: filteredChildren

        };

      }

      return null;

    }).filter(Boolean) as Category[];

  };



  const loadCategories = async () => {

    if (!token) return;



    try {

      const params = {

        search: searchTerm || undefined,

        is_active: statusFilter === 'all' ? undefined : statusFilter === 'active' ? true : false,

        parent_id: parentFilter === 'all' ? undefined : parseInt(parentFilter),

        sort_by: sortBy,

        sort_direction: sortDirection,

        per_page: perPage,

        page: currentPage,

      };

      

      console.log('Loading categories with params:', params);

      

      const response = await getAdminCategories(token, params);

      

      console.log('Categories response:', response);



      if (response.success) {

        setCategories(response.data.data);

        setTotalPages(response.data.last_page);

        console.log('Categories loaded:', response.data.data);

      }

    } catch (error) {

      console.error('Failed to load categories:', error);

      toast.error(t('admin.categories.loadError'));

    }

  };



  const loadCategoryTree = async () => {

    if (!token) return;



    try {

      // Use the same API as table view to get all categories with filters

      const params = {

        search: searchTerm || undefined,

        is_active: statusFilter === 'all' ? undefined : statusFilter === 'active' ? true : false,

        parent_id: parentFilter === 'all' ? undefined : parseInt(parentFilter),

        sort_by: sortBy,

        sort_direction: sortDirection,

        per_page: 1000, // Get all categories for tree view

        page: 1,

      };

      

      console.log('Loading tree data with params:', params);

      

      const response = await getAdminCategories(token, params);

      

      if (response.success) {

        console.log('Tree data from table API:', response.data.data);

        

        // Convert flat list to tree structure

        const treeData = buildCategoryTree(response.data.data);

        console.log('Built tree structure:', treeData);

        

        setCategoryTree(treeData);

      }

    } catch (error) {

      console.error('Failed to load category tree:', error);

      toast.error(t('admin.categories.loadError'));

    }

  };



  const loadStatistics = async () => {

    if (!token) return;



    try {

      const response = await getCategoryStatistics(token);

      if (response.success) {

        setStatistics(response.data);

      }

    } catch (error) {

      console.error('Failed to load statistics:', error);

      toast.error(t('admin.categories.loadError'));

    }

  };



  const loadData = async () => {

    setIsLoading(true);

    await Promise.all([

      loadCategories(),

      loadCategoryTree(),

      loadStatistics(),

    ]);

    setIsLoading(false);

  };



  const handleRefresh = () => {

    setIsRefreshing(true);

    loadData().finally(() => setIsRefreshing(false));

  };



  useEffect(() => {

    loadData();

  }, [token, searchTerm, statusFilter, parentFilter, sortBy, sortDirection, currentPage, perPage]);

  // Auto-expand all parent categories in tree view
  useEffect(() => {
    if (categoryTree.length > 0 && viewMode === 'tree') {
      const parentIds = new Set<number>();
      categoryTree.forEach(category => {
        if (category.children && category.children.length > 0) {
          parentIds.add(category.id);
        }
      });
      setExpandedCategories(parentIds);
    }
  }, [categoryTree, viewMode]);



  const handleCreateCategory = async () => {

    if (!token) return;



    try {

      const response = await createCategory(token, formData);

      if (response.success) {

        toast.success(t('admin.categories.categoryCreated'));

        setIsCreateDialogOpen(false);

        resetForm();

        loadData();

      } else {

        toast.error(response.message || t('admin.categories.createError'));

      }

    } catch (error) {

      console.error('Failed to create category:', error);

      toast.error(t('admin.categories.createError'));

    }

  };



  const handleUpdateCategory = async () => {

    if (!token || !editingCategory) return;



    try {

      const response = await updateCategory(token, editingCategory.id, formData);

      if (response.success) {

        toast.success(t('admin.categories.categoryUpdated'));

        setIsEditDialogOpen(false);

        setEditingCategory(null);

        resetForm();

        loadData();

      } else {

        toast.error(response.message || t('admin.categories.updateError'));

      }

    } catch (error) {

      console.error('Failed to update category:', error);

      toast.error(t('admin.categories.updateError'));

    }

  };



  const handleDeleteCategory = async () => {

    if (!token || !deleteCategoryId) return;



    setIsDeleting(true);

    try {

      const response = await deleteCategory(token, deleteCategoryId);

      if (response.success) {

        toast.success(t('admin.categories.categoryDeleted'));

        setDeleteCategoryId(null);

        loadData();

      } else {

        toast.error(response.message || t('admin.categories.deleteError'));

      }

    } catch (error) {

      console.error('Failed to delete category:', error);

      toast.error(t('admin.categories.deleteError'));

    } finally {

      setIsDeleting(false);

    }

  };



  const handleToggleStatus = async (categoryId: number) => {

    if (!token) return;



    try {

      const response = await toggleCategoryStatus(token, categoryId);

      if (response.success) {

        toast.success(t('admin.categories.categoryStatusUpdated'));

        loadData();

      } else {

        toast.error(response.message || t('admin.categories.statusUpdateError'));

      }

    } catch (error) {

      console.error('Failed to toggle category status:', error);

      toast.error(t('admin.categories.statusUpdateError'));

    }

  };



  const resetForm = () => {

    setFormData({

      name: '',

      description: '',

      parent_id: undefined,

      image: '',

      is_active: true,

      sort_order: 0,

      meta_title: '',

      meta_description: '',

    });

  };



  const openEditDialog = (category: Category) => {

    setEditingCategory(category);

    setFormData({

      name: category.name,

      description: category.description || '',

      parent_id: category.parent_id || undefined,

      image: category.image || '',

      is_active: category.is_active,

      sort_order: category.sort_order,

      meta_title: category.meta_title || '',

      meta_description: category.meta_description || '',

    });

    setIsEditDialogOpen(true);

  };



  const toggleExpanded = (categoryId: number) => {

    const newExpanded = new Set(expandedCategories);

    if (newExpanded.has(categoryId)) {

      newExpanded.delete(categoryId);

    } else {

      newExpanded.add(categoryId);

    }

    setExpandedCategories(newExpanded);

  };



  const renderCategoryTree = (categories: Category[], level = 0) => {
    const isParent = level === 0;
    
    return categories.map((category, index) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.has(category.id);
      
      return (
        <div key={category.id} className="space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 + level * 0.1, duration: 0.4 }}
            className={`group relative flex items-center p-4 rounded-2xl transition-all duration-300 hover:shadow-xl border-2 ${
              isParent
                ? 'bg-gradient-to-br from-primary/5 via-primary/3 to-background border-primary/20 hover:border-primary/40'
                : 'bg-gradient-to-br from-muted/50 to-background border-border/50 hover:border-primary/30'
            }`}
            style={{ marginLeft: level > 0 ? `${level * 2}rem` : '0' }}
          >
            {/* Expand/Collapse Button or Indicator */}
            <div className="flex-shrink-0 mr-3">
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-9 h-9 p-0 hover:bg-primary/10 hover:scale-110 transition-all duration-300 rounded-xl"
                  onClick={() => toggleExpanded(category.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-primary" />
                  )}
                </Button>
              ) : (
                <div className="w-9 h-9 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary/40" />
                </div>
              )}
            </div>

            {/* Category Icon */}
            <div className={`flex-shrink-0 mr-4 p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 ${
              isParent
                ? 'bg-gradient-to-br from-primary/20 to-primary/10'
                : 'bg-gradient-to-br from-muted to-muted/50'
            }`}>
              {isParent ? (
                <FolderTree className="w-6 h-6 text-primary" />
              ) : (
                <Folder className="w-5 h-5 text-primary/70" />
              )}
            </div>

            {/* Category Info */}
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <h3 className={`font-bold text-foreground group-hover:text-primary transition-colors truncate ${
                  isParent ? 'text-base' : 'text-sm'
                }`}>
                  {translateCategoryName(category.name)}
                </h3>
                
                {/* Parent/Child Badge */}
                {isParent ? (
                  <Badge className="bg-primary/90 text-white text-[10px] px-2 py-0.5 font-bold">
                    {i18n.language === 'ar' ? 'أب' : 'Parent'}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-primary/5 border-primary/30 text-primary text-[10px] px-2 py-0.5 font-bold">
                    {i18n.language === 'ar' ? 'فرعي' : 'Child'}
                  </Badge>
                )}
                
                {/* Children Count Badge */}
                {hasChildren && (
                  <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 text-[10px] px-2 py-0.5 font-bold">
                    {category.children.length} {i18n.language === 'ar' ? 'فرعي' : 'sub'}
                  </Badge>
                )}
              </div>
              
              {category.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                  {category.description}
                </p>
              )}
              
              {/* Status and Products */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  variant={category.is_active ? 'default' : 'secondary'} 
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-lg ${
                    category.is_active 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}
                >
                  {category.is_active ? t('admin.common.active') : t('admin.common.inactive')}
                </Badge>

                {category.products_count !== undefined && category.products_count > 0 && (
                  <Badge variant="outline" className="text-[10px] font-semibold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border-blue-200">
                    {category.products_count} {t('admin.categories.products')}
                  </Badge>
                )}
                
                {category.sort_order !== undefined && (
                  <Badge variant="outline" className="text-[10px] font-semibold px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-700 border-amber-200">
                    {i18n.language === 'ar' ? 'ترتيب' : 'Order'}: {category.sort_order}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions Menu */}
            <div className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hover:bg-primary/10 hover:scale-110 transition-all duration-300 p-2 rounded-xl"
                  >
                    <MoreHorizontal className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-200/60 dark:border-slate-700/60 shadow-2xl rounded-2xl">
                  <DropdownMenuLabel className={`px-4 py-3 text-sm font-semibold ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('admin.common.actions')}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem 
                    onClick={() => openEditDialog(category)}
                    className="hover:bg-primary/10 transition-all duration-300 mx-2 my-1 rounded-xl"
                  >
                    <Edit className={`w-4 h-4 ${i18n.language === 'ar' ? 'ms-2' : 'mr-2'}`} />
                    <span className="font-semibold">{t('admin.common.edit')}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    onClick={() => handleToggleStatus(category.id)}
                    className="hover:bg-primary/10 transition-all duration-300 mx-2 my-1 rounded-xl"
                  >
                    {category.is_active ? (
                      <EyeOff className={`w-4 h-4 ${i18n.language === 'ar' ? 'ms-2' : 'mr-2'}`} />
                    ) : (
                      <Eye className={`w-4 h-4 ${i18n.language === 'ar' ? 'ms-2' : 'mr-2'}`} />
                    )}
                    <span className="font-semibold">
                      {category.is_active ? t('admin.common.deactivate') : t('admin.common.activate')}
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setDeleteCategoryId(category.id)}
                    className="text-red-600 hover:text-red-600 hover:bg-red-50 transition-all duration-300 mx-2 my-1 rounded-xl"
                  >
                    <Trash2 className={`w-4 h-4 ${i18n.language === 'ar' ? 'ms-2' : 'mr-2'}`} />
                    <span className="font-semibold">{t('admin.common.delete')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>

          {/* Render Children */}
          {hasChildren && isExpanded && (
            <AnimatePresence>
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {renderCategoryTree(category.children, level + 1)}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      );
    });
  };




  if (isLoading) {

    return (

      <div className="space-y-6 p-1 ">

        <div className="flex items-center justify-between">

          <Skeleton className="h-8 w-48" />

          <Skeleton className="h-10 w-24" />

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (

            <Card key={i}>

              <CardHeader className="pb-2 p-1">

                <Skeleton className="h-4 w-24" />

              </CardHeader>

              <CardContent>

                <Skeleton className="h-8 w-16" />

              </CardContent>

            </Card>

          ))}

        </div>

        <Card>

          <CardHeader className="p-1">

            <Skeleton className="h-6 w-32" />

          </CardHeader>

          <CardContent>

            <div className="space-y-2">

              {Array.from({ length: 5 }).map((_, i) => (

                <Skeleton key={i} className="h-12 w-full" />

              ))}

            </div>

          </CardContent>

        </Card>

      </div>

    );

  }



  return (

    <div className="space-y-6 p-1">

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6"
      >
        {i18n.language === 'ar' ? (
          <>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-right order-1 sm:order-2"
            >
              <h1 className="text-3xl pb-2 sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {t('admin.categories.title')}
              </h1>
         
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto order-2 sm:order-1"
            >
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={resetForm}
                    className="group hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 transition-all duration-300 hover:scale-105 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl"
                  >
                    <Plus className={`w-5 h-5 ms-3 transition-transform duration-300 group-hover:scale-110`} />
                    <span className="font-semibold">{t('admin.categories.addCategory')}</span>
                  </Button>
                </DialogTrigger>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className={`w-5 h-5 ms-3 transition-transform duration-300 group-hover:rotate-180 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="font-semibold">{t('admin.common.refresh')}</span>
              </Button>
            <DialogContent 
              className="max-w-2xl max-h-[90vh] overflow-y-auto mx-auto my-4 w-[95vw] sm:w-full relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-2xl"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 50,
                maxHeight: '90vh',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #f1f5f9'
              }}
              onScroll={(e) => {
                e.currentTarget.style.scrollBehavior = 'smooth';
              }}
            >
              <DialogHeader className="space-y-3">
                <DialogTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
                  {t('admin.categories.addCategory')}
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                </DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400">
                      {t('admin.categories.addCategoryDescription')}
                    </DialogDescription>
                  </DialogHeader>

              <div className="space-y-6">
                {/* Basic Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
                    <CardHeader className="relative pb-3">
                      <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
                        {i18n.language === 'ar' ? (
                          <>
                            {t('admin.categories.basicInformation')}
                            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                              <FolderOpen className="w-5 h-5 text-primary" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                              <FolderOpen className="w-5 h-5 text-primary" />
                            </div>
                            {t('admin.categories.basicInformation')}
                          </>
                        )}
                      </CardTitle>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {t('admin.categories.basicInformationDescription')}
                      </p>
                    </CardHeader>
                    <CardContent className="relative space-y-4 pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.categoryName')} *</Label>
                          <div className="relative group">
                            <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-hover:text-primary transition-colors duration-300" />
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={t('admin.categories.categoryNamePlaceholder')}
                              className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="parent_id" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.parentCategory')}</Label>
                        <Select
                          value={formData.parent_id?.toString() || 'none'}
                          onValueChange={(value) => setFormData({ ...formData, parent_id: value === 'none' ? undefined : parseInt(value) })}
                        >
                            <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                            <SelectValue placeholder={t('admin.categories.selectParentCategory')} />
                          </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                              <SelectItem value="none" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.noParent')}</SelectItem>
                            {categoryTree.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()} className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                {translateCategoryName(category.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.categoryDescription')}</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder={t('admin.categories.categoryDescriptionPlaceholder')}
                        rows={3}
                          className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      />
                    </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Additional Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                    <CardHeader className="relative pb-3">
                      <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
                        {i18n.language === 'ar' ? (
                          <>
                            {t('admin.categories.additionalInformation')}
                            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            {t('admin.categories.additionalInformation')}
                          </>
                        )}
                      </CardTitle>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {t('admin.categories.additionalInformationDescription')}
                      </p>
                    </CardHeader>
                    <CardContent className="relative space-y-4 pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="image" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.categoryImage')}</Label>
                          <CategoryImageUpload
                            token={token}
                            image={formData.image}
                            onImageChange={(imageUrl) => setFormData({ ...formData, image: imageUrl })}
                            className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sort_order" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.sortOrder')}</Label>
                          <div className="relative group">
                            <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-hover:text-primary transition-colors duration-300" />
                        <Input
                          id="sort_order"
                          type="number"
                          value={formData.sort_order}
                          onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                              className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                          </div>
                      </div>
                    </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="meta_title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.metaTitle')}</Label>
                        <Input
                          id="meta_title"
                          value={formData.meta_title}
                          onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                          placeholder={t('admin.categories.metaTitlePlaceholder')}
                            className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>

                        <div className="space-y-2">
                          <Label htmlFor="meta_description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.metaDescription')}</Label>
                        <Input
                          id="meta_description"
                          value={formData.meta_description}
                          onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                          placeholder={t('admin.categories.metaDescriptionPlaceholder')}
                            className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>

                      <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                          className="scale-110"
                        />
                        <div className="flex-1">
                          <Label htmlFor="is_active" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                            {t('admin.categories.isActive')}
                          </Label>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {t('admin.categories.statusHelp')}
                          </p>
                    </div>
                  </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <DialogFooter className="space-x-3 pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2"
                >
                      {t('admin.common.cancel')}
                    </Button>
                <Button 
                  onClick={handleCreateCategory}
                  className="hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2 shadow-lg hover:shadow-xl"
                >
                      {t('admin.categories.addCategory')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-left"
            >
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
            {t('admin.categories.title')}
          </h1>

            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto"
            >
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl"
          >
            <RefreshCw className={`w-5 h-5 me-3 transition-transform duration-300 group-hover:rotate-180 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="font-semibold">{t('admin.common.refresh')}</span>
          </Button>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>

            <DialogTrigger asChild>

              <Button 
                onClick={resetForm}
                className="group hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 transition-all duration-300 hover:scale-105 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl"
              >
                <Plus className={`w-5 h-5 me-3 transition-transform duration-300 group-hover:scale-110`} />
                <span className="font-semibold">{t('admin.categories.addCategory')}</span>
              </Button>

            </DialogTrigger>

            <DialogContent 
              className="max-w-2xl max-h-[90vh] overflow-y-auto mx-auto my-4 w-[95vw] sm:w-full relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-2xl"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 50,
                maxHeight: '90vh',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #f1f5f9'
              }}
              onScroll={(e) => {
                e.currentTarget.style.scrollBehavior = 'smooth';
              }}
            >
              <DialogHeader className="space-y-3">
                <DialogTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
                  {i18n.language === 'ar' ? (
                    <>
                      {t('admin.categories.addCategory')}
                      <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                        <Plus className="w-5 h-5 text-primary" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                        <Plus className="w-5 h-5 text-primary" />
                      </div>
                      {t('admin.categories.addCategory')}
                    </>
                  )}
                </DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400">
                  {t('admin.categories.addCategoryDescription')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
                    <CardHeader className="relative pb-3">
                      <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
                        {i18n.language === 'ar' ? (
                          <>
                            {t('admin.categories.basicInformation')}
                            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                              <FolderOpen className="w-5 h-5 text-primary" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                              <FolderOpen className="w-5 h-5 text-primary" />
                            </div>
                            {t('admin.categories.basicInformation')}
                          </>
                        )}
                      </CardTitle>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {t('admin.categories.basicInformationDescription')}
                      </p>
                    </CardHeader>
                    <CardContent className="relative space-y-4 pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.categoryName')} *</Label>
                          <div className="relative group">
                            <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-hover:text-primary transition-colors duration-300" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('admin.categories.categoryNamePlaceholder')}
                              className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                          </div>
                  </div>

                        <div className="space-y-2">
                          <Label htmlFor="parent_id" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.parentCategory')}</Label>
                    <Select
                      value={formData.parent_id?.toString() || 'none'}
                      onValueChange={(value) => setFormData({ ...formData, parent_id: value === 'none' ? undefined : parseInt(value) })}
                    >
                            <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        <SelectValue placeholder={t('admin.categories.selectParentCategory')} />
                      </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                              <SelectItem value="none" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.noParent')}</SelectItem>
                        {categoryTree.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()} className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                            {translateCategoryName(category.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.categoryDescription')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('admin.categories.categoryDescriptionPlaceholder')}
                    rows={3}
                          className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Additional Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                    <CardHeader className="relative pb-3">
                      <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
                        {i18n.language === 'ar' ? (
                          <>
                            {t('admin.categories.additionalInformation')}
                            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            {t('admin.categories.additionalInformation')}
                          </>
                        )}
                      </CardTitle>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {t('admin.categories.additionalInformationDescription')}
                      </p>
                    </CardHeader>
                    <CardContent className="relative space-y-4 pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="image" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.categoryImage')}</Label>
                          <div className="relative group">
                            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-hover:text-primary transition-colors duration-300" />
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder={t('admin.categories.categoryImagePlaceholder')}
                              className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                          </div>
                  </div>

                        <div className="space-y-2">
                          <Label htmlFor="sort_order" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.sortOrder')}</Label>
                          <div className="relative group">
                            <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-hover:text-primary transition-colors duration-300" />
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                              className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                        </div>
                </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="meta_title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.metaTitle')}</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder={t('admin.categories.metaTitlePlaceholder')}
                            className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                        <div className="space-y-2">
                          <Label htmlFor="meta_description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.metaDescription')}</Label>
                    <Input
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder={t('admin.categories.metaDescriptionPlaceholder')}
                            className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                      <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                          className="scale-110"
                        />
                        <div className="flex-1">
                          <Label htmlFor="is_active" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                            {t('admin.categories.isActive')}
                          </Label>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {t('admin.categories.statusHelp')}
                          </p>
                </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <DialogFooter className="space-x-3 pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2"
                >
                  {t('admin.common.cancel')}
                </Button>
                <Button 
                  onClick={handleCreateCategory}
                  className="hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2 shadow-lg hover:shadow-xl"
                >
                  {t('admin.categories.addCategory')}
                </Button>
              </DialogFooter>

            </DialogContent>

          </Dialog>

        </motion.div>
          </>
        )}
      </motion.div>



      {/* Statistics */}
      {statistics && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-1">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
              {i18n.language === 'ar' ? (
                <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-slate-600 group-hover:text-slate-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                {t('admin.categories.totalCategories')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.total_categories}
                        </div>
                      </div>
                </>
              ) : (
                <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.categories.totalCategories')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.total_categories}
                        </div>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-slate-600 group-hover:text-slate-700 transition-colors duration-300" />
                      </div>
                </>
              )}
                </div>
                <p className={`text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
                {statistics.active_categories} {t('admin.common.active')}
              </p>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-1">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
              {i18n.language === 'ar' ? (
                <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                {t('admin.categories.activeCategories')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.active_categories}
                        </div>
                      </div>
                </>
              ) : (
                <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.categories.activeCategories')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.active_categories}
                        </div>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                      </div>
                </>
              )}
                </div>
                <p className={`text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
                {statistics.inactive_categories} {t('admin.common.inactive')}
              </p>
            </CardContent>
          </Card>
          </motion.div>



          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-amber-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-1">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
              {i18n.language === 'ar' ? (
                <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-amber-600 group-hover:text-amber-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                {t('admin.categories.rootCategories')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.root_categories}
                        </div>
                      </div>
                </>
              ) : (
                <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.categories.rootCategories')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.root_categories}
                        </div>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-amber-600 group-hover:text-amber-700 transition-colors duration-300" />
                      </div>
                </>
              )}
                </div>
                <p className={`text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
                {statistics.subcategories} {t('admin.categories.subcategories')}
              </p>
            </CardContent>
          </Card>
          </motion.div>



          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-1">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
              {i18n.language === 'ar' ? (
                <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                  {t('admin.categories.categoriesWithProducts')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.categories_with_products}
                        </div>
                      </div>
                </>
              ) : (
                <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                  {t('admin.categories.categoriesWithProducts')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.categories_with_products}
                        </div>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                      </div>
                </>
              )}
                </div>
                <p className={`text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
                {statistics.empty_categories} {t('admin.categories.emptyCategories')}
              </p>
            </CardContent>
          </Card>
          </motion.div>
        </motion.div>
      )}



      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
          <CardHeader className="relative">

          {i18n.language === 'ar' ? (
            <div className="flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={`group transition-all duration-300 hover:scale-105 rounded-2xl px-4 py-2 shadow-md hover:shadow-lg ${
                    viewMode === 'table' 
                      ? 'hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/10 dark:hover:from-primary/30 dark:hover:to-primary/20' 
                      : 'hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 ms-2 transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-semibold">{t('admin.categories.tableView')}</span>
                </Button>
                <Button
                  variant={viewMode === 'tree' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('tree')}
                  className={`group transition-all duration-300 hover:scale-105 rounded-2xl px-4 py-2 shadow-md hover:shadow-lg ${
                    viewMode === 'tree' 
                      ? 'hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/10 dark:hover:from-primary/30 dark:hover:to-primary/20' 
                      : 'hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700'
                  }`}
                >
                  <FolderOpen className="w-4 h-4 ms-2 transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-semibold">{t('admin.categories.treeView')}</span>
                </Button>
              </div>
              <CardTitle className="flex items-center text-sm sm:text-base">
              {t('admin.common.filters')}

                <Filter className="w-4 h-4 sm:w-5 sm:h-5 ms-1 sm:ms-2" />
            </CardTitle>

            </div>
          ) : (
            <div className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="flex items-center text-sm sm:text-base">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                {t('admin.common.filters')}
              </CardTitle>
              <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className={`group transition-all duration-300 hover:scale-105 rounded-2xl px-4 py-2 shadow-md hover:shadow-lg ${
                  viewMode === 'table' 
                    ? 'hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/10 dark:hover:from-primary/30 dark:hover:to-primary/20' 
                    : 'hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700'
                }`}
              >
                <BarChart3 className="w-4 h-4 me-2 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-semibold">{t('admin.categories.tableView')}</span>
              </Button>
              <Button
                variant={viewMode === 'tree' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tree')}
                className={`group transition-all duration-300 hover:scale-105 rounded-2xl px-4 py-2 shadow-md hover:shadow-lg ${
                  viewMode === 'tree' 
                    ? 'hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/10 dark:hover:from-primary/30 dark:hover:to-primary/20' 
                    : 'hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700'
                }`}
              >
                <FolderOpen className="w-4 h-4 me-2 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-semibold">{t('admin.categories.treeView')}</span>
              </Button>

            </div>

          </div>

          )}
        </CardHeader>

          <CardContent className="relative">
            {/* Mobile Layout */}
            <div className="block sm:hidden space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-mobile" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('admin.common.search')}
                </Label>
                <div className="relative group">
                  <Search className={`absolute top-3 h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors duration-300 ${i18n.language === 'ar' ? 'left-3' : 'right-3'}`} />
                  <Input
                    id="search-mobile"
                    placeholder={t('admin.categories.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${i18n.language === 'ar' ? 'pl-10' : 'pr-10'}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-mobile" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('admin.common.status')}
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                    <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.allStatuses')}</SelectItem>
                    <SelectItem value="active" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.common.active')}</SelectItem>
                    <SelectItem value="inactive" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.common.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="parent-mobile" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('admin.categories.parentCategory')}
                  </Label>
                  <Select value={parentFilter} onValueChange={setParentFilter}>
                    <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.allParents')}</SelectItem>
                      <SelectItem value="root" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.rootOnly')}</SelectItem>
                      {categoryTree.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()} className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                          {translateCategoryName(category.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort-mobile" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('admin.common.sort')}
                  </Label>
                  <Select value={`${sortBy}-${sortDirection}`} onValueChange={(value) => {
                    const [field, direction] = value.split('-');
                    setSortBy(field);
                    setSortDirection(direction);
                  }}>
                    <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="created_at-desc" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.newestFirst')}</SelectItem>
                      <SelectItem value="created_at-asc" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.oldestFirst')}</SelectItem>
                      <SelectItem value="name-asc" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.nameAZ')}</SelectItem>
                      <SelectItem value="name-desc" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.nameZA')}</SelectItem>
                      <SelectItem value="sort_order-asc" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.sortOrderAsc')}</SelectItem>
                      <SelectItem value="sort_order-desc" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.sortOrderDesc')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('admin.common.search')}
                </Label>
                <div className="relative group">
                  <Search className={`absolute top-3 h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors duration-300 ${i18n.language === 'ar' ? 'left-3' : 'right-3'}`} />
                  <Input
                    id="search"
                    placeholder={t('admin.categories.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${i18n.language === 'ar' ? 'pl-10' : 'pr-10'}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('admin.common.status')}
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                    <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.allStatuses')}</SelectItem>
                    <SelectItem value="active" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.common.active')}</SelectItem>
                    <SelectItem value="inactive" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.common.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('admin.categories.parentCategory')}
                </Label>
                <Select value={parentFilter} onValueChange={setParentFilter}>
                  <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                    <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.allParents')}</SelectItem>
                    <SelectItem value="root" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.rootOnly')}</SelectItem>
                    {categoryTree.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()} className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                        {translateCategoryName(category.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('admin.common.sort')}
                </Label>
                <Select value={`${sortBy}-${sortDirection}`} onValueChange={(value) => {
                  const [field, direction] = value.split('-');
                  setSortBy(field);
                  setSortDirection(direction);
                }}>
                  <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                    <SelectItem value="created_at-desc" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.newestFirst')}</SelectItem>
                    <SelectItem value="created_at-asc" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.oldestFirst')}</SelectItem>
                    <SelectItem value="name-asc" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.nameAZ')}</SelectItem>
                    <SelectItem value="name-desc" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.nameZA')}</SelectItem>
                    <SelectItem value="sort_order-asc" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.sortOrderAsc')}</SelectItem>
                    <SelectItem value="sort_order-desc" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.sortOrderDesc')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </CardContent>
        </Card>
      </motion.div>

      {/* Categories List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>

          <CardHeader className="relative">
            <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
              {viewMode === 'table' ? (
                i18n.language === 'ar' ? (
                  <>
                    {t('admin.categories.categoriesList')}
                    <List className="w-5 h-5 text-primary" />
                  </>
                ) : (
                  <>
                    <List className="w-5 h-5 text-primary" />
                    {t('admin.categories.categoriesList')}
                  </>
                )
              ) : (
                i18n.language === 'ar' ? (
                  <>
                    {t('admin.categories.categoryTree')}
                    <FolderTree className="w-5 h-5 text-primary" />
                  </>
                ) : (
                  <>
                    <FolderTree className="w-5 h-5 text-primary" />
                    {t('admin.categories.categoryTree')}
                  </>
                )
              )}
          </CardTitle>
        </CardHeader>

          <CardContent className="relative p-1">
          {viewMode === 'table' ? (
                <div className="rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-x-auto lg:overflow-x-visible w-full max-w-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm" style={{ maxWidth: '90vw' }}>
                <Table className="w-full min-w-[600px] sm:min-w-[700px] lg:min-w-[810px] table-fixed lg:w-full lg:table-auto">

                  <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50">
                    <TableRow className="hover:bg-transparent">

                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[180px] lg:w-auto">{t('admin.categories.categoryName')}</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[140px] lg:w-auto">{t('admin.categories.parentCategory')}</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[90px] lg:w-auto">{t('admin.common.status')}</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[90px] lg:w-auto">{t('admin.categories.products')}</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[110px] lg:w-auto">{t('admin.categories.sortOrder')}</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[110px] lg:w-auto">{t('admin.common.createdAt')}</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[90px] lg:w-auto">{t('admin.common.actions')}</TableHead>
                  </TableRow>

                </TableHeader>

                <TableBody>

                  {categories.map((category, index) => (

                    <TableRow 
                      key={category.id} 
                        className={`group hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50 transition-all duration-300 ${
                          index % 2 === 0 ? 'bg-white/30 dark:bg-slate-800/30' : 'bg-slate-50/30 dark:bg-slate-700/30'
                        }`}
                    >

                      <TableCell className="text-xs sm:text-sm p-1 sm:p-2 text-center w-[180px] lg:w-auto">
                        <div className="flex items-center justify-center w-full">
                          <span className="font-semibold truncate max-w-[80px] sm:max-w-none text-xs sm:text-sm">{translateCategoryName(category.name)}</span>
                        </div>

                      </TableCell>

                      <TableCell className="text-xs sm:text-sm p-1 sm:p-2 text-center w-[140px] lg:w-auto">
                        <div className="w-full text-center">
                          <span className="text-muted-foreground truncate max-w-[60px] sm:max-w-none text-xs">
                            {category.parent?.name ? translateCategoryName(category.parent.name) : '-'}
                          </span>
                        </div>

                      </TableCell>

                      <TableCell className="text-xs sm:text-sm p-1 sm:p-2 text-center w-[90px] lg:w-auto">
                        <Badge 

                          variant={category.is_active ? 'default' : 'secondary'}

                          className={`text-xs whitespace-nowrap px-1 py-0.5 ${category.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                        >

                          {category.is_active ? t('admin.common.active') : t('admin.common.inactive')}

                        </Badge>

                      </TableCell>

                      <TableCell className="text-xs sm:text-sm p-1 sm:p-2 text-center w-[90px] lg:w-auto">
                        <span className="font-medium text-xs">{category.products_count || 0}</span>
                      </TableCell>

                      <TableCell className="text-xs sm:text-sm p-1 sm:p-2 text-center w-[110px] lg:w-auto">
                        <span className="font-medium text-xs">{category.sort_order}</span>
                      </TableCell>

                      <TableCell className="text-xs sm:text-sm p-1 sm:p-2 text-center w-[110px] lg:w-auto">
                        <span className="text-xs text-muted-foreground">
                          {new Date(category.created_at).toLocaleDateString()}

                        </span>

                      </TableCell>

                      <TableCell className="text-xs sm:text-sm p-1 sm:p-2 text-center w-[90px] lg:w-auto">
                        <DropdownMenu>

                          <DropdownMenuTrigger asChild>

                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 p-1 h-6 w-6 rounded-xl"
                            >
                              <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-90 transition-transform duration-300" />
                            </Button>

                          </DropdownMenuTrigger>

                        <DropdownMenuContent align={i18n.language === 'ar' ? 'start' : 'end'} className="w-56 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border-slate-200/60 dark:border-slate-700/60 shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/30 rounded-2xl">
                          <DropdownMenuLabel className={`px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                            {t('admin.common.actions')}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />

                          <DropdownMenuItem 
                            onClick={() => openEditDialog(category)}
                            className="hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:scale-[1.02] mx-2 my-1 rounded-xl"
                          >
                            <Edit className={`w-4 h-4 ${i18n.language === 'ar' ? 'ms-2' : 'mr-2'} transition-transform duration-300 group-hover:scale-110`} />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{t('admin.common.edit')}</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(category.id)}
                            className="hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:scale-[1.02] mx-2 my-1 rounded-xl"
                          >
                            {category.is_active ? (
                              <EyeOff className={`w-4 h-4 ${i18n.language === 'ar' ? 'ms-2' : 'mr-2'} transition-transform duration-300 group-hover:scale-110`} />
                            ) : (
                              <Eye className={`w-4 h-4 ${i18n.language === 'ar' ? 'ms-2' : 'mr-2'} transition-transform duration-300 group-hover:scale-110`} />
                            )}
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {category.is_active ? t('admin.common.deactivate') : t('admin.common.activate')}
                            </span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />

                          <DropdownMenuItem
                            onClick={() => setDeleteCategoryId(category.id)}
                            className="text-red-600 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 transition-all duration-300 hover:scale-[1.02] mx-2 my-1 rounded-xl"
                          >
                            <Trash2 className={`w-4 h-4 ${i18n.language === 'ar' ? 'ms-2' : 'mr-2'} transition-transform duration-300 group-hover:scale-110`} />
                            <span className="font-semibold">{t('admin.common.delete')}</span>
                          </DropdownMenuItem>

                        </DropdownMenuContent>

                        </DropdownMenu>

                      </TableCell>

                    </TableRow>

                  ))}

                </TableBody>

              </Table>

            </div>

          ) : (
              <div className="space-y-3 p-4">
              {categoryTree.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    {renderCategoryTree(categoryTree)}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center">
                      <FolderOpen className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                </div>
                    <p className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      {t('admin.categories.noCategories')}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      {t('admin.categories.noCategoriesDescription')}
                    </p>
                  </motion.div>
                )}
            </div>
          )}

        </CardContent>
      </Card>
      </motion.div>



      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] overflow-y-auto mx-auto my-4 w-[95vw] sm:w-full relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-2xl"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            maxHeight: '90vh',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9'
          }}
          onScroll={(e) => {
            e.currentTarget.style.scrollBehavior = 'smooth';
          }}
        >
          <DialogHeader className="space-y-3">
            <DialogTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
              {i18n.language === 'ar' ? (
                <>
                  {t('admin.categories.editCategory')}
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                    <Edit className="w-5 h-5 text-primary" />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                    <Edit className="w-5 h-5 text-primary" />
                  </div>
                  {t('admin.categories.editCategory')}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {t('admin.categories.editCategoryDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative pb-3">
                  <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
                    {i18n.language === 'ar' ? (
                      <>
                        {t('admin.categories.basicInformation')}
                        <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                          <FolderOpen className="w-5 h-5 text-primary" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                          <FolderOpen className="w-5 h-5 text-primary" />
                        </div>
                        {t('admin.categories.basicInformation')}
                      </>
                    )}
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('admin.categories.basicInformationDescription')}
                  </p>
                </CardHeader>
                <CardContent className="relative space-y-4 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.categoryName')} *</Label>
                      <div className="relative group">
                        <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-hover:text-primary transition-colors duration-300" />
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('admin.categories.categoryNamePlaceholder')}
                          className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                      </div>
              </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit_parent_id" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.parentCategory')}</Label>
                <Select
                  value={formData.parent_id?.toString() || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, parent_id: value === 'none' ? undefined : parseInt(value) })}
                >
                        <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <SelectValue placeholder={t('admin.categories.selectParentCategory')} />
                  </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                          <SelectItem value="none" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.categories.noParent')}</SelectItem>
                    {categoryTree.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()} className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                        {translateCategoryName(category.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.categoryDescription')}</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('admin.categories.categoryDescriptionPlaceholder')}
                rows={3}
                      className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Additional Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative pb-3">
                  <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
                    {i18n.language === 'ar' ? (
                      <>
                        {t('admin.categories.additionalInformation')}
                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        {t('admin.categories.additionalInformation')}
                      </>
                    )}
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('admin.categories.additionalInformationDescription')}
                  </p>
                </CardHeader>
                <CardContent className="relative space-y-4 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_image" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.categoryImage')}</Label>
                      <CategoryImageUpload
                        token={token}
                        image={formData.image}
                        onImageChange={(imageUrl) => setFormData({ ...formData, image: imageUrl })}
                        className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit_sort_order" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.sortOrder')}</Label>
                      <div className="relative group">
                        <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-hover:text-primary transition-colors duration-300" />
                <Input
                  id="edit_sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                          className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
                    </div>
            </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_meta_title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.metaTitle')}</Label>
                <Input
                  id="edit_meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  placeholder={t('admin.categories.metaTitlePlaceholder')}
                        className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit_meta_description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.categories.metaDescription')}</Label>
                <Input
                  id="edit_meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder={t('admin.categories.metaDescriptionPlaceholder')}
                        className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      className="scale-110"
                    />
                    <div className="flex-1">
                      <Label htmlFor="edit_is_active" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        {t('admin.categories.isActive')}
                      </Label>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {t('admin.categories.statusHelp')}
                      </p>
            </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <DialogFooter className="space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2"
            >
              {t('admin.common.cancel')}
            </Button>
            <Button 
              onClick={handleUpdateCategory}
              className="hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2 shadow-lg hover:shadow-xl"
            >
              {t('admin.common.save')}
            </Button>
          </DialogFooter>

        </DialogContent>

      </Dialog>



      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
        <AlertDialogContent 
          className="bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-2xl mx-auto my-4 w-[95vw] sm:w-full relative overflow-hidden"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            maxHeight: '90vh',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9'
          }}
          onScroll={(e) => {
            e.currentTarget.style.scrollBehavior = 'smooth';
          }}
        >

          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              {t('admin.categories.confirmDelete')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {t('admin.categories.deleteConfirmationMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="space-x-3">
            <AlertDialogCancel className="hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2">
              {t('admin.common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={isDeleting}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2 shadow-lg hover:shadow-xl"
            >
              {isDeleting ? t('admin.common.deleting') : t('admin.common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>

        </AlertDialogContent>

      </AlertDialog>

    </div>
  );
};



export default AdminCategories;


