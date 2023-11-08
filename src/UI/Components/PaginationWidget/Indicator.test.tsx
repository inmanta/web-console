/*eslint-disable testing-library/no-node-access*/

import React from "react";
import { screen, render } from "@testing-library/react";
import { Indicator } from "./Indicator";

function selfHasText(text: string, element: Element | null) {
  if (!element) return false;
  const hasText = (el: Element) => el.textContent === text;
  const elementHasText = hasText(element);
  const childrenDontHaveText = Array.from(element.children).every(
    (child) => !hasText(child),
  );
  return elementHasText && childrenDontHaveText;
}

test("Indicicator shows 0 of 0 for no items", () => {
  render(
    <Indicator metadata={{ before: 0, after: 0, total: 0, page_size: 20 }} />,
  );
  screen.getByText((content, element) => selfHasText("0 of 0", element));
});

test("Indicator shows '1 - 20 of 100' for page 1 limit 20 of 100 items", () => {
  render(
    <Indicator
      metadata={{ before: 0, total: 100, page_size: 20, after: 80 }}
    />,
  );
  screen.getByText((content, element) => selfHasText("1 - 20 of 100", element));
});

test("Indicator shows '21 - 40 of 100' for page 2 limit 20 of 100 items", () => {
  render(
    <Indicator
      metadata={{ before: 20, total: 100, page_size: 20, after: 60 }}
    />,
  );
  screen.getByText((content, element) =>
    selfHasText("21 - 40 of 100", element),
  );
});

test("Indicator shows '1 - 12 of 12' for page 1 of 12 items", () => {
  render(
    <Indicator metadata={{ before: 0, total: 12, page_size: 20, after: 0 }} />,
  );
  screen.getByText((content, element) => selfHasText("1 - 12 of 12", element));
});

test("Indicator shows '1 - 20 of 22' for page 1 limit 20 of 22 items", () => {
  render(
    <Indicator metadata={{ before: 0, total: 22, page_size: 20, after: 2 }} />,
  );
  screen.getByText((content, element) => selfHasText("1 - 20 of 22", element));
});

test("Indicator shows '21 - 22 of 22' for page 2 of 22 items", () => {
  render(
    <Indicator metadata={{ before: 20, total: 22, page_size: 20, after: 0 }} />,
  );
  screen.getByText((content, element) => selfHasText("21 - 22 of 22", element));
});
