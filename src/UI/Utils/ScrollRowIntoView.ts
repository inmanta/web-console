export function scrollRowIntoView(
  rowRef: React.RefObject<HTMLSpanElement>,
  options: ScrollIntoViewOptions = { block: "center" }
): void {
  // Make sure the scroll happens after the rendering
  setTimeout(() => {
    if (rowRef.current !== null) {
      rowRef.current.scrollIntoView(options);
    }
  }, 0);
}
