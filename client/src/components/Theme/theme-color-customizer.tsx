import React, { useState } from "react"
import { useTheme } from "./theme-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Palette, RotateCcw, Check } from "lucide-react"

// Famous and quick palettes (hex for UI, OKLCH for storage)
const quickPalettes = [
  { name: "Tailwind Blue", primary: "#3b82f6", secondary: "#dbeafe", oklchPrimary: "oklch(0.55 0.15 250)", oklchSecondary: "oklch(0.85 0.05 250)" },
  { name: "Material Green", primary: "#43a047", secondary: "#e8f5e9", oklchPrimary: "oklch(0.55 0.15 140)", oklchSecondary: "oklch(0.85 0.05 140)" },
  { name: "Bootstrap Purple", primary: "#6f42c1", secondary: "#f5f0fa", oklchPrimary: "oklch(0.55 0.15 280)", oklchSecondary: "oklch(0.85 0.05 280)" },
  { name: "FlatUI Orange", primary: "#f39c12", secondary: "#fef5e7", oklchPrimary: "oklch(0.65 0.15 60)", oklchSecondary: "oklch(0.85 0.05 60)" },
  { name: "Vercel Black", primary: "#000000", secondary: "#fafafa", oklchPrimary: "oklch(0.2 0.01 270)", oklchSecondary: "oklch(0.98 0.01 270)" },
  { name: "GitHub Dark", primary: "#24292f", secondary: "#f6f8fa", oklchPrimary: "oklch(0.25 0.01 270)", oklchSecondary: "oklch(0.98 0.01 270)" },
  { name: "Notion", primary: "#000000", secondary: "#f7f6f3", oklchPrimary: "oklch(0.2 0.01 270)", oklchSecondary: "oklch(0.98 0.01 270)" },
  { name: "Discord", primary: "#5865f2", secondary: "#f6f6f6", oklchPrimary: "oklch(0.55 0.15 250)", oklchSecondary: "oklch(0.98 0.01 270)" },
  { name: "Spotify", primary: "#1db954", secondary: "#191414", oklchPrimary: "oklch(0.55 0.15 140)", oklchSecondary: "oklch(0.2 0.01 270)" },
  { name: "Netflix", primary: "#e50914", secondary: "#221f1f", oklchPrimary: "oklch(0.65 0.15 20)", oklchSecondary: "oklch(0.2 0.01 270)" },
  { name: "Twitter", primary: "#1da1f2", secondary: "#e8f5fd", oklchPrimary: "oklch(0.55 0.15 250)", oklchSecondary: "oklch(0.98 0.01 270)" },
  { name: "Facebook", primary: "#1877f3", secondary: "#e7f0fd", oklchPrimary: "oklch(0.55 0.15 250)", oklchSecondary: "oklch(0.98 0.01 270)" },
  { name: "Instagram", primary: "#e1306c", secondary: "#fdf6f0", oklchPrimary: "oklch(0.65 0.15 340)", oklchSecondary: "oklch(0.98 0.01 270)" },
  { name: "YouTube", primary: "#ff0000", secondary: "#f9f9f9", oklchPrimary: "oklch(0.65 0.15 20)", oklchSecondary: "oklch(0.98 0.01 270)" },
  { name: "WhatsApp", primary: "#25d366", secondary: "#ece5dd", oklchPrimary: "oklch(0.55 0.15 140)", oklchSecondary: "oklch(0.98 0.01 270)" },
  { name: "Slack", primary: "#611f69", secondary: "#f8f8fa", oklchPrimary: "oklch(0.55 0.15 280)", oklchSecondary: "oklch(0.98 0.01 270)" },
  { name: "Figma", primary: "#0acf83", secondary: "#f6f6f6", oklchPrimary: "oklch(0.55 0.15 140)", oklchSecondary: "oklch(0.98 0.01 270)" },
  { name: "Airbnb", primary: "#ff5a5f", secondary: "#f7f7f7", oklchPrimary: "oklch(0.65 0.15 20)", oklchSecondary: "oklch(0.98 0.01 270)" },
  { name: "Stripe", primary: "#635bff", secondary: "#f6f9fc", oklchPrimary: "oklch(0.55 0.15 250)", oklchSecondary: "oklch(0.98 0.01 270)" },
  { name: "Shopify", primary: "#96bf48", secondary: "#f4f6f8", oklchPrimary: "oklch(0.55 0.15 140)", oklchSecondary: "oklch(0.98 0.01 270)" },
  { name: "Duolingo", primary: "#58cc02", secondary: "#f7f7f7", oklchPrimary: "oklch(0.55 0.15 140)", oklchSecondary: "oklch(0.98 0.01 270)" },
  { name: "Dropbox", primary: "#0061ff", secondary: "#f7f9fa", oklchPrimary: "oklch(0.55 0.15 250)", oklchSecondary: "oklch(0.98 0.01 270)" },
  { name: "Asana", primary: "#fc636b", secondary: "#fdf6f0", oklchPrimary: "oklch(0.65 0.15 20)", oklchSecondary: "oklch(0.98 0.01 270)" },
  { name: "Trello", primary: "#0079bf", secondary: "#f4f5f7", oklchPrimary: "oklch(0.55 0.15 250)", oklchSecondary: "oklch(0.98 0.01 270)" },
]

// Convert OKLCH to hex using a temporary element
function oklchToHex(oklch: string): string {
  const temp = document.createElement('div')
  temp.style.color = oklch
  document.body.appendChild(temp)
  const computed = window.getComputedStyle(temp)
  const hex = computed.color
  document.body.removeChild(temp)
  if (hex.startsWith('rgb')) {
    const rgb = hex.match(/\d+/g)
    if (rgb && rgb.length >= 3) {
      const r = parseInt(rgb[0])
      const g = parseInt(rgb[1])
      const b = parseInt(rgb[2])
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }
  }
  return hex
}

// Use a color library for real hex <-> OKLCH conversion in production
// For now, store hex and use fallback OKLCH for storage
function hexToOklch(hex: string, fallback: string): string {
  // Remove #
  hex = hex.replace('#', '')
  if (hex.length !== 6) return fallback
  // In production, use a color lib for real conversion
  return fallback
}

export function ThemeColorCustomizer() {
  const { customColors, setCustomColors } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [primaryHex, setPrimaryHex] = useState("#3b82f6")
  const [secondaryHex, setSecondaryHex] = useState("#dbeafe")
  const [primaryOklch, setPrimaryOklch] = useState("oklch(0.55 0.15 250)")
  const [secondaryOklch, setSecondaryOklch] = useState("oklch(0.85 0.05 250)")

  React.useEffect(() => {
    if (isOpen) {
      setPrimaryHex(oklchToHex(customColors.primary))
      setSecondaryHex(oklchToHex(customColors.secondary))
      setPrimaryOklch(customColors.primary)
      setSecondaryOklch(customColors.secondary)
    }
  }, [isOpen, customColors])

  // When user picks from color wheel or text input
  const handlePrimaryChange = (hex: string) => {
    setPrimaryHex(hex)
    setPrimaryOklch(hexToOklch(hex, primaryOklch))
    setCustomColors({ primary: hexToOklch(hex, primaryOklch), secondary: secondaryOklch })
  }
  const handleSecondaryChange = (hex: string) => {
    setSecondaryHex(hex)
    setSecondaryOklch(hexToOklch(hex, secondaryOklch))
    setCustomColors({ primary: primaryOklch, secondary: hexToOklch(hex, secondaryOklch) })
  }

  // When user clicks a quick palette
  const handlePalette = (palette: typeof quickPalettes[0]) => {
    setPrimaryHex(palette.primary)
    setSecondaryHex(palette.secondary)
    setPrimaryOklch(palette.oklchPrimary)
    setSecondaryOklch(palette.oklchSecondary)
    setCustomColors({ primary: palette.oklchPrimary, secondary: palette.oklchSecondary })
  }

  const handleApply = () => {
    setCustomColors({ primary: primaryOklch, secondary: secondaryOklch })
    setIsOpen(false)
  }
  const handleReset = () => {
    setPrimaryHex("#3b82f6")
    setSecondaryHex("#dbeafe")
    setPrimaryOklch("oklch(0.6171 0.1375 39.0427)")
    setSecondaryOklch("oklch(0.9245 0.0138 92.9892)")
    setCustomColors({ primary: "oklch(0.6171 0.1375 39.0427)", secondary: "oklch(0.9245 0.0138 92.9892)" })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Customize colors</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-background overflow-y-scroll scrollbar-hide h-screen">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Customize Colors
          </DialogTitle>
          <DialogDescription>
            Choose your own primary and secondary colors for a personalized experience.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Quick Palettes */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Famous & Quick Palettes</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {quickPalettes.map((palette) => (
                <button
                  key={palette.name}
                  onClick={() => handlePalette(palette)}
                  className="group relative p-3 rounded-lg border-2 transition-all hover:scale-105"
                  title={palette.name}
                >
                  <div className="flex flex-col gap-1">
                    <div
                      className="h-6 w-full rounded border"
                      style={{ backgroundColor: palette.primary }}
                    />
                    <div
                      className="h-4 w-full rounded border"
                      style={{ backgroundColor: palette.secondary }}
                    />
                  </div>
                  <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {palette.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <Separator />
          {/* Custom Color Inputs */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Custom Colors</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color" className="text-sm">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={primaryHex}
                    onChange={(e) => handlePrimaryChange(e.target.value)}
                    className="w-12 h-10 p-1 border rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={primaryHex}
                    onChange={(e) => handlePrimaryChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 font-mono text-sm"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Used for buttons, links, and highlights
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-color" className="text-sm">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={secondaryHex}
                    onChange={(e) => handleSecondaryChange(e.target.value)}
                    className="w-12 h-10 p-1 border rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={secondaryHex}
                    onChange={(e) => handleSecondaryChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 font-mono text-sm"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Used for backgrounds and subtle elements
                </div>
              </div>
            </div>
          </div>
          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Preview</Label>
            <div className="p-4 rounded-lg border bg-background">
              <div className="flex gap-2 mb-3">
                <Button size="sm" style={{ backgroundColor: primaryHex, color: 'white' }}>
                  Primary Button
                </Button>
                <Button variant="secondary" size="sm" style={{ backgroundColor: secondaryHex }}>
                  Secondary Button
                </Button>
              </div>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: primaryHex }}
                />
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: secondaryHex }}
                />
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApply} className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Apply Colors
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 