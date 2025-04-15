import moment from "moment-timezone";
import qs from "qs";
import { CompileStatus, RangeOperator } from "@/Core";
import { Filter } from "@/Slices/CompileReports/Core/Query";
import { urlEncodeParams } from "../../helpers/utils";
import { CompileReportsParams } from "./useGetCompileReports";

export function getUrl(params: CompileReportsParams, timezone = moment.tz.guess()): string {
  const { pageSize, sort, filter, currentPage } = urlEncodeParams<CompileReportsParams>(params);

  const serializedFilters =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          { filter: filterToParam(filter, timezone) },
          { allowDots: true, arrayFormat: "repeat" }
        )}`
      : "";
  const filterParam = serializedFilters.length > 1 ? serializedFilters : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";

  return `/api/v2/compilereport?limit=${pageSize.value}${sortParam}${filterParam}${
    currentPage.value ? `&${currentPage.value}` : ""
  }`;
}

const filterToParam = (filter: Filter, timezone: string) => {
  if (typeof filter === "undefined") return {};

  const { status, requested } = filter;
  const serializedTimestampOperatorFilters = requested?.map(
    (timestampWithOperator) =>
      `${RangeOperator.serializeOperator(timestampWithOperator.operator)}:${moment
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
  if (!status) return {};

  switch (status) {
    case CompileStatus.success:
      return { success: true };
    case CompileStatus.failed:
      return { success: false };
    case CompileStatus.inprogress:
      return { started: true, completed: false };
    case CompileStatus.queued:
      return { started: false };
  }
}
