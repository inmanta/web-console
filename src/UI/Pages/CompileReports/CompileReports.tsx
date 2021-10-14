import React, { useContext } from "react";
import { CompileReportParams, RemoteData } from "@/Core";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageSectionWithTitle,
  PaginationWidget,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { TableProvider } from "./TableProvider";
import { CompileReportsTableControls } from "./CompileReportsTableControls";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";

export const CompileReports: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "CompileReports",
  });
  const [filter, setFilter] = useUrlStateWithFilter<CompileReportParams.Filter>(
    { route: "CompileReports", dateRangeKey: "requested" }
  );
  const [sort, setSort] = useUrlStateWithSort({
    default: { name: "requested", order: "desc" },
    route: "CompileReports",
  });
  const [data, retry] = queryResolver.useContinuous<"CompileReports">({
    kind: "CompileReports",
    filter,
    sort,
    pageSize,
  });

  return (
    <PageSectionWithTitle title={words("compileReports.title")}>
      <CompileReportsTableControls
        filter={filter}
        setFilter={setFilter}
        paginationWidget={
          <PaginationWidget
            data={data}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        }
      />
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => (
            <LoadingView aria-label="CompileReportsView-Loading" />
          ),
          failed: (error) => (
            <ErrorView
              message={error}
              retry={retry}
              aria-label="CompileReportsView-Failed"
            />
          ),
          success: (compileReports) =>
            compileReports.data.length <= 0 ? (
              <EmptyView
                message={words("compileReports.empty.message")}
                aria-label="CompileReportsView-Empty"
              />
            ) : (
              <TableProvider
                compileReports={compileReports.data}
                aria-label="CompileReportsView-Success"
                sort={sort}
                setSort={setSort}
              />
            ),
        },
        data
      )}
    </PageSectionWithTitle>
  );
};
