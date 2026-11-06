import React from "react";
import styled from "styled-components";
import { ClipboardCopyButton } from "../ClipboardCopyButton";
import { RowHoverReveal } from "../RowHoverReveal";

interface Props {
  value: string;
  tooltipContent: string;
}

/**
 * Renders a value followed by a dimmed button that copies it to the clipboard, at full strength
 * only while the button itself is hovered. Inside a row (see RowHoverReveal) the button stays
 * hidden until that row is hovered.
 *
 * @prop {string} value - The text to copy, also shown when there are no children.
 * @prop {string} tooltipContent - The tooltip on the copy button.
 */
export const TextWithCopy: React.FC<React.PropsWithChildren<Props>> = ({
  value,
  tooltipContent,
  children,
  ...props
}) => {
  return (
    <span {...props}>
      {children || value}
      <RowHoverReveal>
        <CopyButton value={value} tooltipContent={tooltipContent} />
      </RowHoverReveal>
    </span>
  );
};

// The negative block margin cancels the vertical padding of the small (size="sm") button, so it
// doesn't make the line taller than the text (in a table, rows with and without it then have the
// same height). It uses the token PF's small button padding is built from.
const CopyButton = styled(ClipboardCopyButton)`
  margin-block: calc(-1 * var(--pf-t--global--spacer--control--vertical--compact));
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
`;
