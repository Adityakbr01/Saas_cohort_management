// components/Theme/ModeToggle.tsx

import { useTheme } from "@/components/Theme/theme-provider";
import { useEffect, useState } from "react";
import "./uiverse-switch.css"; // 👈 Make sure this path is correct

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [checked, setChecked] = useState(theme === "dark");

  useEffect(() => {
    setChecked(theme === "dark");
  }, [theme]);

  const handleToggle = () => {
    const newTheme = checked ? "light" : "dark";
    setTheme(newTheme);
    setChecked(!checked);
  };

  return (
    <label htmlFor="theme-switch" className="switch">
      <input
        id="theme-switch"
        type="checkbox"
        checked={checked}
        onChange={handleToggle}
      />
      <span className="slider"></span>
      <span className="decoration"></span>
    </label>
  );
}
