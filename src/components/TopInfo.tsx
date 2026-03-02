import React from 'react';
import { useShinyStore } from '../store/useShinyStore';
import { Sparkles } from 'lucide-react';

export const TopInfo: React.FC = () => {
    const { pokemon_name, odds_base, current_count } = useShinyStore();

    // Binomial distribution: 1 - (1 - p)^n
    const p = 1 / odds_base;
    const probability = 1 - Math.pow(1 - p, current_count);
    const pPercentage = Math.min(probability * 100, 99.99); // Cap at 99.99%

    return (
        <div className="flex flex-col items-center justify-center opacity-80 pt-12 pb-4 pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="text-xl font-medium tracking-wide">{pokemon_name}</span>
            </div>

            <div className="flex flex-col items-center gap-1 mt-2">
                <div className="text-xs font-mono opacity-50 bg-white/10 px-3 py-1 rounded-full whitespace-nowrap">
                    1 / {odds_base}
                </div>
                {pPercentage > 0.01 && (
                    <div className="text-[10px] font-mono opacity-40 whitespace-nowrap tracking-wider uppercase mt-1">
                        Probabilidad de éxito: {pPercentage.toFixed(2)}%
                    </div>
                )}
            </div>
        </div>
    );
};
