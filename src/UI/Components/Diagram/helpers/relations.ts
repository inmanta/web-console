import { dia } from "@inmanta/rappid";
import {
  EmbeddedEntity,
  InstanceAttributeModel,
  InterServiceRelation,
  ServiceInstanceModel,
  ServiceModel,
} from "@/Core";
import { ServiceEntityBlock } from "../shapes";

/**
 * Extracts the IDs of the relations of a service instance.
 *
 * @param service - The service model.
 * @param instance - The service instance.
 * @returns {string[]} An array of relation IDs.
 */
export const extractRelationsIds = (
  service: ServiceModel,
  instance: ServiceInstanceModel,
): string[] => {
  const relationKeys = service.inter_service_relations.map(
    (relation) => relation.name,
  );

  if (!relationKeys) {
    return [];
  }

  const extractRelation = (attributes: InstanceAttributeModel): string[] =>
    relationKeys
      .map((key) => String(attributes[key]))
      .filter((attribute) => attribute !== "undefined");

  if (instance.candidate_attributes !== null) {
    return extractRelation(instance.candidate_attributes);
  } else if (instance.active_attributes !== null) {
    return extractRelation(instance.active_attributes);
  } else {
    return [];
  }
};

/**
 * Finds the inter-service relations entity types for the given service model or embedded entity.
 *
 * @param {ServiceModel | EmbeddedEntity} serviceModel - The service model or embedded entity to find inter-service relations for.
 *
 * @returns {string[]} An array of entity types that have inter-service relations with the given service model or embedded entity
 */
export const findInterServiceRelations = (
  serviceModel: ServiceModel | EmbeddedEntity,
): string[] => {
  const result =
    serviceModel.inter_service_relations.map(
      (relation) => relation.entity_type,
    ) || [];

  const embeddedEntitiesResult = serviceModel.embedded_entities.flatMap(
    (embedded_entity) => findInterServiceRelations(embedded_entity),
  );

  return result.concat(embeddedEntitiesResult);
};

/**
 * Finds the inter-service relations objects for the given service model or embedded entity.
 *
 * @param {ServiceModel | EmbeddedEntity} serviceModel - The service model or embedded entity to find inter-service relations for.
 *
 * @returns {string[]} An array of inter-service relations objects that have inter-service relations
 * */
export const findFullInterServiceRelations = (
  serviceModel: ServiceModel | EmbeddedEntity,
): InterServiceRelation[] => {
  const result = serviceModel.inter_service_relations || [];

  const embeddedEntitiesResult = serviceModel.embedded_entities.flatMap(
    (embedded_entity) => findFullInterServiceRelations(embedded_entity),
  );

  return result.concat(embeddedEntitiesResult);
};

interface CorrespondingId {
  id: dia.Cell.ID;
  attributeName: string;
}

/**
 * Find if the relations of some instance includes Id of the instance passed through prop
 * @param {Map<dia.Cell.ID, string>} neighborRelations map of ids that could include id of instanceAsTable
 * @param {ServiceEntityBlock} instanceAsTable Instance to which should instances connect to
 *
 * @returns {CorrespondingId | undefined}
 */
export const findCorrespondingId = (
  neighborRelations: Map<dia.Cell.ID, string>,
  instanceAsTable: ServiceEntityBlock,
): CorrespondingId | undefined => {
  return Array.from(neighborRelations, ([id, attributeName]) => ({
    id,
    attributeName,
  })).find(({ id }) => id === instanceAsTable.id);
};
