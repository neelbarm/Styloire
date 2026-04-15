import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        luxe: "0 14px 40px rgba(120, 53, 15, 0.12)",
        "3xl":
          "0 28px 72px rgba(41, 37, 36, 0.2), 0 10px 30px rgba(217, 119, 6, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
