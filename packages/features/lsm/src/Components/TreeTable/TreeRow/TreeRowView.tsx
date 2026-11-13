import React from "react";
import { Td, TdProps, TreeRowWrapper } from "@patternfly/react-table";
import { TreeRow } from "./TreeRow";
import { ValueCells } from "./ValueCells";

/**
 * RowProps is an interface that defines the props of the TreeRowView component.
 */
interface RowProps {
  row: TreeRow;

  /** Index of the row in the table body, used by PatternFly's tree toggle. */
  rowIndex: number;
}

/**
 * TreeRowView is a component that renders a row in the tree table for the Attributes.
 * PatternFly's tree table draws the indentation and the toggle from the row's ARIA attributes.
 * Clicking the name cell of a row with child rows opens or closes it, like the toggle.
 * The name cell of a Root or Branch row spans all 5 columns: name, the 3 value columns and the menu column.
 *
 * @param {RowProps} props - The props of the component.
 *  @prop {TreeRow} row - The row object.
 *  @prop {number} rowIndex - Index of the row in the table body.
 *
 * @returns The tree row view component.
 */
export const TreeRowView: React.FC<RowProps> = ({ row, rowIndex }) => {
  switch (row.kind) {
    case "Flat": {
      const treeRow: TdProps["treeRow"] = {
        onCollapse: () => {},
        rowIndex,
        props: {
          "aria-level": 1,
          "aria-posinset": row.positionInSet,
          "aria-setsize": 0,
        },
      };

      return (
        <TreeRowWrapper aria-label={`Row-${row.id}`} row={{ props: treeRow.props }}>
          <Td dataLabel={row.primaryCell.label} treeRow={treeRow}>
            {row.primaryCell.value}
          </Td>
          <ValueCells cells={row.valueCells} />
        </TreeRowWrapper>
      );
    }

    case "Root": {
      const treeRow: TdProps["treeRow"] = {
        onCollapse: row.onToggle,
        rowIndex,
        props: {
          isExpanded: row.isChildExpanded,
          "aria-level": 1,
          "aria-posinset": row.positionInSet,
          "aria-setsize": row.childCount,
        },
      };

      return (
        <TreeRowWrapper aria-label={`Row-${row.id}`} row={{ props: treeRow.props }}>
          <Td
            dataLabel="name"
            colSpan={5}
            onClick={row.childCount > 0 ? row.onToggle : undefined}
            treeRow={treeRow}
          >
            {row.primaryCell.value}
          </Td>
        </TreeRowWrapper>
      );
    }

    case "Branch": {
      const treeRow: TdProps["treeRow"] = {
        onCollapse: row.onToggle,
        rowIndex,
        props: {
          isExpanded: row.isChildExpanded,
          isHidden: !row.isExpandedByParent,
          "aria-level": row.level + 1,
          "aria-posinset": row.positionInSet,
          "aria-setsize": row.childCount,
        },
      };

      return (
        <TreeRowWrapper aria-label={`Row-${row.id}`} row={{ props: treeRow.props }}>
          <Td
            dataLabel={row.primaryCell.label}
            colSpan={5}
            onClick={row.childCount > 0 ? row.onToggle : undefined}
            treeRow={treeRow}
          >
            {row.primaryCell.value}
          </Td>
        </TreeRowWrapper>
      );
    }

    case "Leaf": {
      const treeRow: TdProps["treeRow"] = {
        onCollapse: () => {},
        rowIndex,
        props: {
          isHidden: !row.isExpandedByParent,
          "aria-level": row.level + 1,
          "aria-posinset": row.positionInSet,
          "aria-setsize": 0,
        },
      };

      return (
        <TreeRowWrapper aria-label={`Row-${row.id}`} row={{ props: treeRow.props }}>
          <Td dataLabel={row.primaryCell.label} treeRow={treeRow}>
            {row.primaryCell.value}
          </Td>
          <ValueCells cells={row.valueCells} />
        </TreeRowWrapper>
      );
    }
  }
};
