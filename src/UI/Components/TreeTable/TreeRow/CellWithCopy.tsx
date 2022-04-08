import React, { useState, MouseEvent, useContext } from "react";
import { Button, Popover } from "@patternfly/react-core";
import { Td } from "@patternfly/react-table";
import styled from "styled-components";
import { ClipboardCopyButton } from "@/UI/Components/ClipboardCopyButton";
import { TreeTableCellContext } from "@/UI/Components/TreeTable/RowReferenceContext";
import { words } from "@/UI/words";

interface Props {
  className: string;
  label: string;
  value: string;
  hasOnClick?: boolean;
}

export const CellWithCopy: React.FC<Props> = ({
  label,
  value,
  className,
  hasOnClick,
}) => {
  const [wrapWithPopover, setWrapWithPopover] = useState(false);
  const { onClick } = useContext(TreeTableCellContext);

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
      {hasOnClick ? (
        <Button variant="link" isInline onClick={() => onClick(value)}>
          {value}
        </Button>
      ) : (
        value
      )}
    </Td>
  );

  return wrapWithPopover ? (
    <Popover
      bodyContent={
        <>
          <StyledPopoverBody>{formatValue(value)}</StyledPopoverBody>
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
