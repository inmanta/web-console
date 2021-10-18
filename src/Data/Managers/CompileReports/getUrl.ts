import { CompileReportParams, Operator, Query } from "@/Core";
import { omit } from "lodash";
import moment from "moment";
import qs from "qs";

export function getUrl(
  { pageSize, sort, filter }: Query.SubQuery<"CompileReports">,
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
type Filter = NonNullable<Query.SubQuery<"CompileReports">["filter"]>;

const filterToParam = (filter: Filter, timezone: string) => {
  if (typeof filter === "undefined") return {};
  const { status, success, requested } = filter;
  const serializedTimestampOperatorFilters = requested?.map(
    (timestampWithOperator) =>
      `${operatorToParam(timestampWithOperator.operator)}:${moment
        .tz(timestampWithOperator.date, timezone)
        .utc()
        .format("YYYY-MM-DD+HH:mm:ss")}`
  );

  const combinedFilters = combineStatusFilters(status);

  return {
    ...combinedFilters,
    success,
    requested: serializedTimestampOperatorFilters,
  };
};

function combineStatusFilters(status?: CompileReportParams.CompileStatus[]) {
  if (status && status.length > 0) {
    const processedFilters = status.map((state) => {
      switch (state) {
        case CompileReportParams.CompileStatus.Finished:
          return { completed: true };
        case CompileReportParams.CompileStatus.InProgress:
          return { started: true, completed: false };
        case CompileReportParams.CompileStatus.Queued:
          return { started: false };
      }
    });
    const combinedFilters = processedFilters.reduce((acc, curr) => {
      if (curr.completed !== undefined) {
        if (acc["completed"] !== undefined) {
          acc = omit(acc, "completed");
        } else {
          acc["completed"] = curr.completed;
        }
      }
      if (curr.started !== undefined) {
        if (acc["started"] !== undefined) {
          acc = omit(acc, "started");
        } else {
          acc["started"] = curr.started;
        }
      }
      return acc;
    }, {});
    return combinedFilters;
  }
  return {};
}

const operatorToParam = (operator: Operator): string => {
  switch (operator) {
    case Operator.From:
      return "ge";
    case Operator.To:
      return "le";
  }
};
