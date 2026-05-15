import { createContext, useContext, useEffect, useState } from "react";
import { getCookie, setCookie, removeCookie } from "@/lib/cookies";

type Theme = "dark" | "light";

const DEFAULT_THEME = "light";
const THEME_COOKIE_NAME = "vite-ui-theme";
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  defaultTheme: Theme;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resetTheme: () => void;
};

const initialState: ThemeProviderState = {
  defaultTheme: DEFAULT_THEME,
  theme: DEFAULT_THEME,
  setTheme: () => null,
  resetTheme: () => null,
};

const ThemeContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  storageKey = THEME_COOKIE_NAME,
  ...props
}: ThemeProviderProps) {
  const [theme, _setTheme] = useState<Theme>(() => {
    const cookieValue = getCookie(storageKey) as Theme;
    if (cookieValue === "light" || cookieValue === "dark") return cookieValue;
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (currentTheme: Theme) => {
      // Create a style element to disable transitions
      const disableTransitions = document.createElement("style");
      disableTransitions.appendChild(
        document.createTextNode(
          `* {
            -webkit-transition: none !important;
            -moz-transition: none !important;
            -o-transition: none !important;
            -ms-transition: none !important;
            transition: none !important;
          }`
        )
      );
      document.head.appendChild(disableTransitions);

      root.classList.remove("light", "dark"); // Remove existing theme classes
      root.classList.add(currentTheme); // Add the new theme class
      root.style.colorScheme = currentTheme; // Set the color scheme

      // Force a reflow to ensure the theme change is applied without transitions
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      window.getComputedStyle(disableTransitions).opacity;

      // Remove the style element to re-enable transitions
      document.head.removeChild(disableTransitions);
    };

    applyTheme(theme);
  }, [theme]);

  const setTheme = (theme: Theme) => {
    setCookie(storageKey, theme, THEME_COOKIE_MAX_AGE);
    _setTheme(theme);
  };

  const resetTheme = () => {
    removeCookie(storageKey);
    _setTheme(DEFAULT_THEME);
  };

  const contextValue = {
    defaultTheme,
    resetTheme,
    theme,
    setTheme,
  };

  return (
    <ThemeContext value={contextValue} {...props}>
      {children}
    </ThemeContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
