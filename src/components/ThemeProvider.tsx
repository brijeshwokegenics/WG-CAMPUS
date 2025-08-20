
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Custom hook to manage color theme separately
export function useColorTheme() {
    const { setTheme: setNextTheme, themes } = useTheme();

    const setColorTheme = (theme: string) => {
        if (themes.includes(theme)) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('color-theme', theme);
        }
    }

    React.useEffect(() => {
        const savedTheme = localStorage.getItem('color-theme');
        if (savedTheme && themes.includes(savedTheme)) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
             document.documentElement.setAttribute('data-theme', 'blue');
        }
    }, [themes]);
    
    return { setColorTheme, setMode: setNextTheme };
}
