/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'surface': '#f8fafc',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f1f5f9',
        'surface-container': '#e2e8f0',
        'surface-container-high': '#cbd5e1',
        'primary': '#0f172a',
        'on-primary': '#ffffff',
        'secondary': '#334155',
        'border-subtle': '#e2e8f0',
        'text-muted': '#64748b',
        'nav-active-bg': '#e0e7ff',
        'nav-active-border': '#4f46e5',
        'badge-green-bg': '#dcfce7',
        'badge-green-text': '#166534',
        'badge-blue-bg': '#dbeafe',
        'badge-blue-text': '#1e40af',
        'badge-amber-bg': '#fef3c7',
        'badge-amber-text': '#92400e',
        'badge-gray-bg': '#f1f5f9',
        'badge-gray-text': '#475569',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'heading': ['Geist', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        'full': '9999px',
      },
      spacing: {
        'base': '4px',
        'container-margin': '24px',
        'gutter': '16px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
      }
    },
  },
  plugins: [],
}
