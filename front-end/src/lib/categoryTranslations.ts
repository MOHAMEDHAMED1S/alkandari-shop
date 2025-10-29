import { useTranslation } from 'react-i18next';

/**
 * Hook to get translated category name
 * @param categoryName - The original category name from database
 * @returns Translated category name based on current language
 */
export const useCategoryTranslation = () => {
  const { t, i18n } = useTranslation();

  const translateCategoryName = (categoryName: string): string => {
    // Try to get translation from categoryNames namespace
    const translationKey = `categoryNames.${categoryName}`;
    const translated = t(translationKey);
    
    // If translation exists and is different from the key, return it
    if (translated !== translationKey) {
      return translated;
    }
    
    // If no translation found, return original name
    return categoryName;
  };

  return { translateCategoryName };
};

/**
 * Utility function to translate category name without hook
 * @param categoryName - The original category name from database
 * @param t - Translation function
 * @returns Translated category name
 */
export const translateCategoryName = (categoryName: string, t: (key: string) => string): string => {
  const translationKey = `categoryNames.${categoryName}`;
  const translated = t(translationKey);
  
  // If translation exists and is different from the key, return it
  if (translated !== translationKey) {
    return translated;
  }
  
  // If no translation found, return original name
  return categoryName;
};
