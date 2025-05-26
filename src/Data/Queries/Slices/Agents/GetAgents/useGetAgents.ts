import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { PageSize, Pagination, Sort } from "@/Core";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { CustomError, REFETCH_INTERVAL, useGet, getPaginationHandlers } from "@/Data/Queries";
import { Agent, AgentStatus } from "@/Slices/Agents/Core/Domain";
import { DependencyContext } from "@/UI/Dependency";
import { getUrl } from "./getUrl";

/**
 * Interface for filtering agents
 */
interface Filter {
  name?: string[];
  process_name?: string[];
  status?: AgentStatus[];
}

/**
 * interface for the get agents query params
 */
export interface GetAgentsParams {
  filter?: Filter;
  sort?: Sort.Sort;
  pageSize: PageSize.PageSize;
  currentPage: CurrentPage;
}

/**
 * interface for the agents API response
 */
interface Response {
  data: Agent[];
  links: Pagination.Links;
  metadata: Pagination.Metadata;
}

/**
 * interface for the agents data that Query returns
 */
interface QueryData extends Response {
  handlers: Pagination.Handlers;
}

/**
 * Return Signature of the useGetAgents React Query
 */
interface GetAgents {
  useContinuous: (params: GetAgentsParams) => UseQueryResult<QueryData, CustomError>;
}

/**
 * React Query hook for fetching agents.
 *
 * @returns {GetAgents} An object containing the different available queries.
 * @returns {UseQueryResult<QueryData, CustomError>} returns.useContinuous - Fetch agents with continuous polling.
 */
export const useGetAgents = (): GetAgents => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Response>;

  return {
    useContinuous: (params: GetAgentsParams): UseQueryResult<QueryData, CustomError> =>
      useQuery({
        queryKey: ["get_agents-continuous", ...Array.from(Object.values(params)), env],
        queryFn: () => get(getUrl(params)),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};
