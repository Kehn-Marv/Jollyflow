export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'selector',
  theme: {
    container: {
      center: true,
      padding: '1.25rem',
      screens: {
        '2xl': '1320px'
      }
    },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        'chart-1': 'var(--chart-1)',
        'chart-2': 'var(--chart-2)',
        'chart-3': 'var(--chart-3)',
        'chart-4': 'var(--chart-4)',
        'chart-5': 'var(--chart-5)',
        sidebar: 'var(--sidebar)',
        'sidebar-foreground': 'var(--sidebar-foreground)',
        'sidebar-primary': 'var(--sidebar-primary)',
        'sidebar-primary-foreground': 'var(--sidebar-primary-foreground)',
        'sidebar-accent': 'var(--sidebar-accent)',
        'sidebar-accent-foreground': 'var(--sidebar-accent-foreground)',
        'sidebar-border': 'var(--sidebar-border)',
        'sidebar-ring': 'var(--sidebar-ring)',
        'destructive-foreground': 'var(--destructive-foreground)',
        // JolliFlow brand tokens
        ink: '#10110F',
        paper: '#F6F5EF',
        lime: '#D9F52B',
        coral: '#FF704F',
        bloom: '#F78CDE',
        sky: '#64CEF0',
        forest: '#244D27',
        sand: '#ECEAE0',
        line: '#E3E0D4',
        smoke: '#5E6058',
        ok: '#1E7B3C',
        danger: '#C2361B'
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        pop: '4px 4px 0 0 #10110F',
        'pop-sm': '2px 2px 0 0 #10110F',
        'pop-lg': '6px 6px 0 0 #10110F',
        soft: '0 1px 2px rgba(16,17,15,.05), 0 10px 28px -14px rgba(16,17,15,.22)'
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } }
      },
      animation: {
        marquee: 'marquee 45s linear infinite'
      }
    }
  }
}
