import { useQuery } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useCreateHeaders } from "../helpers/useCreateHeaders";
import { useHandleErrors } from "../helpers/useHandleErrors";

/**
 * Custom hook for fetching metadata for a specific service entity and key.
 * @param environment - The environment in which the service is existing.
 * @param service_entity - The service entity name.
 * @param service_id - The ID of the service instance.
 * @param instanceVersion - The version of the service instance.
 * @param key - The key of the metadata to fetch.
 * @returns An object containing the useOneTime function for fetching the metadata.
 */
export const useGetMetadata = (
  environment: string,
  service_entity: string,
  service_id: string,
  instanceVersion: ParsedNumber | undefined,
  key: string,
) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const { handleAuthorization } = useHandleErrors();
  const headers = useCreateHeaders(environment);
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Fetches the metadata for the specified service entity and key.
   * @returns A promise that resolves to an object containing the metadata data.
   */
  const getMetadata = async (): Promise<{
    data: string | undefined;
  }> => {
    const response = await fetch(
      baseUrl +
        `/lsm/v1/service_inventory/${service_entity}/${service_id}/metadata/${key}?current_version=${instanceVersion}`,
      {
        headers,
      },
    );
    handleAuthorization(response);

    if (!response.ok) {
      // If the value isn't set for given key we receive 404 which shouldn't break the flow of the application, as given endpoint doesn't serve critical data.
      if (response.status === 404) {
        return {
          data: undefined,
        };
      }
      throw new Error(JSON.parse(await response.text()).message);
    }
    return response.json();
  };

  return {
    useOneTime: () =>
      useQuery({
        queryFn: getMetadata,
        queryKey: [
          "get_metadata",
          service_entity,
          service_id,
          key,
          environment,
          instanceVersion,
        ],
        retry: false,
        enabled: instanceVersion !== undefined,
      }),
  };
};
