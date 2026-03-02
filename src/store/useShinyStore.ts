import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ShinyState {
    pokemon_name: string;
    current_count: number;
    odds_base: number;

    // Playtime Tracking
    timestamp_start: number; // For legacy/total duration context
    active_playtime_ms: number; // The actual tracked time in ms
    last_active_timestamp: number; // Last time the user tapped/app was foregrounded

    isVictory: boolean;
    hasSeenTutorial: boolean;

    increment: () => void;
    decrement: () => void;
    reset: () => void;
    setPokemon: (name: string, odds: number) => void;
    setVictory: (status: boolean) => void;
    setHasSeenTutorial: (status: boolean) => void;

    // Playtime Actions
    updatePlaytime: () => void;
    pausePlaytime: () => void;
    resumePlaytime: () => void;
}

export const useShinyStore = create<ShinyState>()(
    persist(
        (set, get) => ({
            pokemon_name: 'Squirtle', // Default selected pokemon
            current_count: 0,
            odds_base: 8192,

            timestamp_start: Date.now(),
            active_playtime_ms: 0,
            last_active_timestamp: Date.now(),

            isVictory: false,
            hasSeenTutorial: false,

            increment: () => {
                get().updatePlaytime(); // Update time before incrementing count logic
                set((state) => {
                    if (state.isVictory) return state; // Block count if won
                    return { current_count: state.current_count + 1 };
                });
            },
            decrement: () => {
                get().updatePlaytime();
                set((state) => {
                    if (state.isVictory) return state; // Block count if won
                    return { current_count: Math.max(0, state.current_count - 1) };
                });
            },
            reset: () => set({
                current_count: 0,
                timestamp_start: Date.now(),
                active_playtime_ms: 0,
                last_active_timestamp: Date.now(),
                isVictory: false
            }),
            setPokemon: (name: string, odds: number) => set({ pokemon_name: name, odds_base: odds }),
            setVictory: (status: boolean) => set({ isVictory: status }),
            setHasSeenTutorial: (status: boolean) => set({ hasSeenTutorial: status }),

            // Playtime Logic
            resumePlaytime: () => set({ last_active_timestamp: Date.now() }),
            pausePlaytime: () => {
                get().updatePlaytime(); // commit the running time before pausing
                // Setting last_active to 0 effectively marks it as "paused"
                set({ last_active_timestamp: 0 });
            },
            updatePlaytime: () => set((state) => {
                if (state.last_active_timestamp === 0 || state.isVictory) return state;

                const now = Date.now();
                const delta = now - state.last_active_timestamp;

                // If the delta is suspiciously large without interaction (e.g. > 2 minutes), 
                // we assume they left the phone alone without locking it. Cap the addition to 2 minutes.
                const MAX_IDLE_TIME = 2 * 60 * 1000;
                const timeToAdd = Math.min(delta, MAX_IDLE_TIME);

                return {
                    active_playtime_ms: state.active_playtime_ms + timeToAdd,
                    last_active_timestamp: now
                };
            }),
        }),
        {
            name: 'shiny-tracker-storage',
        }
    )
);
