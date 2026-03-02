import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShinyStore } from '../store/useShinyStore';
import { Hand, ArrowDown, Settings2, CheckCircle2 } from 'lucide-react';

export const TutorialOverlay: React.FC = () => {
    const { setHasSeenTutorial } = useShinyStore();
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "Cacería Rápida",
            desc: "Toca cualquier parte de la pantalla o usa los botones de Volumen para aumentar el contador.",
            icon: <Hand className="w-16 h-16 text-blue-400 mb-6" />
        },
        {
            title: "Corregir Errores",
            desc: "Desliza el dedo hacia abajo desde el centro de la pantalla si presionaste de más.",
            icon: <ArrowDown className="w-16 h-16 text-red-400 mb-6" />
        },
        {
            title: "Victoria y Opciones",
            desc: "Mantén presionada la pantalla para registrar si has encontrado al Pokémon Shiny (Variacolor), o para reiniciar el contador a cero.",
            icon: <Settings2 className="w-16 h-16 text-yellow-400 mb-6" />
        }
    ];

    const nextStep = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            setHasSeenTutorial(true);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
        >
            <div className="flex gap-2 mb-12">
                {steps.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === step ? 'w-12 bg-white' : 'w-4 bg-white/20'}`}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center max-w-sm"
                >
                    {steps[step].icon}
                    <h2 className="text-3xl font-medium mb-4 tracking-wide">{steps[step].title}</h2>
                    <p className="text-lg opacity-60 leading-relaxed font-light">
                        {steps[step].desc}
                    </p>
                </motion.div>
            </AnimatePresence>

            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={nextStep}
                className="mt-16 w-full max-w-xs bg-white text-black font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
                style={{ WebkitTapHighlightColor: 'transparent' }}
            >
                {step === steps.length - 1 ? (
                    <>
                        <CheckCircle2 className="w-5 h-5" />
                        Comenzar
                    </>
                ) : (
                    "Siguiente"
                )}
            </motion.button>
        </motion.div>
    );
};
