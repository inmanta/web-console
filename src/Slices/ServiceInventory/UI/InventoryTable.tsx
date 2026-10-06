import React from "react";
import { Table, Thead, Tr, Th, OnSort } from "@patternfly/react-table";
import { Row, ServiceModel, Sort } from "@/Core";
import { InstanceRow } from "./InstanceRow";
import { InventoryTablePresenter } from "./Presenters";

interface Props {
  rows: Row[];
  service: ServiceModel;
  tablePresenter: InventoryTablePresenter;
  sort: Sort.Type;
  setSort: (sort: Sort.Type) => void;
}

export const InventoryTable: React.FC<Props> = ({
  rows,
  service,
  tablePresenter,
  sort,
  setSort,
  ...props
}) => {
  const onSort: OnSort = (_event, index, order) => {
    setSort({
      name: tablePresenter.getColumnNameForIndex(index) as string,
      order,
    });
  };
  // Define the column width in percentage for specific columns.
  const getColumnWidth = (apiName: string) => {
    switch (apiName) {
      case tablePresenter.getIdColumnApiName():
        return 20;
      case "deployment_progress":
        return 30;
      default:
        return undefined;
    }
  };
  const activeSortIndex = tablePresenter.getIndexForColumnName(sort.name);
  const heads = tablePresenter.getColumnHeads().map((column, columnIndex) => {
    const sortParams = tablePresenter.getSortableColumnNames().includes(column.apiName)
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
      <Th width={getColumnWidth(column.apiName)} key={column.displayName} {...sortParams}>
        {column.displayName}
      </Th>
    );
  });

  return (
    <Table {...props}>
      <Thead>
        <Tr>{heads}</Tr>
      </Thead>
      {rows.map((row) => (
        <InstanceRow
          key={row.id.full}
          row={row}
          shouldUseServiceIdentity={tablePresenter.shouldUseServiceIdentity()}
          idDataLabel={tablePresenter.getIdColumnName()}
          service={service}
        />
      ))}
    </Table>
  );
};
