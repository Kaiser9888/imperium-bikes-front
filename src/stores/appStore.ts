import { create } from 'zustand'

interface AppState {
    isMenuOpen: boolean
    isAuthenticated: boolean
    user: null | any
    toggleMenu: () => void
    setAuthenticated: (value: boolean) => void
    setUser: (user: any) => void
}

export const useAppStore = create<AppState>((set) => ({
    isMenuOpen: false,
    isAuthenticated: false,
    user: null,
    toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
    setAuthenticated: (value) => set({ isAuthenticated: value }),
    setUser: (user) => set({ user }),
}))