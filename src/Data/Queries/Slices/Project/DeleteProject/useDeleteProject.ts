import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useDeleteWithoutEnv } from "@/Data/Queries";
import { getProjectsKey } from "../GetProjects";

/**
 * React Query hook for deleting a project.
 *
 * @param projectId - The ID of the project to delete.
 * @param options - Optional mutation options.
 * @returns {UseMutationResult<void, Error, void>} The mutation result.
 */
export const useDeleteProject = (
  projectId: string,
  options?: UseMutationOptions<void, Error, void>
): UseMutationResult<void, Error, void> => {
  const deleteFn = useDeleteWithoutEnv();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteFn(`/api/v1/project/${projectId}`),
    mutationKey: ["delete_project", projectId],
    ...options,
    onSuccess: (...args) => {
      queryClient.refetchQueries({ queryKey: getProjectsKey.root() });
      options?.onSuccess?.(...args);
    },
  });
};
