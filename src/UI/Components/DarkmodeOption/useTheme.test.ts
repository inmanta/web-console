import { renderHook, act } from "@testing-library/react";
import { getThemePreference, setThemePreference, useTheme } from "./useTheme";

// Dynamic CSS imports in loadHighlightTheme are fire-and-forget side effects.
// Mock them so they don't cause "unknown module" errors in the test environment.
vi.mock("highlight.js/styles/github-dark-dimmed.css", () => ({}));
vi.mock("highlight.js/styles/github.css", () => ({}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const setSystemDarkMode = (dark: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: dark && query === "(prefers-color-scheme: dark)",
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
};

const getThemeAttr = () => document.documentElement.getAttribute("data-theme");

// ---------------------------------------------------------------------------
// getThemePreference
// ---------------------------------------------------------------------------

describe("getThemePreference", () => {
  beforeEach(() => {
    localStorage.clear();
    setSystemDarkMode(false);
  });

  it("returns 'dark' when localStorage contains 'dark'", () => {
    localStorage.setItem("theme-preference", "dark");
    expect(getThemePreference()).toBe("dark");
  });

  it("returns 'light' when localStorage contains 'light'", () => {
    localStorage.setItem("theme-preference", "light");
    expect(getThemePreference()).toBe("light");
  });

  it("falls back to system dark preference when localStorage is empty", () => {
    setSystemDarkMode(true);
    expect(getThemePreference()).toBe("dark");
  });

  it("falls back to system light preference when localStorage is empty", () => {
    setSystemDarkMode(false);
    expect(getThemePreference()).toBe("light");
  });

  it("ignores invalid localStorage values and falls back to system preference", () => {
    localStorage.setItem("theme-preference", "blue");
    setSystemDarkMode(false);
    expect(getThemePreference()).toBe("light");
  });

  it("localStorage takes priority over system preference", () => {
    localStorage.setItem("theme-preference", "light");
    setSystemDarkMode(true); // system says dark, but localStorage says light
    expect(getThemePreference()).toBe("light");
  });
});

// ---------------------------------------------------------------------------
// setThemePreference
// ---------------------------------------------------------------------------

describe("setThemePreference", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("persists the theme to localStorage", () => {
    setThemePreference("dark");
    expect(localStorage.getItem("theme-preference")).toBe("dark");
  });

  it("sets data-theme to 'dark' on <html>", () => {
    setThemePreference("dark");
    expect(getThemeAttr()).toBe("dark");
  });

  it("sets data-theme to 'light' on <html>", () => {
    setThemePreference("light");
    expect(getThemeAttr()).toBe("light");
  });

  it("overwrites the previous data-theme when switching themes", () => {
    setThemePreference("dark");
    setThemePreference("light");
    expect(getThemeAttr()).toBe("light");
  });

  it("keeps data-theme in sync with localStorage across multiple switches", () => {
    setThemePreference("dark");
    setThemePreference("light");
    setThemePreference("dark");

    expect(localStorage.getItem("theme-preference")).toBe("dark");
    expect(getThemeAttr()).toBe("dark");
  });
});

// ---------------------------------------------------------------------------
// useTheme hook
// ---------------------------------------------------------------------------

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    setSystemDarkMode(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes as light when no preference is stored and system is light", () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.isDark).toBe(false);
    expect(result.current.theme).toBe("light");
  });

  it("initializes as dark when localStorage contains 'dark'", () => {
    localStorage.setItem("theme-preference", "dark");
    const { result } = renderHook(() => useTheme());

    expect(result.current.isDark).toBe(true);
    expect(result.current.theme).toBe("dark");
  });

  it("initializes as dark when system preference is dark", () => {
    setSystemDarkMode(true);
    const { result } = renderHook(() => useTheme());

    expect(result.current.isDark).toBe(true);
    expect(result.current.theme).toBe("dark");
  });

  it("setTheme persists to localStorage and updates data-theme", () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme("dark");
    });

    expect(localStorage.getItem("theme-preference")).toBe("dark");
    expect(getThemeAttr()).toBe("dark");
  });

  it("setTheme updates isDark and theme via MutationObserver", async () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.isDark).toBe(false);

    await act(async () => {
      result.current.setTheme("dark");
    });

    expect(result.current.isDark).toBe(true);
    expect(result.current.theme).toBe("dark");
  });

  it("toggles back from dark to light", async () => {
    localStorage.setItem("theme-preference", "dark");
    const { result } = renderHook(() => useTheme());

    expect(result.current.isDark).toBe(true);

    await act(async () => {
      result.current.setTheme("light");
    });

    expect(result.current.isDark).toBe(false);
    expect(result.current.theme).toBe("light");
  });

  it("reacts to setThemePreference calls made outside the hook", async () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.isDark).toBe(false);

    await act(async () => {
      setThemePreference("dark"); // simulates Root.tsx or any other external caller
    });

    expect(result.current.isDark).toBe(true);
    expect(result.current.theme).toBe("dark");
  });

  it("disconnects the MutationObserver on unmount", () => {
    const disconnectSpy = vi.spyOn(MutationObserver.prototype, "disconnect");
    const { unmount } = renderHook(() => useTheme());

    unmount();

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });

  it("exposes a stable setTheme reference across re-renders", () => {
    const { result, rerender } = renderHook(() => useTheme());
    const firstSetTheme = result.current.setTheme;

    rerender();

    expect(result.current.setTheme).toBe(firstSetTheme);
  });
});
