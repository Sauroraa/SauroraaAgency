import { create } from 'zustand';

interface ThemeState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('light', newTheme === 'light');
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('sauroraa-theme', newTheme);
      }
      return { theme: newTheme };
    }),
  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light', theme === 'light');
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('sauroraa-theme', theme);
    }
    set({ theme });
  },
}));
