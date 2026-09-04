import { renderHook } from "@testing-library/react";
import { useStableFeedback } from "./useStableFeedback";

test("GIVEN a warning and a hint THEN the warning takes precedence", () => {
  const { result } = renderHook(() => useStableFeedback("broken annotation", "waiting", false));

  expect(result.current).toEqual({ message: "broken annotation", isWarning: true });
});

test("GIVEN only a hint THEN it is returned as a neutral (non-warning) message", () => {
  const { result } = renderHook(() => useStableFeedback(undefined, "waiting", false));

  expect(result.current).toEqual({ message: "waiting", isWarning: false });
});

test("GIVEN neither a warning nor a hint THEN there is no feedback", () => {
  const { result } = renderHook(() => useStableFeedback(undefined, undefined, false));

  expect(result.current).toBeUndefined();
});

test("GIVEN a refresh that momentarily clears the message THEN the previous one is kept until new data lands", () => {
  const { result, rerender } = renderHook(
    ({ warning, hint, loading }) => useStableFeedback(warning, hint, loading),
    {
      initialProps: {
        warning: undefined as string | undefined,
        hint: "not in list" as string | undefined,
        loading: false,
      },
    }
  );

  expect(result.current).toEqual({ message: "not in list", isWarning: false });

  // The source changes: the field enters a load and its own feedback briefly resolves to nothing.
  // The last message is bridged so the slot never blanks out (no layout shift).
  rerender({ warning: undefined, hint: undefined, loading: true });
  expect(result.current).toEqual({ message: "not in list", isWarning: false });

  // The refreshed data settles with a different message, which replaces the bridged one in place.
  rerender({ warning: undefined, hint: "no suggestions", loading: false });
  expect(result.current).toEqual({ message: "no suggestions", isWarning: false });
});
