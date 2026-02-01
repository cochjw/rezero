
// Utility to provide representative illustrations for categories.
// Now using cute 'fluency' style icons from Icons8.

// Icons8 Fluency style base URL
const BASE_URL = 'https://img.icons8.com/fluency/240';

// Helper to handle URL encoding for spaces
const getUrl = (name: string) => `${BASE_URL}/${name}.png`;

// Map specific categories to cute icon names
export const getCategoryFallbackImage = (category: string): string => {
  switch (category) {
    case '과일':
      return getUrl('strawberry');
    case '채소/버섯':
      return getUrl('vegetables-bag'); // Or cabbage/carrot
    case '고기/계란':
      return getUrl('steak-medium');
    case '해산물/건어물':
      return getUrl('whole-fish');
    case '곡물/면':
      return getUrl('rice-bowl');
    case '유제품/두부':
      return getUrl('milk-bottle');
    case '햄/가공식품':
      return getUrl('sausages');
    case '간식/빵/떡':
      return getUrl('cookies');
    case '음료':
      return getUrl('soda-bottle');
    case '양념/조미료':
      return getUrl('soy-sauce');
    case '편의점':
      return getUrl('lunchbox');
    case '반찬':
      return getUrl('kimchi');
    case '즉석식품':
      return getUrl('canned-food'); // or microwave
    case '기타':
      return getUrl('ingredients');
    default:
      // Fallback logic for any missed or custom categories
      if (category.includes('고기') || category.includes('계란')) return getUrl('steak-medium');
      if (category.includes('생선') || category.includes('해물')) return getUrl('whole-fish');
      if (category.includes('채소') || category.includes('야채')) return getUrl('vegetables-bag');
      if (category.includes('과일')) return getUrl('strawberry');
      if (category.includes('면') || category.includes('곡물')) return getUrl('noodles');
      if (category.includes('빵') || category.includes('떡')) return getUrl('bread');
      if (category.includes('편의점')) return getUrl('lunchbox');
      if (category.includes('반찬') || category.includes('김치')) return getUrl('kimchi');
      if (category.includes('즉석')) return getUrl('canned-food');
      return getUrl('ingredients');
  }
};

// Deprecated: getIngredientImage specific mapping
export const getIngredientImage = (_name: string, category: string): string => {
  return getCategoryFallbackImage(category);
};
