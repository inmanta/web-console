import React from "react";
import { ExpansionManager } from "@/UI/Pages/ServiceInventory/ExpansionManager";
import {
  OnSort,
  TableComposable,
  TableVariant,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { ResourceHistoryRow, SortDirection } from "@/Core";
import { ResourceHistoryTableRow } from "./ResourceHistoryTableRow";
import { ResourceHistoryTablePresenter } from "./TablePresenter";

interface Props {
  tablePresenter: ResourceHistoryTablePresenter;
  order: SortDirection;
  setOrder: (order: SortDirection) => void;
  rows: ResourceHistoryRow[];
  "aria-label"?: string;
}

export const ResourceHistoryTable: React.FC<Props> = ({
  tablePresenter,
  order,
  setOrder,
  rows,
  ...props
}) => {
  const onSort: OnSort = (event, index, direction) => {
    setOrder(direction);
  };
  // The resource history table is only sortable by one column
  const heads = tablePresenter
    .getColumnHeadDisplayNames()
    .map((column, columnIndex) => {
      const sortParams =
        columnIndex == 0
          ? {
              sort: {
                sortBy: {
                  index: 0,
                  direction: order,
                },
                onSort,
                columnIndex,
              },
            }
          : {};
      return (
        <Th key={column} {...sortParams}>
          {column}
        </Th>
      );
    });
  const expansionManager = new ExpansionManager();

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
    <TableComposable {...props} variant={TableVariant.compact}>
      <Thead>
        <Tr>
          <Th />
          {heads}
        </Tr>
      </Thead>
      {rows.map((row, idx) => (
        <ResourceHistoryTableRow
          row={row}
          key={row.id}
          index={idx}
          isExpanded={expansionState[row.id]}
          onToggle={handleExpansionToggle(row.id)}
          numberOfColumns={tablePresenter.getNumberOfColumns()}
        />
      ))}
    </TableComposable>
  );
};

function rowsToIds(rows: ResourceHistoryRow[]): string[] {
  return rows.map((row) => row.id);
}
