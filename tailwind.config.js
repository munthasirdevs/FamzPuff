/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.js",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        "caesar-black": "#000000",
        "caesar-burgundy": "#6D001A",
        "caesar-white": "#FFFFFF",
        "bg-obsidian": "var(--caesar-black)",
        "bg-surface-1": "#0A0A0C",
        "bg-card": "#121215",
        "bg-glass": "rgba(18,18,21,0.78)",
        "accent-burgundy": "#6D001A",
        "accent-burgundy-hover": "#8F0022",
        "text-pure-white": "#FFFFFF",
        "text-muted": "#A1A1AA",
        "text-dim": "#52525B",
        "border-dark": "#222226",
        "border-light": "#E4E4E7",
      },
    },
  },
  plugins: [],
};
