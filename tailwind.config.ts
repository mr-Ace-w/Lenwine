import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        erd: ['var(--font-erd)', 'UnifrakturMaguntia', 'Cinzel Decorative', 'serif'],
        serif: ['var(--font-bodoni)', 'Bodoni Moda', 'Playfair Display', 'serif'],
        sans: ['Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#0f0f0f',
          accent: '#1a1a1a',
          muted: '#666666',
        }
      },
      letterSpacing: {
        'erd-wide': '0.25em',
        'erd-ultra': '0.4em',
      }
    },
  },
  plugins: [],
}

export default config
