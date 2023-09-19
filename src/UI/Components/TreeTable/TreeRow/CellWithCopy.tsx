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
    <Td
      className={className}
      key={label}
      dataLabel={label}
      onMouseEnter={onMouseEnter}
    >
      {shouldRenderLink(value, hasRelation) ? (
        <MultiLinkCell
          value={value}
          serviceName={serviceName}
          onClick={onClick}
        />
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

export const StyledPopoverBody = styled.div`
  padding-right: var(--pf-v5-c-popover--c-button--sibling--PaddingRight);
  overflow-y: auto;
  max-height: 50vh;
  white-space: pre-wrap;
`;

export const StyledButton = styled(ClipboardCopyButton)`
  position: absolute;
  top: var(--pf-v5-c-popover--c-button--Top);
  right: calc(var(--pf-v5-c-popover--c-button--Right) + 0.5rem);
`;

export function formatValue(value: string): string {
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

export function shouldRenderLink(
  value: string,
  hasRelation?: boolean,
): boolean {
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

export const MultiLinkCell: React.FC<LinkCellProps> = ({
  value,
  serviceName,
  onClick,
}) => {
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

export const LinkCell: React.FC<LinkCellProps> = ({
  value,
  serviceName,
  onClick,
}) =>
  serviceName && value.length > 0 ? (
    <InstanceCellButton
      id={value}
      serviceName={serviceName}
      onClick={onClick}
    />
  ) : (
    <Button
      variant="link"
      isInline
      onClick={
        serviceName ? () => onClick(value, serviceName) : () => onClick(value)
      }
    >
      {value}
    </Button>
  );
