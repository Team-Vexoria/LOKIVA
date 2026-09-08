/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#12213B',
          50: '#F4F6F9',
          100: '#E8ECF2',
          200: '#C5D0E0',
          700: '#1D3256',
          800: '#162846',
          900: '#12213B',
          950: '#0B1526',
        },
        paper: {
          DEFAULT: '#EEF1EE',
          50: '#FAFBF9',
          100: '#F3F5F2',
          200: '#EEF1EE',
          300: '#E0E5DF',
          400: '#D0D7CF',
        },
        marigold: {
          DEFAULT: '#F0A63B',
          50: '#FEF8EE',
          100: '#FDF1DD',
          200: '#FAE3BC',
          500: '#F0A63B',
          600: '#D8912E',
          700: '#B57521',
        },
        teal: {
          DEFAULT: '#1F7A6C',
          50: '#F0F9F8',
          100: '#DCF1EE',
          500: '#1F7A6C',
          600: '#196458',
          700: '#134D44',
        },
        clay: {
          DEFAULT: '#C1443B',
          50: '#FCF2F1',
          100: '#F8E5E3',
          500: '#C1443B',
          600: '#A43730',
          700: '#862B25',
        },
        dusk: {
          DEFAULT: '#5B6B8C',
          50: '#F4F6F9',
          100: '#E7ECF3',
          200: '#CED7E4',
          500: '#5B6B8C',
          600: '#4A5874',
          700: '#3A455C',
        },
        surface: '#FFFFFF',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
