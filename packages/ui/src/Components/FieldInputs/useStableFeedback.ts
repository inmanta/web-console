import { useEffect, useRef } from "react";

/** A field's resolved feedback: the message to show and whether it is a warning (vs a neutral hint). */
export interface StableFeedback {
  message: string;
  isWarning: boolean;
}

/** Picks the message to show, giving a warning precedence over a hint. */
const toFeedback = (
  warningMessage: string | null | undefined,
  hint: string | null | undefined
): StableFeedback | undefined =>
  warningMessage
    ? { message: warningMessage, isWarning: true }
    : hint
      ? { message: hint, isWarning: false }
      : undefined;

/**
 * Resolves a field's feedback (warning over hint) and keeps the previous one visible while a
 * refresh is in flight, so the message swaps in place when the new data lands instead of blanking
 * out and shifting the layout during the load.
 */
export const useStableFeedback = (
  warningMessage: string | null | undefined,
  hint: string | null | undefined,
  loading: boolean
): StableFeedback | undefined => {
  const live = toFeedback(warningMessage, hint);

  // Remember the last feedback shown outside a load, so it can bridge the loading gap.
  const previous = useRef<StableFeedback | undefined>(undefined);

  useEffect(() => {
    if (!loading) {
      previous.current = toFeedback(warningMessage, hint);
    }
  }, [loading, warningMessage, hint]);

  return loading ? (live ?? previous.current) : live;
};
