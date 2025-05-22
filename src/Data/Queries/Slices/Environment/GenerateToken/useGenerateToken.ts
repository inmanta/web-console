import { useContext } from "react";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { TokenInfo } from "@/Core/Domain";
import { DependencyContext } from "@/UI";
import { usePost } from "@/Data/Queries";

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
  const post = usePost(env)<TokenInfo>;

  return useMutation({
    mutationFn: (params) => post("/api/v2/environment_auth", params),
    mutationKey: ["generate_token", env],
    ...options,
  });
};
