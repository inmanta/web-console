import moment from "moment-timezone";
import qs from "qs";
import { Query, RangeOperator } from "@/Core";
import { urlEncodeParams } from "../../helpers";
import { GetInstanceEventParams } from "./useGetEvents";

/**
 * Constructs a URL for fetching events for a specific service instance.
 *
 * @param {GetInstanceEventParams} params - Parameters for the request including service name, instance ID, filters, sorting, and pagination
 * @param {string} timezone - The timezone to use for timestamp conversions, defaults to the user's local timezone
 * @returns {string} The formatted URL for the API request
 */
export function getUrl(params: GetInstanceEventParams, timezone = moment.tz.guess()): string {
  const { serviceName, id, filter, sort, pageSize, currentPage } =
    urlEncodeParams<GetInstanceEventParams>(params);

  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          { filter: filterToParam(filter, timezone) },
          { allowDots: true, arrayFormat: "repeat" }
        )}`
      : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";

  return `/lsm/v1/service_inventory/${serviceName}/${id}/events?limit=${
    pageSize.value
  }${sortParam}${filterParam}${currentPage.value ? `&${currentPage.value}` : ""}`;
}

type Filter = NonNullable<Query.SubQuery<"GetInstanceEvents">["filter"]>;

const filterToParam = (filter: Filter, timezone: string) => {
  if (typeof filter === "undefined") return {};

  const { source, destination, version, event_type, timestamp } = filter;
  const serializedTimestampOperatorFilters = timestamp?.map(
    (timestampWithOperator) =>
      `${RangeOperator.serializeOperator(timestampWithOperator.operator)}:${moment
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
