import React from "react";
import { usePaginatedTable } from "@/Data";
import { useGetAgents } from "@/Data/Queries";
import { Filter } from "@/Slices/Agents/Core/Types";
import {
  EmptyView,
  PageContainer,
  PaginationWidget,
  LoadingView,
  ErrorView,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { AgentsTableControls } from "./AgentsTableControls";
import { GetAgentsContext } from "./GetAgentsContext";
import { TableProvider } from "./TableProvider";

/**
 * Agents Page - Component  responsible for rendering the Agents page in the application.
 * It handles the state management for pagination, filtering, sorting, and data fetching
 * for the agents list. The component also manages error handling, loading states, and
 * displays the appropriate views based on the data fetching status.
 *
 * @returns {React.FC} The rendered Agents page.
 */
export const Page: React.FC = () => {
  const { currentPage, setCurrentPage, pageSize, setPageSize, filter, setFilter, sort, setSort } =
    usePaginatedTable<Filter>({
      route: "Agents",
      defaultSort: { name: "name", order: "asc" },
    });

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
      <PageContainer pageTitle={words("agents.title")}>
        <AgentsTableControls
          filter={filter}
          setFilter={setFilter}
          paginationWidget={
            <PaginationWidget
              data={data}
              pageSize={pageSize}
              setPageSize={setPageSize}
              setCurrentPage={setCurrentPage}
            />
          }
        />
        <GetAgentsContext.Provider value={{ filter, sort, pageSize, currentPage }}>
          {data.data.length <= 0 ? (
            <EmptyView message={words("agents.empty.message")} aria-label="AgentsView-Empty" />
          ) : (
            <TableProvider
              agents={data.data}
              aria-label="AgentsView-Success"
              sort={sort}
              setSort={setSort}
            />
          )}
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
