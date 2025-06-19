import React, { useState, MouseEvent, useContext } from "react";
import { Button, Flex, FlexItem, Popover } from "@patternfly/react-core";
import { Td } from "@patternfly/react-table";
import styled from "styled-components";
import { ClipboardCopyButton } from "@/UI/Components/ClipboardCopyButton";
import { words } from "@/UI/words";
import { TreeTableCellContext } from "../RowReferenceContext";
import { InstanceCellButton } from "./InstanceCellButton";

interface Props {
  className: string;
  label: string;
  value: string;
  hasRelation?: boolean;
  serviceName?: string;
}

export const CellWithCopy: React.FC<Props> = ({
  label,
  value,
  className,
  hasRelation,
  serviceName,
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
    <Td className={className} key={label} dataLabel={label} onMouseEnter={onMouseEnter}>
      {shouldRenderLink(value, hasRelation) ? (
        <MultiLinkCell value={value} serviceName={serviceName} onClick={onClick} />
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
          <ClipboardCopyButton value={value} tooltipContent={words("attribute.value.copy")} />
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
  overflow-y: auto;
  max-height: 50vh;
  white-space: pre-wrap;
`;

function formatValue(value: string): string {
  return isJson(value) ? JSON.stringify(JSON.parse(value), null, 2) : value;
}

function isJson(value: string): boolean {
  try {
    JSON.parse(value);
  } catch (_e) {
    return false;
  }

  return true;
}

function shouldRenderLink(value: string, hasRelation?: boolean): boolean {
  return !!(hasRelation && value.length > 0 && value !== "{}");
}

function splitValue(value: string): string[] {
  const parts = value.split(",").map((val) => val.trim());

  return parts;
}

function isValueOfMultipleIds(value: string): boolean {
  return splitValue(value).length > 0;
}

interface LinkCellProps {
  value: string;
  serviceName?: string;
  onClick: (cellValue: string, serviceName?: string | undefined) => void;
}

/**
 * This component is used to display a link to a service instance.
 * If the value is a comma-separated list of IDs, it will display a list of links.
 * Otherwise, it will display a single link.
 * @param value - The value to display.
 * @param serviceName - The name of the service.
 * @param onClick - The function to call when the link is clicked.
 * @returns A React component that displays a link to a service instance.
 */
export const MultiLinkCell: React.FC<LinkCellProps> = ({ value, serviceName, onClick }) => {
  if (isValueOfMultipleIds(value)) {
    const ids = splitValue(value);

    return (
      <Flex
        direction={{ default: "column" }}
        spaceItems={{ default: "spaceItemsNone" }}
        display={{ default: "inlineFlex" }}
      >
        {ids.map((id) => (
          <FlexItem key={id}>
            <LinkCell value={id} serviceName={serviceName} onClick={onClick} />
          </FlexItem>
        ))}
      </Flex>
    );
  }

  return <LinkCell value={value} serviceName={serviceName} onClick={onClick} />;
};

const LinkCell: React.FC<LinkCellProps> = ({ value, serviceName, onClick }) =>
  serviceName && value.length > 0 ? (
    <InstanceCellButton id={value} serviceName={serviceName} onClick={onClick} />
  ) : (
    <Button
      variant="link"
      isInline
      onClick={serviceName ? () => onClick(value, serviceName) : () => onClick(value)}
    >
      {value}
    </Button>
  );
