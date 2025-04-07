import React from "react";
import {
  OnSort,
  Table,
  TableVariant,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { Resource, Sort } from "@/Core";
import { useExpansion } from "@/Data";
import { words } from "@/UI";
import { ResourceTableRow } from "./ResourceTableRow";
import { ResourcesTablePresenter } from "./ResourcesTablePresenter";

interface Props {
  rows: Resource.Row[];
  tablePresenter: ResourcesTablePresenter;
  sort: Sort.Type<Resource.SortKey>;
  setSort: (sort: Sort.Type<Resource.SortKey>) => void;
}
export const ResourcesTable: React.FC<Props> = ({
  rows,
  tablePresenter,
  sort,
  setSort,
  ...props
}) => {
  const [isExpanded, onExpansion] = useExpansion();
  const onSort: OnSort = (_event, index, order) => {
    setSort({
      name: tablePresenter.getColumnNameForIndex(index) as Resource.SortKey,
      order,
    });
  };
  const activeSortIndex = tablePresenter.getIndexForColumnName(sort.name);
  const smallHeaders = ["requires", "status"];
  const heads = tablePresenter
    .getColumnHeads()
    .map(({ apiName, displayName }, columnIndex) => {
      const hasSort = tablePresenter.getSortableColumnNames().includes(apiName);
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

      const widthModifier = smallHeaders.includes(apiName)
        ? "fitContent"
        : "nowrap";

      return (
        <Th key={displayName} {...sortParams} modifier={widthModifier}>
          {displayName}
        </Th>
      );
    });

  return (
    <Table {...props} variant={TableVariant.compact}>
      <Thead>
        <Tr>
          <Th
            modifier="fitContent"
            screenReaderText={words("common.emptyColumnHeader")}
          />
          {heads}
        </Tr>
      </Thead>
      {rows.map((row, index) => (
        <ResourceTableRow
          row={row}
          key={row.id}
          index={index}
          isExpanded={isExpanded(row.id)}
          onToggle={onExpansion(row.id)}
          numberOfColumns={tablePresenter.getNumberOfColumns()}
        />
      ))}
    </Table>
  );
};
