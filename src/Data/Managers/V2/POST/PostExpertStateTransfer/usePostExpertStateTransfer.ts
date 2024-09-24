import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";

import { useFetchHelpers } from "../../helpers";

/**
 * Required attributes to construct the post request to force update the state of an instance in Expert mode
 */
export interface PostExpertStateTransfer {
  message: string;
  current_version: ParsedNumber;
  target_state: string;
  operation?: string;
}

/**
 * React Query to Force update the state of an instance in expert mode.
 *
 * @param {string} environment - The Environment where the instance is located
 * @param {string} instance_id - The hashed id of the instance
 * @param {string } service_entity - The service entity type of the instance
 * @returns {UseMutationResult<void, Error, PostExpertStateTransfer, unknown>} The useMutation ReactQuery Hook
 */
export const usePostExpertStateTransfer = (
  environment: string,
  instance_id: string,
  service_entity: string,
): UseMutationResult<void, Error, PostExpertStateTransfer, unknown> => {
  const { createHeaders, handleErrors } = useFetchHelpers();

  const headers = createHeaders(environment);
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );

  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Expert Post state request
   *
   * @returns {Promise<void>} - A promise that resolves when the state is updated in Expert mode.
   */
  const postStateTransferExpert = async (
    data: PostExpertStateTransfer,
  ): Promise<void> => {
    const response = await fetch(
      baseUrl +
        `/lsm/v1/service_inventory/${service_entity}/${instance_id}/expert/state`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers,
      },
    );

    await handleErrors(response);
  };

  return useMutation({
    mutationFn: postStateTransferExpert,
    mutationKey: ["post_state_transfer_expert"],
  });
};
