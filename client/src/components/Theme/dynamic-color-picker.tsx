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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Palette, RotateCcw, Check } from "lucide-react"

// Predefined color palettes for quick selection
const colorPalettes = [
  {
    name: "Modern Blue",
    primary: "oklch(0.55 0.15 250)",
    secondary: "oklch(0.85 0.05 250)"
  },
  {
    name: "Nature Green",
    primary: "oklch(0.55 0.15 140)",
    secondary: "oklch(0.85 0.05 140)"
  },
  {
    name: "Royal Purple",
    primary: "oklch(0.55 0.15 280)",
    secondary: "oklch(0.85 0.05 280)"
  },
  {
    name: "Warm Orange",
    primary: "oklch(0.65 0.15 60)",
    secondary: "oklch(0.85 0.05 60)"
  },
  {
    name: "Vibrant Pink",
    primary: "oklch(0.65 0.15 340)",
    secondary: "oklch(0.85 0.05 340)"
  },
  {
    name: "Bold Red",
    primary: "oklch(0.65 0.15 20)",
    secondary: "oklch(0.85 0.05 20)"
  },
  {
    name: "Ocean Teal",
    primary: "oklch(0.55 0.15 180)",
    secondary: "oklch(0.85 0.05 180)"
  },
  {
    name: "Sunset Yellow",
    primary: "oklch(0.75 0.15 90)",
    secondary: "oklch(0.85 0.05 90)"
  }
]

// Convert OKLCH to hex for color input
function oklchToHex(oklch: string): string {
  // Create a temporary element to convert OKLCH to hex
  const temp = document.createElement('div')
  temp.style.color = oklch
  document.body.appendChild(temp)
  
  // Get computed style
  const computed = window.getComputedStyle(temp)
  const hex = computed.color
  
  // Clean up
  document.body.removeChild(temp)
  
  // Convert rgb to hex if needed
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

// Convert hex to OKLCH (simplified but functional)
function hexToOklch(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '')
  
  // Parse hex to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255
  const g = parseInt(hex.substr(2, 2), 16) / 255
  const b = parseInt(hex.substr(4, 2), 16) / 255
  
  // Convert RGB to HSL to get hue
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  
  let h = 0
  let s = 0
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  // Convert to degrees
  const hue = h * 360
  
  // Create OKLCH approximation
  // This is a simplified conversion - for production, use a proper color library
  const lightness = l * 0.8 + 0.2 // Adjust lightness range
  const chroma = s * 0.3 // Adjust chroma range
  
  return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(1)})`
}

export function DynamicColorPicker() {
  const { customColors, setCustomColors } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [tempColors, setTempColors] = useState(customColors)
  const [primaryHex, setPrimaryHex] = useState("")
  const [secondaryHex, setSecondaryHex] = useState("")

  // Initialize hex values when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setTempColors(customColors)
      setPrimaryHex(oklchToHex(customColors.primary))
      setSecondaryHex(oklchToHex(customColors.secondary))
    }
  }, [isOpen, customColors])

  const handlePrimaryChange = (hexColor: string) => {
    setPrimaryHex(hexColor)
    const oklchColor = hexToOklch(hexColor)
    setTempColors(prev => ({ ...prev, primary: oklchColor }))
  }

  const handleSecondaryChange = (hexColor: string) => {
    setSecondaryHex(hexColor)
    const oklchColor = hexToOklch(hexColor)
    setTempColors(prev => ({ ...prev, secondary: oklchColor }))
  }

  const handleApply = () => {
    setCustomColors(tempColors)
    setIsOpen(false)
  }

  const handleReset = () => {
    const defaultColors = {
      primary: "oklch(0.6171 0.1375 39.0427)",
      secondary: "oklch(0.9245 0.0138 92.9892)"
    }
    setTempColors(defaultColors)
    setPrimaryHex(oklchToHex(defaultColors.primary))
    setSecondaryHex(oklchToHex(defaultColors.secondary))
    setCustomColors(defaultColors)
  }

  const handlePaletteSelect = (palette: typeof colorPalettes[0]) => {
    setTempColors({
      primary: palette.primary,
      secondary: palette.secondary
    })
    setPrimaryHex(oklchToHex(palette.primary))
    setSecondaryHex(oklchToHex(palette.secondary))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Customize colors</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
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
          {/* Quick Color Palettes */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Quick Palettes</Label>
            <div className="grid grid-cols-4 gap-2">
              {colorPalettes.map((palette) => (
                <button
                  key={palette.name}
                  onClick={() => handlePaletteSelect(palette)}
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
                <Button size="sm" style={{ backgroundColor: tempColors.primary, color: 'white' }}>
                  Primary Button
                </Button>
                <Button variant="secondary" size="sm" style={{ backgroundColor: tempColors.secondary }}>
                  Secondary Button
                </Button>
              </div>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: tempColors.primary }}
                />
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: tempColors.secondary }}
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

// Compact version for mobile
export function CompactColorPicker() {
  const { customColors, updatePrimaryColor, updateSecondaryColor } = useTheme()
  const [primaryHex, setPrimaryHex] = useState("")
  const [secondaryHex, setSecondaryHex] = useState("")

  React.useEffect(() => {
    setPrimaryHex(oklchToHex(customColors.primary))
    setSecondaryHex(oklchToHex(customColors.secondary))
  }, [customColors])

  const handlePrimaryChange = (hexColor: string) => {
    setPrimaryHex(hexColor)
    updatePrimaryColor(hexToOklch(hexColor))
  }

  const handleSecondaryChange = (hexColor: string) => {
    setSecondaryHex(hexColor)
    updateSecondaryColor(hexToOklch(hexColor))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: customColors.primary }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Primary Color</Label>
            <Input
              type="color"
              value={primaryHex}
              onChange={(e) => handlePrimaryChange(e.target.value)}
              className="w-full h-10 p-1 border rounded cursor-pointer"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Secondary Color</Label>
            <Input
              type="color"
              value={secondaryHex}
              onChange={(e) => handleSecondaryChange(e.target.value)}
              className="w-full h-10 p-1 border rounded cursor-pointer"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 