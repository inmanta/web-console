import React from "react";
import { OnSort, Table, TableVariant, Th, Thead, Tr } from "@patternfly/react-table";
import { Sort } from "@/Core";
import { SortKey } from "@/Slices/Facts/Core/Types";
import { Fact } from "@S/Facts/Core/Domain";
import { FactsRow, isJsonObject } from "./FactsRow";
import { FactsTablePresenter } from "./FactsTablePresenter";

interface Props {
  rows: Fact[];
  tablePresenter: FactsTablePresenter;
  sort: Sort.Type<SortKey>;
  setSort: (sort: Sort.Type<SortKey>) => void;
}

export const FactsTable: React.FC<Props> = ({ rows, tablePresenter, sort, setSort, ...props }) => {
  const onSort: OnSort = (_event, index, order) => {
    setSort({
      name: tablePresenter.getColumnNameForIndex(index) as SortKey,
      order,
    });
  };
  const activeSortIndex = tablePresenter.getIndexForColumnName(sort.name);
  const hasExpandableRows = rows.some((row) => isJsonObject(row.value));
  const numberOfColumns =
    tablePresenter.getNumberOfColumns() + (hasExpandableRows ? 1 : 0);
  const heads = tablePresenter.getColumnHeads().map(({ apiName, displayName }, columnIndex) => {
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

    return (
      <Th key={displayName} {...sortParams} modifier="nowrap">
        {displayName}
      </Th>
    );
  });

  return (
    <Table {...props} variant={TableVariant.compact}>
      <Thead>
        <Tr>
          {hasExpandableRows && <Th screenReaderText="Row expansion" />}
          {heads}
        </Tr>
      </Thead>
      {rows.map((row, rowIndex) => (
        <FactsRow
          row={row}
          key={row.id}
          rowIndex={rowIndex}
          numberOfColumns={numberOfColumns}
          showExpandColumn={hasExpandableRows}
        />
      ))}
    </Table>
  );
};
