import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { CustomError, useGet } from "../../helpers";

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
  useOneTime: () => UseQueryResult<string | undefined, CustomError>;
}

/**
 * React Query hook to fetch metadata for a specific service instance and key.
 * @param {string} service_entity - The entity name of the service.
 * @param {string} service_id - The ID of the service.
 * @param {string} key - The key for the metadata.
 * @param {ParsedNumber} instanceVersion - The version of the service instance (optional).
 * @returns {GetMetadataHook} An object containing the custom hook.
 */
export const useGetMetadata = (
  service_entity: string,
  service_id: string,
  key: string,
  instanceVersion?: ParsedNumber | null
): GetMetadataHook => {
  const get = useGet()<Metadata>;

  return {
    useOneTime: () =>
      useQuery({
        queryFn: () =>
          get(
            `/lsm/v1/service_inventory/${service_entity}/${service_id}/metadata/${encodeURIComponent(key)}?current_version=${instanceVersion}`
          ),
        queryKey: ["get_metadata", service_entity, service_id, key, instanceVersion],

        enabled: instanceVersion !== null,
        select: (data) => data.data,
      }),
  };
};
