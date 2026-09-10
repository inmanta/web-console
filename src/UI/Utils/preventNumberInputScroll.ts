import { WheelEvent } from "react";

/**
 * Stops a focused `<input type="number">` from changing its value on mouse wheel: it blurs the
 * field so the wheel scrolls the page instead. Safe to wire to any TextInput's `onWheel` - it only
 * acts on number inputs and is a no-op for other types.
 *
 * @example onWheel={preventNumberInputScroll} // scrolling over a focused number field scrolls the page, value unchanged
 */
export const preventNumberInputScroll = (event: WheelEvent<HTMLInputElement>): void => {
  if (event.currentTarget.type === "number") {
    event.currentTarget.blur();
  }
};
