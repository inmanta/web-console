import { renderHook } from "@testing-library/react";
import { useOptionDisplayNames } from "./useOptionDisplayNames";

const options = [
  { children: "Apple", value: "apple" },
  { children: "Banana", value: "banana" },
];

test("useOptionDisplayNames keeps the name of an option that is no longer given", () => {
  const [apple, banana] = options;
  const { result, rerender } = renderHook((props) => useOptionDisplayNames(props), {
    initialProps: options,
  });

  rerender([banana]);

  expect(result.current(apple.value)).toBe(apple.children);
  expect(result.current(banana.value)).toBe(banana.children);
});

test("useOptionDisplayNames returns undefined for a value that was never given", () => {
  const { result } = renderHook(() => useOptionDisplayNames(options));

  expect(result.current("cherry")).toBeUndefined();
});
