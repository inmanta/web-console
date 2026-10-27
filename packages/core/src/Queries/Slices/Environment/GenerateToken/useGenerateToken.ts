import { useContext } from "react";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { TokenInfo } from "@inmanta/web-console-core/Domain";
import { usePost } from "@inmanta/web-console-core/Queries/Helpers";

/**
 * Interface for the response from the generate token mutation.
 */
interface Response {
  data: string;
}

/**
 * React Query hook for generating a new token.
 *
 * @returns {UseMutationResult<Response, Error, TokenInfo, unknown>} The mutation object for generating a new token.
 */
export const useGenerateToken = (
  options?: UseMutationOptions<Response, Error, TokenInfo>
): UseMutationResult<Response, Error, TokenInfo> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env, { isResponseBodyRequired: true })<TokenInfo, Response>;

  return useMutation({
    mutationFn: (params) => post("/api/v2/environment_auth", params),
    mutationKey: ["generate_token", env],
    ...options,
  });
};
