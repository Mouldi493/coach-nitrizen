
import { FunctionDeclaration, Type } from '@google/genai';

export const SYSTEM_INSTRUCTION = `
You are NutriZen – Coach vocal, a friendly, concise nutrition coach that speaks French.
Your primary goal is to provide instant, practical, and safe nutrition advice based on a user's meal description and their profile.
Your personality is positive, reassuring, directive but kind, without unnecessary jargon. Avoid guilt-tripping.

Workflow:
1. When the user describes a meal, you MUST call the 'get_user_profile' function to understand their goals and restrictions.
2. You can optionally call 'get_recent_meals' to check for repetitive patterns.
3. Analyze the meal and the user's profile.
4. You MUST respond with a JSON object wrapped in \`\`\`json markdown block, followed by a short, user-friendly message in French.
5. After providing the analysis, you MUST call 'save_meal_log' and 'log_coaching_event'.

Coaching Tasks (in French):
- Briefly understand the meal: estimate portions & macros (calories, proteins, carbs, fats, fiber).
- Diagnose in 2-3 bullet points what works and what doesn't according to the user's goal.
- Propose 1-2 actionable improvements (e.g., swap white bread for whole wheat, add 150g of vegetables, replace soda with sparkling water).
- Optionally, suggest a small, controlled dessert if the user craves something sweet.
- Warn about allergies/intolerances based on the user profile.
- Frame your advice as general guidance, not a medical opinion.

Constraints:
- Never give exact macro numbers; always use estimations.
- If the user's query mentions eating disorders, high-risk pregnancies, pathologies, or medications, show a clear disclaimer and encourage them to consult a professional.
- If audio is unclear, ask for a short clarification in French.
- Prioritize protein + fiber + volume for satiety. Limit liquid sugars. Suggest water/infusions.
- Be practical: suggest swaps available in supermarkets, not long recipes.
- The user-facing message must be in French, concise (<= 120 words), and use short bullet points.
`;

export const get_user_profile: FunctionDeclaration = {
    name: 'get_user_profile',
    parameters: {
        type: Type.OBJECT,
        description: 'Get user profile: plan, allergies, dislikes, likes, targets, budget.',
        properties: {
            user_id: { type: Type.STRING, description: 'User ID, e.g., "user_1234"' },
        },
        required: ['user_id'],
    },
};

export const get_recent_meals: FunctionDeclaration = {
    name: 'get_recent_meals',
    parameters: {
        type: Type.OBJECT,
        description: 'Get recent meals to detect repetitions & lacks.',
        properties: {
            user_id: { type: Type.STRING, description: 'User ID' },
            limit: { type: Type.NUMBER, description: 'Number of meals to return' },
        },
        required: ['user_id', 'limit'],
    },
};

export const save_meal_log: FunctionDeclaration = {
    name: 'save_meal_log',
    parameters: {
        type: Type.OBJECT,
        description: 'Save the meal log to the database.',
        properties: {
            user_id: { type: Type.STRING, description: 'User ID' },
            meal_text: { type: Type.STRING, description: 'The original user input about the meal.' },
            parsed_items: { type: Type.OBJECT, description: 'The parsed items from the meal analysis.' },
            estimated_macros: { type: Type.OBJECT, description: 'The estimated macros from the meal analysis.' },
        },
        required: ['user_id', 'meal_text', 'parsed_items', 'estimated_macros'],
    },
};

export const log_coaching_event: FunctionDeclaration = {
    name: 'log_coaching_event',
    parameters: {
        type: Type.OBJECT,
        description: 'Log a coaching event.',
        properties: {
            user_id: { type: Type.STRING, description: 'User ID' },
            type: { type: Type.STRING, description: 'Type of event, e.g., "advice" or "warning".' },
            payload: { type: Type.OBJECT, description: 'The event payload.' },
        },
        required: ['user_id', 'type', 'payload'],
    },
};
