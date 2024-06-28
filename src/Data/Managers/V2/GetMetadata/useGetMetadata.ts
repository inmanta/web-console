import { useQuery } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";

/**
 * Custom hook to fetch metadata for a specific service entity and key.
 * @param environment - The environment of the service.
 * @param service_entity - The entity name of the service.
 * @param service_id - The ID of the service.
 * @param instanceVersion - The version of the service instance.
 * @param key - The key for the metadata.
 * @returns An object containing the custom hook.
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
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

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

    // If the value isn't set for the given key, we receive a 404 which shouldn't break the flow of the application, as the endpoint doesn't serve critical data.
    if (response.status === 404) {
      return {
        data: undefined,
      };
    }
    await handleErrors(response);

    return response.json();
  };

  return {
    /**
     * Custom hook to fetch the metadata.
     * @returns The result of the query.
     */
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
