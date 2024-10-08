import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../../helpers";

/**
 * React Query hook for destroying an instance.
 * This is an expert action, and dangerous to perform.
 *
 * @returns {Mutation} - The mutation object provided by `useMutation` hook.
 */
export const useDestroyInstance = (
  environment: string,
  instance_id: string,
  service_entity: string,
  version: ParsedNumber,
  message: string,
): UseMutationResult<void, Error, string, unknown> => {
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);

  headers.append("message", message);

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );

  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Destroy an instance.
   *
   * @returns {Promise<void>} - A promise that resolves when the instance is succesfully destroyed.
   */
  const destroyInstance = async (): Promise<void> => {
    const response = await fetch(
      baseUrl +
        `/lsm/v2/service_inventory/${service_entity}/${instance_id}/expert?current_version=${version}`,
      {
        method: "DELETE",
        headers: headers,
      },
    );

    await handleErrors(response);
  };

  return useMutation({
    mutationFn: destroyInstance,
    mutationKey: ["destroy_instance"],
  });
};
