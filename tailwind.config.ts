import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#05070a',
        surface: '#0b1220',
        card: 'rgba(15, 23, 42, 0.72)',
        emeraldx: '#34d399',
        bluex: '#38bdf8'
      },
      boxShadow: { glow: '0 0 50px rgba(16,185,129,.18)' }
    }
  },
  plugins: []
};
export default config;
