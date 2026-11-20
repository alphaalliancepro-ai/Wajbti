export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type RecipeImageKey =
  | 'eggs'
  | 'oats'
  | 'ojja'
  | 'yogurt'
  | 'chicken'
  | 'couscous'
  | 'lentils'
  | 'sardines'
  | 'salad'
  | 'pasta'
  | 'chorba'
  | 'sandwich';

export interface Ingredient {
  name: string;
  amount: string;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  category: MealCategory;
  prepMinutes: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  costDT: number;
  imageKey: RecipeImageKey;
  ingredients: Ingredient[];
  spices: string[];
  steps: string[];
  flavorSecret: string;
  tip: string;
  difficulty: 'ساهلة برشا' | 'متوسطة';
}

export interface ShoppingTemplateItem {
  id: string;
  name: string;
  quantity: string;
  defaultPrice: number;
  category: 'بروتينات' | 'خضرة وغلة' | 'حبوب وبقوليات' | 'حليب ومشتقاته';
  imageKey: RecipeImageKey;
}

export interface ShoppingItemState {
  checked: boolean;
  price: number;
}

export interface CustomShoppingItem {
  id: string;
  weekIndex: number;
  name: string;
  quantity: string;
  price: number;
  checked: boolean;
}

export interface TrackerEntry {
  id: string;
  dateISO: string;
  weight: number;
  waist?: number;
  note?: string;
}

export interface DailyHabits {
  water: boolean;
  workout: boolean;
  sleep: boolean;
}

export interface UserProfile {
  currentWeight: number;
  heightCm: number;
  targetWeight: number;
  dailyBudgetDT: number;
}

export type ActiveTab = 'menu' | 'recipes' | 'shopping' | 'tracker';

export interface AppState {
  version: number;
  activeDay: number;
  doneDays: number[];
  /** Keyed by `${day}-${category}` -> recipeId */
  selectedRecipes: Record<string, string>;
  /** Keyed by `${weekIndex}-${itemId}` */
  shoppingState: Record<string, ShoppingItemState>;
  customShoppingItems: CustomShoppingItem[];
  /** Keyed by day number as string */
  dailyHabits: Record<string, DailyHabits>;
  profile: UserProfile;
  trackerHistory: TrackerEntry[];
  lastUpdatedISO: string;
}
