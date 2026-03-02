import React, { useEffect, useState, useCallback } from 'react';
import { useShinyStore } from './store/useShinyStore';
import { TopInfo } from './components/TopInfo';
import { GiantCounter, getPokemonColor } from './components/GiantCounter';
import { BottomMetrics } from './components/BottomMetrics';
import { VictoryScreen } from './components/VictoryScreen';
import { TutorialOverlay } from './components/TutorialOverlay';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { Capacitor } from '@capacitor/core';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { increment, decrement, isVictory, hasSeenTutorial } = useShinyStore();
  const [startY, setStartY] = useState(0);
  // ... Skipping unmodified lines to target bottom return...
  const [flashlight, setFlashlight] = useState(false);

  const tryHaptics = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {
        console.warn("Haptics failed", e);
      }
    }
  }, []);

  const handleIncrement = useCallback(() => {
    increment();
    tryHaptics();
  }, [increment, tryHaptics]);

  const handleDecrement = useCallback(() => {
    decrement();
    tryHaptics();
  }, [decrement, tryHaptics]);

  useEffect(() => {
    // Keep Wake Lock active
    const enableWakeLock = async () => {
      try {
        await KeepAwake.keepAwake();
      } catch (e) {
        console.warn("KeepAwake not supported", e);
      }
    };
    enableWakeLock();

    // App State listeners for Playtime Pause/Resume
    const setupAppListeners = async () => {
      if (Capacitor.isNativePlatform()) {
        const { App: CapacitorApp } = await import('@capacitor/app');
        CapacitorApp.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            useShinyStore.getState().resumePlaytime();
          } else {
            useShinyStore.getState().pausePlaytime();
          }
        });
      }
    };
    setupAppListeners();
  }, []);

  // Hardware buttons (Volume keys)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'VolumeUp' || e.key === 'AudioVolumeUp') {
        handleIncrement();
      } else if (e.key === 'VolumeDown' || e.key === 'AudioVolumeDown') {
        handleDecrement();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleIncrement, handleDecrement]);

  // Shake Gesture for Night Mode / Flashlight (aesthetic UI change since we can't fully control Android LED flashlight easily without another plugin)
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    const threshold = 18; // Sensibility
    let lastShakeTime = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      if (!e.accelerationIncludingGravity) return;
      const { x, y, z } = e.accelerationIncludingGravity;
      if (x === null || y === null || z === null) return;

      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      // Update last positions
      lastX = x; lastY = y; lastZ = z;

      if (deltaX + deltaY + deltaZ > threshold) {
        const now = Date.now();
        if (now - lastShakeTime > 1000) { // Cooldown 1s
          lastShakeTime = now;
          setFlashlight((prev) => !prev);
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

  // Touch handlers for swipe down (-1)
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    // Check if it's a downward swipe (difference greater than 50px)
    if (endY - startY > 50) {
      handleDecrement();
    }
  };

  const handleLongPress = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent standard context menu
    if (window.confirm("¿Lo encontraste?\n\n[Aceptar] para registrar y celebrar.\n[Cancelar] continuar.")) {
      useShinyStore.getState().setVictory(true);
      if (Capacitor.isNativePlatform()) {
        Haptics.impact({ style: ImpactStyle.Heavy });
      }
    }
  };

  const backgroundColor = getPokemonColor(useShinyStore().pokemon_name, 'hex');

  return (
    <main
      className={`w-full h-full flex flex-col justify-between transition-colors duration-500 select-none relative ${flashlight ? 'bg-zinc-900 border-[10px] border-white/20' : 'bg-black'} overflow-hidden overscroll-y-none touch-none`}
      onClick={handleIncrement}
      onContextMenu={handleLongPress}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Ambient background breathing glow */}
      {!flashlight && (
        <motion.div
          className="absolute inset-x-0 -top-64 h-[50vh] rounded-full blur-[120px] opacity-10 pointer-events-none mx-auto w-full max-w-3xl"
          animate={{
            backgroundColor: backgroundColor as string,
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <TopInfo />
      <GiantCounter />
      <BottomMetrics />

      <AnimatePresence>
        {isVictory && <VictoryScreen />}
        {!hasSeenTutorial && <TutorialOverlay />}
      </AnimatePresence>
    </main>
  );
}

export default App;
