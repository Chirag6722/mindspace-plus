import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#f6f4ef',
          dark: '#15161a',
          dot: '#00000012',
          'dot-dark': '#ffffff14',
        },
        note: {
          yellow: { bg: '#fef6d8', border: '#f3d77c', text: '#6b5a14' },
          blue: { bg: '#dbeefe', border: '#8fc7f7', text: '#1e4f73' },
          pink: { bg: '#fde2ef', border: '#f4a8cc', text: '#7a2c50' },
          green: { bg: '#def7e6', border: '#8fdba8', text: '#1f5c37' },
          purple: { bg: '#ece4fb', border: '#bda3f0', text: '#4a2c80' },
          orange: { bg: '#fde6d2', border: '#f7b377', text: '#7a3c10' },
          gray: { bg: '#eceef1', border: '#c3c9d1', text: '#3a4250' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        hand: ['"Patrick Hand"', '"Comic Sans MS"', 'cursive'],
      },
      boxShadow: {
        note: '0 2px 8px -2px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.08)',
        'note-hover': '0 8px 20px -4px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.1)',
        panel: '0 4px 24px -6px rgba(0,0,0,0.18)',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'pop-in': 'popIn 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        popIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
