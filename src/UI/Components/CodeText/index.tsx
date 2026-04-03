import React from "react";
import styled from "styled-components";

interface Props {
  singleLine?: boolean;
  children: string;
}

/**
 * Renders inline code text inside a styled `<pre>` block.
 *
 * @prop {boolean} [singleLine=false] - When true, truncates overflowing text
 *   with an ellipsis and prevents wrapping. Use this inside constrained
 *   containers such as table cells.
 * @prop {string} children - The text content to display.
 */
export const CodeText: React.FC<Props> = ({ children, singleLine = false }) => (
  <StyledPre $singleLine={singleLine}>
    <code>{children}</code>
  </StyledPre>
);

/**
 * A `<pre>` element styled with the Liberation Mono font.
 *
 * @prop {boolean} $singleLine - Transient prop (not forwarded to the DOM).
 *   When true: `white-space: nowrap`, `overflow: hidden`, `text-overflow: ellipsis`.
 *   When false: `white-space: pre-wrap` (default multi-line behaviour).
 */
const StyledPre = styled.pre<{ $singleLine: boolean }>`
  white-space: ${(p) => (p.$singleLine ? "nowrap" : "pre-wrap")};
  ${({ $singleLine }) => ($singleLine ? "overflow: hidden; text-overflow: ellipsis;" : "")}
  font-family: "Liberation Mono";
`;
