import React, { createContext, useState } from "react";
import type { ThemeContextType } from "../types";

// ============================================================================
// THEME CONTEXT - Light & Dark Mode Toggle
// ============================================================================

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // Default Dark Mode

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div
        className={
          isDarkMode
            ? "dark bg-[#0B0F19] text-[#F3F4F6]"
            : "bg-[#F9F9F9] text-[#111111]"
        }
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
