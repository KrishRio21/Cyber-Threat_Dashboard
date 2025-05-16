/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0d1117',
        'dark-card': '#1c2526',
        'dark-text': '#e6edf3',
        'primary': '#2b6cb0',
        'danger': '#dc2626',
        'accent': '#7c3aed',
        'light-bg': '#f8fafc',
        'light-card': '#e2e8f0',
        'light-text': '#1f2937',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(59, 130, 246, 0.4)',
        'card-glow': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'neon-glow': '0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(124, 58, 237, 0.4)',
      },
      backdropBlur: {
        'sm': '4px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(45deg, #2b6cb0, #7c3aed)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)' },
        },
        neonPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(59, 130, 246, 0.4), 0 0 20px rgba(124, 58, 237, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(124, 58, 237, 0.5)' },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'neon-pulse': 'neonPulse 1.5s ease-in-out infinite',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [],
}