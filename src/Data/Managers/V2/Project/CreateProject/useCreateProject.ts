import {
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ProjectModel } from "@/Core";
import { usePostWithoutEnv } from "../../helpers";

interface CreateProjectParams {
  name: string;
  description?: string;
}

interface CreateProjectResponse {
  data: ProjectModel;
}

/**
 * React Query hook for creating a project.
 *
 * @returns {UseMutationResult<CreateProjectResponse, Error, CreateProjectParams>} The mutation result.
 */
export const useCreateProject = (): UseMutationResult<
  CreateProjectResponse,
  Error,
  CreateProjectParams
> => {
  const post = usePostWithoutEnv()<CreateProjectParams>;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateProjectParams) =>
      post("/api/v2/project", params),
    onSuccess: () => {
      // Invalidate and refetch projects query
      queryClient.invalidateQueries({ queryKey: ["get_projects"] });
    },
  });
};
