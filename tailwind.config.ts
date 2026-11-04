import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FDF8EE",
        paperDeep: "#F7ECD8",
        card: "#FFFDF7",
        ink: "#2B3A2E",
        inkSoft: "#51624F",
        forest: "#2F5D3A",
        forestDark: "#1E4028",
        forestMid: "#3A6B47",
        line: "#E7DCC4",
        terra: "#C45C4A",
        terraSoft: "#F7DDD6",
        leafSoft: "#E3EFE0",
        sandSoft: "#FDF0E6",
        onDark: "#E9F0E4",
        onDarkSoft: "#BFD3B8",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
