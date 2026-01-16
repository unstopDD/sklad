/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'var(--primary)',
                    hover: 'var(--primary-hover)',
                    light: 'var(--primary-light)',
                },
                bg: {
                    page: 'var(--bg-page)',
                    card: 'var(--bg-card)',
                    sidebar: 'var(--bg-sidebar)',
                },
                text: {
                    main: 'var(--text-main)',
                    secondary: 'var(--text-secondary)',
                    light: 'var(--text-light)',
                },
                border: 'var(--border)',
                danger: 'var(--danger)',
                success: 'var(--success)',
                warning: 'var(--warning)',
            },
            borderRadius: {
                DEFAULT: 'var(--radius)',
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            fontFamily: {
                sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-mono)', 'monospace'],
            },
            boxShadow: {
                sm: 'var(--shadow-sm)',
                DEFAULT: 'var(--shadow)',
            }
        },
    },
    plugins: [],
}
