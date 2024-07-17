import React, { useContext, useState } from "react";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import {
  EmptyView,
  ToastAlert,
  PageContainer,
  PaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Filter } from "@S/Agents/Core/Query";
import { AgentsTableControls } from "./AgentsTableControls";
import { GetAgentsContext } from "./GetAgentsContext";
import { TableProvider } from "./TableProvider";

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [errorMessage, setErrorMessage] = useState("");

  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "Agents",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "Agents",
  });
  const [filter, setFilter] = useUrlStateWithFilter<Filter>({
    route: "Agents",
  });
  const [sort, setSort] = useUrlStateWithSort<string>({
    default: { name: "name", order: "asc" },
    route: "Agents",
  });
  const [data, retry] = queryResolver.useContinuous<"GetAgents">({
    kind: "GetAgents",
    filter,
    sort,
    pageSize,
    currentPage,
  });

  return (
    <PageContainer title={words("agents.title")}>
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
      <GetAgentsContext.Provider
        value={{ filter, sort, pageSize, currentPage, setErrorMessage }}
      >
        <ToastAlert
          data-testid="ToastAlert"
          title={words("agents.actions.failed")}
          message={errorMessage}
          setMessage={setErrorMessage}
        />
        <RemoteDataView
          data={data}
          retry={retry}
          label="AgentsView"
          SuccessView={(agents) =>
            agents.data.length <= 0 ? (
              <EmptyView
                message={words("agents.empty.message")}
                aria-label="AgentsView-Empty"
              />
            ) : (
              <TableProvider
                agents={agents.data}
                aria-label="AgentsView-Success"
                sort={sort}
                setSort={setSort}
              />
            )
          }
        />
      </GetAgentsContext.Provider>
    </PageContainer>
  );
};
