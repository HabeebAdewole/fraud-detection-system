/** @type {import('tailwindcss').Config} */
// Light "Tracer" theme inspired by Sardine's design language.
// NOTE: token names are kept stable across the app; their VALUES are the light
// palette. `cyan` is the brand accent (electric blue-indigo), not a literal cyan.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#F6F6F4",        // page background (warm off-white)
        panel: "#FFFFFF",      // card surface
        "panel-2": "#F2F1EE",  // inset / subtle raised
        line: "#E6E4E0",       // hairline border
        "line-soft": "#EFEDEA",
        text: "#0B0C0E",       // near-black body text
        muted: "#6B7280",      // secondary text
        cyan: "#2B44E8",       // BRAND accent (electric blue-indigo)
        "cyan-dim": "#1E33C4",
        amber: "#E0870B",
        "amber-dim": "#B26C09",
        red: "#E5484D",
        "red-dim": "#C13239",
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
