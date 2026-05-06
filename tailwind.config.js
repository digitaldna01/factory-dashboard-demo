/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        fab: {
          page:    '#F4F2EC',
          card:    '#FCFBF7',
          subtle:  '#EBE8E1',
          inset:   '#F5F2EB',
          border:  '#E5E1D7',
          fg1:     '#171614',
          fg2:     '#4A4843',
          fg3:     '#8A867D',
          fg4:     '#BDB9AE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
