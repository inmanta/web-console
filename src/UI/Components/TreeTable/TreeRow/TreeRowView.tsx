import React from "react";
import { Tr, Td } from "@patternfly/react-table";
import { TreeRow, isRowOfMultipleValues } from "./TreeRow";
import { Toggle } from "@/UI/Components/Toggle";
import { Indent } from "./Indent";
import { CellValueWithCopy } from "./CellValueWithCopy";

interface RowProps {
  row: TreeRow;
}

export const TreeRowView: React.FC<RowProps> = ({ row }) => {
  switch (row.kind) {
    case "Flat":
      return (
        <Tr aria-label={`Row-${row.id}`}>
          <Td dataLabel={row.primaryCell.label}>
            <Indent level={0} noToggle>
              {row.primaryCell.value}
            </Indent>
          </Td>
          {row.valueCells.map(({ label, value }) => (
            <Td
              className={isRowOfMultipleValues(row) ? "" : "pf-m-truncate"}
              key={label}
              dataLabel={label}
            >
              <CellValueWithCopy value={value} />
            </Td>
          ))}
        </Tr>
      );
    case "Root":
      return (
        <Tr aria-label={`Row-${row.id}`}>
          <Td dataLabel="name" colSpan={4}>
            <Indent level={0}>
              <Toggle
                expanded={row.isChildExpanded}
                onToggle={row.onToggle}
                aria-label={`Toggle-${row.id}`}
              />
              {row.primaryCell.value}
            </Indent>
          </Td>
        </Tr>
      );

    case "Branch":
      return (
        <Tr aria-label={`Row-${row.id}`} isExpanded={row.isExpandedByParent}>
          <Td colSpan={4} dataLabel={row.primaryCell.label}>
            <Indent level={row.level}>
              <Toggle
                expanded={row.isChildExpanded}
                onToggle={row.onToggle}
                aria-label={`Toggle-${row.id}`}
              />
              {row.primaryCell.value}
            </Indent>
          </Td>
        </Tr>
      );

    case "Leaf":
      return (
        <Tr aria-label={`Row-${row.id}`} isExpanded={row.isExpandedByParent}>
          <Td dataLabel={row.primaryCell.label}>
            <Indent level={row.level} noToggle>
              {row.primaryCell.value}
            </Indent>
          </Td>
          {row.valueCells.map(({ label, value }) => (
            <Td
              className={isRowOfMultipleValues(row) ? "" : "pf-m-truncate"}
              key={label}
              dataLabel={label}
            >
              <CellValueWithCopy value={value} />
            </Td>
          ))}
        </Tr>
      );
  }
};
