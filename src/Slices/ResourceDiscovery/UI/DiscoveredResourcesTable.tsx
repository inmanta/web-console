import React from "react";
import { OnSort, Table, TableVariant, Th, Thead, Tr } from "@patternfly/react-table";
import { Sort } from "@/Core";
import { DiscoveredResource, SortKey } from "@/Data/Queries";
import { words } from "@/UI";
import { DiscoveredResourceRow } from "./DiscoveredResourcesRow";
import { DiscoveredResourcesTablePresenter } from "./DiscoveredResourcesTablePresenter";

interface Props {
  tablePresenter: DiscoveredResourcesTablePresenter;
  rows: DiscoveredResource[];
  sort: Sort.Type<SortKey>;
  setSort: (sort: Sort.Type<SortKey>) => void;
}

/**
 * The DiscoveredResourcesTable component.
 *
 * This component is responsible of displaying the discovered resources.
 *
 * @Props {Props} - The props of the component
 *  @prop {DiscoveredResourcesTablePresenter} tablePresenter - The table presenter
 *  @prop {DiscoveredResource[]} rows - The rows of the table
 *  @prop {Sort.Type<SortKey>} sort - The sort of the table
 *  @prop {Function} setSort - The function to set the sort of the table
 *
 * @returns {React.FC} DiscoveredResourcesTable component
 */
export const DiscoveredResourcesTable: React.FC<Props> = ({
  tablePresenter,
  rows,
  sort,
  setSort,
  ...props
}) => {
  const onSort: OnSort = (_event, index, order) => {
    setSort({
      name: tablePresenter.getColumnNameForIndex(index) as SortKey,
      order,
    });
  };

  const heads = tablePresenter.getColumnHeads().map(({ apiName, displayName }, columnIndex) => {
    const sortParams = tablePresenter.getSortableColumnNames().includes(apiName)
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
          {heads}
          <Th modifier="fitContent" screenReaderText={words("common.emptyColumnHeader")} />
        </Tr>
      </Thead>
      {rows.map((row: DiscoveredResource) => (
        <DiscoveredResourceRow row={row} key={row.discovered_resource_id} />
      ))}
    </Table>
  );
};
