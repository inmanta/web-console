import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Environment } from "@/Core";
import { usePutWithoutEnv } from "../../helpers";

interface CreateEnvironmentParams {
  name: string;
  project_id: string;
  repository?: string;
  branch?: string;
  icon?: string;
  description?: string;
}

interface Response {
  data: Environment;
}

/**
 * React Query hook for creating a new environment.
 *
 * @returns {UseMutationResult<Response, Error, CreateEnvironmentParams, unknown>} The mutation object for creating an environment.
 */
export const useCreateEnvironment = (
  options?: UseMutationOptions<Response, Error, CreateEnvironmentParams>,
): UseMutationResult<Response, Error, CreateEnvironmentParams> => {
  const client = useQueryClient();
  const put = usePutWithoutEnv()<CreateEnvironmentParams>;

  return useMutation({
    mutationFn: (params) => put("/api/v2/environment", params),
    mutationKey: ["create_environment"],
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["get_environments-one_time"] });
      client.invalidateQueries({ queryKey: ["get_environments-continuous"] });
    },
    ...options,
  });
};
