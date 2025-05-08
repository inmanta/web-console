import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ProjectModel } from "@/Core";
import { REFETCH_INTERVAL, useGetWithoutEnv } from "../../helpers";

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

  return {
    useOneTime: (hasEnvironmentDetails = false): UseQueryResult<ProjectModel[], Error> =>
      useQuery({
        queryKey: ["get_projects-one_time", hasEnvironmentDetails],
        queryFn: () => get(`/api/v2/project?environment_details=${hasEnvironmentDetails}`),
        retry: false,
        select: (data) => data.data,
      }),

    useContinuous: (hasEnvironmentDetails = false): UseQueryResult<ProjectModel[], Error> =>
      useQuery({
        queryKey: ["get_projects-continuous", hasEnvironmentDetails],
        queryFn: () => get(`/api/v2/project?environment_details=${hasEnvironmentDetails}`),
        retry: false,
        select: (data) => data.data,
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};
