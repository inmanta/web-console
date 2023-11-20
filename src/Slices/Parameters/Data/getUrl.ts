import moment from "moment";
import qs from "qs";
import { Query, RangeOperator } from "@/Core";

export function getUrl(
  { pageSize, filter, sort, currentPage }: Query.SubQuery<"GetParameters">,
  timezone = moment.tz.guess(),
): string {
  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          {
            filter: {
              name: filter.name,
              source: filter.source,
              updated: filter.updated?.map(
                (timestampWithOperator) =>
                  `${RangeOperator.serializeOperator(
                    timestampWithOperator.operator,
                  )}:${moment
                    .tz(timestampWithOperator.date, timezone)
                    .utc()
                    .format("YYYY-MM-DD+HH:mm:ss")}`,
              ),
            },
          },
          { allowDots: true, arrayFormat: "repeat" },
        )}`
      : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";
  const currentPageParams =
    currentPage.value && currentPage.value.length > 0
      ? `&${decodeURIComponent(currentPage.value.join("&"))}`
      : "";

  return `/api/v2/parameters?limit=${pageSize.value}${sortParam}${filterParam}${currentPageParams}`;
}
