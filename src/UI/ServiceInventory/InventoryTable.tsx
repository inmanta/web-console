import React from "react";
import { TableComposable, Thead, Tr, Th } from "@patternfly/react-table";
import { Row } from "@/Core";
import { TablePresenter } from "./Presenters";
import { ExpansionManager } from "./ExpansionManager";

import { InstanceRowProps } from "./InstanceRowProps";

interface Props {
  rows: Row[];
  tablePresenter: TablePresenter;
  RowComponent: React.FC<InstanceRowProps>;
}

export const InventoryTable: React.FC<Props> = ({
  rows,
  tablePresenter,
  RowComponent,
}) => {
  const expansionManager = new ExpansionManager();
  const heads = tablePresenter
    .getColumnHeads()
    .map((column) => <Th key={column}>{column}</Th>);

  const [expansionState, setExpansionState] = React.useState(
    expansionManager.create(rowsToIds(rows))
  );

  const handleExpansionToggle = (id: string) => () => {
    setExpansionState(expansionManager.toggle(expansionState, id));
  };

  React.useEffect(() => {
    setExpansionState(expansionManager.merge(expansionState, rowsToIds(rows)));
  }, [rows]);

  return (
    <TableComposable>
      <Thead>
        <Tr aria-label="Headers">
          <Th />
          {heads}
        </Tr>
      </Thead>
      {rows.map((row, index) => (
        <RowComponent
          index={index}
          key={row.id.full}
          row={row}
          isExpanded={expansionState[row.id.full]}
          onToggle={handleExpansionToggle(row.id.full)}
          numberOfColumns={tablePresenter.getNumberOfColumns()}
        />
      ))}
    </TableComposable>
  );
};

function rowsToIds(rows: Row[]): string[] {
  return rows.map((row) => row.id.full);
}
