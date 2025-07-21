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
import { converter } from "culori";

// Simple predefined colors
const predefinedColors = [
  { name: "Blue", primary: "#3b82f6", secondary: "#dbeafe" },
  { name: "Green", primary: "#10b981", secondary: "#d1fae5" },
  { name: "Purple", primary: "#8b5cf6", secondary: "#ede9fe" },
  { name: "Orange", primary: "#f59e0b", secondary: "#fef3c7" },
  { name: "Pink", primary: "#ec4899", secondary: "#fce7f3" },
  { name: "Red", primary: "#ef4444", secondary: "#fee2e2" },
  { name: "Teal", primary: "#14b8a6", secondary: "#ccfbf1" },
  { name: "Yellow", primary: "#eab308", secondary: "#fefce8" },
]

export function SimpleColorPicker() {
  const { customColors, setCustomColors } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [tempPrimary, setTempPrimary] = useState("#3b82f6")
  const [tempSecondary, setTempSecondary] = useState("#dbeafe")

  // Initialize when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      // Convert OKLCH to hex for display (simplified)
      setTempPrimary("#3b82f6") // Default blue
      setTempSecondary("#dbeafe") // Default light blue
    }
  }, [isOpen])


  const hexToOklch = converter("oklch");

  console.log(customColors)


  
  const handleApply = () => {
    setCustomColors({
      primary: hexToOklch(tempPrimary)?.toString() || tempPrimary,
      secondary: hexToOklch(tempSecondary)?.toString() || tempSecondary,
    });
    setIsOpen(false);
  };
  

  const handleReset = () => {
    const defaultColors = {
      primary: "oklch(0.6171 0.1375 39.0427)",
      secondary: "oklch(0.9245 0.0138 92.9892)"
    }
    setCustomColors(defaultColors)
    setTempPrimary("#3b82f6")
    setTempSecondary("#dbeafe")
  }

  const handleColorSelect = (color: typeof predefinedColors[0]) => {
    setTempPrimary(color.primary)
    setTempSecondary(color.secondary)
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
            Choose Colors
          </DialogTitle>
          <DialogDescription>
            Select your preferred primary and secondary colors.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Predefined Colors */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Quick Colors</Label>
            <div className="grid grid-cols-4 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorSelect(color)}
                  className="group relative p-3 rounded-lg border-2 transition-all hover:scale-105"
                  title={color.name}
                >
                  <div className="flex flex-col gap-1">
                    <div
                      className="h-6 w-full rounded border"
                      style={{ backgroundColor: color.primary }}
                    />
                    <div
                      className="h-4 w-full rounded border"
                      style={{ backgroundColor: color.secondary }}
                    />
                  </div>
                  <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {color.name}
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
                    value={tempPrimary}
                    onChange={(e) => setTempPrimary(e.target.value)}
                    className="w-12 h-10 p-1 border rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={tempPrimary}
                    onChange={(e) => setTempPrimary(e.target.value)}
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
                    value={tempSecondary}
                    onChange={(e) => setTempSecondary(e.target.value)}
                    className="w-12 h-10 p-1 border rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={tempSecondary}
                    onChange={(e) => setTempSecondary(e.target.value)}
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
                <Button size="sm" style={{ backgroundColor: tempPrimary, color: 'white' }}>
                  Primary Button
                </Button>
                <Button variant="secondary" size="sm" style={{ backgroundColor: tempSecondary }}>
                  Secondary Button
                </Button>
              </div>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: tempPrimary }}
                />
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: tempSecondary }}
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