import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wazifny: {
          orange: "#F97316",
          "orange-dark": "#EA6A0C",
          navy: "#0B1224",
          "navy-light": "#131B33",
          green: "#16A34A",
          "green-dark": "#128040",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Inter",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "0.875rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(11,18,36,0.06), 0 1px 3px 0 rgba(11,18,36,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
