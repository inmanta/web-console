export function scrollRowIntoView(
  rowRef: React.RefObject<HTMLSpanElement>,
  options: ScrollIntoViewOptions = { block: "center" }
): void {
  scrollElementIntoView(rowRef.current, options);
}

export function scrollElementIntoView(
  element: HTMLSpanElement | null,
  options: ScrollIntoViewOptions = { block: "center" }
): void {
  // Make sure the scroll happens after the rendering
  setTimeout(() => {
    if (element !== null) {
      element.scrollIntoView(options);
    }
  }, 0);
}
