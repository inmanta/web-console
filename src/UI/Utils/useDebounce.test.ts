import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));

    expect(result.current).toBe("initial");
  });

  it("does not update the value before the delay has passed", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "updated" });
    act(() => vi.advanceTimersByTime(100));

    expect(result.current).toBe("initial");
  });

  it("updates the value after the delay has passed", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "updated" });
    act(() => vi.advanceTimersByTime(300));

    expect(result.current).toBe("updated");
  });

  it("resets the timer when the value changes before the delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "first" });
    act(() => vi.advanceTimersByTime(200));

    rerender({ value: "second" });
    act(() => vi.advanceTimersByTime(200));

    expect(result.current).toBe("initial");

    act(() => vi.advanceTimersByTime(100));

    expect(result.current).toBe("second");
  });
});
