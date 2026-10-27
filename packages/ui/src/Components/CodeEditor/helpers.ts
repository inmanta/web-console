/** Height an auto-sizing editor expands to: near-full viewport, minus chrome. */
const EXPANDED_HEIGHT = "calc(100vh - 300px)";

/**
 * Determines the height for code editors based on content length.
 * Uses explicit px values instead of "sizeToFit" because PatternFly's sizeToFit
 * calls editor.layout() but never updates the container's CSS height, leaving
 * the container at 0px (invalid CSS value) while Monaco overflows it.
 *
 * Monaco line height: Math.round(GOLDEN_LINE_HEIGHT_RATIO * fontSize)
 *   Windows/Linux: Math.round(1.35 * 14) = 19px
 *   macOS:         Math.round(1.5  * 12) = 18px
 * Using 19px covers both platforms (slightly tall on macOS — better than too short).
 * The height prop targets the Monaco container only; the toolbar sits outside it.
 *
 * @param code - The display-ready code shown in the editor.
 * @returns A CSS px height string, capped at 300px.
 */
export function getDefaultHeightEditor(code: string): string {
  const lineCount = code.split("\n").length;

  return `${Math.min(lineCount * 19, 300)}px`;
}

/**
 * Height for an auto-sizing editor (one given no explicit `height`): sized to its
 * content while collapsed, or near-full viewport while expanded.
 *
 * @param code - The display-ready code shown in the editor.
 * @param isExpanded - Whether the expand/collapse toggle is on.
 */
export function getAutoHeight(code: string, isExpanded: boolean): string {
  return isExpanded ? EXPANDED_HEIGHT : getDefaultHeightEditor(code);
}
