import React from "react";
import { Row } from "./RowPresenter";
import {
  Tbody,
  Tr,
  Td,
  ExpandableRowContent,
  OnCollapse,
} from "@patternfly/react-table";
import { Tooltip } from "@patternfly/react-core";
import { InstanceDetails } from "../InstanceDetails/View";
import { DateInfo } from "./DatePresenter";
import { content } from "./content";

interface Props {
  row: Row;
  index: number;
  isExpanded: boolean;
  onToggle: OnCollapse;
}

const COLUMN_LENGTH = 5;

export const InstanceRow: React.FC<Props> = ({
  row,
  index,
  isExpanded,
  onToggle,
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
      <Td dataLabel={content("inventory.column.id")}>{row.id}</Td>
      <Td dataLabel={content("inventory.column.state")}>{row.state}</Td>
      <Td dataLabel={content("inventory.column.createdAt")}>
        <DateWithTooltip date={row.createdAt} />
      </Td>
      <Td dataLabel={content("inventory.column.updatedAt")}>
        <DateWithTooltip date={row.updatedAt} />
      </Td>
    </Tr>
    <Tr isExpanded={isExpanded} data-testid={`details_${row.id}`}>
      <Td colSpan={COLUMN_LENGTH}>
        <ExpandableRowContent>
          <InstanceDetails />
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
