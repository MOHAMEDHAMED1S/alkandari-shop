// ملف مؤقت - الدالة المحسنة لعرض شجرة التصنيفات
// نسخ هذه الدالة لـ AdminCategories.tsx

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

