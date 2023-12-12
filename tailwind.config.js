/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        inner: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);",
      },
    },
  },
  plugins: [],
};
