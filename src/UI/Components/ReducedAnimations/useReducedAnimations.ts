import { useCallback, useEffect, useState } from "react";

/** localStorage key for the persisted "reduce animations" preference. */
const STORAGE_KEY = "reduced-animations-preference";

/**
 * Custom event fired whenever the preference changes, so every mounted
 * BlinkingDot instance (there can be dozens on the Resources page) picks up
 * the change immediately, not just the component that changed it.
 */
const CHANGE_EVENT = "reduced-animations-changed";

/**
 * Retrieves the user's "reduce animations" preference from localStorage.
 * @returns {boolean} Whether continuously-animating indicators (e.g. BlinkingDot) should render statically instead.
 */
export const getReducedAnimationsPreference = (): boolean =>
  localStorage.getItem(STORAGE_KEY) === "true";

/**
 * Persists the "reduce animations" preference and notifies all mounted useReducedAnimations() consumers.
 * @param {boolean} value - Whether to render animated indicators statically instead.
 */
export const setReducedAnimationsPreference = (value: boolean): void => {
  localStorage.setItem(STORAGE_KEY, String(value));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

/**
 * Reactively tracks and controls the "reduce animations" preference across the whole app.
 *
 * @returns {{ reducedAnimations: boolean, setReducedAnimations: (value: boolean) => void }}
 */
export const useReducedAnimations = (): {
  reducedAnimations: boolean;
  setReducedAnimations: (value: boolean) => void;
} => {
  const [reducedAnimations, setReducedAnimationsState] = useState(getReducedAnimationsPreference);

  useEffect(() => {
    const handleChange = (): void => setReducedAnimationsState(getReducedAnimationsPreference());

    window.addEventListener(CHANGE_EVENT, handleChange);

    return () => window.removeEventListener(CHANGE_EVENT, handleChange);
  }, []);

  const setReducedAnimations = useCallback((value: boolean): void => {
    setReducedAnimationsPreference(value);
  }, []);

  return { reducedAnimations, setReducedAnimations };
};
