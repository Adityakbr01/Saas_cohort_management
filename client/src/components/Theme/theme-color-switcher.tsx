import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Check, Palette } from "lucide-react"
import { useTheme } from "./theme-provider"

const colorSchemes = [
  {
    name: "Default",
    value: "default",
    light: "hsl(222.2 84% 4.9%)",
    dark: "hsl(210 40% 98%)",
  },
  {
    name: "Blue",
    value: "blue",
    light: "hsl(221.2 83.2% 53.3%)",
    dark: "hsl(217.2 91.2% 59.8%)",
  },
  {
    name: "Green",
    value: "green",
    light: "hsl(142.1 76.2% 36.3%)",
    dark: "hsl(142.1 70.6% 45.3%)",
  },
  {
    name: "Purple",
    value: "purple",
    light: "hsl(262.1 83.3% 57.8%)",
    dark: "hsl(263.4 70% 50.4%)",
  },
  {
    name: "Orange",
    value: "orange",
    light: "hsl(24.6 95% 53.1%)",
    dark: "hsl(20.5 90.2% 48.2%)",
  },
  {
    name: "Pink",
    value: "pink",
    light: "hsl(346.8 77.2% 49.8%)",
    dark: "hsl(346.8 77.2% 49.8%)",
  },
  {
    name: "Red",
    value: "red",
    light: "hsl(0 84.2% 60.2%)",
    dark: "hsl(0 62.8% 30.6%)",
  },
  {
    name: "Teal",
    value: "teal",
    light: "hsl(173 58% 39%)",
    dark: "hsl(173 58% 39%)",
  },
]

export function ThemeColorSwitcher() {
  const { colorScheme, setColorScheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle color scheme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="grid grid-cols-2 gap-1 p-1">
          {colorSchemes.map((scheme) => (
            <DropdownMenuItem
              key={scheme.value}
              onClick={() => setColorScheme(scheme.value)}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium cursor-pointer transition-colors",
                colorScheme === scheme.value
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full border border-border"
                  style={{
                    backgroundColor: scheme.light,
                  }}
                />
                <span>{scheme.name}</span>
              </div>
              {colorScheme === scheme.value && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Alternative component with a more visual color palette
export function ThemeColorPalette() {
  const { colorScheme, setColorScheme } = useTheme()

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-sm font-medium">Choose Color Scheme</h3>
      <div className="grid grid-cols-4 gap-3">
        {colorSchemes.map((scheme) => (
          <button
            key={scheme.value}
            onClick={() => setColorScheme(scheme.value)}
            className={cn(
              "group relative flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all hover:scale-105",
              colorScheme === scheme.value
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            )}
            title={scheme.name}
          >
            <div
              className="h-8 w-8 rounded-md"
              style={{
                backgroundColor: scheme.light,
              }}
            />
            {colorScheme === scheme.value && (
              <Check className="absolute h-4 w-4 text-primary-foreground drop-shadow-sm" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// Compact inline color switcher
export function InlineColorSwitcher() {
  const { colorScheme, setColorScheme } = useTheme()

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Theme:</span>
      <div className="flex gap-1">
        {colorSchemes.map((scheme) => (
          <button
            key={scheme.value}
            onClick={() => setColorScheme(scheme.value)}
            className={cn(
              "h-6 w-6 rounded-full border-2 transition-all hover:scale-110",
              colorScheme === scheme.value
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            )}
            style={{
              backgroundColor: scheme.light,
            }}
            title={scheme.name}
          />
        ))}
      </div>
    </div>
  )
} 