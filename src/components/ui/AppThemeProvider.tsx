"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const STORAGE_KEY = "gospelagc-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
};

type AppThemeProviderProps = {
  children: React.ReactNode;
};

export default function AppThemeProvider({
  children,
}: AppThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    return storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : "dark";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: (nextTheme) => {
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
        setThemeState(nextTheme);
        applyTheme(nextTheme);
      },
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useAppTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider.");
  }

  return context;
};
