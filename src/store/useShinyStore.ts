import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ShinyState {
    pokemon_name: string;
    current_count: number;
    odds_base: number;
    timestamp_start: number;
    isVictory: boolean;
    increment: () => void;
    decrement: () => void;
    reset: () => void;
    setPokemon: (name: string, odds: number) => void;
    setVictory: (status: boolean) => void;
}

export const useShinyStore = create<ShinyState>()(
    persist(
        (set) => ({
            pokemon_name: 'Squirtle', // Default selected pokemon
            current_count: 0,
            odds_base: 8192,
            timestamp_start: Date.now(),
            isVictory: false,
            increment: () => set((state) => {
                if (state.isVictory) return state; // Block count if won
                return { current_count: state.current_count + 1 };
            }),
            decrement: () => set((state) => {
                if (state.isVictory) return state; // Block count if won
                return { current_count: Math.max(0, state.current_count - 1) };
            }),
            reset: () => set({ current_count: 0, timestamp_start: Date.now(), isVictory: false }),
            setPokemon: (name: string, odds: number) => set({ pokemon_name: name, odds_base: odds }),
            setVictory: (status: boolean) => set({ isVictory: status }),
        }),
        {
            name: 'shiny-tracker-storage',
        }
    )
);
