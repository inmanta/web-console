import React, { useState, MouseEvent } from "react";
import { Popover } from "@patternfly/react-core";
import { Td, TdProps } from "@patternfly/react-table";
import styled from "styled-components";
import { ClipboardCopyButton } from "@/UI/Components/ClipboardCopyButton";
import { words } from "@/UI/words";

interface Props extends Pick<TdProps, "width"> {
  className: string;
  label: string;
  value: string;
}

export const CellWithCopy: React.FC<Props> = ({
  label,
  value,
  className,
  ...props
}) => {
  const [wrapWithPopover, setWrapWithPopover] = useState(false);

  const onMouseEnter = (event: MouseEvent<HTMLTableCellElement>) => {
    // Check if overflown
    if (event.currentTarget.offsetWidth < event.currentTarget.scrollWidth) {
      setWrapWithPopover(true);
    } else {
      setWrapWithPopover(false);
    }
  };
  const cell = (
    <Td
      {...props}
      className={className}
      key={label}
      dataLabel={label}
      onMouseEnter={onMouseEnter}
    >
      {value}
    </Td>
  );

  return wrapWithPopover ? (
    <Popover
      bodyContent={
        <>
          <StyledPopoverBody>{value}</StyledPopoverBody>
          <StyledButton
            value={value}
            tooltipContent={words("attribute.value.copy")}
          />
        </>
      }
      showClose={false}
    >
      {cell}
    </Popover>
  ) : (
    cell
  );
};

const StyledPopoverBody = styled.div`
  padding-right: var(--pf-c-popover--c-button--sibling--PaddingRight);
`;

const StyledButton = styled(ClipboardCopyButton)`
  position: absolute;
  top: var(--pf-c-popover--c-button--Top);
  right: var(--pf-c-popover--c-button--Right);
`;
