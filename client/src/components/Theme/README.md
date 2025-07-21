# Dynamic Theme Switcher Components

A comprehensive set of theme switching components built with Tailwind CSS and shadcn/ui that allows users to switch between different theme modes (light/dark/system) and customize their own primary and secondary colors dynamically.

## Features

- 🌙 **Theme Modes**: Light, Dark, and System preference detection
- 🎨 **Dynamic Color Customization**: Choose your own primary and secondary colors
- 🎯 **Color Picker**: Visual color picker with hex input support
- 📋 **Predefined Palettes**: Quick selection from curated color palettes
- 💾 **Persistent Storage**: Theme and color preferences are saved to localStorage
- 📱 **Responsive Design**: Works on all screen sizes
- ♿ **Accessible**: Full keyboard navigation and screen reader support
- 🎯 **TypeScript**: Fully typed with TypeScript

## Components

### 1. CombinedThemeSwitcher
All-in-one theme switcher that combines both theme mode and dynamic color picker in a single component.

```tsx
import { CombinedThemeSwitcher } from "@/components/Theme/combined-theme-switcher"

function Header() {
  return (
    <header>
      <CombinedThemeSwitcher />
    </header>
  )
}
```

### 2. DynamicColorPicker
Full-featured color customization dialog with predefined palettes and custom color selection.

```tsx
import { DynamicColorPicker } from "@/components/Theme/dynamic-color-picker"

function Settings() {
  return (
    <div>
      <DynamicColorPicker />
    </div>
  )
}
```

### 3. CompactColorPicker
Compact popover version for quick color changes.

```tsx
import { CompactColorPicker } from "@/components/Theme/dynamic-color-picker"

function MobileHeader() {
  return (
    <header>
      <CompactColorPicker />
    </header>
  )
}
```

### 4. CompactThemeSwitcher
Space-efficient version with separate buttons for theme mode and color picker.

```tsx
import { CompactThemeSwitcher } from "@/components/Theme/combined-theme-switcher"

function MobileHeader() {
  return (
    <header>
      <CompactThemeSwitcher />
    </header>
  )
}
```

### 5. ModeToggle (Original)
The original dark/light mode toggle with custom CSS animations.

```tsx
import { ModeToggle } from "@/components/Theme/mode-toggle"

function Navigation() {
  return (
    <nav>
      <ModeToggle />
    </nav>
  )
}
```

## Usage

### 1. Setup Theme Provider

Make sure your app is wrapped with the `ThemeProvider`:

```tsx
import { ThemeProvider } from "@/components/Theme/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="system" defaultColorScheme="default">
      <YourApp />
    </ThemeProvider>
  )
}
```

### 2. Use Theme State

Access theme state in any component:

```tsx
import { useTheme } from "@/components/Theme/theme-provider"

function MyComponent() {
  const { theme, customColors, setTheme, setCustomColors, updatePrimaryColor, updateSecondaryColor } = useTheme()
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Primary color: {customColors.primary}</p>
      <p>Secondary color: {customColors.secondary}</p>
    </div>
  )
}
```

### 3. Add to Navigation

Replace the existing `ModeToggle` in your navigation:

```tsx
// Before
import { ModeToggle } from "./Theme/mode-toggle"
<ModeToggle />

// After
import { CombinedThemeSwitcher } from "./Theme/combined-theme-switcher"
<CombinedThemeSwitcher />
```

### 4. Customize Colors Programmatically

Update colors from your code:

```tsx
import { useTheme } from "@/components/Theme/theme-provider"

function ColorControls() {
  const { updatePrimaryColor, updateSecondaryColor } = useTheme()
  
  return (
    <div>
      <button onClick={() => updatePrimaryColor("oklch(0.55 0.15 250)")}>
        Set Blue Primary
      </button>
      <button onClick={() => updateSecondaryColor("oklch(0.85 0.05 250)")}>
        Set Light Blue Secondary
      </button>
    </div>
  )
}
```

## Color Customization

The dynamic color system allows users to:

- **Choose Custom Colors**: Pick any primary and secondary colors using the color picker
- **Use Predefined Palettes**: Quick selection from curated color combinations
- **Live Preview**: See changes immediately before applying
- **Persistent Storage**: Colors are saved and restored on page reload

### Predefined Palettes

- **Modern Blue**: Professional blue theme
- **Nature Green**: Fresh green theme
- **Royal Purple**: Elegant purple theme
- **Warm Orange**: Vibrant orange theme
- **Vibrant Pink**: Bold pink theme
- **Bold Red**: Strong red theme
- **Ocean Teal**: Calming teal theme
- **Sunset Yellow**: Bright yellow theme

## CSS Variables

The theme system uses CSS custom properties that automatically update based on the selected theme and custom colors:

```css
:root {
  --custom-primary: /* user's primary color */;
  --custom-secondary: /* user's secondary color */;
  --primary: var(--custom-primary);
  --ring: var(--custom-primary);
  --secondary: var(--custom-secondary);
}

.dark {
  --primary: var(--custom-primary);
  --ring: var(--custom-primary);
  --secondary: var(--custom-secondary);
}
```

## Customization

### Adding New Predefined Palettes

1. Add the palette to the `colorPalettes` array in `dynamic-color-picker.tsx`
2. Update the color conversion functions if needed

### Customizing the Color Picker

Modify the `DynamicColorPicker` component to add new features:

```tsx
// Add new palette
const newPalette = {
  name: "Custom Theme",
  primary: "oklch(0.55 0.15 120)",
  secondary: "oklch(0.85 0.05 120)"
}

// Add to colorPalettes array
```

### Extending Color Support

To support additional color formats, update the conversion functions:

```tsx
// Add support for HSL, RGB, etc.
function hexToOklch(hex: string): string {
  // Enhanced conversion logic
}
```

## Demo

To see all components in action, import and use the demo components:

```tsx
import { DynamicThemeDemo } from "@/components/Theme/dynamic-theme-demo"

function DemoPage() {
  return <DynamicThemeDemo />
}
```

## Browser Support

- Modern browsers with CSS custom properties support
- Automatic fallback for older browsers
- Progressive enhancement approach

## License

This component library is part of your project and follows the same license terms. 