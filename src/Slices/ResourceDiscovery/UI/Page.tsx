import React, { useCallback, useMemo, useState } from "react";
import { Content, PageSection, Stack, StackItem } from "@patternfly/react-core";
import { words } from "@inmanta/web-console-core";
import { usePaginatedTable } from "@inmanta/web-console-core/Common";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import {
  Filter,
  SortKey,
  useGetDiscoveredResources,
} from "@inmanta/web-console-core/Queries/Slices/DiscoveredResources";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { FilterDrawer, countActiveFilters } from "@inmanta/web-console-ui/Components/FilterDrawer";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PaginationWidget } from "@inmanta/web-console-ui/Components/PaginationWidget";
import { DiscoveredResourcesFilterWidget } from "./Components";
import { DiscoveredResourcesTable } from "./DiscoveredResourcesTable";
import { createDiscoveredResourcesTablePresenter } from "./DiscoveredResourcesTablePresenter";
import { TableControls } from "./TableControls";

/**
 * The Page component.
 *
 * This component is responsible of displaying the discovered resources.
 *
 * @returns {React.FC} A React Component displaying the discovered resources
 */
export const Page: React.FC = () => {
  const { orchestratorProvider } = React.useContext(DependencyContext);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const { currentPage, setCurrentPage, pageSize, setPageSize, sort, setSort, filter } =
    usePaginatedTable<Filter, SortKey>({
      route: "DiscoveredResources",
      defaultSort: { name: "discovered_resource_id", order: "asc" },
    });

  const activeFilterCount = useMemo(() => countActiveFilters(filter), [filter]);

  const onCloseFilterWidget = useCallback(() => setIsDrawerExpanded(false), []);

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
      <>
        <PageSection
          hasBodyWrapper={false}
          style={{
            position: "sticky",
            top: 0,
            zIndex: 400,
            backgroundColor: "var(--pf-t--global--background--color--primary--default)",
            paddingBottom: "var(--pf-t--global--spacer--md)",
          }}
        >
          <Content component="h1">{words("discovered_resources.title")}</Content>
          <TableControls
            paginationWidget={
              <PaginationWidget
                data={data}
                pageSize={pageSize}
                setPageSize={setPageSize}
                setCurrentPage={setCurrentPage}
              />
            }
            onToggleFilters={() => setIsDrawerExpanded((prev) => !prev)}
            isDrawerExpanded={isDrawerExpanded}
            activeFilterCount={activeFilterCount}
          />
        </PageSection>
        <PageSection
          hasBodyWrapper={false}
          isFilled
          padding={{ default: "padding" }}
          style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}
        >
          <FilterDrawer
            isExpanded={isDrawerExpanded}
            panelContent={<DiscoveredResourcesFilterWidget onClose={onCloseFilterWidget} />}
          >
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
              <Stack style={{ flex: "1 1 auto", minHeight: 0, height: "100%" }}>
                <StackItem isFilled style={{ minHeight: 0, height: "100%", overflow: "auto" }}>
                  <DiscoveredResourcesTable
                    rows={data.data}
                    aria-label="DiscoveredResourcesView-Success"
                    tablePresenter={createDiscoveredResourcesTablePresenter()}
                    sort={sort}
                    setSort={setSort}
                  />
                </StackItem>
              </Stack>
            )}
          </FilterDrawer>
        </PageSection>
      </>
    );
  }

  return <LoadingView ariaLabel="DiscoveredResourcesView-Loading" />;
};
