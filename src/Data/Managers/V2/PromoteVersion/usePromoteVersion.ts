import {
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";

import { useFetchHelpers } from "../helpers";

/**
 * React Query hook for promoting a version of desired state
 * @returns {Mutation} The mutation object for sending the request.
 */
export const usePromoteVersion = (
  environment: string,
): UseMutationResult<void, Error, string, unknown> => {
  const client = useQueryClient();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Sends a request to promote a version of desired state
   * @param {string} version - the stringified version of desired state.
   * @throws {Error} If the response is not successful, an error with the error message is thrown.
   */
  const promoteVersion = async (version: string): Promise<void> => {
    const response = await fetch(
      baseUrl + `/api/v2/desiredstate/${version}/promote`,
      {
        method: "POST",
        headers,
      },
    );

    await handleErrors(response);
  };

  return useMutation({
    mutationFn: promoteVersion,
    mutationKey: ["promote_version"],
    onSuccess: () => {
      // Refetch the desired state queries to update the list
      client.invalidateQueries({
        queryKey: ["get_desired_states-continuous"],
      });
      client.invalidateQueries({
        queryKey: ["get_desired_states-one_time"],
      });
    },
  });
};
