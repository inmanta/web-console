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
  OldPaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Filter, SortKey } from "@S/Parameters/Core/Query";
import { ParametersTable } from "./ParametersTable";
import { ParametersTablePresenter } from "./ParametersTablePresenter";
import { TableControls } from "./TableControls";

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);

  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "Parameters",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "Parameters",
  });
  const [filter, setFilter] = useUrlStateWithFilter<Filter>({
    route: "Parameters",
    keys: { updated: "DateRange" },
  });
  const [sort, setSort] = useUrlStateWithSort<SortKey>({
    default: { name: "name", order: "asc" },
    route: "Parameters",
  });
  const [data, retry] = queryResolver.useContinuous<"GetParameters">({
    kind: "GetParameters",
    filter,
    pageSize,
    sort,
    currentPage,
  });

  //when sorting is triggered, reset the current page
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort.order]);

  return (
    <PageContainer pageTitle={words("parameters.title")}>
      <TableControls
        filter={filter}
        setFilter={setFilter}
        paginationWidget={
          <OldPaginationWidget
            data={data}
            pageSize={pageSize}
            setPageSize={setPageSize}
            setCurrentPage={setCurrentPage}
          />
        }
      />

      <RemoteDataView
        data={data}
        retry={retry}
        label="ParametersView"
        SuccessView={(parameters) =>
          parameters.data.length <= 0 ? (
            <EmptyView
              message={words("parameters.empty.message")}
              aria-label="ParametersView-Empty"
            />
          ) : (
            <ParametersTable
              rows={parameters.data}
              aria-label="ParametersView-Success"
              tablePresenter={new ParametersTablePresenter()}
              sort={sort}
              setSort={setSort}
            />
          )
        }
      />
    </PageContainer>
  );
};
