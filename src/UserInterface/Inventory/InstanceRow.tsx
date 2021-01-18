import React from "react";
import { AttributeInfo, Row } from "Core";
import {
  Tbody,
  Tr,
  Td,
  ExpandableRowContent,
  OnCollapse,
} from "@patternfly/react-table";
import { Tooltip } from "@patternfly/react-core";
import { DateInfo, content } from "Core";
import {
  OutlinedQuestionCircleIcon,
  ListIcon,
  RedoIcon,
} from "@patternfly/react-icons";
import { List, ListItem, ListVariant } from "@patternfly/react-core";

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
      <Td dataLabel={content("inventory.column.id")}>{row.id.short}</Td>
      <Td dataLabel={content("inventory.column.state")}>{row.state}</Td>
      <Td dataLabel={content("inventory.column.attributes")}>
        <Attributes info={row.attributes} />
      </Td>
      <Td dataLabel={content("inventory.column.createdAt")}>
        <DateWithTooltip date={row.createdAt} />
      </Td>
      <Td dataLabel={content("inventory.column.updatedAt")}>
        <DateWithTooltip date={row.updatedAt} />
      </Td>
      <Td dataLabel={content("inventory.column.actions")}>{actions}</Td>
    </Tr>
    <Tr isExpanded={isExpanded} data-testid={`details_${row.id.short}`}>
      <Td colSpan={numberOfColumns}>
        <ExpandableRowContent>
          <div>instance details</div>
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

const Attributes: React.FC<{ info: AttributeInfo }> = ({ info }) => {
  const color = (enabled) => (enabled ? "#030303" : "#D2D2D2");

  return (
    <List variant={ListVariant.inline}>
      <ListItem>
        <OutlinedQuestionCircleIcon color={color(info.candidate)} />
      </ListItem>
      <ListItem>
        <ListIcon color={color(info.active)} />
      </ListItem>
      <ListItem>
        <RedoIcon color={color(info.rollback)} />
      </ListItem>
    </List>
  );
};
