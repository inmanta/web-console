import qs from "qs";
import { RangeOperator } from "@/Core";
import dayjs from "@/dayjs";
import { GetParametersParams } from "./useGetParameters";

/**
 * Constructs the URL for fetching parameters with the provided query parameters.
 *
 * @param {GetParametersParams} params - The parameters for the request
 *   @param {PageSize.PageSize} params.pageSize - The page size for pagination
 *   @param {Filter} params.filter - Optional filters for the parameters query
 *   @param {Sort.Sort} params.sort - Optional sorting criteria
 *   @param {CurrentPage} params.currentPage - The current page for pagination
 *
 * @param {string} timezone - The timezone to use for date conversions, defaults to the user's local timezone
 * @returns {string} The constructed URL string for the API request
 */
export function getUrl(
  { pageSize, filter, sort, currentPage }: GetParametersParams,
  timezone = dayjs.tz.guess()
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
                  `${RangeOperator.serializeOperator(timestampWithOperator.operator)}:${dayjs(
                    timestampWithOperator.date
                  )
                    .tz(timezone)
                    .utc()
                    .format("YYYY-MM-DD+HH:mm:ss")}`
              ),
            },
          },
          { allowDots: true, arrayFormat: "repeat" }
        )}`
      : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";

  return `/api/v2/parameters?limit=${pageSize.value}${sortParam}${filterParam}${
    currentPage.value ? `&${currentPage.value}` : ""
  }`;
}
