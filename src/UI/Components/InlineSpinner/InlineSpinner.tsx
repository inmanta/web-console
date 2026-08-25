import React from "react";
import styled, { keyframes } from "styled-components";
import { words } from "@/UI/words";

const rotate = keyframes`
  to { transform: rotate(360deg); }
`;

/**
 * Renders a faint full-circle track (`::before`) plus a solid quarter-arc
 * (`::after`) that rotates. Only `transform` is animated, so the animation
 * runs on the compositor. PatternFly's <Spinner> animates
 * stroke-dasharray/stroke-dashoffset instead, which Chrome cannot composite:
 * it re-rasterizes the SVG path on the main thread every frame, costing
 * ~30% of a CPU core per spinner on some platforms.
 */
const StyledInlineSpinner = styled.span<{ $size: number; $borderWidth: number }>`
  position: relative;
  display: inline-block;
  flex: none;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;

  &::before,
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: ${({ $borderWidth }) => $borderWidth}px solid transparent;
  }

  &::before {
    border-color: currentColor;
    opacity: 0.25;
  }

  &::after {
    border-block-start-color: currentColor;
    animation: ${rotate} 1s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
    }
  }
`;

interface Props extends React.ComponentPropsWithoutRef<"span"> {
  size?: number;
}

/**
 * A small inline loading spinner for indicators that stay on screen
 * indefinitely, where PatternFly's <Spinner> is too expensive to animate.
 *
 * @param size - Diameter in pixels, defaults to 12.
 */
export const InlineSpinner: React.FC<Props> = ({ size = 12, ...rest }) => (
  <StyledInlineSpinner
    $size={size}
    $borderWidth={size / 8}
    role="progressbar"
    aria-label={words("loading")}
    {...rest}
  />
);
