import moment from "moment-timezone";
import qs from "qs";
import { Query, RangeOperator } from "@/Core";

/**
 * Constructs the URL for fetching desired states based on the provided query parameters.
 * @note This function is imported from V1 of Query Manager of the same url query manager, as filters are out of scope of the query manager upgrade/migration - https://github.com/inmanta/web-console/issues/5973
 *
 * @param query - The query parameters for fetching desired states.
 * @param timezone - The timezone to use for date conversions (default: guessed timezone).
 * @returns The constructed URL for fetching desired states.
 */
export function getUrl (
  { pageSize, filter, currentPage }: Query.SubQuery<"GetDesiredStates">,
  timezone = moment.tz.guess(),
): string {
  const defaultFilter = {};
  const filterWithDefaults =
    filter && filter.status && filter.status?.length > 0
      ? filter
      : { ...filter, ...defaultFilter };
  const filterParam =
    filterWithDefaults && Object.keys(filterWithDefaults).length > 0
      ? `&${qs.stringify(
        {
          filter: {
            status: filterWithDefaults.status,
            date: filterWithDefaults.date?.map(
              (timestampWithOperator) =>
                `${RangeOperator.serializeOperator(
                  timestampWithOperator.operator,
                )}:${moment
                  .tz(timestampWithOperator.date, timezone)
                  .utc()
                  .format("YYYY-MM-DD+HH:mm:ss")}`,
            ),
            version: filterWithDefaults.version?.map(
              ({ value, operator }) =>
                `${RangeOperator.serializeOperator(operator)}:${value}`,
            ),
          },
        },
        { allowDots: true, arrayFormat: "repeat" },
      )}`
      : "";
  const sortParam = "&sort=version.desc";

  return `/api/v2/desiredstate?limit=${
    pageSize.value
  }${sortParam}${filterParam}${
    currentPage.value ? `&${currentPage.value}` : ""
  }`;
}
