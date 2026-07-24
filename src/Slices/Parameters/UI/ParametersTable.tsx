import React from "react";
import { OnSort, Table, TableVariant, Th, Thead, Tr } from "@patternfly/react-table";
import { Sort, Parameter } from "@/Core";
import { SortKey } from "@/Slices/Parameters/Core/Types";
import { useClassifiedRows } from "@/UI/Components";
import { ParametersTablePresenter } from "./ParametersTablePresenter";
import { ParametersTableRow } from "./ParametersTableRow";

interface Props {
  tablePresenter: ParametersTablePresenter;
  rows: Parameter[];
  sort: Sort.Type<SortKey>;
  setSort: (sort: Sort.Type<SortKey>) => void;
}

export const ParametersTable: React.FC<Props> = ({
  tablePresenter,
  rows,
  sort,
  setSort,
  ...props
}) => {
  const onSort: OnSort = (event, index, order) => {
    setSort({
      name: tablePresenter.getColumnNameForIndex(index) as SortKey,
      order,
    });
  };

  const { classifiedRows, hasExpandableRows } = useClassifiedRows(rows);
  const numberOfColumns = tablePresenter.getColumnHeads().length + (hasExpandableRows ? 1 : 0);

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
      <Th key={displayName} {...sortParams} width={20}>
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
      {classifiedRows.map(({ row, attribute }, rowIndex) => (
        <ParametersTableRow
          row={row}
          attribute={attribute}
          key={row.id}
          rowIndex={rowIndex}
          numberOfColumns={numberOfColumns}
          showExpandColumn={hasExpandableRows}
        />
      ))}
    </Table>
  );
};
