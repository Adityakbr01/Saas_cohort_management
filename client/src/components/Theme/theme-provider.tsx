import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "dark" | "light" | "system"

type CustomColors = {
  primary: string
  secondary: string
}

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultColors?: CustomColors
  storageKey?: string
  colorsStorageKey?: string
  colorSchemeKey?: string
}

type ThemeProviderState = {
  theme: Theme
  customColors: CustomColors
  colorScheme: string
  setTheme: (theme: Theme) => void
  setCustomColors: (colors: CustomColors) => void
  updatePrimaryColor: (color: string) => void
  updateSecondaryColor: (color: string) => void
  setColorScheme: (scheme: string) => void
}

const defaultColors: CustomColors = {
  primary: "oklch(0.6171 0.1375 39.0427)",
  secondary: "oklch(0.9245 0.0138 92.9892)",
}

const initialState: ThemeProviderState = {
  theme: "system",
  customColors: defaultColors,
  colorScheme: "default",
  setTheme: () => null,
  setCustomColors: () => null,
  updatePrimaryColor: () => null,
  updateSecondaryColor: () => null,
  setColorScheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColors: initialColors = defaultColors,
  storageKey = "vite-ui-theme",
  colorsStorageKey = "vite-ui-custom-colors",
  colorSchemeKey = "vite-ui-color-scheme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  const [customColors, setCustomColors] = useState<CustomColors>(() => {
    const saved = localStorage.getItem(colorsStorageKey)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return initialColors
      }
    }
    return initialColors
  })

  const [colorScheme, setColorSchemeState] = useState<string>(() => {
    return localStorage.getItem(colorSchemeKey) || "default"
  })

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }

    root.style.setProperty("--custom-primary", customColors.primary)
    root.style.setProperty("--custom-secondary", customColors.secondary)
  }, [theme, customColors])

  const updatePrimaryColor = (color: string) => {
    const newColors = { ...customColors, primary: color }
    setCustomColors(newColors)
    localStorage.setItem(colorsStorageKey, JSON.stringify(newColors))
  }

  const updateSecondaryColor = (color: string) => {
    const newColors = { ...customColors, secondary: color }
    setCustomColors(newColors)
    localStorage.setItem(colorsStorageKey, JSON.stringify(newColors))
  }

  const value: ThemeProviderState = {
    theme,
    customColors,
    colorScheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    setCustomColors: (colors: CustomColors) => {
      localStorage.setItem(colorsStorageKey, JSON.stringify(colors))
      setCustomColors(colors)
    },
    updatePrimaryColor,
    updateSecondaryColor,
    setColorScheme: (scheme: string) => {
      setColorSchemeState(scheme)
      localStorage.setItem(colorSchemeKey, scheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export type { CustomColors }
