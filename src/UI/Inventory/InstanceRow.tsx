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
import {
  InstanceDetails,
  AttributesView,
  StatusView,
  ResourcesView,
} from "@/UI/ServiceInstanceDetails";
import {
  AutomationIcon,
  InfoCircleIcon,
  ListIcon,
} from "@patternfly/react-icons";

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
    </Tr>
    <Tr isExpanded={isExpanded} data-testid={`details_${row.id.short}`}>
      <Td colSpan={numberOfColumns}>
        <ExpandableRowContent>
          <InstanceDetails>
            <StatusView
              title={words("inventory.tabs.status")}
              icon={<InfoCircleIcon />}
              statusInfo={{
                instanceId: row.id.full,
                state: row.state,
                version: row.version,
                createdAt: row.createdAt.full,
                updatedAt: row.updatedAt.full,
                actions: actions,
              }}
            />
            <AttributesView
              attributes={row.attributes}
              title={words("inventory.tabs.attributes")}
              icon={<ListIcon />}
            />
            <ResourcesView
              title={words("inventory.tabs.resources")}
              icon={<AutomationIcon />}
            />
          </InstanceDetails>
        </ExpandableRowContent>
      </Td>
    </Tr>
  </Tbody>
);
