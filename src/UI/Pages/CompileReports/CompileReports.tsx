import React, { useContext, useState } from "react";
import {
  CompileReportParams,
  PageSize,
  RemoteData,
  SortDirection,
} from "@/Core";
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

export const CompileReports: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [pageSize, setPageSize] = useState(PageSize.initial);
  const [order, setOrder] = useState<SortDirection>("desc");
  const [filter, setFilter] = useState<CompileReportParams.Filter>({});
  const sort = order ? { name: "requested", order: order } : undefined;
  const [data, retry] = queryResolver.useContinuous<"CompileReports">({
    kind: "CompileReports",
    filter,
    sort,
    pageSize,
  });

  const paginationWidget = RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => null,
      failed: () => null,
      success: ({ handlers, metadata }) => (
        <PaginationWidget
          handlers={handlers}
          metadata={metadata}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      ),
    },
    data
  );
  return (
    <PageSectionWithTitle title={words("compileReports.title")}>
      <CompileReportsTableControls
        filter={filter}
        setFilter={setFilter}
        paginationWidget={paginationWidget}
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
                order={order}
                setOrder={setOrder}
              />
            ),
        },
        data
      )}
    </PageSectionWithTitle>
  );
};
