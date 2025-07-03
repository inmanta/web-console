import { RefObject } from "react";
import { scrollRowIntoView } from "./ScrollRowIntoView";

vi.useFakeTimers();

test("GIVEN scrollElementIntoView WHEN provided with valid element as a parameter THEN scrollIntoView executes", () => {
  const container = document.createElement("span");
  const scrollIntoViewMock = vi.fn();

  window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

  const useRefSpy: RefObject<HTMLSpanElement> = { current: container };

  scrollRowIntoView(useRefSpy);
  vi.runAllTimers();

  expect(scrollIntoViewMock).toHaveBeenCalled();
});

test("GIVEN scrollElementIntoView WHEN run with null parameter THEN function executes scrollIntoView()", () => {
  const scrollIntoViewMock = vi.fn();

  window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

  const ref: RefObject<HTMLSpanElement | null> = { current: null };

  scrollRowIntoView(ref);
  expect(scrollIntoViewMock).not.toHaveBeenCalled();
});
