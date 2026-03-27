import React from "react";
import { Resource } from "@/Core";
import { usePaginatedTable } from "@/Data";
import { useGetVersionResources } from "@/Data/Queries";
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
  const { currentPage, setCurrentPage, pageSize, setPageSize, filter, setFilter, sort, setSort } =
    usePaginatedTable<Resource.FilterFromVersion, Resource.SortKeyFromVersion>({
      route: "DesiredStateDetails",
      defaultSort: { name: "resource_type", order: "asc" },
    });

  const { data, isSuccess, isError, error, refetch } = useGetVersionResources({
    version,
    pageSize,
    filter,
    sort,
    currentPage,
  }).useContinuous();

  const presenter = new VersionResourceTablePresenter();

  if (isError) {
    return (
      <ErrorView ariaLabel="VersionResourcesTable-Error" retry={refetch} message={error.message} />
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
