import React, { useState } from 'react';
import { useShinyStore } from '../store/useShinyStore';
import { Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BottomMetrics: React.FC = () => {
    const { current_count, timestamp_start, pokemon_name, odds_base, setPokemon } = useShinyStore();
    const [sessionCount, setSessionCount] = React.useState(0);
    const [elapsed, setElapsed] = React.useState('0m');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Track this specific session mounts
    const [startCount] = React.useState(current_count);

    React.useEffect(() => {
        setSessionCount(Math.max(0, current_count - startCount));
    }, [current_count, startCount]);

    React.useEffect(() => {
        const updateTime = () => {
            const diffMs = Date.now() - timestamp_start;
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
            if (hours > 0) {
                setElapsed(`${hours}h ${minutes}m`);
            } else {
                setElapsed(`${minutes}m`);
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, [timestamp_start]);

    return (
        <>
            <div className="pb-8 pt-4 flex flex-col items-center justify-end pointer-events-none relative z-10">
                <div className="flex gap-6 text-sm opacity-50 mb-6 font-mono">
                    <span>Sesión actual: +{sessionCount}</span>
                    <span>•</span>
                    <span>Tiempo transcurrido: {elapsed}</span>
                </div>

                {/* Settings button is interactive while rest is pointer-events-none */}
                <button
                    className="pointer-events-auto p-3 rounded-full opacity-30 hover:opacity-100 transition-opacity duration-300 mb-2"
                    onClick={(e) => {
                        e.stopPropagation(); // prevent app tap
                        setIsSettingsOpen(true);
                    }}
                >
                    <Settings className="w-6 h-6" />
                </button>

                <div className="text-[10px] opacity-20 tracking-widest uppercase flex flex-col items-center gap-1 font-mono mt-2">
                    <span>ShinyCheck v1.1.0</span>
                    <span>by Alkimia Studio</span>
                </div>
            </div>

            {/* Settings Modal - Stop propagation so taps don't trigger the counter */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative pointer-events-auto"
                        >
                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="absolute top-6 right-6 opacity-50 hover:opacity-100"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                                <Settings className="w-5 h-5 opacity-60" />
                                Configuración
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm opacity-60 mb-2">Pokémon a buscar</label>
                                    <input
                                        type="text"
                                        defaultValue={pokemon_name}
                                        placeholder="Ej. Charmander, Mew..."
                                        className="w-full bg-black/50 border border-zinc-800 rounded-xl p-4 outline-none focus:border-white/50 transition-colors"
                                        onBlur={(e) => setPokemon(e.target.value.trim() || 'Desconocido', odds_base)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setPokemon(e.currentTarget.value.trim() || 'Desconocido', odds_base);
                                                e.currentTarget.blur();
                                            }
                                        }}
                                    />
                                    <p className="text-xs opacity-40 mt-2 font-mono">* El color del contador cambiará automáticamente si escribes nombres como Squirtle, Charmander, Bulbasaur, Pikachu o Mew.</p>
                                </div>

                                <div>
                                    <label className="block text-sm opacity-60 mb-2">Probabilidad Base (Odds)</label>
                                    <select
                                        defaultValue={odds_base}
                                        onChange={(e) => setPokemon(pokemon_name, Number(e.target.value))}
                                        className="w-full bg-black/50 border border-zinc-800 rounded-xl p-4 outline-none focus:border-white/50 transition-colors appearance-none"
                                    >
                                        <option value="8192">1 / 8192 (Full Odds Clásico)</option>
                                        <option value="4096">1 / 4096 (Full Odds Gen 6+)</option>
                                        <option value="1365">1 / 1365 (Shiny Charm)</option>
                                        <option value="512">1 / 512 (Masuda Method + Charm)</option>
                                        <option value="819">1 / 819 (SOS Chain 11-20)</option>
                                        <option value="315">1 / 315 (SOS Chain 31+)</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsSettingsOpen(false);
                                }}
                                className="w-full mt-8 bg-white text-black font-medium py-4 rounded-xl hover:bg-zinc-200 transition-colors"
                            >
                                Cerrar
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
