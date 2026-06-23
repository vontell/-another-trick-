/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cartographer's Map palette — aged parchment & oak-gall ink.
        ink: '#2c2114', // primary dark ink (text)
        paper: '#e7d9b6', // page background
        panel: '#f3e9cf', // card surface
        panel2: '#e4d3a6', // secondary surface / chips
        edge: '#c2ac7c', // borders
        accent: '#8a3b2e', // oxblood — primary action
        meta: '#5d7d60', // faded sea-green — meta tiles
        gold: '#9c6f24', // antique gold
        good: '#4f7d4a',
        bad: '#a23524',
        cream: '#f7efd6', // light text on oxblood/gold
      },
      fontFamily: {
        display: ['Cinzel', 'ui-serif', 'Georgia', 'serif'],
        body: ['Spectral', 'ui-serif', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        map: '4px 5px 0 rgba(44,33,20,0.13)',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        flipIn: {
          '0%': { transform: 'rotateX(-90deg)', opacity: '0' },
          '60%': { transform: 'rotateX(15deg)', opacity: '1' },
          '100%': { transform: 'rotateX(0deg)' },
        },
        riseIn: {
          '0%': { transform: 'translateY(14px) scale(.96)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        stampIn: {
          '0%': { transform: 'scale(1.8) rotate(-12deg)', opacity: '0' },
          '70%': { transform: 'scale(.92) rotate(-12deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-12deg)', opacity: '1' },
        },
        drawline: {
          '0%': { 'stroke-dashoffset': 'var(--len, 200)' },
          '100%': { 'stroke-dashoffset': '0' },
        },
        glowpulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 0 rgba(156,111,36,0))' },
          '50%': { filter: 'drop-shadow(0 0 6px rgba(156,111,36,0.7))' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        draw: {
          '0%': { 'stroke-dashoffset': '1' },
          '100%': { 'stroke-dashoffset': '0' },
        },
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
        pop: 'pop 0.18s ease-out',
        flipIn: 'flipIn 0.4s ease-out both',
        riseIn: 'riseIn 0.35s ease-out both',
        fadeIn: 'fadeIn 0.4s ease-out both',
        stampIn: 'stampIn 0.5s cubic-bezier(.2,.8,.2,1) both',
        glowpulse: 'glowpulse 2.4s ease-in-out infinite',
        floaty: 'floaty 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
