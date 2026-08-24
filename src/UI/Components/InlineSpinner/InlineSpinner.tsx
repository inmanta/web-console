import React from "react";
import styled, { keyframes } from "styled-components";
import { words } from "@/UI/words";

const rotate = keyframes`
  to { transform: rotate(360deg); }
`;

/**
 * Only `transform` is animated, so the animation runs on the compositor.
 * PatternFly's <Spinner> animates stroke-dasharray/stroke-dashoffset instead,
 * which Chrome cannot composite: it re-rasterizes the SVG path on the main
 * thread every frame, costing ~30% of a CPU core per spinner on some platforms.
 */
const StyledInlineSpinner = styled.span<{ $size: number }>`
  display: inline-block;
  flex: none;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border: 2px solid currentColor;
  border-block-start-color: transparent;
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

interface Props extends React.ComponentPropsWithoutRef<"span"> {
  size?: number;
}

/**
 * A small inline loading spinner for indicators that stay on screen
 * indefinitely, where PatternFly's <Spinner> is too expensive to animate.
 *
 * @param size - Diameter in pixels, defaults to 12 (matches PatternFly's "sm").
 */
export const InlineSpinner: React.FC<Props> = ({ size = 12, ...rest }) => (
  <StyledInlineSpinner $size={size} role="progressbar" aria-label={words("loading")} {...rest} />
);
