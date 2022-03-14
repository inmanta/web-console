import moment from "moment";
import qs from "qs";
import { CompileStatus, Query, RangeOperator } from "@/Core";

export function getUrl(
  { pageSize, sort, filter }: Query.SubQuery<"GetCompileReports">,
  timezone = moment.tz.guess()
): string {
  const serializedFilters =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          { filter: filterToParam(filter, timezone) },
          { allowDots: true, arrayFormat: "repeat" }
        )}`
      : "";
  const filterParam = serializedFilters.length > 1 ? serializedFilters : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";
  return `/api/v2/compilereport?limit=${pageSize.value}${sortParam}${filterParam}`;
}
type Filter = NonNullable<Query.SubQuery<"GetCompileReports">["filter"]>;

const filterToParam = (filter: Filter, timezone: string) => {
  if (typeof filter === "undefined") return {};
  const { status, requested } = filter;
  const serializedTimestampOperatorFilters = requested?.map(
    (timestampWithOperator) =>
      `${RangeOperator.serializeOperator(
        timestampWithOperator.operator
      )}:${moment
        .tz(timestampWithOperator.date, timezone)
        .utc()
        .format("YYYY-MM-DD+HH:mm:ss")}`
  );

  const statusFilter = translateStatusFilter(status);

  return {
    ...statusFilter,
    requested: serializedTimestampOperatorFilters,
  };
};

function translateStatusFilter(status?: CompileStatus) {
  if (status) {
    switch (status) {
      case CompileStatus.Success:
        return { success: true };
      case CompileStatus.Failed:
        return { success: false };
      case CompileStatus.InProgress:
        return { started: true, completed: false };
      case CompileStatus.Queued:
        return { started: false };
    }
  }
  return {};
}
