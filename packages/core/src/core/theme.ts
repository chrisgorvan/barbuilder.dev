import type { ThemeMode, ThemeDefaults } from "./types.js";

// Get theme-specific default colors
export function getThemeDefaults(theme: ThemeMode): ThemeDefaults {
  if (theme === "dark") {
    return {
      backgroundColor: "#333333",
      labelBackground: "#1a1a1a",
      labelText: "#e0e0e0",
      progressColor: "#55dd55", // Slightly brighter green for dark theme
    };
  }

  // Light theme (default)
  return {
    backgroundColor: "#e0e0e0",
    labelBackground: "#555555",
    labelText: "#ffffff",
    progressColor: "#44cc11",
  };
}
