import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Button } from "@patternfly/react-core";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import { DependencyContext } from "@/UI";
import { DateWithTooltip } from "@/UI/Components";
import { words } from "@/UI/words";
import { ServiceOrder } from "../Core/Query";
import { OrderProgressBar } from "./OrderProgressBar";
import { OrderStatusLabel } from "./OrderStatusLabel";

interface Props {
  row: ServiceOrder;
}

export const OrdersRow: React.FC<Props> = ({ row }) => {
  const { routeManager } = useContext(DependencyContext);
  return (
    <Tbody>
      <Tr aria-label="ServiceOrderRow">
        <Td width={15} dataLabel={words("orders.column.created_at")}>
          <DateWithTooltip timestamp={row.created_at} />
        </Td>
        <Td width={15} dataLabel={words("orders.column.completed_at")}>
          {row.completed_at ? (
            <DateWithTooltip timestamp={row.completed_at} />
          ) : (
            ""
          )}
        </Td>
        <Td width={10} dataLabel={words("orders.column.status")}>
          <OrderStatusLabel status={row.status.state} />
        </Td>
        <Td width={20} dataLabel={words("orders.column.progress")}>
          <OrderProgressBar serviceOrderItems={row.service_order_items} />
        </Td>
        <Td width={25} dataLabel={words("orders.column.description")}>
          {row.description || row.id}
        </Td>
        <Td
          dataLabel={words("orders.column.option")}
          modifier="fitContent"
          isActionCell
        >
          <Link
            to={{
              pathname: routeManager.getUrl("OrderDetails", {
                id: row.id,
              }),
              search: location.search,
            }}
          >
            <Button variant="link">{words("orders.links.details")}</Button>
          </Link>
        </Td>
      </Tr>
    </Tbody>
  );
};
