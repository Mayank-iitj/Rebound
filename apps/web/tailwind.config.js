/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
        sans: ['Inter', 'Noto Sans Arabic', 'Noto Sans Devanagari', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

