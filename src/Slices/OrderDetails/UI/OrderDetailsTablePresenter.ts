import { ServiceOrderItem } from "@/Slices/Orders/Core/Types";
import { ColumnHead, createTablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";

const columnHeads: ColumnHead[] = [
  { displayName: words("orders.column.instance"), apiName: "instance" },
  { displayName: words("orders.column.serviceEntity"), apiName: "service_entity" },
  { displayName: words("orders.column.action"), apiName: "action" },
  { displayName: words("status"), apiName: "status" },
];

/**
 * Table presenter for the order details view. Rows are the order items unchanged.
 *
 * @example createOrderDetailsTablePresenter().getColumnNameForIndex(0) // "instance"
 */
export const createOrderDetailsTablePresenter = () =>
  createTablePresenter<ServiceOrderItem, ServiceOrderItem>({
    columnHeads,
    extraColumns: 1,
    createRows: (items) => items,
  });

export type OrderDetailsTablePresenter = ReturnType<typeof createOrderDetailsTablePresenter>;
