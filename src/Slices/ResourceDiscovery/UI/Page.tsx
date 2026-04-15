import React, { useCallback, useMemo, useState } from "react";
import {
  Content,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  PageSection,
} from "@patternfly/react-core";
import { usePaginatedTable } from "@/Data";
import { Filter, SortKey, useGetDiscoveredResources } from "@/Data/Queries";
import { EmptyView, PaginationWidget, LoadingView, ErrorView, countActiveFilters } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { DiscoveredResourcesFilterWidget } from "./Components";
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
          <Drawer
            isExpanded={isDrawerExpanded}
            isInline
            style={{ display: "flex", flexDirection: "column", flex: "1 1 auto" }}
          >
            <DrawerContent panelContent={<DiscoveredResourcesFilterWidget onClose={onCloseFilterWidget} />}>
              <DrawerContentBody
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: "1 1 auto",
                  minHeight: 0,
                }}
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
                  <DiscoveredResourcesTable
                    rows={data.data}
                    aria-label="DiscoveredResourcesView-Success"
                    tablePresenter={new DiscoveredResourcesTablePresenter()}
                    sort={sort}
                    setSort={setSort}
                  />
                )}
              </DrawerContentBody>
            </DrawerContent>
          </Drawer>
        </PageSection>
      </>
    );
  }

  return <LoadingView ariaLabel="DiscoveredResourcesView-Loading" />;
};
