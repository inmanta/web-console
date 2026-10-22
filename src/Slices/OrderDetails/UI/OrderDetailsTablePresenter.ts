import { words } from "@/Core";
import { ServiceOrderItem } from "@/Core/Domain/ServiceOrderModel";
import { ColumnHead, createTablePresenter } from "@/UI/Presenters";

const getColumnHeads = (): ColumnHead[] => [
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
    columnHeads: getColumnHeads(),
    extraColumns: 1,
    createRows: (items) => items,
  });

export type OrderDetailsTablePresenter = ReturnType<typeof createOrderDetailsTablePresenter>;
