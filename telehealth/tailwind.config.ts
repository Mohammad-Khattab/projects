import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1d4ed8', dark: '#1e3a8a', light: '#3b82f6' },
        accent: { DEFAULT: '#06b6d4', light: '#38bdf8' },
        surface: '#f1f5f9',
        body: '#1e293b',
        muted: '#64748b',
        border: '#e2e8f0',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
