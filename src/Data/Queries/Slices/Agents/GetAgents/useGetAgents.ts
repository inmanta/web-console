import { useContext } from "react";
import {
  UseQueryResult,
  useQuery,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  InfiniteData,
} from "@tanstack/react-query";
import { PageSize, Pagination, Sort } from "@/Core";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { CustomError, REFETCH_INTERVAL, useGet, getPaginationHandlers } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
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

interface GetAgentsBaseParams {
  filter?: Filter;
  sort?: Sort.Sort;
  pageSize: PageSize.PageSize;
}

/** Standard paginated query */
export interface GetAgentsParams extends GetAgentsBaseParams {
  currentPage: CurrentPage;
}

/** Infinite scroll query */
export type GetAgentsInfiniteParams = GetAgentsBaseParams;

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
  useInfiniteScroll: (
    params: GetAgentsInfiniteParams
  ) => UseInfiniteQueryResult<InfiniteData<Response>, CustomError>;
}

/**
 * React Query hook for fetching agents.
 *
 * @returns {GetAgents} An object containing the different available queries.
 * @returns {UseQueryResult<QueryData, CustomError>} returns.useContinuous - Fetch agents with continuous polling.
 * @returns {UseInfiniteQueryResult<InfiniteData<QueryData>, CustomError>} returns.useInfiniteScroll - Fetch agents with infinite scrolling.
 */
export const useGetAgents = (): GetAgents => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Response>;

  return {
    useContinuous: (params: GetAgentsParams): UseQueryResult<QueryData, CustomError> =>
      useQuery({
        queryKey: getAgentKey.list([...Object.values(params), env]),
        queryFn: () => get(getUrl(params)),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
      }),
    useInfiniteScroll: (params: GetAgentsInfiniteParams) =>
      useInfiniteQuery({
        queryKey: getAgentKey.list([...Object.values(params), env]),
        queryFn: ({ pageParam }) => get(getUrl(params, pageParam || undefined)),
        initialPageParam: "",
        getNextPageParam: (lastPage) =>
          new URLSearchParams(lastPage.links.next?.split("?")[1]).get("start") ?? undefined,
      }),
  };
};

export const getAgentKey = new KeyFactory(SliceKeys.agents, "get_agent");
