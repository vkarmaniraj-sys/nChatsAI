import { createContext } from "react";

export type ThemeType = {
  theme: string;
  toggleTheme: () => void;
};

// Create context, but allow null initially
const ThemeContext = createContext<ThemeType>({theme:"light",toggleTheme:()=>{}});

// export function useTheme(): ThemeType {
//   const context = useContext(ThemeContext);

//   if (!context) {
//     throw new Error("useTheme must be used inside a ThemeProvider");
//   }

//   return context; // ✅ always ThemeType, never null/undefined
// }

export default ThemeContext;