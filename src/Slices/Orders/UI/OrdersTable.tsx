import React from "react";
import { OnSort, Table, TableVariant, Th, Thead, Tr } from "@patternfly/react-table";
import { Sort } from "@/Core";
import { words } from "@/UI";
import { ServiceOrder, SortKey } from "../Core/Query";
import { OrdersRow } from "./OrdersRow";
import { OrdersTablePresenter } from "./OrdersTablePresenter";

interface Props {
  tablePresenter: OrdersTablePresenter;
  rows: ServiceOrder[];
  sort: Sort.Type<SortKey>;
  setSort: (sort: Sort.Type<SortKey>) => void;
}

/**
 * OrdersTable Component
 *
 * The table displays the result from the order-endpoint
 * It provides Sorting on the columns returned in the TablePresenter.
 *
 * @param tablePresenter OrdersTablePresenter
 * @param rows ServiceOrder[]
 * @param sort Sort.Type<SortKey>
 * @param setSort function
 * @returns ReactNode
 */
export const OrdersTable: React.FC<Props> = ({ tablePresenter, rows, sort, setSort, ...props }) => {
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
        <Tr aria-hidden>
          {heads}
          <Th aria-hidden screenReaderText={words("common.emptyColumnHeader")} />
        </Tr>
      </Thead>
      {rows.map((row) => (
        <OrdersRow row={row} key={row.id} />
      ))}
    </Table>
  );
};
