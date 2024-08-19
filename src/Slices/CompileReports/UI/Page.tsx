import React, { useContext, useEffect } from "react";

import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import {
  EmptyView,
  PageContainer,
  PaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Filter } from "@S/CompileReports/Core/Query";
import { CompileReportsTableControls } from "./CompileReportsTableControls";
import { TableProvider } from "./TableProvider";

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);

  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "CompileReports",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "CompileReports",
  });
  const [filter, setFilter] = useUrlStateWithFilter<Filter>({
    route: "CompileReports",
    keys: { requested: "DateRange", success: "Boolean" },
  });
  const [sort, setSort] = useUrlStateWithSort<string>({
    default: { name: "requested", order: "desc" },
    route: "CompileReports",
  });
  const [data, retry] = queryResolver.useContinuous<"GetCompileReports">({
    kind: "GetCompileReports",
    filter,
    sort,
    pageSize,
    currentPage,
  });

  //when sorting or filtering is triggered, reset the current page
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort.order, filter.requested, filter.status]);

  return (
    <PageContainer pageTitle={words("compileReports.title")}>
      <CompileReportsTableControls
        filter={filter}
        setFilter={setFilter}
        paginationWidget={
          <PaginationWidget
            data={data}
            pageSize={pageSize}
            setPageSize={setPageSize}
            setCurrentPage={setCurrentPage}
          />
        }
        afterRecompile={retry}
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
