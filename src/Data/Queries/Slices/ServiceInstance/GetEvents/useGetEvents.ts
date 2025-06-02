import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { DateRange, EventType, InstanceEvent, PageSize, Pagination, Sort } from "@/Core";
import { Handlers } from "@/Core/Domain/Pagination/Pagination";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import {
  CustomError,
  useGet,
  REFETCH_INTERVAL,
  getPaginationHandlers,
  KeyFactory,
  keySlices,
} from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";
import { getUrl } from "./getUrl";

/**
 * Result interface for the events API response
 */
interface ResponseBody {
  data: InstanceEvent[];
  links?: Pagination.Links;
  metadata: Pagination.Metadata;
}

/**
 * Extended interface that includes pagination handlers for the events response
 */
interface HookResponse extends ResponseBody {
  handlers: Handlers;
}

/**
 * Parameters for fetching instance events
 *
 * @property {string} serviceName - Name of the service
 * @property {string} id - ID of the service instance
 * @property {Filter} [filter] - Optional filters to apply to the query
 * @property {Sort.Sort} [sort] - Optional sorting parameters
 * @property {PageSize.PageSize} pageSize - Number of items per page
 * @property {CurrentPage} currentPage - Current page information
 */
export interface GetInstanceEventParams {
  serviceName: string;
  id: string;
  filter?: Filter;
  sort?: Sort.Sort;
  pageSize: PageSize.PageSize;
  currentPage: CurrentPage;
}

/**
 * Filter options for instance events
 *
 * @property {EventType[]} [event_type] - Filter by event types
 * @property {string[]} [version] - Filter by versions
 * @property {string[]} [source] - Filter by source states
 * @property {string[]} [destination] - Filter by destination states
 * @property {DateRange.DateRange[]} [timestamp] - Filter by timestamp ranges
 */
export interface Filter {
  event_type?: EventType[];
  version?: string[];
  source?: string[];
  destination?: string[];
  timestamp?: DateRange.DateRange[];
}

/**
 * Enum representing different types of filters
 * @enum {string}
 */
export enum FilterKind {
  EventType = "EventType",
  Version = "Version",
  Source = "Source",
  Destination = "Destination",
  Date = "Date",
}

/**
 * Return Signature of the useGetInstanceEvents React Query
 */
interface GetInstance {
  useContinuous: () => UseQueryResult<HookResponse, CustomError>;
}

/**
 * React Query hook to fetch instances events for given service entity.
 *
 * @param {GetInstanceEventParams} params - params for fetching instance events
 *
 * @returns {GetInstance} An object containing the different available queries.
 * @returns {UseQueryResult<HookResponse, CustomError>} returns.useContinuous - Fetch the instances events with a recurrent query with an interval of 5s.
 */
export const useGetInstanceEvents = (params: GetInstanceEventParams): GetInstance => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<ResponseBody>;
  const keyFactory = new KeyFactory(keySlices.serviceInstance, "get_instance_events");

  return {
    useContinuous: (): UseQueryResult<HookResponse, CustomError> =>
      useQuery({
        queryKey: keyFactory.list([...Object.values(params), env]),
        queryFn: () => get(getUrl(params)),
        refetchInterval: REFETCH_INTERVAL,
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
  };
};
