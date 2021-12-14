import moment from "moment-timezone";
import qs from "qs";
import { Query, RangeOperator } from "@/Core";

export function getUrl(
  {
    service_entity,
    id,
    filter,
    sort,
    pageSize,
  }: Query.SubQuery<"GetInstanceEvents">,
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
  return `/lsm/v1/service_inventory/${service_entity}/${id}/events?limit=${pageSize.value}${sortParam}${filterParam}`;
}

type Filter = NonNullable<Query.SubQuery<"GetInstanceEvents">["filter"]>;

const filterToParam = (filter: Filter, timezone: string) => {
  if (typeof filter === "undefined") return {};
  const { source, destination, version, event_type, timestamp } = filter;
  const serializedTimestampOperatorFilters = timestamp?.map(
    (timestampWithOperator) =>
      `${RangeOperator.serializeOperator(
        timestampWithOperator.operator
      )}:${moment
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
