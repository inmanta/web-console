import React, { useContext, useState } from "react";
import { AgentParams } from "@/Core";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import {
  EmptyView,
  ErrorToastAlert,
  PageContainer,
  PaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { AgentsTableControls } from "./AgentsTableControls";
import { GetAgentsContext } from "./GetAgentsContext";
import { TableProvider } from "./TableProvider";

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "Agents",
  });
  const [filter, setFilter] = useUrlStateWithFilter<AgentParams.Filter>({
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
          />
        }
      />
      <GetAgentsContext.Provider
        value={{ filter, sort, pageSize, setErrorMessage }}
      >
        <ErrorToastAlert
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
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
