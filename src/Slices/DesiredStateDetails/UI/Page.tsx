import React, { useEffect } from "react";
import { Resource } from "@/Core";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { useGetVersionResources } from "@/Data/Managers/V2/DesiredState";
import {
  EmptyView,
  PageContainer,
  ErrorView,
  LoadingView,
  PaginationWidget,
} from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Controls } from "./Controls";
import { VersionResourceTable } from "./VersionResourceTable";
import { VersionResourceTablePresenter } from "./VersionResourceTablePresenter";

export const Provider: React.FC = () => {
  const { version } = useRouteParams<"DesiredStateDetails">();

  return <Page version={version} />;
};

export const Page: React.FC<{ version: string }> = ({ version }) => {
  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "DesiredStateDetails",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "DesiredStateDetails",
  });
  const [sort, setSort] = useUrlStateWithSort<Resource.SortKeyFromVersion>({
    default: { name: "resource_type", order: "asc" },
    route: "DesiredStateDetails",
  });
  const [filter, setFilter] = useUrlStateWithFilter<Resource.FilterFromVersion>(
    {
      route: "DesiredStateDetails",
    },
  );

  const { data, isSuccess, isError, error, refetch } = useGetVersionResources({
    version,
    pageSize,
    filter,
    sort,
    currentPage,
  }).useContinuous();

  const presenter = new VersionResourceTablePresenter();

  //when sorting is triggered, reset the current page
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort.order]);

  if (isError) {
    return (
      <ErrorView
        ariaLabel="VersionResourcesTable-Error"
        retry={refetch}
        message={error.message}
      />
    );
  }
  if (isSuccess) {
    return (
      <PageContainer pageTitle={words("desiredState.details.title")}>
        <Controls
          paginationWidget={
            <PaginationWidget
              data={data}
              pageSize={pageSize}
              setPageSize={setPageSize}
              setCurrentPage={setCurrentPage}
            />
          }
          filter={filter}
          setFilter={setFilter}
        />
        {data?.data.length <= 0 ? (
          <EmptyView
            message={words("resources.empty.message")}
            aria-label="VersionResourcesTable-Empty"
          />
        ) : (
          <VersionResourceTable
            aria-label="VersionResourcesTable-Success"
            version={version}
            rows={presenter.createRows(data.data)}
            tablePresenter={new VersionResourceTablePresenter()}
            sort={sort}
            setSort={setSort}
          />
        )}
      </PageContainer>
    );
  }

  return <LoadingView ariaLabel="VersionResourcesTable-Loading" />;
};
