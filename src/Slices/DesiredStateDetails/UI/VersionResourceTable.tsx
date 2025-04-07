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
import { Row } from "./Row";
import { VersionResourceTablePresenter } from "./VersionResourceTablePresenter";

interface Props {
  version: string;
  rows: Resource.RowFromVersion[];
  tablePresenter: VersionResourceTablePresenter;
  sort: Sort.Type<Resource.SortKeyFromVersion>;
  setSort: (sort: Sort.Type<Resource.SortKeyFromVersion>) => void;
}

export const VersionResourceTable: React.FC<Props> = ({
  version,
  rows,
  tablePresenter,
  sort,
  setSort,
  ...props
}) => {
  const onSort: OnSort = (event, index, order) => {
    setSort({
      name: tablePresenter.getColumnNameForIndex(
        index,
      ) as Resource.SortKeyFromVersion,
      order,
    });
  };
  const activeSortIndex = tablePresenter.getIndexForColumnName(sort.name);
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

      return (
        <Th key={displayName} {...sortParams} modifier="fitContent">
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
        <Row row={row} key={row.id} version={version} />
      ))}
    </Table>
  );
};
