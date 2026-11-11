/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coldbrook: {
          paper: '#F5F5F2',
          tint1: '#E9E8E4',
          tint2: '#DEDFDB',
          black: '#090B0C',
          sage: '#B8C0BC',
          clay: '#C9C3B9',
          ice: '#B9E5F3',
          hairline: 'rgba(9,11,12,0.14)',
          hairlineLight: 'rgba(9,11,12,0.07)',
          muted: 'rgba(9,11,12,0.56)'
        },
        desert: {
          navy: '#0B2030',
          deep: '#07141F',
          sand: '#F0E5D4',
          sandDark: '#E6D8C3',
          cream: '#F5EDE2',
          ink: '#33291E',
          coral: '#C64A32',
          coralPressed: '#A83D28',
          coralSoft: '#E2705A',
        },
        sand: {
          50: '#FDFCF9',
          100: '#FAF7F2',
          200: '#F3EDE2',
          300: '#E8DEC9',
        },
        primary: {
          DEFAULT: '#0F766E',
          hover: '#115E59',
          light: '#CCFBF1',
        },
        accent: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
        },
        info: {
          DEFAULT: '#2563EB',
          light: '#DBEAFE',
        },
        success: {
          DEFAULT: '#15803D',
          light: '#DCFCE7',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'Inter', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      }
    },
  },
  plugins: [],
}

