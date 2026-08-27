import React from "react";
import styled, { keyframes } from "styled-components";
import { words } from "@/UI/words";

const rotate = keyframes`
  to { transform: rotate(360deg); }
`;

/**
 * A conic-gradient fading arc, masked into a thin ring. The gradient and mask
 * are static — only `transform` is animated — so the rotation stays on the
 * compositor. PatternFly's <Spinner> animates stroke-dasharray/stroke-dashoffset
 * instead, which Chrome cannot composite: it re-rasterizes the SVG path on the
 * main thread every frame, costing ~30% of a CPU core per spinner on some
 * platforms.
 *
 * Colored with the same fixed token PatternFly's <Spinner> uses
 * (`--pf-t--global--icon--color--brand--default`) rather than `currentColor`,
 * so it always renders the same brand blue regardless of ambient text color.
 */
const StyledSpinner = styled.span<{ $size: number; $ringWidth: number }>`
  display: inline-block;
  flex: none;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  color: var(--pf-t--global--icon--color--brand--default);
  border-radius: 50%;
  background: conic-gradient(from 0deg, currentColor, transparent 80%);
  -webkit-mask: radial-gradient(
    farthest-side,
    transparent calc(100% - ${({ $ringWidth }) => $ringWidth}px),
    #000 calc(100% - ${({ $ringWidth }) => $ringWidth}px)
  );
  mask: radial-gradient(
    farthest-side,
    transparent calc(100% - ${({ $ringWidth }) => $ringWidth}px),
    #000 calc(100% - ${({ $ringWidth }) => $ringWidth}px)
  );
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
 * @param size - Diameter in pixels, defaults to 12.
 */
export const Spinner: React.FC<Props> = ({ size = 12, ...rest }) => (
  <StyledSpinner
    $size={size}
    $ringWidth={size / 8}
    role="progressbar"
    aria-label={words("loading")}
    {...rest}
  />
);
