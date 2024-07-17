import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";

/**
 *  Interface containing the metadata.
 */
interface Metadata {
  data: string;
}

/**
 * Return Signature of the useServiceModel React Query
 */
interface GetMetadataHook {
  useOneTime: () => UseQueryResult<string | undefined, Error>;
}

/**
 * React Query hook to fetch metadata for a specific service instance and key.
 * @param {string} environment - The environment of the service.
 * @param {string} service_entity - The entity name of the service.
 * @param {string} service_id - The ID of the service.
 * @param {string} key - The key for the metadata.
 * @param {ParsedNumber} instanceVersion - The version of the service instance (optional).
 * @returns {GetMetadataHook} An object containing the custom hook.
 */
export const useGetMetadata = (
  environment: string,
  service_entity: string,
  service_id: string,
  key: string,
  instanceVersion?: ParsedNumber | null,
): GetMetadataHook => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  const getMetadata = async (): Promise<Metadata> => {
    const response = await fetch(
      baseUrl +
        `/lsm/v1/service_inventory/${service_entity}/${service_id}/metadata/${key}?current_version=${instanceVersion}`,
      {
        headers,
      },
    );

    await handleErrors(response);

    return response.json();
  };

  return {
    /**
     * Single time query hook to fetch the metadata.
     * @returns {GetMetadataHook} The result of the query.
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
        enabled: instanceVersion !== null,
        select: (data) => data.data,
      }),
  };
};
