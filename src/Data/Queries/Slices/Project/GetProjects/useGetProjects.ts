import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ProjectModel } from "@/Core";
import { KeyFactory, keySlices } from "@/Data/Managers/KeyFactory";
import { REFETCH_INTERVAL, useGetWithoutEnv } from "@/Data/Queries";

/**
 * Return Signature of the useGetProjects React Query
 */
interface GetProjects {
  useOneTime: (hasEnvironmentDetails?: boolean) => UseQueryResult<ProjectModel[], Error>;
  useContinuous: (hasEnvironmentDetails?: boolean) => UseQueryResult<ProjectModel[], Error>;
}

/**
 * React Query hook for fetching projects.
 *
 * @returns {GetProjects} An object containing the different available queries.
 * @returns {UseQueryResult<ProjectModel[], Error>} returns.useOneTime - Fetch projects with a single query.
 * @returns {UseQueryResult<ProjectModel[], Error>} returns.useContinuous - Fetch projects with continuous polling.
 */
export const useGetProjects = (): GetProjects => {
  const get = useGetWithoutEnv()<{ data: ProjectModel[] }>;
  const keyFactory = new KeyFactory(keySlices.project, "get_projects");

  return {
    useOneTime: (hasEnvironmentDetails = false): UseQueryResult<ProjectModel[], Error> =>
      useQuery({
        queryKey: keyFactory.list([hasEnvironmentDetails]),
        queryFn: () => get(`/api/v2/project?environment_details=${hasEnvironmentDetails}`),
        retry: false,
        select: (data) => data.data,
      }),

    useContinuous: (hasEnvironmentDetails = false): UseQueryResult<ProjectModel[], Error> =>
      useQuery({
        queryKey: keyFactory.list([hasEnvironmentDetails]),
        queryFn: () => get(`/api/v2/project?environment_details=${hasEnvironmentDetails}`),
        retry: false,
        select: (data) => data.data,
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};
