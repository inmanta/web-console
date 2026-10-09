import { useContext } from "react";
import { UseInfiniteQueryResult, useInfiniteQuery } from "@tanstack/react-query";
import { PageSize, Pagination } from "@/Core";
import { useGet } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DesiredStateVersion } from "@/Slices/DesiredState/Core/Domain";
import { DependencyContext } from "@/UI/Dependency";

/**
 * The response of the desired state endpoint.
 */
interface Response {
  data: DesiredStateVersion[];
  links: Pagination.Links;
}

/**
 * React Query hook listing the model versions on the desired state endpoint, newest first, a page
 * at a time, so a version select can reach any version of a long history without loading it all.
 *
 * @example useGetDesiredStateVersions().data // [{ version: 9, status: "candidate", ... }, { version: 8, status: "active", ... }]
 */
export const useGetDesiredStateVersions = (): UseInfiniteQueryResult<
  DesiredStateVersion[],
  Error
> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Response>;

  return useInfiniteQuery({
    queryKey: getDesiredStateVersionsKey.list([env]),
    queryFn: ({ pageParam }) => get(`/api/v2/desiredstate?${pageParam}`),
    initialPageParam: `limit=${PageSize.initial.value}&sort=version.desc`,
    getNextPageParam: (lastPage) => lastPage.links.next?.split("?")[1],
    select: (data) => data.pages.flatMap((page) => page.data),
    // A refetch reloads every loaded page, so it doesn't happen on each return to the window.
    refetchOnWindowFocus: false,
  });
};

export const getDesiredStateVersionsKey = new KeyFactory(
  SliceKeys.desiredState,
  "get_desired_state_versions"
);
