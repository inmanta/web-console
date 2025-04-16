import { OrdersQueryParams } from "./useGetOrders";

export function getUrl({ pageSize, sort, currentPage }: OrdersQueryParams): string {
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";

  return `/lsm/v2/order?limit=${pageSize.value}${sortParam}${
    currentPage.value ? `&${currentPage.value}` : ""
  }`;
}
