import React from "react";
import { TableComposable, Thead, Tr, Th } from "@patternfly/react-table";
import { Row, TablePresenter } from "./TablePresenter";
import { InstanceRow } from "./InstanceRow";

interface Props {
  rows: Row[];
  tablePresenter: TablePresenter;
}

interface ExpandedDict {
  [id: string]: boolean;
}

function rowsToExpandedDict(rows: Row[]): ExpandedDict {
  const pairs = rows.map((_, index) => [index, false]);
  return Object.fromEntries(pairs);
}

export const InventoryTable: React.FC<Props> = ({ rows, tablePresenter }) => {
  const heads = tablePresenter
    .getColumnHeads()
    .map((column) => <Th key={column}>{column}</Th>);

  const [expanded, setExpanded] = React.useState(rowsToExpandedDict(rows));
  const handleExpansionToggle = (event, index) => {
    setExpanded({
      ...expanded,
      [index]: !expanded[index],
    });
  };

  return (
    <TableComposable aria-label="Expandable Table">
      <Thead>
        <Tr>
          <Th />
          {heads}
        </Tr>
      </Thead>
      {rows.map((row, index) => (
        <InstanceRow
          index={index}
          key={row.id.full}
          row={row}
          isExpanded={expanded[index]}
          onToggle={handleExpansionToggle}
          numberOfColumns={tablePresenter.getNumberOfColumns()}
          actions={tablePresenter.getActionsFor(row.id.full)}
        />
      ))}
    </TableComposable>
  );
};
