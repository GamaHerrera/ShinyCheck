import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ShinyState {
    pokemon_name: string;
    current_count: number;
    odds_base: number;
    timestamp_start: number;
    increment: () => void;
    decrement: () => void;
    reset: () => void;
    setPokemon: (name: string, odds: number) => void;
}

export const useShinyStore = create<ShinyState>()(
    persist(
        (set) => ({
            pokemon_name: 'Squirtle', // Default selected pokemon
            current_count: 0,
            odds_base: 8192,
            timestamp_start: Date.now(),
            increment: () => set((state) => ({ current_count: state.current_count + 1 })),
            decrement: () => set((state) => ({ current_count: Math.max(0, state.current_count - 1) })),
            reset: () => set({ current_count: 0, timestamp_start: Date.now() }),
            setPokemon: (name: string, odds: number) => set({ pokemon_name: name, odds_base: odds }),
        }),
        {
            name: 'shiny-tracker-storage',
        }
    )
);
