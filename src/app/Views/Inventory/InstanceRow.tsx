import React from "react";
import { Row } from "./RowPresenter";
import {
  Tbody,
  Tr,
  Td,
  ExpandableRowContent,
  OnCollapse,
} from "@patternfly/react-table";
import { InstanceDetails } from "../InstanceDetails/View";

interface Props {
  row: Row;
  index: number;
  isExpanded: boolean;
  onToggle: OnCollapse;
}

const COLUMN_LENGTH = 3;

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
      <Td dataLabel="id">{row.id}</Td>
      <Td dataLabel="state">{row.state}</Td>
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
