import qs from "qs";
import { urlEncodeParams } from "@/Data/Queries";
import { GetNotificationsParams } from "./useGetNotifications";

export function getUrl(params: GetNotificationsParams): string {
  const { filter, pageSize, currentPage } = urlEncodeParams<GetNotificationsParams>(params);

  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          {
            filter: {
              title: filter.title,
              message: filter.message,
              read: filter.read,
              cleared: filter.cleared,
              severity: filter.severity,
            },
          },
          { allowDots: true, arrayFormat: "repeat" }
        )}`
      : "";

  return `/api/v2/notification?limit=${pageSize.value}${filterParam}${
    currentPage.value ? `&${currentPage.value}` : ""
  }`;
}
