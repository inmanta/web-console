import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Pagination, ServiceInstanceModelWithTargetStates } from "@/Core";
import { ServiceInstanceParams } from "@/Core/Domain/ServiceInstanceParams";

import { getPaginationHandlers } from "@/Data/Managers/Helpers";
import { useGet } from "../../helpers/useQueries";
import { getUrl } from "./getUrl";

/**
 * Return Signature of the useGetInstances React Query
 */
interface GetInstance {
  useOneTime: () => UseQueryResult<ResponseBody, Error>;
  useContinuous: () => UseQueryResult<ResponseBody, Error>;
}

interface ResponseBody {
  data: ServiceInstanceModelWithTargetStates[];
  links: Pagination.Links;
  metadata: Pagination.Metadata;
}

/**
 * React Query hook to fetch all instances for given service entity.
 *
 * @param {string} service  - the service entity name
 * @param instanceId {string} - the instance ID for which the data needs to be fetched.
 *
 * @returns {GetInstance} An object containing the different available queries.
 * @returns {UseQueryResult<ResponseBody, Error>} returns.useOneTime - Fetch the instances with a single query.
 * @returns {UseQueryResult<ResponseBody, Error>} returns.useContinuous - Fetch the instances with a recurrent query with an interval of 5s.
 */
export const useGetInstances = (
  name: string,
  params: ServiceInstanceParams,
): GetInstance => {
  const { filter, sort, pageSize, currentPage } = params;

  const url = getUrl({
    name,
    sort,
    filter,
    pageSize,
    currentPage,
  });
  const get = useGet()<{ data: ResponseBody }>;

  return {
    useOneTime: (): UseQueryResult<ResponseBody, Error> =>
      useQuery({
        queryKey: [
          "get_instances-one_time",
          name,
          filter,
          sort,
          pageSize,
          currentPage,
        ],
        queryFn: () => get(url),
        retry: false,
        select: (data) => ({
          ...data.data,
          handlers: getPaginationHandlers(data.data.links, data.data.metadata),
        }),
      }),
    useContinuous: (): UseQueryResult<ResponseBody, Error> =>
      useQuery({
        queryKey: [
          "get_instances-continuous",
          name,
          filter,
          sort,
          pageSize,
          currentPage,
        ],
        queryFn: () => get(url),
        refetchInterval: 5000,
        select: (data) => ({
          ...data.data,
          handlers: getPaginationHandlers(data.data.links, data.data.metadata),
        }),
      }),
  };
};
