import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Theme;
}

export function ThemeProvider({
  children,
  initialTheme = 'light',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = window.localStorage.getItem('tech-gear-theme');
    return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : initialTheme;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    window.localStorage.setItem('tech-gear-theme', theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => {
        setTheme((currentTheme) =>
          currentTheme === 'light' ? 'dark' : 'light',
        );
      },
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider.');
  }

  return context;
}
