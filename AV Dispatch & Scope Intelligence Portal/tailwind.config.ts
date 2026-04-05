import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f3f6fb",
        signal: {
          50: "#eefdf8",
          100: "#d6f8ec",
          500: "#0d9f6e",
          700: "#0d6f52"
        },
        alert: {
          50: "#fff6ed",
          100: "#ffead5",
          500: "#f97316",
          700: "#c2410c"
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          700: "#b91c1c"
        },
        ocean: {
          100: "#d8efff",
          300: "#7dd3fc",
          500: "#0ea5e9",
          700: "#075985"
        }
      },
      boxShadow: {
        glow: "0 18px 45px rgba(15, 23, 42, 0.12)"
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Georgia", "Cambria", "Times New Roman", "serif"]
      }
    }
  },
  plugins: []
};

export default config;
