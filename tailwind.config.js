/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F7F3EA",
        paper: "#FFFDF9",
        ink: "#1F2A3C",
        inkSoft: "#4A5568",
        gold: "#B08D4F",
        goldSoft: "#D9C29A",
        line: "#E7E0D2",
        terracotta: "#B5652E",
      },
      fontFamily: {
        serif: ["'Fraunces'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(31, 42, 60, 0.06)",
        card: "0 1px 3px rgba(31, 42, 60, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
