import { UseQueryResult, useQuery } from "@tanstack/react-query";
import {
  EmbeddedEntity,
  InstanceAttributeModel,
  ServiceInstanceModel,
  ServiceModel,
} from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";

/*
 * interface for the service instance with its related instances and eventual coordinates on canvas
 */
export interface InstanceWithRelations {
  instance: ServiceInstanceModel;
  relatedInstances?: ServiceInstanceModel[];
  coordinates?: string;
}

/**
 * Return Signature of the useServiceModel React Query
 */
interface GetInstanceWithRelationsHook {
  useOneTime: () => UseQueryResult<InstanceWithRelations, Error>;
  useContinuous: () => UseQueryResult<InstanceWithRelations, Error>;
}

/**
 * React Query hook to fetch an instance with its related instances from the API.
 * @param {string} id - The ID of the instance to fetch.
 * @param {ServiceModel | undefined} serviceModel - The service Model of the instance
 * @param {string} environment - The environment in which we are looking for instances.
 * @returns  {GetInstanceWithRelationsHook} An object containing a custom hook to fetch the instance with its related instances.
 */
export const useGetInstanceWithRelations = (
  instanceId: string,
  serviceModel: ServiceModel | undefined,
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
   * Fetches a service instance
   * @param {string} id - The ID of the instance to fetch.
   * @returns {Promise<{data: ServiceInstanceModel}>} An object containing the fetched instance.
   * @throws Error if the instance fails to fetch.
   */
  const fetchInstance = async (
    id: string,
  ): Promise<{ data: ServiceInstanceModel }> => {
    //we use this endpoint instead /lsm/v1/service_inventory/{service_entity}/{service_id} because referenced_by property includes only ids, without information about service_entity for given ids
    const response = await fetch(
      `${baseUrl}/lsm/v1/service_inventory?service_id=${id}&include_deployment_progress=false&exclude_read_only_attributes=false&include_referenced_by=true&include_metadata=true`,
      {
        headers,
      },
    );

    await handleErrors(response, "Failed to fetch instance with id: " + id);

    return await response.json();
  };

  const getAllRelations = (
    serviceModel: ServiceModel | EmbeddedEntity,
  ): string[] => {
    const relations =
      serviceModel.inter_service_relations?.map((relation) => relation.name) ||
      [];

    const nestedRelations = serviceModel.embedded_entities?.flatMap((entity) =>
      getAllRelations(entity),
    );

    return [...relations, ...nestedRelations];
  };

  const getAllEmbeddedEntities = (
    serviceModel: ServiceModel | EmbeddedEntity,
  ): string[] => {
    const embedded = serviceModel.embedded_entities.map(
      (entity) => entity.name,
    );
    const nestedEmbedded = serviceModel.embedded_entities?.flatMap((entity) =>
      getAllEmbeddedEntities(entity),
    );

    return [...embedded, ...nestedEmbedded];
  };

  const findAllRelatedIds = (
    attributes: InstanceAttributeModel,
    relationNames: string[],
    embeddedNames: string[],
  ): string[] => {
    const relationIDs = relationNames.map(
      (relationName) => (attributes[relationName] as string) || "",
    );

    const embeddedRelationsIDs = embeddedNames.flatMap((embeddedName) => {
      if (!attributes[embeddedName]) {
        return "";
      }
      if (Array.isArray(attributes[embeddedName])) {
        return (attributes[embeddedName] as InstanceAttributeModel[]).flatMap(
          (embedded) =>
            findAllRelatedIds(embedded, relationNames, embeddedNames),
        );
      } else {
        return findAllRelatedIds(
          attributes[embeddedName] as InstanceAttributeModel,
          relationNames,
          embeddedNames,
        );
      }
    });

    return [...relationIDs, ...embeddedRelationsIDs];
  };

  /**
   * Fetches a service instance with its related instances.
   * @param {string} id - The ID of the instance to fetch.
   * @returns {Promise<InstanceWithRelations>} An object containing the fetched instance and its related instances.
   * @throws Error if the instance fails to fetch.
   */
  const fetchInstances = async (id: string): Promise<InstanceWithRelations> => {
    const relatedInstances: ServiceInstanceModel[] = [];
    const instance = (await fetchInstance(id)).data;
    let serviceIDs: string[] = [];

    if (serviceModel) {
      const whatAttributesToFetch = getAllRelations(serviceModel);
      const uniqueAttributes = [...new Set(whatAttributesToFetch)];
      const allEmbedded = getAllEmbeddedEntities(serviceModel);
      const attributes =
        instance.active_attributes || instance.candidate_attributes || {}; //we don't operate on rollback attributes

      serviceIDs = [
        ...new Set(
          findAllRelatedIds(attributes, uniqueAttributes, allEmbedded),
        ),
      ].filter((id) => id !== "");
    }

    const allIDs = [
      ...new Set([...serviceIDs, ...(instance.referenced_by || [])]),
    ];

    await Promise.all(
      allIDs.map(async (relatedId) => {
        const relatedInstance = await fetchInstance(relatedId);

        if (relatedInstance) {
          relatedInstances.push(relatedInstance.data);
        }

        return relatedInstance;
      }),
    );

    return {
      instance,
      relatedInstances,
    };
  };

  return {
    /**
     * Custom hook to fetch the parameter from the API once.
     * @returns The result of the query, including the parameter data.
     */
    useOneTime: (): UseQueryResult<InstanceWithRelations, Error> =>
      useQuery({
        queryKey: [
          "get_instance_with_relations-one_time",
          instanceId,
          environment,
        ],
        queryFn: () => fetchInstances(instanceId),
        retry: false,
        enabled: serviceModel !== undefined,
      }),
    useContinuous: (): UseQueryResult<InstanceWithRelations, Error> =>
      useQuery({
        queryKey: [
          "get_instance_with_relations-continuous",
          instanceId,
          environment,
        ],
        queryFn: () => fetchInstances(instanceId),
        refetchInterval: 5000,
        enabled: serviceModel !== undefined,
      }),
  };
};
