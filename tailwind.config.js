/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#6EEB20",
          emerald: "#10B981",
          teal: "#14B8A6",
          blue: "#2563EB",
          deep: "#1E40AF"
        },
        background: "#F8FAFC",
        textmain: "#334155"
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #6EEB20 0%, #10B981 40%, #2563EB 100%)",
      },
    },
  },
  plugins: [],
};