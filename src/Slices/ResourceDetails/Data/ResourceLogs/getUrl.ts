import moment from "moment";
import qs from "qs";
import { Query, DateRange, RangeOperator } from "@/Core";

export function getUrl({
  id,
  sort,
  filter,
  pageSize,
  currentPage,
}: Query.SubQuery<"GetResourceLogs">): string {
  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          {
            filter: {
              minimal_log_level: filter.minimal_log_level,
              action: filter.action,
              message: filter.message,
              timestamp: serializeTimestampFilter(filter.timestamp),
            },
          },
          { allowDots: true, arrayFormat: "repeat" },
        )}`
      : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";

  return `/api/v2/resource/${id}/logs?limit=${pageSize.value}${filterParam}${sortParam}${currentPage.value}`;
}

const serializeTimestampFilter = (
  filter?: DateRange.Type[],
): string[] | undefined => {
  if (typeof filter === "undefined") return undefined;
  return filter.map(
    (timestampWithOperator) =>
      `${RangeOperator.serializeOperator(
        timestampWithOperator.operator,
      )}:${moment
        .tz(timestampWithOperator.date, moment.tz.guess())
        .utc()
        .format("YYYY-MM-DD+HH:mm:ss")}`,
  );
};
