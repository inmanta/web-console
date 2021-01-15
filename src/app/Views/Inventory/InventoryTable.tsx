import React from "react";
import { TableComposable, Thead, Tr, Th } from "@patternfly/react-table";
import { Row } from "./RowPresenter";
import { InstanceRow } from "./InstanceRow";

interface Props {
  rows: Row[];
}

interface ExpandedDict {
  [id: string]: boolean;
}

function rowsToExpandedDict(rows: Row[]): ExpandedDict {
  const pairs = rows.map((_, index) => [index, false]);
  return Object.fromEntries(pairs);
}

export const InventoryTable: React.FC<Props> = ({ rows }) => {
  const columns = ["Id", "State", "Created", "Updated"];
  const heads = columns.map((column) => <Th key={column}>{column}</Th>);

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
          key={row.id}
          row={row}
          isExpanded={expanded[index]}
          onToggle={handleExpansionToggle}
        />
      ))}
    </TableComposable>
  );
};
