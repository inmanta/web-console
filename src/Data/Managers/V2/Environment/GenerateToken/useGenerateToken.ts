import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePost } from "../../helpers";

/**
 * Interface for the parameters for the generate token mutation.
 */
interface GenerateTokenParams {
  name: string;
  project_id: string;
  repository?: string;
  branch?: string;
  icon?: string;
  description?: string;
}

/**
 * Interface for the response from the generate token mutation.
 */
interface Response {
  data: string;
}

/**
 * React Query hook for generating a new token.
 *
 * @returns {UseMutationResult<Response, Error, GenerateTokenParams, unknown>} The mutation object for generating a new token.
 */
export const useGenerateToken = (
  options?: UseMutationOptions<Response, Error, GenerateTokenParams>
): UseMutationResult<Response, Error, GenerateTokenParams> => {
  const client = useQueryClient();
  const post = usePost()<GenerateTokenParams>;

  return useMutation({
    mutationFn: (params) => post("/api/v2/environment_auth", params),
    mutationKey: ["generate_token"],
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["get_environments-one_time"] });
      client.invalidateQueries({ queryKey: ["get_environments-continuous"] });
    },
    ...options,
  });
};
