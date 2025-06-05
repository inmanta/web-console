import { UseQueryOptions, UseQueryResult, useQuery } from "@tanstack/react-query";
import { VersionInfo } from "@/Core";
import { CustomError, useGetWithoutEnv } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";

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
    queryKey: getVersionFileInfoKey.root(),
    queryFn: () => get("/console/version.json"),
    ...options,
  });
};

export const getVersionFileInfoKey = new KeyFactory(SliceKeys.server, "get_version_file_info");
