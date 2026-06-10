import { create } from "zustand";

interface ThemeState {
  dark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  dark: localStorage.getItem("darkMode") === "true",
  toggle: () =>
    set((state) => {
      const next = !state.dark;
      localStorage.setItem("darkMode", String(next));
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { dark: next };
    }),
}));
