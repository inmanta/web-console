import { useRef } from "react";
import { fireEvent, renderHook } from "@testing-library/react";
import { useClickOutside } from "./useClickOutside";

describe("useClickOutside", () => {
  it("calls onClickOutside when clicking outside all refs", () => {
    const onClickOutside = vi.fn();
    const outer = document.createElement("div");
    document.body.appendChild(outer);

    renderHook(() => {
      const ref = useRef<HTMLElement>(outer);
      useClickOutside([ref], onClickOutside, true);
    });

    fireEvent.mouseDown(document);

    expect(onClickOutside).toHaveBeenCalledTimes(1);

    document.body.removeChild(outer);
  });

  it("does not call onClickOutside when clicking inside a ref", () => {
    const onClickOutside = vi.fn();
    const outer = document.createElement("div");
    document.body.appendChild(outer);

    renderHook(() => {
      const ref = useRef<HTMLElement>(outer);
      useClickOutside([ref], onClickOutside, true);
    });

    fireEvent.mouseDown(outer);

    expect(onClickOutside).not.toHaveBeenCalled();

    document.body.removeChild(outer);
  });

  it("does not call onClickOutside when enabled is false", () => {
    const onClickOutside = vi.fn();
    const outer = document.createElement("div");
    document.body.appendChild(outer);

    renderHook(() => {
      const ref = useRef<HTMLElement>(outer);
      useClickOutside([ref], onClickOutside, false);
    });

    fireEvent.mouseDown(document);

    expect(onClickOutside).not.toHaveBeenCalled();

    document.body.removeChild(outer);
  });
});
