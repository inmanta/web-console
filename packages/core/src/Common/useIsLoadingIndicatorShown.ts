import { useEffect, useState } from "react";

/**
 * When a loading indicator shows up and how long it stays.
 */
export interface LoadingIndicatorTiming {
  /** How long loading can take, in milliseconds, before the indicator shows. */
  delay: number;

  /** How long the indicator stays at least, in milliseconds, once it shows. */
  minimumDuration: number;
}

/**
 * The console's timing for loading indicators that replace content already on screen: loads
 * under 300 ms show none, and a shown indicator stays for at least 500 ms.
 */
export const LOADING_INDICATOR_TIMING: LoadingIndicatorTiming = {
  delay: 300,
  minimumDuration: 500,
};

/**
 * React hook telling whether to show a loading indicator. A short load shows none, so fast
 * results swap in without a flash. A load that takes longer than the delay shows the indicator
 * for at least the minimum duration, so it doesn't flicker, and longer while the load lasts.
 *
 * @example
 * const isSkeletonShown = useIsLoadingIndicatorShown(isLoading, LOADING_INDICATOR_TIMING);
 * // a load of 400 ms: true from 300 ms to 800 ms
 */
export const useIsLoadingIndicatorShown = (
  isLoading: boolean,
  { delay, minimumDuration }: LoadingIndicatorTiming
): boolean => {
  const [shownSince, setShownSince] = useState<number>();

  useEffect(() => {
    if (isLoading && shownSince === undefined) {
      const timeout = setTimeout(() => setShownSince(Date.now()), delay);

      return () => clearTimeout(timeout);
    }

    if (!isLoading && shownSince !== undefined) {
      const remainingDuration = minimumDuration - (Date.now() - shownSince);
      const timeout = setTimeout(() => setShownSince(undefined), Math.max(remainingDuration, 0));

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [isLoading, shownSince, delay, minimumDuration]);

  return shownSince !== undefined;
};
