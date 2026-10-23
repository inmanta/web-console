import { words } from "@/Core";
import { ServiceOrderItem } from "@/Slices/Orders/Core/Types";
import { createTablePresenter } from "@/UI/Presenters";

/**
 * Table presenter for the order details view. Rows are the order items unchanged.
 *
 * @example createOrderDetailsTablePresenter().getColumnNameForIndex(0) // "instance"
 */
export const createOrderDetailsTablePresenter = () =>
  createTablePresenter<ServiceOrderItem, ServiceOrderItem>({
    columnHeads: [
      { displayName: words("orders.column.instance"), apiName: "instance" },
      { displayName: words("orders.column.serviceEntity"), apiName: "service_entity" },
      { displayName: words("orders.column.action"), apiName: "action" },
      { displayName: words("status"), apiName: "status" },
    ],
    extraColumns: 1,
    createRows: (items) => items,
  });

export type OrderDetailsTablePresenter = ReturnType<typeof createOrderDetailsTablePresenter>;
