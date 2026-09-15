/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        caveat: ['Caveat', 'cursive'],
        shadows: ['"Shadows Into Light"', 'cursive'],
        indie: ['"Indie Flower"', 'cursive'],
        patrick: ['"Patrick Hand"', 'cursive'],
        dancing: ['"Dancing Script"', 'cursive'],
        kalam: ['Kalam', 'cursive'],
        sacramento: ['Sacramento', 'cursive'],
      },
      boxShadow: {
        'paper': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05)',
        'paper-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 30px 40px -10px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}
