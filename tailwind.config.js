/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        nunito: ["Nunito Sans", "sans-serif"], // ✅ düzeltildi
      },
    },
  },
  plugins: [],
};
