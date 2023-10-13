import React from "react";
import {
  OnSort,
  Table /* data-codemods */,
  TableVariant,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { Sort, Parameter } from "@/Core";
import { SortKey } from "@S/Parameters/Core/Query";
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
        <Tr>{heads}</Tr>
      </Thead>
      {rows.map((row) => (
        <ParametersTableRow row={row} key={row.id} />
      ))}
    </Table>
  );
};
