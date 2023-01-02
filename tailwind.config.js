const primaryColor = "#00B0BB";

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: primaryColor,
      },
      borderColor: {
        primary: primaryColor,
      },
      backgroundColor: {
        primary: primaryColor,
        white: "#fff",
      },
    },
  },
  plugins: [],
  content: [
    "./packages/renderer/index.html",
    "./packages/renderer/src/**/*.{vue,ts,tsx}",
  ],
};
