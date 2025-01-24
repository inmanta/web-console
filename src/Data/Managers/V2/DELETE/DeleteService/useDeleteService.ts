import {
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../../helpers";

/**
 * React Query hook for Deleting an Service.
 *
 * @returns {Mutation} - The mutation object provided by `useMutation` hook.
 */
export const useDeleteService = (
  environment: string,
  service_entity: string,
): UseMutationResult<void, Error, void, unknown> => {
  const client = useQueryClient();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );

  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Delete an Service.
   *
   * @returns {Promise<void>} - A promise that resolves when the Service is successfully deleted
   */
  const deleteService = async (): Promise<void> => {
    const response = await fetch(
      baseUrl + `/lsm/v1/service_catalog/${service_entity}`,
      {
        method: "DELETE",
        headers: headers,
      },
    );

    await handleErrors(response);
  };

  return useMutation({
    mutationFn: deleteService,
    mutationKey: ["delete_service"],
    onSuccess: () => {
      client.refetchQueries({ queryKey: ["get_service_models-continuous"] });
      client.refetchQueries({ queryKey: ["get_service_models-one_time"] });
      client.refetchQueries({ queryKey: ["get_service_model-one_time"] });
      client.refetchQueries({ queryKey: ["get_service_model-continuous"] });
    },
  });
};
