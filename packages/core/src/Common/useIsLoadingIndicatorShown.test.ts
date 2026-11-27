import { act, renderHook } from "@testing-library/react";
import { LOADING_INDICATOR_TIMING, useIsLoadingIndicatorShown } from "./useIsLoadingIndicatorShown";

const { delay, minimumDuration } = LOADING_INDICATOR_TIMING;

/**
 * Renders the hook, loading from the start.
 */
const renderLoading = () =>
  renderHook(({ isLoading }) => useIsLoadingIndicatorShown(isLoading, LOADING_INDICATOR_TIMING), {
    initialProps: { isLoading: true },
  });

describe("useIsLoadingIndicatorShown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows nothing when nothing loads", () => {
    const { result } = renderHook(() =>
      useIsLoadingIndicatorShown(false, LOADING_INDICATOR_TIMING)
    );

    act(() => vi.advanceTimersByTime(delay + minimumDuration));

    expect(result.current).toBe(false);
  });

  it("never shows the indicator for a load shorter than the delay", () => {
    const { result, rerender } = renderLoading();

    act(() => vi.advanceTimersByTime(delay - 100));

    expect(result.current).toBe(false);

    rerender({ isLoading: false });
    act(() => vi.advanceTimersByTime(delay + minimumDuration));

    expect(result.current).toBe(false);
  });

  it("shows the indicator once the load takes as long as the delay", () => {
    const { result } = renderLoading();

    act(() => vi.advanceTimersByTime(delay - 1));

    expect(result.current).toBe(false);

    act(() => vi.advanceTimersByTime(1));

    expect(result.current).toBe(true);
  });

  it("keeps the indicator for the minimum duration when the load ends sooner", () => {
    const { result, rerender } = renderLoading();

    act(() => vi.advanceTimersByTime(delay + 100));
    rerender({ isLoading: false });
    act(() => vi.advanceTimersByTime(minimumDuration - 101));

    expect(result.current).toBe(true);

    act(() => vi.advanceTimersByTime(1));

    expect(result.current).toBe(false);
  });

  it("keeps the indicator when a new load starts during the minimum duration", () => {
    const { result, rerender } = renderLoading();

    act(() => vi.advanceTimersByTime(delay + 100));
    rerender({ isLoading: false });
    act(() => vi.advanceTimersByTime(100));
    rerender({ isLoading: true });
    act(() => vi.advanceTimersByTime(minimumDuration));

    expect(result.current).toBe(true);

    rerender({ isLoading: false });
    act(() => vi.advanceTimersByTime(0));

    expect(result.current).toBe(false);
  });

  it("keeps the indicator while the load lasts longer than the minimum duration", () => {
    const { result, rerender } = renderLoading();

    act(() => vi.advanceTimersByTime(delay + minimumDuration + 400));

    expect(result.current).toBe(true);

    rerender({ isLoading: false });

    act(() => vi.advanceTimersByTime(0));

    expect(result.current).toBe(false);
  });
});
