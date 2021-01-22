import React from "react";
import {
  Tbody,
  Tr,
  Td,
  ExpandableRowContent,
  OnCollapse,
} from "@patternfly/react-table";
import { Row } from "@/Core";
import { words } from "@/UI";
import {
  AttributesSummaryView,
  DateWithTooltip,
  IdWithCopy,
} from "./Components";
import { InstanceDetails, AttributesView } from "@/UI/ServiceInstanceDetails";

interface Props {
  row: Row;
  index: number;
  isExpanded: boolean;
  onToggle: OnCollapse;
  numberOfColumns: number;
  actions: React.ReactElement | null;
}

export const InstanceRow: React.FC<Props> = ({
  row,
  index,
  isExpanded,
  onToggle,
  numberOfColumns,
  actions,
}) => (
  <Tbody isExpanded={false}>
    <Tr>
      <Td
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
      <Td dataLabel={words("inventory.column.actions")}>{actions}</Td>
    </Tr>
    <Tr isExpanded={isExpanded} data-testid={`details_${row.id.short}`}>
      <Td colSpan={numberOfColumns} noPadding>
        <ExpandableRowContent>
          <InstanceDetails>
            <AttributesView attributes={row.attributes} />
          </InstanceDetails>
        </ExpandableRowContent>
      </Td>
    </Tr>
  </Tbody>
);
