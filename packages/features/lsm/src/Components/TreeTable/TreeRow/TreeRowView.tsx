import React from "react";
import { Tr, Td } from "@patternfly/react-table";
import { CellWithCopy } from "./CellWithCopy";
import { Indent } from "./Indent";
import { TreeRow } from "./TreeRow";
import { TreeRowToggle } from "./TreeRowToggle";

/**
 * RowProps is an interface that defines the props of the TreeRowView component.
 */
interface RowProps {
  row: TreeRow;
}

/**
 * TreeRowView is a component that renders a row in the tree table for the Attributes.
 *
 * @param {RowProps} props - The props of the component.
 *  @prop {TreeRow} row - The row object.
 *
 * @returns The tree row view component.
 */
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
          {row.valueCells.map(({ label, value, hasRelation }) => (
            <CellWithCopy
              label={label}
              value={label === "description" && value === "null" ? "" : value}
              hasRelation={hasRelation}
              className={"pf-v6-c-truncate"}
              key={`${label}-${value}`}
            />
          ))}
        </Tr>
      );

    case "Root":
      return (
        <Tr aria-label={`Row-${row.id}`}>
          <Td dataLabel="name" colSpan={4}>
            <Indent level={0}>
              <TreeRowToggle
                isExpanded={row.isChildExpanded}
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
              <TreeRowToggle
                isExpanded={row.isChildExpanded}
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
          {row.valueCells.map(({ label, value, hasRelation }) => (
            <CellWithCopy
              label={label}
              value={label === "description" && value === "null" ? "" : value}
              hasRelation={hasRelation}
              className={"pf-v6-c-truncate"}
              key={`${label}-${value}`}
            />
          ))}
        </Tr>
      );
  }
};
