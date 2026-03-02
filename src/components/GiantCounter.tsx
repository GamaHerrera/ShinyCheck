import React, { useEffect, useState } from 'react';
import { useShinyStore } from '../store/useShinyStore';
import { motion, AnimatePresence } from 'framer-motion';

export const getPokemonColor = (name: string, format: 'hex' | 'tailwind' = 'tailwind') => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('squirtle') || lowerName.includes('water')) {
        return format === 'hex' ? '#60a5fa' : 'text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.4)]';
    }
    if (lowerName.includes('charmander') || lowerName.includes('fire')) {
        return format === 'hex' ? '#fb923c' : 'text-orange-400 drop-shadow-[0_0_20px_rgba(251,146,60,0.4)]';
    }
    if (lowerName.includes('bulbasaur') || lowerName.includes('grass')) {
        return format === 'hex' ? '#4ade80' : 'text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.4)]';
    }
    if (lowerName.includes('pikachu') || lowerName.includes('electric')) {
        return format === 'hex' ? '#facc15' : 'text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]';
    }
    if (lowerName.includes('mew') || lowerName.includes('psychic')) {
        return format === 'hex' ? '#e879f9' : 'text-fuchsia-400 drop-shadow-[0_0_20px_rgba(232,121,249,0.4)]';
    }
    return format === 'hex' ? '#ffffff' : 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]';
};

export const GiantCounter: React.FC = () => {
    const { current_count, pokemon_name, odds_base } = useShinyStore();
    const colorClass = getPokemonColor(pokemon_name) as string;
    const hexColor = getPokemonColor(pokemon_name, 'hex') as string;

    const [pulse, setPulse] = useState(false);
    const isOverOdds = current_count > odds_base;

    useEffect(() => {
        setPulse(true);
        const timeout = setTimeout(() => setPulse(false), 150);
        return () => clearTimeout(timeout);
    }, [current_count]);

    // Calculate ring progress (cap at 100%)
    const percentage = Math.min((current_count / odds_base) * 100, 100);
    // Exact circumference of r=140 is 2 * PI * 140 = 879.64
    const circumference = 2 * Math.PI * 140;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex-1 flex items-center justify-center pointer-events-none relative overflow-hidden w-full max-w-lg mx-auto aspect-square">

            {/* Background ambient ring */}
            <svg className="absolute inset-0 w-full h-full p-8 opacity-10" viewBox="0 0 300 300">
                <circle
                    cx="150" cy="150" r="140"
                    fill="none"
                    stroke={hexColor}
                    strokeWidth="2"
                />
            </svg>

            {/* Progress Ring */}
            <svg className="absolute inset-0 w-full h-full p-8 -rotate-90 origin-center transition-all duration-1000 ease-out" viewBox="0 0 300 300">
                <circle
                    cx="150" cy="150" r="140"
                    fill="none"
                    stroke={isOverOdds ? '#ef4444' : hexColor}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out, stroke 1s ease-in-out' }}
                />
            </svg>

            <AnimatePresence mode="popLayout">
                <motion.div
                    key={current_count}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{
                        opacity: 1,
                        scale: pulse ? 1.05 : 1,
                        y: 0,
                        textShadow: pulse ? "0px 0px 40px currentColor" : "0px 0px 20px currentColor",
                        color: isOverOdds && pulse ? '#ef4444' : undefined // Flash red briefly if over odds
                    }}
                    exit={{ opacity: 0, scale: 1.2, y: -10, filter: "blur(10px)" }}
                    transition={{
                        duration: 0.3,
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                    }}
                    className={`text-[6rem] sm:text-[10rem] md:text-[12rem] font-bold tabular-nums leading-none tracking-tighter z-10 ${isOverOdds ? 'text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]' : colorClass}`}
                >
                    {current_count}
                </motion.div>
            </AnimatePresence>

            {/* Over odds text indicator */}
            <AnimatePresence>
                {isOverOdds && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-16 text-red-500/80 text-sm font-medium tracking-widest uppercase z-10"
                    >
                        OVER ODDS
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
