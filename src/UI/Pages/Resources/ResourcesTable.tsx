import { ResourceRow, Sort } from "@/Core";
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
  sort: Sort.Type;
  setSort: (sort: Sort.Type) => void;
}
export const ResourcesTable: React.FC<Props> = ({
  rows,
  tablePresenter,
  sort,
  setSort,
  ...props
}) => {
  const onSort: OnSort = (event, index, order) => {
    setSort({
      name: tablePresenter.getColumnNameForIndex(index) as string,
      order,
    });
  };
  const activeSortIndex = tablePresenter.getIndexForColumnName(sort.name);
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
                direction: sort.order,
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
