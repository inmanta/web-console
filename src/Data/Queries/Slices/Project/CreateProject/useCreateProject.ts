import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ProjectModel } from "@/Core";
import { getRequiredResponseBody, usePutWithoutEnv } from "@/Data/Queries/Helpers";
import { getProjectsKey } from "../GetProjects";

/**
 * Interface for the parameters for the create project mutation.
 */
export interface CreateProjectParams {
  name: string;
  description?: string;
}

/**
 * Interface for the response from the create project mutation.
 */
export interface CreateProjectResponse {
  data: ProjectModel;
}

/**
 * React Query hook for creating a project.
 *
 * @returns {UseMutationResult<CreateProjectResponse, Error, CreateProjectParams>} The mutation result.
 */
export const useCreateProject = (
  options?: UseMutationOptions<CreateProjectResponse, Error, CreateProjectParams>
): UseMutationResult<CreateProjectResponse, Error, CreateProjectParams> => {
  const put = usePutWithoutEnv()<CreateProjectParams, CreateProjectResponse>;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateProjectParams) =>
      getRequiredResponseBody(await put("/api/v2/project", params)),
    ...options,
    onSuccess: () => {
      // Invalidate and refetch projects query
      queryClient.refetchQueries({ queryKey: getProjectsKey.root() });
    },
  });
};
