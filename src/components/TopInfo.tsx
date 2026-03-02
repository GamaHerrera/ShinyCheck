import React from 'react';
import { useShinyStore } from '../store/useShinyStore';
import { Sparkles } from 'lucide-react';

export const TopInfo: React.FC = () => {
    const { pokemon_name, odds_base } = useShinyStore();

    return (
        <div className="flex flex-col items-center justify-center opacity-80 pt-12 pb-4 pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="text-xl font-medium tracking-wide">{pokemon_name}</span>
            </div>
            <div className="text-sm opacity-60 tracking-wider">
                Soft Reset
            </div>
            <div className="mt-2 text-xs font-mono opacity-50 bg-white/10 px-3 py-1 rounded-full">
                1 / {odds_base}
            </div>
        </div>
    );
};
