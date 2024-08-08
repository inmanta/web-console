import { RefObject } from "react";
import { scrollRowIntoView } from "./ScrollRowIntoView";

jest.useFakeTimers();

test("GIVEN scrollElementIntoView WHEN provided with valid element as a prameter THEN scrollIntoView executes", () => {
  const container = document.createElement("span");
  const scrollIntoViewMock = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

  const useRefSpy: RefObject<HTMLSpanElement> = { current: container };

  scrollRowIntoView(useRefSpy);
  jest.runAllTimers();

  expect(scrollIntoViewMock).toBeCalled();
});

test("GIVEN scrollElementIntoView WHEN run with null parameter THEN function executes scrollIntoView()", () => {
  const scrollIntoViewMock = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

  const ref: RefObject<HTMLSpanElement> = { current: null };

  scrollRowIntoView(ref);
  expect(scrollIntoViewMock).not.toBeCalled();
});
