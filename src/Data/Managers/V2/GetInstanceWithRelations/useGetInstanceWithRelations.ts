import { useQuery } from "@tanstack/react-query";
import { ServiceInstanceModel } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { InstanceWithReferences } from "../../GetInstanceWithRelations/interface";
import { useCreateHeaders } from "../helpers/useCreateHeaders";
import { useHandleErrors } from "../helpers/useHandleErrors";

/**
 * Custom hook to fetch an instance with its related instances from the API.
 * @param id - The ID of the instance to fetch.
 * @param environment - The environment in which we are looking for instances.
 * @returns An object containing a custom hook to fetch the instance with its related instances.
 */
export const useGetInstanceWithRelations = (
  id: string,
  environment: string,
) => {
  //extracted headers to avoid breaking rules of Hooks
  const headers = useCreateHeaders(environment);
  const { handleAuthorization } = useHandleErrors();

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Fetches a service instance with its related instances recursively.
   * @param instanceId - The ID of the instance to fetch.
   * @returns An object containing the fetched instance and its related instances.
   * @throws Error if the instance fails to fetch.
   */
  const fetchService = async (instanceId: string) => {
    const relatedInstances: InstanceWithReferences[] = [];
    const response = await fetch(
      `${baseUrl}/lsm/v1/service_inventory?service_id=${instanceId}&include_deployment_progress=false&exclude_read_only_attributes=false&include_referenced_by=true&include_metadata=false`,
      {
        headers,
      },
    );
    handleAuthorization(response);

    if (!response.ok) {
      throw new Error("Failed to fetch instance");
    }
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

  const fetchServiceWithRelations = async () => {
    return await fetchService(id);
  };

  return {
    /**
     * Custom hook to fetch the parameter from the API once.
     * @returns The result of the query, including the parameter data.
     */
    useOneTime: () =>
      useQuery({
        queryKey: ["get_instance_with_relations-one_time", id, environment],
        queryFn: fetchServiceWithRelations,
        retry: false,
        select: (data) => data,
      }),
  };
};
