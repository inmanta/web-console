import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { words } from "@/UI/words";

interface Props {
  height: number;
  onResize: (height: number) => void;
  minHeight?: number;
}

export const KEYBOARD_STEP = 20;

/**
 * A horizontal drag bar that lets the user change the height of the element above it.
 * It works with a pointer drag or with the arrow keys once focused.
 *
 * @prop {number} height - The current height in px of the element being resized.
 * @prop {(height: number) => void} onResize - Called with the new height in px while resizing.
 * @prop {number} [minHeight=0] - The smallest height in px the handle allows.
 */
export const ResizeHandle: React.FC<Props> = ({ height, onResize, minHeight = 0 }) => {
  // Ends the drag in progress, so its listeners don't outlive an unmount mid-drag.
  const stopDragRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => () => stopDragRef.current?.(), []);

  const resizeTo = (newHeight: number) => onResize(Math.max(minHeight, Math.round(newHeight)));

  const handlePointerDown = (event: React.PointerEvent) => {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = height;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      resizeTo(startHeight + moveEvent.clientY - startY);
    };

    const stopDrag = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", stopDrag);
      document.removeEventListener("pointercancel", stopDrag);
      stopDragRef.current = undefined;
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", stopDrag);
    document.addEventListener("pointercancel", stopDrag);
    stopDragRef.current = stopDrag;
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      resizeTo(height - KEYBOARD_STEP);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      resizeTo(height + KEYBOARD_STEP);
    }
  };

  return (
    <Handle
      role="separator"
      aria-orientation="horizontal"
      aria-label={words("resize")}
      aria-valuenow={height}
      aria-valuemin={minHeight}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
    />
  );
};

const Handle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 12px;
  cursor: row-resize;
  touch-action: none;

  &::after {
    content: "";
    width: 32px;
    height: 4px;
    border-radius: var(--pf-t--global--border--radius--pill);
    background-color: var(--pf-t--global--border--color--default);
  }

  &:hover::after,
  &:focus-visible::after {
    background-color: var(--pf-t--global--border--color--hover);
  }

  &:focus-visible {
    outline: var(--pf-t--global--focus-ring--width--offset) solid
      var(--pf-t--global--focus-ring--color--default);
  }
`;
