import React, { useCallback, useMemo, useState } from "react";
import { Stack, StackItem } from "@patternfly/react-core";
import { hasAnySetValue, words } from "@inmanta/web-console-core";
import { usePaginatedTable } from "@inmanta/web-console-core/Common";
import { useGetAgents } from "@inmanta/web-console-core/Queries/Slices/Agents";
import { Filter } from "@inmanta/web-console-feature-resource-manager/Slices/Agents/Core/Types";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { FilterDrawer, countActiveFilters } from "@inmanta/web-console-ui/Components/FilterDrawer";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
import { PaginationWidget } from "@inmanta/web-console-ui/Components/PaginationWidget";
import { AgentsTableControls } from "./AgentsTableControls";
import { AgentsActionsButton } from "./Components";
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
  const { currentPage, setCurrentPage, pageSize, setPageSize, filter, setFilter, sort, setSort } =
    usePaginatedTable<Filter>({
      route: "Agents",
      defaultSort: { name: "name", order: "asc" },
    });

  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  const onCloseFilterWidget = useCallback(() => {
    setIsDrawerExpanded(false);
  }, []);

  const activeFilterCount = useMemo(() => countActiveFilters(filter), [filter]);
  const onResetFilters = hasAnySetValue(filter) ? () => setFilter({}) : undefined;

  const { data, isSuccess, isError, error, refetch } = useGetAgents().useContinuous({
    filter,
    sort,
    pageSize,
    currentPage,
  });

  if (isError) {
    return (
      <PageContainer pageTitle={words("agents.title")} actions={<AgentsActionsButton isDisabled />}>
        <ErrorView ariaLabel="AgentsView-Error" retry={refetch} message={error.message} />
      </PageContainer>
    );
  }

  if (isSuccess) {
    return (
      <PageContainer
        pageTitle={words("agents.title")}
        actions={<AgentsActionsButton isDisabled={data.data.length <= 0} />}
        style={{ display: "flex", flexDirection: "column" }}
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
          <FilterDrawer
            isExpanded={isDrawerExpanded}
            panelContent={<ConnectedFilterWidget onClose={onCloseFilterWidget} />}
          >
            {data.data.length <= 0 ? (
              <EmptyView
                message={words("agents.empty.message")}
                aria-label="AgentsView-Empty"
                onResetFilters={onResetFilters}
              />
            ) : (
              <Stack hasGutter style={{ flex: "1 1 auto", minHeight: 0, height: "100%" }}>
                <StackItem isFilled style={{ minHeight: 0, height: "100%", overflow: "auto" }}>
                  <TableProvider
                    agents={data.data}
                    aria-label="AgentsView-Success"
                    sort={sort}
                    setSort={setSort}
                  />
                </StackItem>
              </Stack>
            )}
          </FilterDrawer>
        </GetAgentsContext.Provider>
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={words("agents.title")} actions={<AgentsActionsButton isDisabled />}>
      <LoadingView ariaLabel="AgentsView-Loading" />
    </PageContainer>
  );
};
