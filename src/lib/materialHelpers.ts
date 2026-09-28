import { AppLanguage, MaterialCategory, PriceRecord } from '../types/database';

export const getMaterialCategoryName = (
  category?: MaterialCategory | null,
  lang: AppLanguage = 'en'
): string => {
  if (!category) return 'Material';
  switch (lang) {
    case 'mr':
      return category.name_mr || category.name_en;
    case 'hi':
      return category.name_hi || category.name_en;
    case 'gu':
      return category.name_gu || category.name_hi || category.name_en;
    case 'ta':
      return category.name_ta || category.name_en;
    case 'te':
      return category.name_te || category.name_en;
    case 'kn':
      return category.name_kn || category.name_en;
    case 'en':
    default:
      return category.name_en;
  }
};

export const getPriceSubCategoryName = (
  price?: PriceRecord | null,
  lang: AppLanguage = 'en'
): string => {
  if (!price) return '';
  switch (lang) {
    case 'mr':
      return price.sub_category_name_mr || price.sub_category_name;
    case 'hi':
      return price.sub_category_name_hi || price.sub_category_name;
    case 'gu':
      return price.sub_category_name_gu || price.sub_category_name;
    case 'ta':
      return price.sub_category_name_ta || price.sub_category_name;
    case 'te':
      return price.sub_category_name_te || price.sub_category_name;
    case 'kn':
      return price.sub_category_name_kn || price.sub_category_name;
    case 'en':
    default:
      return price.sub_category_name;
  }
};
