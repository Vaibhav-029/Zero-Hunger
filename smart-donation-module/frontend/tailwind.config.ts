import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#22c55e",
          orange: "#f97316"
        }
      }
    }
  },
  plugins: []
};

export default config;

