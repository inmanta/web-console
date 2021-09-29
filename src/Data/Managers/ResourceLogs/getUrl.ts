import { Operator, Query, TimestampOperatorFilter } from "@/Core";
import moment from "moment";
import qs from "qs";

export function getUrl({
  id,
  sort,
  filter,
  pageSize,
}: Query.SubQuery<"ResourceLogs">): string {
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
          { allowDots: true, arrayFormat: "repeat" }
        )}`
      : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";
  return `/api/v2/resource/${id}/logs?limit=${pageSize.value}${filterParam}${sortParam}`;
}

const operatorToParam = (operator: Operator): string => {
  switch (operator) {
    case Operator.From:
      return "ge";
    case Operator.To:
      return "le";
  }
};

const serializeTimestampFilter = (
  filter?: TimestampOperatorFilter[]
): string[] | undefined => {
  if (typeof filter === "undefined") return undefined;
  return filter.map(
    (timestampWithOperator) =>
      `${operatorToParam(timestampWithOperator.operator)}:${moment
        .tz(timestampWithOperator.date, moment.tz.guess())
        .utc()
        .format("YYYY-MM-DD+HH:mm:ss")}`
  );
};
