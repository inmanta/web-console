import { ResourceRow, SortDirection } from "@/Core";
import {
  OnSort,
  TableComposable,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import React from "react";
import { ResourceTableRow } from "./ResourceTableRow";
import { ResourcesTablePresenter } from "./ResourcesTablePresenter";
import { ExpansionManager } from "@/UI/Pages/ServiceInventory/ExpansionManager";

interface Props {
  rows: ResourceRow[];
  tablePresenter: ResourcesTablePresenter;
  sortColumn?: string;
  order?: SortDirection;
  setSortColumn: (name?: string) => void;
  setOrder: (order?: SortDirection) => void;
}
export const ResourcesTable: React.FC<Props> = ({
  rows,
  tablePresenter,
  setOrder,
  setSortColumn,
  sortColumn,
  order,
  ...props
}) => {
  const onSort: OnSort = (event, index, direction) => {
    setSortColumn(tablePresenter.getColumnNameForIndex(index));
    setOrder(direction);
  };
  const activeSortIndex = tablePresenter.getIndexForColumnName(sortColumn);
  const heads = tablePresenter
    .getColumnHeads()
    .map(({ apiName, displayName }, columnIndex) => {
      const sortParams = tablePresenter
        .getSortableColumnNames()
        .includes(apiName)
        ? {
            sort: {
              sortBy: {
                index: activeSortIndex,
                direction: order,
              },
              onSort,
              columnIndex,
            },
          }
        : {};
      return (
        <Th key={displayName} {...sortParams}>
          {displayName}
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
    <TableComposable {...props}>
      <Thead>
        <Tr>
          <Th />
          {heads}
        </Tr>
      </Thead>
      {rows.map((row, idx) => (
        <ResourceTableRow
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

function rowsToIds(rows: ResourceRow[]): string[] {
  return rows.map((row) => row.id);
}
