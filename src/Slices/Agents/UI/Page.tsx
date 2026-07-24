import React, { useCallback, useMemo, useState } from "react";
import { Drawer, DrawerContent, DrawerContentBody } from "@patternfly/react-core";
import { usePaginatedTable } from "@/Data";
import { useGetAgents } from "@/Data/Queries";
import { Filter } from "@/Slices/Agents/Core/Types";
import {
  EmptyView,
  PageContainer,
  PaginationWidget,
  LoadingView,
  ErrorView,
  countActiveFilters,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { AgentsTableControls } from "./AgentsTableControls";
import { ConnectedFilterWidget } from "./FilterWidget";
import { GetAgentsContext } from "./GetAgentsContext";
import { TableProvider } from "./TableProvider";

/**
 * Agents Page - Component  responsible for rendering the Agents page in the application.
 * It handles the state management for pagination, filtering, sorting, and data fetching
 * for the agents list. The component also manages error handling, loading states, and
 * displays the appropriate views based on the data fetching status.
 *
 * Filtering is handled in a side panel drawer: the toolbar exposes a toggle button
 * with an active filter count, and the filter form lives in the drawer panel.
 *
 * @returns {React.FC} The rendered Agents page.
 */
export const Page: React.FC = () => {
  const { currentPage, setCurrentPage, pageSize, setPageSize, filter, sort, setSort } =
    usePaginatedTable<Filter>({
      route: "Agents",
      defaultSort: { name: "name", order: "asc" },
    });

  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  const onCloseFilterWidget = useCallback(() => {
    setIsDrawerExpanded(false);
  }, []);

  const activeFilterCount = useMemo(() => countActiveFilters(filter), [filter]);

  const { data, isSuccess, isError, error, refetch } = useGetAgents().useContinuous({
    filter,
    sort,
    pageSize,
    currentPage,
  });

  if (isError) {
    return (
      <PageContainer pageTitle={words("agents.title")}>
        <ErrorView ariaLabel="AgentsView-Error" retry={refetch} message={error.message} />
      </PageContainer>
    );
  }

  if (isSuccess) {
    return (
      <PageContainer
        pageTitle={words("agents.title")}
        style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}
      >
        <GetAgentsContext.Provider value={{ filter, sort, pageSize, currentPage }}>
          <AgentsTableControls
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
          <Drawer isExpanded={isDrawerExpanded} isInline>
            <DrawerContent panelContent={<ConnectedFilterWidget onClose={onCloseFilterWidget} />}>
              <DrawerContentBody>
                {data.data.length <= 0 ? (
                  <EmptyView
                    message={words("agents.empty.message")}
                    aria-label="AgentsView-Empty"
                  />
                ) : (
                  <TableProvider
                    agents={data.data}
                    aria-label="AgentsView-Success"
                    sort={sort}
                    setSort={setSort}
                  />
                )}
              </DrawerContentBody>
            </DrawerContent>
          </Drawer>
        </GetAgentsContext.Provider>
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={words("agents.title")}>
      <LoadingView ariaLabel="AgentsView-Loading" />
    </PageContainer>
  );
};
