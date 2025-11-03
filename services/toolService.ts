
import { RecentMeal, UserProfile } from '../types';

// Mock implementations of Supabase/backend functions

export const get_user_profile = async ({ user_id }: { user_id: string }): Promise<UserProfile> => {
    console.log(`[Tool] Fetching profile for user: ${user_id}`);
    // In a real app, this would be a fetch call to your backend/Supabase
    return new Promise(resolve => setTimeout(() => {
        resolve({
            plan: 'Fit',
            allergies: ['arachides'],
            dislikes: ['betteraves', 'endives'],
            likes: ['poulet', 'brocoli', 'patates douces'],
            kcal_target: 2200,
            protein_target_g: 150,
            carb_target_g: 200,
            fat_target_g: 80,
            fiber_target_g: 30,
            budget_level: 'medium',
        });
    }, 500));
};

export const get_recent_meals = async ({ user_id, limit }: { user_id: string; limit: number }): Promise<RecentMeal[]> => {
    console.log(`[Tool] Fetching ${limit} recent meals for user: ${user_id}`);
    return new Promise(resolve => setTimeout(() => {
        resolve([
            { name: 'Poulet grillé, brocolis et riz complet', time: 'hier soir' },
            { name: 'Omelette aux épinards', time: 'hier midi' },
        ]);
    }, 300));
};

export const save_meal_log = async (params: any): Promise<{ ok: boolean }> => {
    console.log('[Tool] Saving meal log:', params);
    return new Promise(resolve => setTimeout(() => {
        resolve({ ok: true });
    }, 200));
};

export const log_coaching_event = async (params: any): Promise<{ ok: boolean }> => {
    console.log('[Tool] Logging coaching event:', params);
    return new Promise(resolve => setTimeout(() => {
        resolve({ ok: true });
    }, 200));
};

// A map to easily call the functions by name
export const availableTools = {
    get_user_profile,
    get_recent_meals,
    save_meal_log,
    log_coaching_event,
};
