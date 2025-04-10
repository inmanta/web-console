import React, { useContext, useEffect } from "react";
import { useUrlStateWithFilter, useUrlStateWithPageSize, useUrlStateWithSort } from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import {
  Filter,
  SortKey,
  useGetDiscoveredResources,
} from "@/Data/Managers/V2/DiscoveredResources/useGetDiscoveredResources";
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
  const { featureManager } = useContext(DependencyContext);

  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "DiscoveredResources",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "DiscoveredResources",
  });
  // The filters are currently empty, but can easily be added at a later stage when the endpoint supports it.
  const [filter, _setFilter] = useUrlStateWithFilter<Filter>({
    route: "DiscoveredResources",
  });
  const [sort, setSort] = useUrlStateWithSort<SortKey>({
    default: { name: "discovered_resource_id", order: "asc" },
    route: "DiscoveredResources",
  });
  const { data, isError, isSuccess, refetch, error } = useGetDiscoveredResources({
    sort,
    filter,
    pageSize,
    currentPage,
  }).useContinuous();

  const disabledDiscoveredResourcesView = !featureManager.isResourceDiscoveryEnabled();

  //when sorting is triggered, reset the current page
  useEffect(() => {
    setCurrentPage({ kind: "CurrentPage", value: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort.order]);

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
