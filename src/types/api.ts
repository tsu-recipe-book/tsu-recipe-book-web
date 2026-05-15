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
  proteins: number;
  fats: number;
  carbohydrates: number;
  calories: number;
  composition: string;
  flags: ProductFlag[];
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  category: ProductCategory;
  cookingRequired: ProductStatus;
  calories: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
  flags: ProductFlag[];
  mainPhoto?: string;
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

export interface IngredientCalculationRequest {
  productId: string;
  weight: number;
}

export interface DishNutritionCalculationRequest {
  ingredients: IngredientCalculationRequest[];
}

export interface DishNutritionResponse {
  calories: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
  portionSize: number;
  availableFlags: ProductFlag[];
}

export interface DishDto {
  id: string;
  name: string;
  category: DishCategory;
  ingredients: IngredientDto[];
  proteins: number;
  fats: number;
  carbohydrates: number;
  calories: number;
  portionSize: number;
  flags: ProductFlag[];
  availableFlags?: ProductFlag[];
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DishListItem {
  id: string;
  name: string;
  category: DishCategory;
  calories: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
  portionSize: number;
  flags: ProductFlag[];
  mainPhoto?: string;
}
