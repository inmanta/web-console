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

const CopyButton = styled(ClipboardCopyButton)`
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
`;
