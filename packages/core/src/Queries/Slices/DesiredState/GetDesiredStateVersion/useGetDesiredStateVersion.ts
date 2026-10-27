import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { DesiredStateVersion } from "@inmanta/web-console-core/Domain/DesiredStateVersion";
import { useGet } from "@inmanta/web-console-core/Queries/Helpers";
import { KeyFactory, SliceKeys } from "@inmanta/web-console-core/Queries/Helpers/KeyFactory";

/**
 * The response of the desired state endpoint.
 */
interface Response {
  data: DesiredStateVersion[];
}

/**
 * React Query hook looking up one model version on the desired state endpoint by its number. The
 * result is null when no such model version exists. Doesn't fetch until the model version is known.
 *
 * @example useGetDesiredStateVersion(8).data // { version: 8, status: "active", ... }
 */
export const useGetDesiredStateVersion = (
  modelVersion: number | undefined
): UseQueryResult<DesiredStateVersion | null, Error> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Response>;

  return useQuery({
    queryKey: getDesiredStateVersionKey.single(String(modelVersion), [env]),
    queryFn: () =>
      get(
        `/api/v2/desiredstate?limit=1&filter.version=ge:${modelVersion}&filter.version=le:${modelVersion}`
      ),
    enabled: modelVersion !== undefined,
    select: (response) => response.data[0] ?? null,
  });
};

export const getDesiredStateVersionKey = new KeyFactory(
  SliceKeys.desiredState,
  "get_desired_state_version"
);
