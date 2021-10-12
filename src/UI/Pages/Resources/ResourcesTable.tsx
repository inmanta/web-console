import { ResourceRow, SortDirection } from "@/Core";
import {
  OnSort,
  TableComposable,
  TableVariant,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import React from "react";
import { ResourceTableRow } from "./ResourceTableRow";
import { ResourcesTablePresenter } from "./ResourcesTablePresenter";

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

  return (
    <TableComposable {...props} variant={TableVariant.compact}>
      <Thead>
        <Tr>{heads}</Tr>
      </Thead>
      {rows.map((row) => (
        <ResourceTableRow row={row} key={row.id} />
      ))}
    </TableComposable>
  );
};
