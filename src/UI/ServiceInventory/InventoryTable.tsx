import React from "react";
import { TableComposable, Thead, Tr, Th } from "@patternfly/react-table";
import { Row } from "@/Core";
import { TablePresenter } from "./Presenters";
import { InstanceRow } from "./InstanceRow";
import { ExpansionManager } from "./ExpansionManager";

interface Props {
  rows: Row[];
  tablePresenter: TablePresenter;
}

export const InventoryTable: React.FC<Props> = ({ rows, tablePresenter }) => {
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
          isExpanded={expansionState[row.id.full]}
          onToggle={handleExpansionToggle(row.id.full)}
          numberOfColumns={tablePresenter.getNumberOfColumns()}
          actions={tablePresenter.getActionsFor(row.id.full)}
          state={tablePresenter.getStateFor(row.id.full)}
        />
      ))}
    </TableComposable>
  );
};

function rowsToIds(rows: Row[]): string[] {
  return rows.map((row) => row.id.full);
}
