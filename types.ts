
export interface MealItem {
  name: string;
  estimated_qty_g: number;
}

export interface EstimatedMacros {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export interface MealUnderstanding {
  items: MealItem[];
  estimated_macros: EstimatedMacros;
}

export interface MealAnalysis {
  meal_understanding: MealUnderstanding;
  diagnosis_bullets: string[];
  suggested_swaps: string[];
  allergy_flags: string[];
  next_step_cta: string;
}

export interface UserProfile {
  plan: string;
  allergies: string[];
  dislikes: string[];
  likes: string[];
  kcal_target: number;
  protein_target_g: number;
  carb_target_g: number;
  fat_target_g: number;
  fiber_target_g: number;
  budget_level: 'low' | 'medium' | 'high';
}

export interface RecentMeal {
  name: string;
  time: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'coach' | 'system';
  text: string;
  analysis?: MealAnalysis;
}
