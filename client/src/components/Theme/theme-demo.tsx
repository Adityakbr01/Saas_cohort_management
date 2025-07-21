import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Info,
  Palette,
  Settings,
  Sun
} from "lucide-react"
import { CombinedThemeSwitcher, CompactThemeSwitcher } from "./combined-theme-switcher"
import { ModeToggle } from "./mode-toggle"
import { InlineColorSwitcher, ThemeColorPalette, ThemeColorSwitcher } from "./theme-color-switcher"
import { useTheme } from "./theme-provider"

export function ThemeDemo() {
  const { theme, colorScheme } = useTheme()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Theme Switcher Components</h1>
          <p className="text-muted-foreground text-lg">
            Explore different theme switching components built with Tailwind CSS and shadcn/ui
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <Sun className="h-3 w-3" />
              Current Theme: {theme}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <Palette className="h-3 w-3" />
              Color Scheme: {colorScheme}
            </Badge>
          </div>
        </div>

        {/* Component Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                Uses custom CSS animations and provides a smooth toggle experience
              </div>
            </CardContent>
          </Card>

          {/* Color Scheme Switcher */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Scheme Switcher
              </CardTitle>
              <CardDescription>
                Dropdown menu to switch between different color schemes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <ThemeColorSwitcher />
              </div>
              <div className="text-sm text-muted-foreground">
                Choose from 8 different color schemes with visual preview
              </div>
            </CardContent>
          </Card>

          {/* Combined Theme Switcher */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Combined Theme Switcher
              </CardTitle>
              <CardDescription>
                All-in-one switcher for both theme mode and color scheme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <CombinedThemeSwitcher />
              </div>
              <div className="text-sm text-muted-foreground">
                Complete theme control in a single dropdown menu
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
                Space-efficient version for mobile or constrained layouts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <CompactThemeSwitcher />
              </div>
              <div className="text-sm text-muted-foreground">
                Two separate buttons for theme mode and color scheme
              </div>
            </CardContent>
          </Card>

          {/* Color Palette */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Color Palette
              </CardTitle>
              <CardDescription>
                Visual grid layout for color scheme selection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeColorPalette />
            </CardContent>
          </Card>

          {/* Inline Color Switcher */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Inline Color Switcher
              </CardTitle>
              <CardDescription>
                Compact inline version with color dots
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InlineColorSwitcher />
              <div className="text-sm text-muted-foreground">
                Perfect for settings panels or configuration pages
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Examples</CardTitle>
            <CardDescription>
              How to integrate these components into your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">1. Import the components</h4>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
{`import { CombinedThemeSwitcher } from "@/components/Theme/combined-theme-switcher"
import { ThemeColorSwitcher } from "@/components/Theme/theme-color-switcher"
import { ModeToggle } from "@/components/Theme/mode-toggle"`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Use in your component</h4>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
{`function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>My App</h1>
      <div className="flex items-center gap-2">
        <CombinedThemeSwitcher />
        {/* or */}
        <ModeToggle />
        <ThemeColorSwitcher />
      </div>
    </header>
  )
}`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Access theme state</h4>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
{`import { useTheme } from "@/components/Theme/theme-provider"

function MyComponent() {
  const { theme, colorScheme, setTheme, setColorScheme } = useTheme()
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Color scheme: {colorScheme}</p>
    </div>
  )
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Feature List */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Theme Modes</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Light mode</li>
                  <li>• Dark mode</li>
                  <li>• System preference detection</li>
                  <li>• Persistent storage</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Color Schemes</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 8 predefined color schemes</li>
                  <li>• Visual color previews</li>
                  <li>• Automatic CSS variable updates</li>
                  <li>• Responsive design</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 