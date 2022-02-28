import React, { useState, MouseEvent } from "react";
import { Popover } from "@patternfly/react-core";
import { Td } from "@patternfly/react-table";
import styled from "styled-components";
import { ClipboardCopyButton } from "@/UI/Components/ClipboardCopyButton";
import { words } from "@/UI/words";

interface Props {
  className: string;
  label: string;
  value: string;
}

export const CellWithCopy: React.FC<Props> = ({ label, value, className }) => {
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
      className={className}
      key={label}
      dataLabel={label}
      onMouseEnter={onMouseEnter}
    >
      {value}
    </Td>
  );
  const formattedValue = formatValue(value);

  return wrapWithPopover ? (
    <Popover
      bodyContent={
        <>
          <StyledPopoverBody>{formattedValue}</StyledPopoverBody>
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
  white-space: pre-wrap;
`;

const StyledButton = styled(ClipboardCopyButton)`
  position: absolute;
  top: var(--pf-c-popover--c-button--Top);
  right: var(--pf-c-popover--c-button--Right);
`;

function formatValue(value: string): string {
  return isJson(value) ? JSON.stringify(JSON.parse(value), null, 2) : value;
}

function isJson(value: string): boolean {
  try {
    JSON.parse(value);
  } catch (e) {
    return false;
  }
  return true;
}
