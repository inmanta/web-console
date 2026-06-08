import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "theme-preference";

/**
 * Framework-agnostic attribute set on <html> to signal the active theme.
 * The MutationObserver watches this instead of any UI-library-specific class,
 * so the reactive hook stays stable across PatternFly version upgrades.
 */
const THEME_ATTR = "data-theme";

/**
 * PatternFly-specific class names applied alongside data-theme.
 * When upgrading PatternFly, only these two constants need updating.
 */
const PF_DARK_CLASS = "pf-v6-theme-dark";
const PF_LIGHT_CLASS = "pf-v6-theme-light";

/**
 * Retrieves the user's theme preference from localStorage or the system's color scheme.
 * @returns {"dark" | "light"} The resolved theme preference.
 */
export const getThemePreference = (): "dark" | "light" => {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored === "dark" || stored === "light") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const loadHighlightTheme = (theme: "dark" | "light"): void => {
  // Dynamically import the appropriate highlight.js theme.
  // We intentionally don't await these imports: they load CSS side effects.
  if (theme === "dark") {
    void import("highlight.js/styles/github-dark-dimmed.css");
  } else {
    void import("highlight.js/styles/github.css");
  }
};

/**
 * Persists the theme preference to localStorage, sets the framework-agnostic
 * data-theme attribute on <html>, applies the PatternFly theme class, and loads
 * the matching highlight.js CSS.
 *
 * To upgrade PatternFly: update PF_DARK_CLASS / PF_LIGHT_CLASS above — nothing else changes.
 *
 * @param {"dark" | "light"} theme - The theme to apply.
 */
export const setThemePreference = (theme: "dark" | "light"): void => {
  localStorage.setItem(STORAGE_KEY, theme);
  // Stable, framework-agnostic signal — observed by useTheme's MutationObserver.
  document.documentElement.setAttribute(THEME_ATTR, theme);
  // PatternFly requires its own class on <html> to apply dark styles.
  document.documentElement.classList.remove(PF_DARK_CLASS, PF_LIGHT_CLASS);
  document.documentElement.classList.add(theme === "dark" ? PF_DARK_CLASS : PF_LIGHT_CLASS);
  loadHighlightTheme(theme);
};

/**
 * Reactively tracks and controls the application's dark/light theme.
 *
 * Subscribes to changes of the data-theme attribute on <html> via a MutationObserver
 * so all return values update immediately when the theme is toggled — no page reload
 * required. Watching data-theme (not the PF class) keeps the hook decoupled from
 * PatternFly version-specific class names.
 *
 * @returns {{ isDark: boolean, theme: "dark" | "light", setTheme: (theme: "dark" | "light") => void }}
 */
export const useTheme = (): {
  isDark: boolean;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
} => {
  const [isDark, setIsDark] = useState(() => getThemePreference() === "dark");

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(getThemePreference() === "dark");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [THEME_ATTR],
    });

    return () => observer.disconnect();
  }, []);

  const setTheme = useCallback((theme: "dark" | "light"): void => {
    setThemePreference(theme);
    // The MutationObserver above picks up the data-theme change and updates
    // isDark automatically — no manual setState needed here.
  }, []);

  return { isDark, theme: isDark ? "dark" : "light", setTheme };
};
