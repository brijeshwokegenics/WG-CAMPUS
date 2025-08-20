
"use client"

import * as React from "react"
import { Moon, Sun, Palette } from "lucide-react"
import { useTheme } from "next-themes"
import { useColorTheme } from "@/components/ThemeProvider";

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const colorThemes = [
    { name: 'Blue', color: 'bg-blue-500' },
    { name: 'Green', color: 'bg-green-500' },
    { name: 'Orange', color: 'bg-orange-500' },
    { name: 'Violet', color: 'bg-violet-500' },
    { name: 'Rose', color: 'bg-rose-500' },
]

export function ThemeToggle({ isCollapsed }: { isCollapsed?: boolean }) {
  const { setTheme: setMode } = useTheme()
  const { setColorTheme } = useColorTheme();

  if (isCollapsed !== undefined) {
    // This is the sidebar toggle
    return (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="w-full">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className={cn("ml-3 origin-left duration-200", isCollapsed ? "hidden" : "inline")}>Toggle Theme</span>
              <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Mode</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setMode("light")}>Light</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMode("dark")}>Dark</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMode("system")}>System</DropdownMenuItem>
          <DropdownMenuSeparator />
           <DropdownMenuLabel>Color</DropdownMenuLabel>
            {colorThemes.map(theme => (
                <DropdownMenuItem key={theme.name} onClick={() => setColorTheme(theme.name.toLowerCase())}>
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: `var(--primary)` }} />
                    {theme.name}
                </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // This is the header toggle
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Mode</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setMode("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("system")}>System</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Palette className="mr-2 h-4 w-4" />
                <span>Color Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    {colorThemes.map(theme => (
                        <DropdownMenuItem key={theme.name} onClick={() => setColorTheme(theme.name.toLowerCase())}>
                            <div className={cn("w-4 h-4 rounded-full mr-2", theme.color)} />
                            {theme.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
