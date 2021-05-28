import { Operator, Query } from "@/Core";
import moment from "moment-timezone";
import qs from "qs";

export function getUrl(
  { service_entity, id, filter, sort, pageSize }: Query.SubQuery<"Events">,
  timezone = moment.tz.guess()
): string {
  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          { filter: filterToParam(filter, timezone) },
          { allowDots: true, arrayFormat: "repeat" }
        )}`
      : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";
  const limitParam = pageSize ? `?limit=${pageSize}` : "";
  return `/lsm/v1/service_inventory/${service_entity}/${id}/events${limitParam}${sortParam}${filterParam}`;
}

type Filter = NonNullable<Query.SubQuery<"Events">["filter"]>;

const filterToParam = (filter: Filter, timezone: string) => {
  if (typeof filter === "undefined") return {};
  const { source, destination, version, event_type, timestamp } = filter;
  const serializedTimestampOperatorFilters = timestamp?.map(
    (timestampWithOperator) =>
      `${operatorToParam(timestampWithOperator.operator)}:${moment
        .tz(timestampWithOperator.date, timezone)
        .utc()
        .format("YYYY-MM-DD+HH:mm:ss")}`
  );

  return {
    source,
    destination,
    version,
    event_type,
    timestamp: serializedTimestampOperatorFilters,
  };
};

const operatorToParam = (operator: Operator): string => {
  switch (operator) {
    case Operator.Greater:
      return "gt";
    case Operator.GreaterOrEqual:
      return "ge";
    case Operator.Less:
      return "lt";
    case Operator.LessOrEqual:
      return "le";
  }
};
