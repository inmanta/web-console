import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { EmbeddedEntity, InstanceAttributeModel, ServiceInstanceModel, ServiceModel } from "@/Core";
import { CustomError, useGet, REFETCH_INTERVAL } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";

/*
 * interface for the service instance with its related instances and eventual coordinates on canvas
 */
export interface InstanceWithRelations {
  instance: ServiceInstanceModel;
  interServiceRelations: ServiceInstanceModel[];
  coordinates?: string;
}

/**
 * Return Signature of the useServiceModel React Query
 */
interface GetInstanceWithRelationsHook {
  useOneTime: () => UseQueryResult<InstanceWithRelations, CustomError>;
  useContinuous: () => UseQueryResult<InstanceWithRelations, CustomError>;
}

/**
 * React Query hook to fetch an instance with its related instances from the API. The related instances are all instances connected with given instance by inter-service relation, both, as a parent and as a child.
 * @param {string} id - The ID of the instance to fetch.
 * @param {boolean} includesReferencedBy - A flag indicating if we should fetch instances that reference our main instance - defaults to false.
 * @param {ServiceModel} [serviceModel] - The service Model of the instance (optional as it can be undefined at the init of the component that use the hook)
 * @returns  {GetInstanceWithRelationsHook} An object containing a custom hook to fetch the instance with its related instances.
 */
export const useGetInstanceWithRelations = (
  instanceId: string,
  includesReferencedBy: boolean = false,
  serviceModel?: ServiceModel
): GetInstanceWithRelationsHook => {
  const getUrl = (id: string) =>
    `/lsm/v1/service_inventory?service_id=${id}&include_deployment_progress=false&exclude_read_only_attributes=false&include_referenced_by=${includesReferencedBy}&include_metadata=true`;
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<{ data: ServiceInstanceModel }>;

  /**
   * This function is responsible for extracting the names of all inter-service relations from the provided service model or embedded entity.
   * It also recursively extracts the names of all relations from any embedded entities within the provided service model or embedded entity.
   *
   * @param {ServiceModel | EmbeddedEntity} serviceModel - The service model or embedded entity from which to extract the relations.
   * @returns {string[]} An array of the names of all relations.
   */
  const getAllRelationNames = (serviceModel: ServiceModel | EmbeddedEntity): string[] => {
    const relations = serviceModel.inter_service_relations.map((relation) => relation.name) || [];

    const nestedRelations = serviceModel.embedded_entities.flatMap((entity) =>
      getAllRelationNames(entity)
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
  const getAllEmbeddedEntityNames = (serviceModel: ServiceModel | EmbeddedEntity): string[] => {
    const embeddedEntities = serviceModel.embedded_entities.map((entity) => entity.name);
    const nestedEmbeddedEntities = serviceModel.embedded_entities.flatMap((entity) =>
      getAllEmbeddedEntityNames(entity)
    );

    return [...embeddedEntities, ...nestedEmbeddedEntities];
  };

  /**
   * This function extracts all the inter-service-relation ids from the provided attributes.
   * It does this by mapping over the provided relation names and extracting the corresponding Ids from the attributes.
   * It also recursively extracts the Ids of all related instances from any embedded entities within the provided attributes.
   *
   * @param {InstanceAttributeModel} attributes - The attributes from which to extract the related Ids.
   * @param {string[]} relationNames - The names of the relations to extract.
   * @param {string[]} embeddedNames - The names of the embedded entities that can have relations.
   *
   * @returns {string[]} An array of the Ids of all related instances.
   */
  const getInterServiceRelationIds = (
    attributes: InstanceAttributeModel,
    relationNames: string[],
    embeddedNames: string[]
  ): string[] => {
    // Map relation names to corresponding IDs from attributes
    const relationIds = relationNames
      .flatMap((relationName) => attributes[relationName]) //relations can be in the array of strings so we need to flatten it just in case
      .filter((id): id is string => typeof id === "string"); // Filter to ensure only you only keep strings

    // Extract IDs from embedded relations recursively
    const embeddedRelationsIds = embeddedNames.flatMap((embeddedName) => {
      const embeddedAttributes = attributes[embeddedName];

      if (!embeddedAttributes) {
        return [];
      }

      if (Array.isArray(embeddedAttributes)) {
        // Recursively collect IDs from an array of embedded attributes
        return embeddedAttributes.flatMap((embedded) =>
          getInterServiceRelationIds(embedded, relationNames, embeddedNames)
        );
      } else {
        // Recursively collect IDs from a single embedded attribute
        return getInterServiceRelationIds(
          embeddedAttributes as InstanceAttributeModel, //InstanceAttributeModel is a Record<string, unknown> so casting is required here
          relationNames,
          embeddedNames
        );
      }
    });

    // Combine and filter out falsy values (undefined, null, "")
    const ids = [...relationIds, ...embeddedRelationsIds].filter(Boolean);

    return ids;
  };

  /**
   *  For a given instance Id, fetches the root instance with its corresponding inter-service-relation instances.
   * @param {string} id - The ID of the instance to fetch.
   * @returns {Promise<InstanceWithRelations>} An object containing the fetched instance and its related instances.
   * @throws Error if the instance fails to fetch.
   */
  const fetchInstanceWithRelations = async (id: string): Promise<InstanceWithRelations> => {
    const interServiceRelations: ServiceInstanceModel[] = [];
    const { data: instance } = await get(getUrl(id));
    let serviceIds: string[] = [];

    if (serviceModel) {
      const attributesToFetch = getAllRelationNames(serviceModel);
      const uniqueAttributes = [...new Set(attributesToFetch)];
      const allEmbedded = getAllEmbeddedEntityNames(serviceModel);
      const attributes = instance.active_attributes || instance.candidate_attributes || {}; //we don't operate on rollback attributes

      serviceIds = getInterServiceRelationIds(attributes, uniqueAttributes, allEmbedded);
    }

    const allIds = [...new Set([...serviceIds, ...(instance.referenced_by || [])])];

    await Promise.all(
      allIds.map(async (relatedId) => {
        const interServiceRelation = await get(getUrl(relatedId));

        if (interServiceRelation) {
          interServiceRelations.push(interServiceRelation.data);
        }

        return interServiceRelation;
      })
    );

    return {
      instance,
      interServiceRelations,
    };
  };

  return {
    /**
     * Custom hook to fetch the parameter from the API once.
     * @returns The result of the query, including the parameter data.
     */
    useOneTime: (): UseQueryResult<InstanceWithRelations, CustomError> =>
      useQuery({
        queryKey: ["get_instance_with_relations-one_time", instanceId, env],
        queryFn: () => fetchInstanceWithRelations(instanceId),

        enabled: serviceModel !== undefined,
        gcTime: 0,
      }),
    useContinuous: (): UseQueryResult<InstanceWithRelations, CustomError> =>
      useQuery({
        queryKey: ["get_instance_with_relations-continuous", instanceId, env],
        queryFn: () => fetchInstanceWithRelations(instanceId),

        refetchInterval: REFETCH_INTERVAL,
        enabled: serviceModel !== undefined,
      }),
  };
};
