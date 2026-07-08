import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useDelete } from "@/Data/Queries";
import { DependencyContext } from "@/UI";
import { getTokensKey } from "../GetTokens/useGetTokens";

/**
 * React Query hook to revoke a registered token by its jti.
 *
 * @returns The mutation object; call `mutate(jti)` to revoke a token.
 */
export const useRevokeToken = (
  options?: UseMutationOptions<void, Error, string, unknown>
): UseMutationResult<void, Error, string, unknown> => {
  const client = useQueryClient();
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const deleteFn = useDelete(env);

  return useMutation({
    mutationFn: (jti) => deleteFn(`/api/v2/environment_auth/${encodeURIComponent(jti)}`),
    mutationKey: ["revokeToken", env],
    onSuccess: () => {
      client.invalidateQueries({ queryKey: getTokensKey.root() });
    },
    ...options,
  });
};
