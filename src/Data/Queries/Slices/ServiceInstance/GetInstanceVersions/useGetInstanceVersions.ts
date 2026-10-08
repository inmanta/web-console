import { useContext } from "react";
import { UseInfiniteQueryResult, useInfiniteQuery } from "@tanstack/react-query";
import { PageSize, Pagination } from "@/Core";
import { InstanceLog } from "@/Core/Domain/HistoryLog";
import { useGet } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";

/**
 * The response of the instance log endpoint.
 */
interface Response {
  data: InstanceLog[];
  links: Pagination.Links;
}

/**
 * React Query hook listing the versions of a service instance, newest first, a page at a time, so
 * a picker can reach any version of a long history without loading it all. It stays idle without
 * an instance.
 *
 * @example useGetInstanceVersions({ serviceEntity: "lsp", id: "abc" }).data // [{ version: 5, state: "up", ... }, { version: 4, ... }]
 */
export const useGetInstanceVersions = (
  instance: { serviceEntity: string; id: string } | undefined
): UseInfiniteQueryResult<InstanceLog[], Error> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Response>;

  return useInfiniteQuery({
    queryKey: getInstanceVersionsKey.list([instance?.id ?? "", env]),
    queryFn: ({ pageParam }) =>
      get(`/lsm/v1/service_inventory/${instance?.serviceEntity}/${instance?.id}/log?${pageParam}`),
    initialPageParam: `limit=${PageSize.initial.value}&sort=version.desc`,
    getNextPageParam: (lastPage) => lastPage.links.next?.split("?")[1],
    enabled: instance !== undefined,
    select: (data) => data.pages.flatMap((page) => page.data),
    // A refetch reloads every loaded page, so it doesn't happen on each return to the window.
    refetchOnWindowFocus: false,
  });
};

export const getInstanceVersionsKey = new KeyFactory(
  SliceKeys.serviceInstance,
  "get_instance_versions"
);
