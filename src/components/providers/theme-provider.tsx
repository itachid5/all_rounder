"use client";
import React, { createContext, useState, useCallback, useEffect, useContext } from "react";

const ThemeContext = createContext<any>(null);

export function ThemeProvider({ children, defaultTheme = "system", attribute = "class", enableSystem = true, disableTransitionOnChange = false }: any) {
  const [theme, setThemeState] = useState(defaultTheme);

  const setTheme = useCallback((newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    const resolvedTheme = newTheme === "system" && enableSystem 
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : newTheme;
    
    if (attribute === "class") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(resolvedTheme);
      document.documentElement.style.colorScheme = resolvedTheme;
    }
  }, [attribute, enableSystem]);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) {
      setTheme(stored);
    } else {
      setTheme(defaultTheme);
    }
  }, [setTheme, defaultTheme]);

  // Handle system preference changes
  useEffect(() => {
    if (theme !== "system" || !enableSystem) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => setTheme("system");
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme, enableSystem, setTheme]);

  const resolvedTheme = theme === "system" ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, themes: ["light", "dark", "system"] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
