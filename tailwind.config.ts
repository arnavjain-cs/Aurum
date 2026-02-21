import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'grid-green': '#22c55e',
        'grid-yellow': '#eab308',
        'grid-red': '#ef4444',
        'grid-blue': '#3b82f6',
      },
    },
  },
  plugins: [],
}

export default config
