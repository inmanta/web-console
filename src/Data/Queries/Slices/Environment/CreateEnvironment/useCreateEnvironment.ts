import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { Environment } from "@/Core";
import { usePutWithoutEnv } from "@/Data/Queries";

/**
 * Interface for the parameters for the create environment mutation.
 */
interface CreateEnvironmentParams {
  name: string;
  project_id: string;
  repository?: string;
  branch?: string;
  icon?: string;
  description?: string;
}

/**
 * Interface for the response from the create environment mutation.
 */
interface Response {
  data: Environment;
}

/**
 * React Query hook for creating a new environment.
 *
 * @returns {UseMutationResult<Response, Error, CreateEnvironmentParams, unknown>} The mutation object for creating an environment.
 */
export const useCreateEnvironment = (
  options?: UseMutationOptions<Response, Error, CreateEnvironmentParams>
): UseMutationResult<Response, Error, CreateEnvironmentParams> => {
  const put = usePutWithoutEnv()<CreateEnvironmentParams>;

  return useMutation({
    mutationFn: (params) => put("/api/v2/environment", params),
    mutationKey: ["create_environment"],
    ...options,
  });
};
