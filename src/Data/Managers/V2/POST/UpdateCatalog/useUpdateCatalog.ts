import {
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../../helpers";

/**
 * React Query hook for updating environment catalog.
 *
 * @param {string} environment  - The environment to use for creating headers.
 * @returns {UseMutationResult<void, Error, void, unknown>}- The mutation object from `useMutation` hook.
 */
export const useUpdateCatalog = (
  environment: string,
): UseMutationResult<void, Error, void, unknown> => {
  const client = useQueryClient();
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Update the environment catalog.
   *
   * @returns {Promise<void>} - The promise object of the fetch request.
   * @throws {Error} If the response is not successful, an error with the error message is thrown.
   */
  const updateCatalog = async (): Promise<void> => {
    const response = await fetch(
      baseUrl + `/lsm/v1/exporter/export_service_definition`,
      {
        method: "POST",
        headers,
      },
    );

    await handleErrors(response);
  };

  return useMutation({
    mutationFn: updateCatalog,
    mutationKey: ["update_catalog"],
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["get_service_models-one_time"] });
      client.invalidateQueries({ queryKey: ["get_service_models-continuous"] });
    },
  });
};
