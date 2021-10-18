export function scrollRowIntoView(
  rowRef: React.RefObject<HTMLSpanElement>
): void {
  // Make sure the scroll happens after the rendering
  setTimeout(() => {
    if (rowRef.current !== null) {
      rowRef.current.scrollIntoView({ block: "center" });
    }
  }, 0);
}
