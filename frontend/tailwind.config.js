/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0E16",
        panel: "#111824",
        "panel-2": "#18202E",
        line: "#232C3C",
        "line-soft": "#1B2230",
        text: "#EAEDF3",
        muted: "#7E879B",
        cyan: "#2DE1C2",
        "cyan-dim": "#1FA892",
        amber: "#F6B73C",
        "amber-dim": "#B5821F",
        red: "#FB5468",
        "red-dim": "#B83545",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.02) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
        glow: "0 0 0 1px rgba(45,225,194,0.35), 0 0 24px -4px rgba(45,225,194,0.35)",
      },
      letterSpacing: {
        eyebrow: "0.18em",
      },
    },
  },
  plugins: [],
};
