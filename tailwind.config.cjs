/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        hairline: 'var(--border)',
        txt: 'var(--text)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        'accent-ink': 'var(--accent-ink)',
        up: 'var(--up)',
        'up-soft': 'var(--up-soft)',
        down: 'var(--down)',
        'down-soft': 'var(--down-soft)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.18)',
        pop: '0 12px 40px rgba(0,0,0,0.45)',
      },
      animation: {
        'fade-in': 'fadeIn .18s ease-out',
        'slide-in': 'slideIn .22s cubic-bezier(.16,1,.3,1)',
        'pop-in': 'popIn .16s cubic-bezier(.16,1,.3,1)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { transform: 'translateX(48px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        popIn: { from: { transform: 'scale(.96)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
