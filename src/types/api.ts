export type ProductStatus = 'READY_TO_EAT' | 'SEMI_FINISHED' | 'REQUIRES_COOKING';

export type ProductCategory =
  | 'FROZEN'
  | 'MEAT'
  | 'VEGETABLES'
  | 'GREENS'
  | 'SPICES'
  | 'GRAINS'
  | 'CANNED'
  | 'LIQUID'
  | 'SWEETS';

export type ProductFlag = 'VEGAN' | 'GLUTEN_FREE' | 'SUGAR_FREE';

export interface ProductDto {
  id: string;
  name: string;
  category: ProductCategory;
  cookingRequired: ProductStatus;
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
  flags: ProductFlag[];
  photoUrls: string[];
}

export interface ProductListItem {
  id: string;
  name: string;
  category: ProductCategory;
  cookingRequired: ProductStatus;
  calories: number;
  flags: ProductFlag[];
  mainPhotoUrl?: string;
}

export type DishCategory =
  | 'DESSERT'
  | 'FIRST'
  | 'SECOND'
  | 'DRINK'
  | 'SALAD'
  | 'SOUP'
  | 'SNACK';

export interface IngredientDto {
  productId: string;
  productName: string;
  weight: number;
}

export interface DishDto {
  id: string;
  name: string;
  category: DishCategory;
  ingredients: IngredientDto[];
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
  flags: ProductFlag[];
  photoUrls: string[];
}

export interface DishListItem {
  id: string;
  name: string;
  category: DishCategory;
  calories: number;
  flags: ProductFlag[];
  mainPhotoUrl?: string;
}
