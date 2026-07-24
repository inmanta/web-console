import React, { useEffect } from "react";
import { useUrlStateWithCurrentPage, useUrlStateWithFilter, useUrlStateWithPageSize } from "@/Data";
import { useGetResourceActions } from "@/Data/Queries";
import { EmptyView, ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { words } from "@/UI/words";
import { ResourceActionFilter } from "@S/ResourceActions/Core/Domain";
import { Controls } from "./Controls";
import { CursorPagination } from "./CursorPagination";
import { ResourceActionsTable } from "./ResourceActionsTable";

/**
 * The changelog page.
 *
 * Displays the environment-wide history of resource actions (deployments) as a
 * table, backed by the `get_resource_actions` API. Supports the server-side
 * filters available on that API (resource type, agent, value, log severity) and
 * cursor-based pagination.
 *
 * @returns {React.FC} The changelog page.
 */
export const Page: React.FC = () => {
  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({ route: "ResourceActions" });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({ route: "ResourceActions" });
  const [filter, setFilter] = useUrlStateWithFilter<ResourceActionFilter>({
    route: "ResourceActions",
  });

  // Reset the pagination cursor whenever the filters change.
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const { data, isSuccess, isError, error, refetch, isFetching } = useGetResourceActions({
    pageSize,
    filter,
    currentPage,
  }).useContinuous();

  const pagination = (currentData: NonNullable<typeof data>): React.ReactNode => (
    <CursorPagination
      pageSize={pageSize}
      setPageSize={setPageSize}
      hasPrev={currentPage.value !== "" && !!currentData.handlers.prev}
      hasNext={!!currentData.handlers.next && currentData.data.length === Number(pageSize.value)}
      onPrev={() =>
        setCurrentPage({
          kind: "CurrentPage",
          value: currentData.handlers.prev ?? "",
        })
      }
      onNext={() =>
        setCurrentPage({
          kind: "CurrentPage",
          value: currentData.handlers.next ?? "",
        })
      }
      isDisabled={isFetching}
    />
  );

  if (isError) {
    return (
      <PageContainer pageTitle={words("resourceActions.title")}>
        <ErrorView message={error.message} retry={refetch} ariaLabel="ResourceActions-Failed" />
      </PageContainer>
    );
  }

  if (isSuccess) {
    return (
      <PageContainer pageTitle={words("resourceActions.title")}>
        <Controls filter={filter} setFilter={setFilter} paginationWidget={pagination(data)} />
        {data.data.length <= 0 ? (
          <EmptyView
            message={words("resourceActions.empty.message")}
            aria-label="ResourceActions-Empty"
          />
        ) : (
          <ResourceActionsTable actions={data.data} />
        )}
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={words("resourceActions.title")}>
      <LoadingView ariaLabel="ResourceActions-Loading" />
    </PageContainer>
  );
};
