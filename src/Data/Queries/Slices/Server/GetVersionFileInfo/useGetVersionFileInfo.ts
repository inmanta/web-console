import { UseQueryOptions, UseQueryResult, useQuery } from "@tanstack/react-query";
import { VersionInfo } from "@/Core";
import { CustomError, useGetWithoutEnv } from "@/Data/Queries";

/**
 * React Query hook for getting version file info.
 *
 * @returns {UseQueryResult<VersionInfo, CustomError>} A query result containing the version file info or an error.
 */
export const useGetVersionFileInfo = (
  options?: UseQueryOptions<VersionInfo, CustomError>
): UseQueryResult<VersionInfo, CustomError> => {
  const get = useGetWithoutEnv()<VersionInfo>;

  return useQuery({
    queryKey: ["version-file-info"],
    queryFn: () => get("/console/version.json"),
    ...options,
  });
};
