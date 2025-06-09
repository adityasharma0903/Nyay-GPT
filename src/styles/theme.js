import React from "react";

export const theme = {
  colors: {
    primary: "#223A5E", // Deep blue
    accent: "#FF9933", // Saffron
    background: "#FFFBF6", // Off-white
    text: "#222",
    surface: "#FFF",
    error: "#D32F2F",
    success: "#388E3C",
  },
  font: {
    family: "'Noto Sans', 'Mangal', Arial, sans-serif",
    size: "1.25rem",
  },
};

export const ThemeProvider = ({ children }) => (
  <div style={{ background: theme.colors.background, minHeight: "100vh", fontFamily: theme.font.family }}>
    {children}
  </div>
);