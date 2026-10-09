import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { useGet } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DesiredStateVersion } from "@/Slices/DesiredState/Core/Domain";
import { DependencyContext } from "@/UI/Dependency";

/**
 * The response of the desired state endpoint.
 */
interface Response {
  data: DesiredStateVersion[];
}

/**
 * React Query hook looking up one desired state version by its number. The result is null when no
 * such version exists. Doesn't fetch until the version is known.
 *
 * @example useGetDesiredStateVersion(8).data // { version: 8, status: "active", ... }
 */
export const useGetDesiredStateVersion = (
  version: number | undefined
): UseQueryResult<DesiredStateVersion | null, Error> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Response>;

  return useQuery({
    queryKey: getDesiredStateVersionKey.single(String(version), [env]),
    queryFn: () =>
      get(`/api/v2/desiredstate?limit=1&filter.version=ge:${version}&filter.version=le:${version}`),
    enabled: version !== undefined,
    select: (response) => response.data[0] ?? null,
  });
};

export const getDesiredStateVersionKey = new KeyFactory(
  SliceKeys.desiredState,
  "get_desired_state_version"
);
