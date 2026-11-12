"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

type WorkspaceTheme = "dark" | "light";
type ThemeContextValue = { theme: WorkspaceTheme; toggleTheme: () => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

function getThemeSnapshot(): WorkspaceTheme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("internshield-theme");
  return stored === "light" ? "light" : "dark";
}

function getServerThemeSnapshot(): WorkspaceTheme {
  return "dark";
}

function subscribeToTheme(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const update = () => listener();
  window.addEventListener("storage", update);
  window.addEventListener("internshield-theme-change", update);
  return () => {
    window.removeEventListener("storage", update);
    window.removeEventListener("internshield-theme-change", update);
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    toggleTheme: () => {
      const next = getThemeSnapshot() === "dark" ? "light" : "dark";
      localStorage.setItem("internshield-theme", next);
      document.documentElement.dataset.theme = next;
      window.dispatchEvent(new Event("internshield-theme-change"));
    },
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useWorkspaceTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useWorkspaceTheme must be used inside ThemeProvider");
  return context;
}
