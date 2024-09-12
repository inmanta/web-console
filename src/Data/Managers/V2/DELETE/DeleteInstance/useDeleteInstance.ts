import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../../helpers";

/**
 * React Query hook for Deleting an instance.
 *
 * @returns {Mutation} - The mutation object provided by `useMutation` hook.
 */
export const useDeleteInstance = (
  environment: string,
  instance_id: string,
  service_entity: string,
  version: ParsedNumber,
): UseMutationResult<void, Error, string, unknown> => {
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );

  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Delete an instance.
   *
   * @returns {Promise<void>} - A promise that resolves when the instance is succesfully deleted
   */
  const deleteInstance = async (): Promise<void> => {
    const response = await fetch(
      baseUrl +
        `/lsm/v1/service_inventory/${service_entity}/${instance_id}?current_version=${version}`,
      {
        method: "DELETE",
        headers: headers,
      },
    );

    await handleErrors(response);
  };

  return useMutation({
    mutationFn: deleteInstance,
    mutationKey: ["delete_instance"],
  });
};
