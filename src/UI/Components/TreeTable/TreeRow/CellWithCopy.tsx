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

/**
 * This component is used to display a cell with a value and a copy button.
 * If the value is a comma-separated list of IDs, it will display a list of links.
 * Otherwise, it will display a single link.
 * @prop label - The label of the cell.
 * @prop value - The value of the cell.
 * @prop className - The class name of the cell.
 * @prop hasRelation - Whether the value has a relation.
 * @prop serviceName - The name of the service.
 * @returns A React component that displays a cell with a value and a copy button.
 */
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

/**
 * This function formats the value.
 * @param value - The value to format.
 * @returns The formatted value.
 */
function formatValue(value: string): string {
  return isJson(value) ? JSON.stringify(JSON.parse(value), null, 2) : value;
}

/**
 * This function checks if the value is a JSON object.
 * @param value - The value to check.
 * @returns True if the value is a JSON object, false otherwise.
 */
function isJson(value: string): boolean {
  try {
    JSON.parse(value);
  } catch (_e) {
    return false;
  }

  return true;
}

/**
 * This function checks if the value should render a link.
 * @param value - The value to check.
 * @param hasRelation - Whether the value has a relation.
 * @returns True if the value should render a link, false otherwise.
 */
function shouldRenderLink(value: string, hasRelation?: boolean): boolean {
  return !!(hasRelation && value.length > 0 && value !== "{}");
}

/**
 * This function splits the value into a list of IDs.
 * @param value - The value to split.
 * @returns A list of IDs.
 */
function splitValue(value: unknown): string[] {
  if (typeof value !== "string") {
    return [String(value)];
  }

  return value.split(",").map((val) => val.trim());
}

/**
 * This function checks if the value is a comma-separated list of IDs.
 * @param value - The value to check.
 * @returns True if the value is a comma-separated list of IDs, false otherwise.
 */
function isValueOfMultipleIds(value: unknown): boolean {
  return typeof value === "string" && splitValue(value).length > 0;
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
 * @prop value - The value to display.
 * @prop serviceName - The name of the service.
 * @prop onClick - The function to call when the link is clicked.
 * @returns A React component that displays a link to a service instance.
 */
export const MultiLinkCell: React.FC<LinkCellProps> = ({ value, serviceName, onClick }) => {
  if (value && isValueOfMultipleIds(value)) {
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

/**
 * This component is used to display a link to a service instance.
 * If the value is a comma-separated list of IDs, it will display a list of links.
 * Otherwise, it will display a single link.
 * @prop value - The value to display. (this is usually a string, but can also be an empty string or null)
 * @prop serviceName - The name of the service.
 * @prop onClick - The function to call when the link is clicked.
 * @returns A React component that displays a link to a service instance.
 */
const LinkCell: React.FC<LinkCellProps> = ({ value, serviceName, onClick }) =>
  serviceName && value && value.length > 0 ? (
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
