import { useState } from "react";
import type { ThemeType } from "./themeProvider";
import ThemeContext from "./themeProvider";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType["theme"]>("light");
  console.log("in ThemeProvider");
  const toggleTheme = () => {
    console.log("togglerthem");
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}