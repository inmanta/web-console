/**
 * Monaco line height: Math.round(GOLDEN_LINE_HEIGHT_RATIO * fontSize)
 *   Windows/Linux: Math.round(1.35 * 14) = 19px
 *   macOS:         Math.round(1.5  * 12) = 18px
 * 19px covers both platforms (slightly tall on macOS — better than too short).
 */
const LINE_HEIGHT = 19;

/** Tallest the collapsed editor grows before it starts scrolling internally. */
const COLLAPSED_MAX_HEIGHT = 300;

/**
 * Determines the editor height (in px) from the content's line count.
 * Uses explicit px values instead of "sizeToFit" because PatternFly's sizeToFit
 * calls editor.layout() but never updates the container's CSS height, leaving
 * the container at 0px (invalid CSS value) while Monaco overflows it. The height
 * targets the Monaco container only; the toolbar sits outside it.
 *
 * @param code - The display-ready code shown in the editor.
 * @param cap  - When true (default), caps at {@link COLLAPSED_MAX_HEIGHT}. Pass
 *   false for the expanded state, which fits the full content (the caller bounds
 *   it to the viewport instead).
 * @returns A CSS px height string.
 */
export function getDefaultHeightEditor(code: string, cap = true): string {
  const contentHeight = code.split("\n").length * LINE_HEIGHT;

  return `${cap ? Math.min(contentHeight, COLLAPSED_MAX_HEIGHT) : contentHeight}px`;
}
