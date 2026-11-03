import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50: "#eef3f9", 100: "#ccdaed", 400: "#4a7ab5", 500: "#1a3a5c", 600: "#152f4a", 700: "#0f2035" },
        accent: "#d4a017",
      },
    },
  },
  plugins: [],
};

export default config;
