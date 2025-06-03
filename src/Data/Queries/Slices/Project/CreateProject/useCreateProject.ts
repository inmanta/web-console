import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ProjectModel } from "@/Core";
import { usePutWithoutEnv } from "@/Data/Queries";
import { getProjectsFactory } from "../GetProjects";

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
  const put = usePutWithoutEnv()<CreateProjectParams>;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateProjectParams) => put("/api/v2/project", params),
    ...options,
    onSuccess: () => {
      // Invalidate and refetch projects query
      queryClient.refetchQueries({ queryKey: getProjectsFactory.root() });
    },
  });
};
