import { Button, Popover, Tooltip } from "@patternfly/react-core";
import React, { useState, MouseEvent } from "react";
import { Td } from "@patternfly/react-table";
import { CopyIcon } from "@patternfly/react-icons";
import copy from "copy-to-clipboard";
import { words } from "@/UI/words";
import styled from "styled-components";

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

  return wrapWithPopover ? (
    <Popover
      bodyContent={
        <>
          <StyledPopoverBody>{value}</StyledPopoverBody>

          <Tooltip content={words("attribute.value.copy")} entryDelay={200}>
            <StyledButton variant="plain">
              <CopyIcon
                aria-label="Copy to clipboard"
                onClick={() => copy(value)}
              />
            </StyledButton>
          </Tooltip>
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

const StyledButton = styled(Button)`
  position: absolute;
  top: var(--pf-c-popover--c-button--Top);
  right: var(--pf-c-popover--c-button--Right);
`;
