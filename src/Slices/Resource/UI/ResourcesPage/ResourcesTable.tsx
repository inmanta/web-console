import React from "react";
import { OnSort, Table, TableVariant, Th, Thead, Tr } from "@patternfly/react-table";
import { Resource, Sort } from "@/Core";
import { words } from "@/UI";
import { ResourceTableRow, ResourceRow } from "./ResourceTableRow";
import {
  columnHeads,
  getColumnNameForIndex,
  getIndexForColumnName,
  sortableColumns,
} from "./ResourcesTablePresenter";

interface Props {
  rows: ResourceRow[];
  sort: Sort.Type<Resource.SortKey>;
  setSort: (sort: Sort.Type<Resource.SortKey>) => void;
}

export const ResourcesTable: React.FC<Props> = ({ rows, sort, setSort, ...props }) => {
  const onSort: OnSort = (_event, index, order) => {
    setSort({
      name: getColumnNameForIndex(index) as Resource.SortKey,
      order,
    });
  };
  const activeSortIndex = getIndexForColumnName(sort.name);
  const smallHeaders = ["status"];
  const heads = columnHeads.map(({ apiName, displayName }, columnIndex) => {
    const hasSort = sortableColumns.includes(apiName);
    const sortParams = hasSort
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

    const widthModifier = smallHeaders.includes(apiName) ? "fitContent" : "nowrap";

    return (
      <Th
        key={displayName}
        {...sortParams}
        modifier={widthModifier}
        textCenter={apiName === "status"}
      >
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
