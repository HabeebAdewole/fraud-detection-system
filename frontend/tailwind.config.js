/** @type {import('tailwindcss').Config} */
// "Tracer" theme — Sardine-inspired. Colors are CSS variables (RGB channels)
// so the same token names work in both light and dark mode. Values live in
// index.css under :root (light) and .dark. `cyan` is the brand accent
// (electric blue-indigo), not a literal cyan.
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        panel: "rgb(var(--c-panel) / <alpha-value>)",
        "panel-2": "rgb(var(--c-panel-2) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        "line-soft": "rgb(var(--c-line-soft) / <alpha-value>)",
        text: "rgb(var(--c-text) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        cyan: "rgb(var(--c-cyan) / <alpha-value>)",
        "cyan-dim": "rgb(var(--c-cyan-dim) / <alpha-value>)",
        amber: "rgb(var(--c-amber) / <alpha-value>)",
        "amber-dim": "rgb(var(--c-amber-dim) / <alpha-value>)",
        red: "rgb(var(--c-red) / <alpha-value>)",
        "red-dim": "rgb(var(--c-red-dim) / <alpha-value>)",
      },
      fontFamily: {
        display: ['"Hanken Grotesk"', "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)",
        lift: "0 4px 12px -2px rgba(16,24,40,0.10), 0 2px 6px -2px rgba(16,24,40,0.06)",
        glow: "0 0 0 3px rgba(43,68,232,0.15)",
      },
      letterSpacing: {
        eyebrow: "0.14em",
      },
    },
  },
  plugins: [],
};
