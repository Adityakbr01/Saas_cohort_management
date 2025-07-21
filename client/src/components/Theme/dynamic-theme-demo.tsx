import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertCircle,
  CheckCircle,
  
  Eye,
  
  Info,
  Palette,
  Settings,
  Sun
} from "lucide-react"
import { CombinedThemeSwitcher, CompactThemeSwitcher } from "./combined-theme-switcher"
import { CompactColorPicker, DynamicColorPicker } from "./dynamic-color-picker"
import { ModeToggle } from "./mode-toggle"
import { useTheme } from "./theme-provider"

export function DynamicThemeDemo() {
  const { theme, customColors } = useTheme()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Dynamic Theme Customization</h1>
          <p className="text-muted-foreground text-lg">
            Choose your own primary and secondary colors for a truly personalized experience
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <Sun className="h-3 w-3" />
              Current Theme: {theme}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <Palette className="h-3 w-3" />
              Custom Colors Active
            </Badge>
          </div>
        </div>

        {/* Component Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Combined Theme Switcher */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Combined Theme Switcher
              </CardTitle>
              <CardDescription>
                All-in-one switcher with theme mode and dynamic color picker
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <CombinedThemeSwitcher />
              </div>
              <div className="text-sm text-muted-foreground">
                Theme mode toggle + dynamic color picker in one component
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Color Picker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Dynamic Color Picker
              </CardTitle>
              <CardDescription>
                Full-featured color customization with preview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <DynamicColorPicker />
              </div>
              <div className="text-sm text-muted-foreground">
                Choose from presets or pick custom colors with live preview
              </div>
            </CardContent>
          </Card>

          {/* Compact Theme Switcher */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Compact Theme Switcher
              </CardTitle>
              <CardDescription>
                Space-efficient version for mobile layouts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <CompactThemeSwitcher />
              </div>
              <div className="text-sm text-muted-foreground">
                Separate buttons for theme mode and color picker
              </div>
            </CardContent>
          </Card>

          {/* Compact Color Picker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Compact Color Picker
              </CardTitle>
              <CardDescription>
                Minimal popover for quick color changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <CompactColorPicker />
              </div>
              <div className="text-sm text-muted-foreground">
                Quick access to primary and secondary color controls
              </div>
            </CardContent>
          </Card>

          {/* Original Mode Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Original Mode Toggle
              </CardTitle>
              <CardDescription>
                The original dark/light mode toggle with custom CSS animation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <ModeToggle />
              </div>
              <div className="text-sm text-muted-foreground">
                Still available for theme mode switching only
              </div>
            </CardContent>
          </Card>

          {/* Current Colors Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Current Colors
              </CardTitle>
              <CardDescription>
                Your currently selected primary and secondary colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: customColors.primary }}
                  />
                  <div>
                    <div className="text-sm font-medium">Primary</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {customColors.primary}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: customColors.secondary }}
                  />
                  <div>
                    <div className="text-sm font-medium">Secondary</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {customColors.secondary}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              See how your custom colors look in real UI components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Buttons</h4>
                <div className="flex flex-col gap-2">
                  <Button>Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="outline">Outline Button</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Badges</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Links</h4>
                <div className="space-y-1">
                  <a href="#" className="text-primary hover:underline block">Primary Link</a>
                  <a href="#" className="text-secondary-foreground hover:underline block">Secondary Link</a>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Color Swatches</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    className="w-full h-12 rounded border"
                    style={{ backgroundColor: customColors.primary }}
                  />
                  <div 
                    className="w-full h-12 rounded border"
                    style={{ backgroundColor: customColors.secondary }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Examples</CardTitle>
            <CardDescription>
              How to integrate dynamic color customization into your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">1. Import the components</h4>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
{`import { CombinedThemeSwitcher } from "@/components/Theme/combined-theme-switcher"
import { DynamicColorPicker } from "@/components/Theme/dynamic-color-picker"
import { useTheme } from "@/components/Theme/theme-provider"`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Use in your component</h4>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
{`function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>My App</h1>
      <CombinedThemeSwitcher />
    </header>
  )
}`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Access custom colors</h4>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
{`import { useTheme } from "@/components/Theme/theme-provider"

function MyComponent() {
  const { theme, customColors, updatePrimaryColor, updateSecondaryColor } = useTheme()
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Primary color: {customColors.primary}</p>
      <p>Secondary color: {customColors.secondary}</p>
      
      <button onClick={() => updatePrimaryColor("oklch(0.55 0.15 250)")}>
        Set Blue Primary
      </button>
    </div>
  )
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">Dynamic Color Selection</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Custom primary and secondary colors</li>
                  <li>• Color picker with hex input</li>
                  <li>• Predefined color palettes</li>
                  <li>• Live preview of changes</li>
                  <li>• OKLCH color space support</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Theme Modes</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Light, Dark, and System modes</li>
                  <li>• Persistent storage</li>
                  <li>• Automatic CSS variable updates</li>
                  <li>• Responsive design</li>
                  <li>• Accessible components</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 