import moment from "moment";
import qs from "qs";
import { Query, RangeOperator } from "@/Core";

export function getUrl(
  { pageSize, filter, currentPage }: Query.SubQuery<"GetDesiredStates">,
  timezone = moment.tz.guess(),
): string {
  const defaultFilter = { status: ["active", "candidate", "retired"] };
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
  const sortParam = `&sort=version.desc`;
  const currentPageParams =
    currentPage.value && currentPage.value.length > 0
      ? `&${decodeURIComponent(currentPage.value.join("&"))}`
      : "";

  return `/api/v2/desiredstate?limit=${pageSize.value}${sortParam}${filterParam}${currentPageParams}`;
}
