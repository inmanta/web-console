import React from "react";
import {
  Tbody,
  Tr,
  Td,
  ExpandableRowContent,
  OnCollapse,
} from "@patternfly/react-table";
import {
  OutlinedQuestionCircleIcon,
  ListIcon,
  RedoIcon,
} from "@patternfly/react-icons";
import { List, ListItem, ListVariant } from "@patternfly/react-core";
import { Tooltip } from "@patternfly/react-core";
import { Row, DateInfo, AttributesSummary } from "Core";
import { InstanceDetails } from "./InstanceDetails";
import { words } from "UserInterface";

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
      <Td dataLabel={words("inventory.column.id")}>{row.id.short}</Td>
      <Td dataLabel={words("inventory.column.state")}>{row.state}</Td>
      <Td dataLabel={words("inventory.column.attributesSummary")}>
        <Attributes summary={row.attributesSummary} />
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
      <Td colSpan={numberOfColumns}>
        <ExpandableRowContent>
          <InstanceDetails attributes={row.attributes} />
        </ExpandableRowContent>
      </Td>
    </Tr>
  </Tbody>
);

const DateWithTooltip: React.FC<{ date: DateInfo }> = ({ date }) => (
  <Tooltip content={date.full} entryDelay={200}>
    <span>{date.relative}</span>
  </Tooltip>
);

const Attributes: React.FC<{ summary: AttributesSummary }> = ({
  summary: { candidate, active, rollback },
}) => {
  const color = (enabled) => (enabled ? "#030303" : "#D2D2D2");

  return (
    <List variant={ListVariant.inline}>
      <ListItem>
        <OutlinedQuestionCircleIcon color={color(candidate)} />
      </ListItem>
      <ListItem>
        <ListIcon color={color(active)} />
      </ListItem>
      <ListItem>
        <RedoIcon color={color(rollback)} />
      </ListItem>
    </List>
  );
};
