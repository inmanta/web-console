import React from "react";
import {
  Table,
  TableVariant,
  Tbody,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { useExpansion } from "@/Data";
import { ServiceOrderItem } from "@/Slices/Orders/Core/Query";
import { OrderDetailsRow } from "./OrderDetailsRow";
import { OrderDetailsTablePresenter } from "./OrderDetailsTablePresenter";

interface Props {
  tablePresenter: OrderDetailsTablePresenter;
  rows: ServiceOrderItem[];
}

/**
 * OrderDetailsTable Component
 *
 * @param tablePresenter  OrderDetailsTablePresenter
 * @param rows ServiceOrderItem[]
 * @returns ReactNode
 */
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
      <Tbody>
        {rows.map((row) => (
          <OrderDetailsRow
            row={row}
            key={row.instance_id}
            isExpanded={isExpanded(row.instance_id)}
            onToggle={onExpansion(row.instance_id)}
            numberOfColumns={tablePresenter.getNumberOfColumns()}
          />
        ))}
      </Tbody>
    </Table>
  );
};
