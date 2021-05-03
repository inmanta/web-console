import React from "react";
import {
  TableComposable,
  Thead,
  Tr,
  Th,
  OnSort,
} from "@patternfly/react-table";
import { Row, SortDirection } from "@/Core";
import { InventoryTablePresenter } from "./Presenters";
import { InstanceRow } from "./InstanceRow";
import { ExpansionManager } from "./ExpansionManager";

interface Props {
  rows: Row[];
  tablePresenter: InventoryTablePresenter;
  sortColumn?: string;
  order?: SortDirection;
  setSortColumn: (name?: string) => void;
  setOrder: (order?: SortDirection) => void;
}

export const InventoryTable: React.FC<Props> = ({
  rows,
  tablePresenter,
  sortColumn,
  order,
  setSortColumn,
  setOrder,
  ...props
}) => {
  const expansionManager = new ExpansionManager();

  const onSort: OnSort = (event, index, direction) => {
    setSortColumn(tablePresenter.getColumnNameForIndex(index));
    setOrder(direction);
  };
  const activeSortIndex = tablePresenter.getIndexForColumnName(sortColumn);
  const heads = tablePresenter.getColumnHeads().map((column, columnIndex) => {
    const sortParams = tablePresenter
      .getSortableColumnNames()
      .includes(column.apiName)
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
      <Th key={column.displayName} {...sortParams}>
        {column.displayName}
      </Th>
    );
  });

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
          serviceInstanceIdentifier={{
            id: row.id.full,
            service_entity: row.service_entity,
            environment: row.environment,
            version: row.version,
          }}
          shouldUseServiceIdentity={tablePresenter.shouldUseServiceIdentity()}
          idDataLabel={tablePresenter.getIdColumnName()}
        />
      ))}
    </TableComposable>
  );
};

function rowsToIds(rows: Row[]): string[] {
  return rows.map((row) => row.id.full);
}
