
import React from 'react';
import { MealAnalysis } from '../types';
import { NutritionIcon, CheckCircleIcon, LightbulbIcon, AlertTriangleIcon } from './Icons';

interface AnalysisCardProps {
  analysis: MealAnalysis;
}

const MacroItem: React.FC<{ label: string; value: number; unit: string }> = ({ label, value, unit }) => (
    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-lg font-bold text-gray-800">{`~${value}${unit}`}</span>
    </div>
);

const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis }) => {
    const { meal_understanding, diagnosis_bullets, suggested_swaps, allergy_flags } = analysis;

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden w-full max-w-lg mx-auto p-6 space-y-6 animate-fade-in">
            
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center"><NutritionIcon className="w-5 h-5 mr-2 text-green-500" />Résumé du repas</h3>
                <ul className="list-disc list-inside text-gray-700">
                    {meal_understanding.items.map((item, index) => (
                        <li key={index}>{`${item.name} (~${item.estimated_qty_g}g)`}</li>
                    ))}
                </ul>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-center">
                    <MacroItem label="Kcal" value={meal_understanding.estimated_macros.kcal} unit="" />
                    <MacroItem label="Prot" value={meal_understanding.estimated_macros.protein_g} unit="g" />
                    <MacroItem label="Gluc" value={meal_understanding.estimated_macros.carbs_g} unit="g" />
                    <MacroItem label="Lip" value={meal_understanding.estimated_macros.fat_g} unit="g" />
                    <MacroItem label="Fibres" value={meal_understanding.estimated_macros.fiber_g} unit="g" />
                </div>
            </div>

            {allergy_flags && allergy_flags.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertTriangleIcon className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700 font-semibold">Attention Allergies</p>
                            <ul className="list-disc list-inside text-red-600 text-sm">
                                {allergy_flags.map((flag, index) => <li key={index}>{flag}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center"><CheckCircleIcon className="w-5 h-5 mr-2 text-blue-500" />Diagnostic</h3>
                <ul className="space-y-2">
                    {diagnosis_bullets.map((bullet, index) => (
                        <li key={index} className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">&#8226;</span>
                            <span className="text-gray-700">{bullet}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center"><LightbulbIcon className="w-5 h-5 mr-2 text-yellow-500" />Suggestions</h3>
                <ul className="space-y-2">
                    {suggested_swaps.map((swap, index) => (
                         <li key={index} className="flex items-start">
                            <span className="text-yellow-500 mr-2 mt-1">&#8226;</span>
                            <span className="text-gray-700">{swap}</span>
                        </li>
                    ))}
                </ul>
            </div>
            
        </div>
    );
};

export default AnalysisCard;
