// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const themes = {
  cyan: { primary: "#3bd2f0", primaryDark: "#2ba8c4", primaryLight: "#6ee2f8" },
  green: {
    primary: "#22c55e",
    primaryDark: "#16a34a",
    primaryLight: "#4ade80",
  },
  orange: {
    primary: "#f59e0b",
    primaryDark: "#d97706",
    primaryLight: "#fbbf24",
  },
  purple: {
    primary: "#a78bfa",
    primaryDark: "#8b5cf6",
    primaryLight: "#c4b5fd",
  },
  red: { primary: "#f87171", primaryDark: "#ef4444", primaryLight: "#fca5a5" },
};

export const colorSchemes = {
  dark: {
    "--bg-primary": "#0d1117",
    "--bg-secondary": "#161b22",
    "--bg-tertiary": "#21262d",
    "--border-color": "rgba(255,255,255,0.1)",
    "--text-primary": "#ffffff",
    "--text-secondary": "#8b949e",
    "--card-bg": "#161b22",
    "--input-bg": "#0d1117",
    "--hover-bg": "rgba(255,255,255,0.05)",
  },
  light: {
    "--bg-primary": "#f6f8fa",
    "--bg-secondary": "#ffffff",
    "--bg-tertiary": "#eaeef2",
    "--border-color": "#d0d7de",
    "--text-primary": "#1f2328",
    "--text-secondary": "#656d76",
    "--card-bg": "#ffffff",
    "--input-bg": "#ffffff",
    "--hover-bg": "rgba(0,0,0,0.04)",
  },
};

// Helper function to convert hex to rgb
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "59, 210, 240";
};

// ThemeProvider - declared only once
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app_theme") || "cyan";
  });

  const [mode, setMode] = useState(() => {
    return localStorage.getItem("app_mode") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("app_theme", theme);
    localStorage.setItem("app_mode", mode);

    const root = document.documentElement;

    // Apply theme colors (accent colors)
    const themeColors = themes[theme];
    root.style.setProperty("--brand", themeColors.primary);
    root.style.setProperty("--brand-dark", themeColors.primaryDark);
    root.style.setProperty("--brand-light", themeColors.primaryLight);
    root.style.setProperty("--brand-soft", `${themeColors.primary}20`);
    root.style.setProperty("--brand-rgb", hexToRgb(themeColors.primary));

    // Apply mode colors (light/dark)
    const colorScheme = colorSchemes[mode];
    Object.entries(colorScheme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Also set body background directly
    document.body.style.backgroundColor =
      mode === "dark" ? "#0d1117" : "#f6f8fa";
    document.body.style.color = mode === "dark" ? "#ffffff" : "#1f2328";
  }, [theme, mode]);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, mode, setMode, themes, colorSchemes }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// useTheme hook - declared only once
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
