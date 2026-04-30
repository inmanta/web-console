import React from "react";
import { OnSort, Table, TableVariant, Th, Thead, Tr } from "@patternfly/react-table";
import { Resource, Sort } from "@/Core";
import { words } from "@/UI";
import { STATUS_SORT_KEYS, StatusSortMenu } from "./Components";
import { ResourceTableRow, ResourceRow } from "./ResourceTableRow";
import {
  columnHeads,
  getColumnNameForIndex,
  getIndexForColumnName,
  sortableColumns,
} from "./ResourcesTablePresenter";

interface Props {
  rows: ResourceRow[];
  sort: Sort.MultiSort<Resource.SortKey>;
  setSort: (sort: Sort.MultiSort<Resource.SortKey>) => void;
}

export const ResourcesTable: React.FC<Props> = ({ rows, sort, setSort, ...props }) => {
  const onSort: OnSort = (_event, index, order) => {
    const name = getColumnNameForIndex(index) as Resource.SortKey;

    // Whenever sorting via regular column, we want to keep the status sorts intact
    const statusSorts = sort.filter((s) =>
      STATUS_SORT_KEYS.includes(s.name as Resource.StatusSortKey)
    );
    setSort([...statusSorts, { name, order }]);
  };

  // For PatternFly's default sortBy — we still use the first non-status sort entry
  const activeRegularSort = sort.find(
    (s) => !STATUS_SORT_KEYS.includes(s.name as Resource.StatusSortKey)
  );
  const activeSortIndex = activeRegularSort
    ? getIndexForColumnName(activeRegularSort.name)
    : undefined;

  const heads = columnHeads.map(({ apiName, displayName }, columnIndex) => {
    if (apiName === "status") {
      return (
        <Th style={{ textAlign: "end", position: "relative" }} key={displayName}>
          <StatusSortMenu sort={sort} setSort={setSort} />
        </Th>
      );
    }

    const hasSort = sortableColumns.includes(apiName);
    const sortParams = hasSort
      ? {
          sort: {
            sortBy: {
              index: activeSortIndex,
              direction: activeRegularSort?.order ?? "asc",
            },
            onSort,
            columnIndex,
          },
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
