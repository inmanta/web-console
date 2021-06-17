import { Button, Popover, Tooltip } from "@patternfly/react-core";
import React, { useState, MouseEvent } from "react";
import { Td } from "@patternfly/react-table";
import { CopyIcon } from "@patternfly/react-icons";
import copy from "copy-to-clipboard";
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

  return wrapWithPopover ? (
    <Popover
      bodyContent={value}
      footerContent={
        <Tooltip content={words("attribute.value.copy")} entryDelay={200}>
          <Button variant="plain">
            <CopyIcon
              aria-label="Copy to clipboard"
              onClick={() => copy(value)}
            />
          </Button>
        </Tooltip>
      }
      showClose={false}
    >
      {cell}
    </Popover>
  ) : (
    cell
  );
};
