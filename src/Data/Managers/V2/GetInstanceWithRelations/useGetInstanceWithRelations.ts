import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceInstanceModel } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";

/*
 * interface for the service instance with its related instances and eventual coordinates on canvas
 */
export interface InstanceWithReferences {
  instance: ServiceInstanceModel;
  relatedInstances: InstanceWithReferences[];
  coordinates?: string;
}

interface GetInstanceWithRelationsHook {
  useOneTime: () => UseQueryResult<InstanceWithReferences, Error>;
}

/**
 * React Query hook to fetch an instance with its related instances from the API.
 * @param {string} id - The ID of the instance to fetch.
 * @param {string} environment - The environment in which we are looking for instances.
 * @returns  {GetInstanceWithRelationsHook} An object containing a custom hook to fetch the instance with its related instances.
 */
export const useGetInstanceWithRelations = (
  id: string,
  environment: string,
): GetInstanceWithRelationsHook => {
  //extracted headers to avoid breaking rules of Hooks
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Fetches a service instance with its related instances recursively.
   * @param {string} instanceId - The ID of the instance to fetch.
   * @returns {Promise<InstanceWithReferences>} An object containing the fetched instance and its related instances.
   * @throws Error if the instance fails to fetch.
   */
  const fetchService = async (
    instanceId: string,
  ): Promise<InstanceWithReferences> => {
    const relatedInstances: InstanceWithReferences[] = [];
    const response = await fetch(
      `${baseUrl}/lsm/v1/service_inventory?service_id=${instanceId}&include_deployment_progress=false&exclude_read_only_attributes=false&include_referenced_by=true&include_metadata=false`,
      {
        headers,
      },
    );
    await handleErrors(
      response,
      "Failed to fetch instance with id: " + instanceId,
    );

    const instance: { data: ServiceInstanceModel } = await response.json();

    if (instance.data.referenced_by !== null) {
      await Promise.all(
        instance.data.referenced_by.map(async (relatedId) => {
          const nestedInstance = await fetchService(relatedId);
          if (nestedInstance) {
            relatedInstances.push(nestedInstance);
          }
          return nestedInstance;
        }),
      );
    }

    return {
      instance: instance.data,
      relatedInstances,
    };
  };

  return {
    /**
     * Custom hook to fetch the parameter from the API once.
     * @returns The result of the query, including the parameter data.
     */
    useOneTime: (): UseQueryResult<InstanceWithReferences, Error> =>
      useQuery({
        queryKey: ["get_instance_with_relations-one_time", id, environment],
        queryFn: () => fetchService(id),
        retry: false,
      }),
  };
};
