import React, { useContext } from "react";
import { CompileReportParams } from "@/Core";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import {
  EmptyView,
  PageContainer,
  PaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { CompileReportsTableControls } from "./CompileReportsTableControls";
import { TableProvider } from "./TableProvider";

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "CompileReports",
  });
  const [filter, setFilter] = useUrlStateWithFilter<CompileReportParams.Filter>(
    {
      route: "CompileReports",
      keys: { requested: "DateRange", success: "Boolean" },
    }
  );
  const [sort, setSort] = useUrlStateWithSort<string>({
    default: { name: "requested", order: "desc" },
    route: "CompileReports",
  });
  const [data, retry] = queryResolver.useContinuous<"GetCompileReports">({
    kind: "GetCompileReports",
    filter,
    sort,
    pageSize,
  });

  return (
    <PageContainer title={words("compileReports.title")}>
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
      <RemoteDataView
        data={data}
        retry={retry}
        label="CompileReportsView"
        SuccessView={(compileReports) =>
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
          )
        }
      />
    </PageContainer>
  );
};
