import { DateRange, Query } from "@/Core";
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
  return `/lsm/v1/service_inventory/${service_entity}/${id}/events?limit=${pageSize.value}${sortParam}${filterParam}`;
}

type Filter = NonNullable<Query.SubQuery<"Events">["filter"]>;

const filterToParam = (filter: Filter, timezone: string) => {
  if (typeof filter === "undefined") return {};
  const { source, destination, version, event_type, timestamp } = filter;
  const serializedTimestampOperatorFilters = timestamp?.map(
    (timestampWithOperator) =>
      `${DateRange.serializeOperator(timestampWithOperator.operator)}:${moment
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
