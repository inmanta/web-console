import {
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../../helpers";

/**
 * React Query hook for deleting version of Desired State
 *
 * @param {string} env - The environment in which we are trying to remove the version.
 * @returns {Mutation} - The mutation object provided by `useMutation` hook.
 */
export const useDeleteDesiredStateVersion = (
  env: string,
): UseMutationResult<void, Error, string, unknown> => {
  const client = useQueryClient();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );

  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Deletes a version of the desired state.
   *
   * @param {string} version - The version of the desired state to be removed.
   * @returns {Promise<void>} - A promise that resolves when the version is successfully removed.
   * @throws {Error} If the response is not successful, an error with the error message is thrown.
   */
  const deleteOrder = async (version: string): Promise<void> => {
    const response = await fetch(baseUrl + `/api/v1/version/${version}`, {
      method: "DELETE",
      headers: createHeaders(env),
    });

    await handleErrors(response);
  };

  return useMutation({
    mutationFn: deleteOrder,
    mutationKey: ["delete_desired_state_version"],
    onSuccess: () => {
      //invalidate the desired state queries to update the list
      client.invalidateQueries({
        queryKey: ["get_desired_states-continuous"],
      });
      client.invalidateQueries({
        queryKey: ["get_desired_states-one_time"],
      });
    },
  });
};
