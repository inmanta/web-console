import { useEffect, useState } from "react";

/**
 * React hook that debounces a value over a specified delay.
 *
 * The returned value only updates after the input value has stopped
 * changing for the given delay period. This is useful for reducing
 * the frequency of expensive operations such as API calls, filtering,
 * or validation triggered by fast-changing input (e.g. typing).
 *
 * @param value - The input value to debounce.
 * @param delay - The debounce delay in milliseconds.
 *
 * @returns The debounced value, updated only after the delay has elapsed
 * since the last change to the input value.
 *
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 500);
 *
 */
export const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
