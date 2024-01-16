import React from "react";
import {
  OnSort,
  Table,
  TableVariant,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { Sort } from "@/Core";
import { useExpansion } from "@/Data";
import { DiscoveredResource, SortKey } from "../Core/Query";
import { DiscoveredResourceRow } from "./DiscoveredResourcesRow";
import { DiscoveredResourcesTablePresenter } from "./DiscoveredResourcesTablePresenter";

interface Props {
  tablePresenter: DiscoveredResourcesTablePresenter;
  rows: DiscoveredResource[];
  sort: Sort.Type<SortKey>;
  setSort: (sort: Sort.Type<SortKey>) => void;
}

export const DiscoveredResourcesTable: React.FC<Props> = ({
  tablePresenter,
  rows,
  sort,
  setSort,
  ...props
}) => {
  const [isExpanded, onExpansion] = useExpansion();
  const onSort: OnSort = (event, index, order) => {
    setSort({
      name: tablePresenter.getColumnNameForIndex(index) as SortKey,
      order,
    });
  };

  const heads = tablePresenter
    .getColumnHeads()
    .map(({ apiName, displayName }, columnIndex) => {
      const sortParams = tablePresenter
        .getSortableColumnNames()
        .includes(apiName)
        ? {
            sort: {
              sortBy: {
                index: tablePresenter.getIndexForColumnName(sort.name),
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
    <Table {...props} variant={TableVariant.compact}>
      <Thead>
        <Tr>
          <Th></Th>
          {heads}
        </Tr>
      </Thead>
      {rows.map((row) => (
        <DiscoveredResourceRow
          numberOfColumns={tablePresenter.getNumberOfColumns()}
          row={row}
          key={row.discovered_resource_id}
          isExpanded={isExpanded(row.discovered_resource_id)}
          onToggle={onExpansion(row.discovered_resource_id)}
        />
      ))}
    </Table>
  );
};
