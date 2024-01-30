import React from "react";
import { Table, TableVariant, Th, Thead, Tr } from "@patternfly/react-table";
import { useExpansion } from "@/Data";
import { ServiceOrder } from "@/Slices/Orders/Core/Query";
import { OrderDetailsRow } from "./OrderDetailsRow";
import { OrderDetailsTablePresenter } from "./OrderDetailsTablePresenter";

interface Props {
  tablePresenter: OrderDetailsTablePresenter;
  rows: ServiceOrder;
}

export const OrderDetailsTable: React.FC<Props> = ({
  tablePresenter,
  rows,
  ...props
}) => {
  const [isExpanded, onExpansion] = useExpansion();

  const heads = tablePresenter
    .getColumnHeads()
    .map(({ apiName, displayName }) => {
      return <Th key={apiName}>{displayName}</Th>;
    });
  return (
    <Table {...props} variant={TableVariant.compact}>
      <Thead>
        <Tr>
          <Th style={{ width: "15px" }}></Th>
          {heads}
        </Tr>
      </Thead>
      {rows.service_order_items.map((row) => (
        <OrderDetailsRow
          row={row}
          key={row.instance_id}
          isExpanded={isExpanded(row.instance_id)}
          onToggle={onExpansion(row.instance_id)}
          numberOfColumns={tablePresenter.getNumberOfColumns()}
        />
      ))}
    </Table>
  );
};
