import { fireEvent, render, screen } from "@testing-library/react";
import { words } from "@/UI/words";
import { KEYBOARD_STEP, ResizeHandle } from "./ResizeHandle";

const height = 100;
const minHeight = 40;

const setup = () => {
  const onResize = vi.fn();

  render(<ResizeHandle height={height} onResize={onResize} minHeight={minHeight} />);

  return { onResize, handle: screen.getByRole("separator", { name: words("resize") }) };
};

describe("ResizeHandle", () => {
  test.each(["pointerUp", "pointerCancel"] as const)(
    "resizes by the distance dragged and stops on %s",
    (endEvent) => {
      const { onResize, handle } = setup();

      fireEvent.pointerDown(handle, { clientY: 200 });
      fireEvent.pointerMove(document, { clientY: 260 });

      expect(onResize).toHaveBeenLastCalledWith(height + 60);

      fireEvent[endEvent](document);
      fireEvent.pointerMove(document, { clientY: 400 });

      expect(onResize).toHaveBeenCalledTimes(1);
    }
  );

  test("never resizes below the minimum height", () => {
    const { onResize, handle } = setup();

    fireEvent.pointerDown(handle, { clientY: 200 });
    fireEvent.pointerMove(document, { clientY: 0 });

    expect(onResize).toHaveBeenLastCalledWith(minHeight);
  });

  test("resizes with the arrow keys", () => {
    const { onResize, handle } = setup();

    fireEvent.keyDown(handle, { key: "ArrowDown" });
    fireEvent.keyDown(handle, { key: "ArrowUp" });

    expect(onResize.mock.calls).toEqual([[height + KEYBOARD_STEP], [height - KEYBOARD_STEP]]);
  });
});
