import { useTheme } from "../../context/ThemeContext";
import { IconSun, IconMoon } from "./icons";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      onClick={toggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
      className={`inline-flex items-center justify-center h-8 w-8 rounded-lg border border-line text-muted hover:text-cyan hover:border-cyan/50 transition-colors ${className}`}
    >
      {dark ? <IconSun /> : <IconMoon />}
    </button>
  );
}
