import React, { useState, useEffect } from "react";
import { DropdownItem } from "@patternfly/react-core";
import { words } from "@/UI/words";

const storageKey = "theme-preference";

/**
 * Retrieves the user's theme preference from localStorage or the system's color scheme.
 * @returns {string} The theme preference, either 'dark' or 'light'.
 */
export const getThemePreference = () => {
  if (localStorage.getItem(storageKey)) {
    return localStorage.getItem(storageKey);
  } else {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
};

const loadHighlightTheme = (theme: string) => {
  // Dynamically import the appropriate highlight.js theme.
  // We intentionally don't await these imports: they load CSS side effects.
  if (theme === "dark") {
    void import("highlight.js/styles/github-dark-dimmed.css");
  } else {
    void import("highlight.js/styles/github.css");
  }
};

/**
 * Sets the user's theme preference in localStorage and updates the document's theme class,
 * and loads the matching highlight.js theme CSS.
 * @param {string} theme - The theme to set, either 'dark' or 'light'.
 */
export const setThemePreference = (theme: string) => {
  localStorage.setItem(storageKey, theme);
  // Target the html tag and update the theme class "pf-v6-theme-dark" / "pf-v6-theme-light" depending on the theme.
  document.documentElement.classList.remove("pf-v6-theme-dark", "pf-v6-theme-light");
  document.documentElement.classList.add(`pf-v6-theme-${theme}`);
  loadHighlightTheme(theme);
};

/**
 * A React component that provides a dropdown item to toggle between dark and light themes.
 * The user's theme preference is stored in localStorage and applied to the document.
 * @returns {React.FC} The rendered component.
 */
export const DarkmodeOption: React.FC = () => {
  const [theme, setTheme] = useState<string>(getThemePreference() || "light");

  useEffect(() => {
    setThemePreference(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";

    setTheme(newTheme);
  };

  return (
    <DropdownItem key="darkmode-toggle" onClick={toggleTheme}>
      {words("theme.toggle")(theme)}
    </DropdownItem>
  );
};
