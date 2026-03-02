import React, { useRef } from 'react';
import { useShinyStore } from '../store/useShinyStore';
import { motion } from 'framer-motion';
import { getPokemonColor } from './GiantCounter';
import { Sparkles, Share2, RefreshCw } from 'lucide-react';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const VictoryScreen: React.FC = () => {
    const { pokemon_name, current_count, timestamp_start, reset } = useShinyStore();
    const cardRef = useRef<HTMLDivElement>(null);
    const colorClass = getPokemonColor(pokemon_name);

    // Calculate final time
    const diffMs = Date.now() - timestamp_start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const timeSpent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} minutos`;
    const startDate = new Date(timestamp_start).toLocaleDateString();

    const handleShare = async () => {
        if (!cardRef.current) return;

        try {
            if (Capacitor.isNativePlatform()) {
                await Haptics.impact({ style: ImpactStyle.Light });
            }

            // Temporary hide buttons for the screenshot
            const buttons = cardRef.current.querySelectorAll('.no-export');
            buttons.forEach(btn => (btn as HTMLElement).style.display = 'none');

            const dataUrl = await toPng(cardRef.current, { quality: 1, backgroundColor: '#000000' });

            buttons.forEach(btn => (btn as HTMLElement).style.display = 'flex');

            // Trigger download or native share (mocked here with downloadjs)
            download(dataUrl, `Shiny-${pokemon_name}-${current_count}.png`);

        } catch (err) {
            console.error('Failed to export image', err);
        }
    };

    const handleReset = () => {
        if (Capacitor.isNativePlatform()) {
            Haptics.impact({ style: ImpactStyle.Heavy });
        }
        reset();
    };

    // Particle Array
    const particles = Array.from({ length: 20 });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-6 pointer-events-auto"
        >
            {/* Celebration Particles */}
            {particles.map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute z-0"
                    initial={{
                        x: 0,
                        y: 0,
                        opacity: 1,
                        scale: 0
                    }}
                    animate={{
                        x: (Math.random() - 0.5) * window.innerWidth,
                        y: (Math.random() - 0.5) * window.innerHeight,
                        opacity: 0,
                        scale: Math.random() * 2 + 1,
                        rotate: Math.random() * 360
                    }}
                    transition={{
                        duration: Math.random() * 2 + 1.5,
                        ease: "easeOut",
                        delay: Math.random() * 0.2
                    }}
                >
                    <Sparkles className={`w-8 h-8 ${colorClass}`} />
                </motion.div>
            ))}

            <motion.div
                ref={cardRef}
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-2xl relative z-10 overflow-hidden"
            >
                {/* Visual Flair in Card */}
                <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] opacity-20 ${colorClass.replace('text-', 'bg-').split(' ')[0]}`} />

                <div className="flex flex-col items-center mb-8 relative z-10">
                    <motion.div
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ duration: 0.8, type: "spring" }}
                    >
                        <Sparkles className={`w-12 h-12 mb-4 ${colorClass}`} />
                    </motion.div>
                    <h2 className="text-2xl font-medium tracking-wide">¡Encontrado!</h2>
                    <p className={`text-xl font-bold mt-2 ${colorClass}`}>{pokemon_name}</p>
                </div>

                <div className="space-y-6 relative z-10 font-mono text-center">
                    <div>
                        <p className="text-sm opacity-50 uppercase tracking-widest mb-1">Intentos Totales</p>
                        <p className="text-4xl font-bold tabular-nums">{current_count}</p>
                    </div>

                    <div>
                        <p className="text-sm opacity-50 uppercase tracking-widest mb-1">Tiempo Invertido</p>
                        <p className="text-xl tabular-nums">{timeSpent}</p>
                    </div>

                    <div>
                        <p className="text-sm opacity-50 uppercase tracking-widest mb-1">Fecha de Inicio</p>
                        <p className="text-lg tabular-nums">{startDate}</p>
                    </div>
                </div>

                <div className="mt-10 flex flex-col gap-3 no-export relative z-10">
                    <button
                        onClick={handleShare}
                        className="w-full flex items-center justify-center gap-2 bg-white text-black font-medium py-4 rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                        <Share2 className="w-5 h-5" />
                        Compartir Resumen
                    </button>
                    <button
                        onClick={handleReset}
                        className="w-full flex items-center justify-center gap-2 bg-zinc-800 text-white font-medium py-4 rounded-xl hover:bg-zinc-700 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5 opacity-50" />
                        Nueva Cacería
                    </button>
                </div>

                {/* Subtle Branding on Export */}
                <div className="absolute bottom-4 left-0 right-0 text-center opacity-0 [export-opacity:100] text-[10px] tracking-widest text-white/30 font-mono">
                    SHINYCHECK BY ALKIMIA STUDIO
                </div>
            </motion.div>
        </motion.div>
    );
};
