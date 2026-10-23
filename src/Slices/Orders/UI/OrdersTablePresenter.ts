import { words } from "@/Core";
import { createTablePresenter } from "@/UI/Presenters";
import { ServiceOrder } from "../Core/Types";

/**
 * Table presenter for the orders view. Rows are the orders unchanged.
 *
 * @example createOrdersTablePresenter().getSortableColumnNames() // ["created_at"]
 */
export const createOrdersTablePresenter = () =>
  createTablePresenter<ServiceOrder, ServiceOrder>({
    columnHeads: [
      { displayName: words("orders.column.created_at"), apiName: "created_at" },
      { displayName: words("orders.column.completed_at"), apiName: "completed_at" },
      { displayName: words("status"), apiName: "status" },
      { displayName: words("orders.column.progress"), apiName: "progress" },
      { displayName: words("orders.column.description"), apiName: "description" },
    ],
    sortableColumns: ["created_at"],
    createRows: (orders) => orders,
  });

export type OrdersTablePresenter = ReturnType<typeof createOrdersTablePresenter>;
