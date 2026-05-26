import React from "react";
import { OnSort, Table, TableVariant, Th, Thead, Tr } from "@patternfly/react-table";
import { Resource } from "@/Core";
import { MultiSort } from "@/Data";
import { words } from "@/UI";
import { StatusSortMenu } from "./Components";
import { ResourceTableRow, ResourceRow } from "./ResourceTableRow";
import {
  columnHeads,
  getColumnNameForIndex,
  getIndexForColumnName,
  sortableColumns,
} from "./ResourcesTablePresenter";

interface Props {
  rows: ResourceRow[];
  sort: MultiSort<Resource.SortKey>;
  setSort: (sort: MultiSort<Resource.SortKey>) => void;
}

export const ResourcesTable: React.FC<Props> = ({ rows, sort, setSort, ...props }) => {
  const onSort: OnSort = (_event, index, order) => {
    const name = getColumnNameForIndex(index) as Resource.SortKey;
    setSort([{ name, order }]);
  };

  const activeRegularSort = sort.find(
    (sortEntry) => !Resource.isStatusSortKey(sortEntry.name)
  );

  const heads = columnHeads.map(({ apiName, displayName }, columnIndex) => {
    if (apiName === "status") {
      return (
        <Th style={{ textAlign: "end", overflow: "visible" }} key={displayName}>
          <StatusSortMenu sort={sort} setSort={setSort} />
        </Th>
      );
    }

    const hasSort = sortableColumns.includes(apiName);
    const sortParams = hasSort
      ? {
          sort: {
            sortBy: {
              index: activeRegularSort ? getIndexForColumnName(activeRegularSort.name) : undefined,
              direction: activeRegularSort?.order ?? "asc",
            },
            onSort,
            columnIndex,
          },
          "data-testid": `sort-${displayName}`,
        }
      : {};

    return (
      <Th key={displayName} {...sortParams} modifier="nowrap">
        {displayName}
      </Th>
    );
  });

  return (
    <Table {...props} isStickyHeader variant={TableVariant.compact}>
      <Thead>
        <Tr>
          {heads}
          <Th
            modifier="fitContent"
            screenReaderText={words("common.emptyColumnHeader")}
            aria-label="Details"
          />
        </Tr>
      </Thead>
      {rows.map((row) => (
        <ResourceTableRow row={row} key={row.id} />
      ))}
    </Table>
  );
};
