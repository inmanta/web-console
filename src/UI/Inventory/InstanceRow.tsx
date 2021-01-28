import React from "react";
import { Tbody, Tr, Td, ExpandableRowContent } from "@patternfly/react-table";
import { words } from "@/UI";
import {
  AttributesSummaryView,
  DateWithTooltip,
  IdWithCopy,
} from "./Components";
import { InstanceRowProps } from "./InstanceRowProps";

interface Props extends InstanceRowProps {
  expandedContent: React.ReactElement | null;
}

export const InstanceRow: React.FC<Props> = ({
  row,
  index,
  isExpanded,
  onToggle,
  numberOfColumns,
  expandedContent,
}) => (
  <Tbody isExpanded={false}>
    <Tr aria-label={`Row-${index}`}>
      <Td
        aria-label={`Toggle_${index}`}
        expand={{
          rowIndex: index,
          isExpanded,
          onToggle,
        }}
      />
      <Td dataLabel={words("inventory.column.id")}>
        <IdWithCopy id={row.id} />
      </Td>
      <Td dataLabel={words("inventory.column.state")}>{row.state}</Td>
      <Td dataLabel={words("inventory.column.attributesSummary")}>
        <AttributesSummaryView summary={row.attributesSummary} />
      </Td>
      <Td dataLabel={words("inventory.column.createdAt")}>
        <DateWithTooltip date={row.createdAt} />
      </Td>
      <Td dataLabel={words("inventory.column.updatedAt")}>
        <DateWithTooltip date={row.updatedAt} />
      </Td>
    </Tr>
    <Tr isExpanded={isExpanded} aria-label={`ExpandedRow-${index}`}>
      <Td colSpan={numberOfColumns}>
        <ExpandableRowContent>{expandedContent}</ExpandableRowContent>
      </Td>
    </Tr>
  </Tbody>
);
