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
        gov: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#052e16',
        },
        navy: {
          800: '#0f172a',
          900: '#020617',
        }
      },
    },
  },
  plugins: [],
};
export default config;
