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
      <Td dataLabel="Id">{row.id}</Td>
      <Td dataLabel="State">{row.state}</Td>
      <Td dataLabel="Created">
        <DateWithTooltip date={row.createdAt} />
      </Td>
      <Td dataLabel="Updated">
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
