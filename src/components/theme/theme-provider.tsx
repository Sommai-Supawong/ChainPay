"use client";

import { createContext, useContext, useState } from "react";
import { api } from "@/lib/client-api";

export type Theme = "dark" | "light";

const ThemeContext = createContext<{
  theme: Theme;
  changeTheme: (next: Theme) => Promise<void>;
} | null>(null);

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  async function changeTheme(next: Theme) {
    if (next === theme) return;
    const previous = theme;
    setTheme(next);
    try {
      await api("settings/theme", { method: "PATCH", body: { theme: next } });
    } catch (error) {
      setTheme(previous);
      throw error;
    }
  }
  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("ThemeProvider is missing.");
  return context;
}

export function useThemeOptional(): { theme: Theme } {
  const context = useContext(ThemeContext);
  return context ?? { theme: "dark" };
}
