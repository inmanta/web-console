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
 * @param {string} environment - The environment in which we are looking for instances.
 * @param {ServiceModel} serviceModel - The service Model of the instance (optional as it can be undefined at the init of the component that use the hook)
 * @returns  {GetInstanceWithRelationsHook} An object containing a custom hook to fetch the instance with its related instances.
 */
export const useGetInstanceWithRelations = (
  instanceId: string,
  environment: string,
  serviceModel?: ServiceModel,
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

  /**
   * This function is responsible for extracting the names of all inter-service relations from the provided service model or embedded entity.
   * It also recursively extracts the names of all relations from any embedded entities within the provided service model or embedded entity.
   *
   * @param {ServiceModel | EmbeddedEntity} serviceModel - The service model or embedded entity from which to extract the relations.
   * @returns {string[]} An array of the names of all relations.
   */
  const getAllRelationsNames = (
    serviceModel: ServiceModel | EmbeddedEntity,
  ): string[] => {
    const relations =
      serviceModel.inter_service_relations?.map((relation) => relation.name) ||
      [];

    const nestedRelations = serviceModel.embedded_entities?.flatMap((entity) =>
      getAllRelationsNames(entity),
    );

    return [...relations, ...nestedRelations];
  };

  /**
   * This function is responsible for extracting the names of all embedded entities from the provided service model or embedded entity.
   * It also recursively extracts the names of all embedded entities from any embedded entities within the provided service model or embedded entity.
   *
   * @param {ServiceModel | EmbeddedEntity} serviceModel - The service model or embedded entity from which to extract the embedded entities.
   * @returns {string[]} An array of the names of all embedded entities.
   */
  const getAllEmbeddedEntitiesNames = (
    serviceModel: ServiceModel | EmbeddedEntity,
  ): string[] => {
    const embedded = serviceModel.embedded_entities.map(
      (entity) => entity.name,
    );
    const nestedEmbedded = serviceModel.embedded_entities?.flatMap((entity) =>
      getAllEmbeddedEntitiesNames(entity),
    );

    return [...embedded, ...nestedEmbedded];
  };

  /**
   * This function is responsible for extracting the Ids of all related instances from the provided attributes.
   * It does this by mapping over the provided relation names and extracting the corresponding Ids from the attributes.
   * It also recursively extracts the Ids of all related instances from any embedded entities within the provided attributes.
   *
   * @param {InstanceAttributeModel} attributes - The attributes from which to extract the related Ids.
   * @param {string[]} relationNames - The names of the relations to extract.
   * @param {string[]} embeddedNames - The names of the embedded entities that can have relations.
   * @returns {string[]} An array of the Ids of all related instances.
   */
  const getAllRelatedIds = (
    attributes: InstanceAttributeModel,
    relationNames: string[],
    embeddedNames: string[],
  ): string[] => {
    const relationIds = relationNames
      .map((relationName) => attributes[relationName])
      .filter((id) => id !== undefined) as string[];

    const embeddedRelationsIds = embeddedNames.flatMap((embeddedName) => {
      if (!attributes[embeddedName]) {
        return "";
      }
      const embeddedAttributes = attributes[embeddedName] as
        | InstanceAttributeModel
        | InstanceAttributeModel[];

      if (Array.isArray(embeddedAttributes)) {
        return embeddedAttributes.flatMap((embedded) =>
          getAllRelatedIds(embedded, relationNames, embeddedNames),
        );
      } else {
        return getAllRelatedIds(
          embeddedAttributes,
          relationNames,
          embeddedNames,
        );
      }
    });

    return [...relationIds, ...embeddedRelationsIds];
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
    let serviceIds: string[] = [];

    if (serviceModel) {
      const attributesToFetch = getAllRelationsNames(serviceModel);
      const uniqueAttributes = [...new Set(attributesToFetch)];
      const allEmbedded = getAllEmbeddedEntitiesNames(serviceModel);
      const attributes =
        instance.active_attributes || instance.candidate_attributes || {}; //we don't operate on rollback attributes

      serviceIds = [
        ...new Set(getAllRelatedIds(attributes, uniqueAttributes, allEmbedded)),
      ];
    }

    const allIds = [
      ...new Set([...serviceIds, ...(instance.referenced_by || [])]),
    ];

    await Promise.all(
      allIds.map(async (relatedId) => {
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
        enabled: !serviceModel,
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
        enabled: !serviceModel,
      }),
  };
};
