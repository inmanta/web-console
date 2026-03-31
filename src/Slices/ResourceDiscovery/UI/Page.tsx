import React, { useContext } from "react";
import { usePaginatedTable } from "@/Data";
import { Filter, SortKey, useGetDiscoveredResources } from "@/Data/Queries";
import {
  EmptyView,
  PageContainer,
  PaginationWidget,
  LoadingView,
  ErrorView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { DiscoveredResourcesTable } from "./DiscoveredResourcesTable";
import { DiscoveredResourcesTablePresenter } from "./DiscoveredResourcesTablePresenter";
import { TableControls } from "./TableControls";

/**
 * The Page component.
 *
 * This component is responsible of displaying the discovered resources.
 *
 * @returns {React.FC} A React Component displaying the discovered resources
 */
export const Page: React.FC = () => {
  const { orchestratorProvider } = useContext(DependencyContext);
  const { currentPage, setCurrentPage, pageSize, setPageSize, sort, setSort, filter, setFilter } =
    usePaginatedTable<Filter, SortKey>({
      route: "DiscoveredResources",
      defaultSort: { name: "discovered_resource_id", order: "asc" },
    });

  const { data, isError, isSuccess, refetch, error } = useGetDiscoveredResources({
    sort,
    filter,
    pageSize,
    currentPage,
  }).useContinuous();

  const disabledDiscoveredResourcesView = !orchestratorProvider.isResourceDiscoveryEnabled();

  if (isError) {
    return (
      <ErrorView
        message={error.message}
        ariaLabel="DiscoveredResourcesView-Error"
        retry={refetch}
      />
    );
  }

  if (isSuccess) {
    return (
      <PageContainer pageTitle={words("discovered_resources.title")}>
        <TableControls
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

        {disabledDiscoveredResourcesView || data.data.length <= 0 ? (
          <EmptyView
            message={
              disabledDiscoveredResourcesView
                ? words("resources.discovery.disabled")
                : words("resources.empty.message")
            }
            aria-label="DiscoveredResourcesView-Empty"
          />
        ) : (
          <DiscoveredResourcesTable
            rows={data.data}
            aria-label="DiscoveredResourcesView-Success"
            tablePresenter={new DiscoveredResourcesTablePresenter()}
            sort={sort}
            setSort={setSort}
          />
        )}
      </PageContainer>
    );
  }

  return <LoadingView ariaLabel="DiscoveredResourcesView-Loading" />;
};
