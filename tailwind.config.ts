import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Premium dark palette - Mobile Finance App
        'premium-bg': '#090C12',
        'premium-bg-dark': '#06080D',
        'premium-card': '#171B23',
        'premium-card-soft': '#1E232D',
        'premium-card-dark': '#11151C',
        'premium-border-soft': 'rgba(255,255,255,0.07)',
        'premium-border-medium': 'rgba(255,255,255,0.12)',
        'premium-text': '#F1F3F7',
        'premium-text-secondary': '#B7BBC5',
        'premium-text-muted': '#7F8490',
        'premium-income': '#42D97B',
        'premium-expense': '#F05C6B',
        'premium-savings': '#5DA8FF',
        'premium-orange': '#F59E0B',
        'premium-purple': '#B026FF',
        'premium-cyan': '#16E6F2',
        'premium-green': '#4ADE80',
        'premium-red': '#FF4D5E',
        'premium-nav': '#11151C',
        'premium-nav-active': '#2A2F39',
        'premium-button': '#E9EDF5',
        'premium-button-text': '#11151C',
        // Legacy colors (kept for compatibility)
        ink: '#05070a',
        surface: '#0b1220',
        card: 'rgba(15, 23, 42, 0.72)',
        emeraldx: '#34d399',
        bluex: '#38bdf8'
      },
      boxShadow: {
        glow: '0 0 50px rgba(16,185,129,.18)',
        'premium': '0 20px 50px rgba(0,0,0,0.35)',
        'premium-lg': '0 25px 60px rgba(0,0,0,0.4)',
        'premium-sm': '0 10px 30px rgba(0,0,0,0.25)',
        'glow-violet': '0 0 60px rgba(139,92,246,0.15)',
        'glow-emerald': '0 0 60px rgba(66,217,123,0.15)',
        'glow-rose': '0 0 60px rgba(240,92,107,0.15)',
        'glow-blue': '0 0 60px rgba(93,168,255,0.15)'
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #0067A8 0%, #007F78 45%, #005B3F 75%, #071018 100%)',
        'gradient-premium-alt': 'linear-gradient(135deg, #1a1f3a 0%, #2d1b4e 50%, #1a2f3a 100%)',
        'gradient-balance': 'linear-gradient(135deg, #0067A8 0%, #007F78 45%, #005B3F 75%, #071018 100%)'
      },
      fontFamily: {
        'plus-jakarta': ['Plus Jakarta Sans', 'Inter', 'sans-serif']
      },
      spacing: {
        'safe-bottom': 'max(1rem, env(safe-area-inset-bottom))',
        'safe-top': 'max(1rem, env(safe-area-inset-top))',
      },
      borderRadius: {
        'card': '32px',
        'card-lg': '28px',
        'card-md': '24px',
        'card-sm': '20px',
      }
    }
  },
  plugins: []
};
export default config;
