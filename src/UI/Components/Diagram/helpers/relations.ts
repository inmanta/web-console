import { dia } from "@inmanta/rappid";
import { EmbeddedEntity, InterServiceRelation, ServiceInstanceModel, ServiceModel } from "@/Core";
import { ServiceEntityBlock } from "../shapes";

/**
 * Extracts the IDs of the relations of a service instance.
 *
 * Prioritizes candidate_attributes over active_attributes when both are available.
 * Filters out null, undefined, and empty string values.
 *
 * @param service - The service model containing inter-service relation definitions.
 * @param instance - The service instance containing attribute values.
 * @returns {string[]} An array of relation IDs as strings.
 */
export const extractRelationsIds = (
  service: ServiceModel,
  instance: ServiceInstanceModel
): string[] => {
  const relationKeys = service.inter_service_relations.map((relation) => relation.name);

  if (relationKeys.length === 0) {
    return [];
  }

  // Prefer candidate_attributes over active_attributes.
  // rollback_attributes are not used in the composer.
  const attributes = instance.candidate_attributes ?? instance.active_attributes;

  if (!attributes) {
    return [];
  }

  return relationKeys
    .map((key) => attributes[key])
    .filter(Boolean)
    .map(String);
};

/**
 * Finds the inter-service relations entity types for the given service model or embedded entity.
 *
 * TODO: This recursive function should be adjusted to work with levels, and also cover x-level of nested inter-service relations.
 *
 * @param {ServiceModel | EmbeddedEntity} serviceModel - The service model or embedded entity to find inter-service relations for.
 *
 * @returns {string[]} An array of entity types that have inter-service relations with the given service model or embedded entity
 */
export const findInterServiceRelations = (
  serviceModel: ServiceModel | EmbeddedEntity
): string[] => {
  const result = serviceModel.inter_service_relations.map((relation) => relation.entity_type) || [];

  const embeddedEntitiesResult = serviceModel.embedded_entities.flatMap((embedded_entity) =>
    findInterServiceRelations(embedded_entity)
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
  serviceModel: ServiceModel | EmbeddedEntity
): InterServiceRelation[] => {
  const result = serviceModel.inter_service_relations || [];

  const embeddedEntitiesResult = serviceModel.embedded_entities.flatMap((embedded_entity) =>
    findFullInterServiceRelations(embedded_entity)
  );

  return result.concat(embeddedEntitiesResult);
};

interface CorrespondingId {
  id: dia.Cell.ID;
  attributeName: string;
}

/**
 * Find if the relations of some instance includes Id of the instance passed through prop
 * @param {Map<dia.Cell.ID, string>} neighborRelations map of ids that could include id of instanceEntityBlock
 * @param {ServiceEntityBlock} instanceEntityBlock Instance to which should instances connect to
 *
 * @returns {CorrespondingId | undefined}
 */
export const findCorrespondingId = (
  neighborRelations: Map<dia.Cell.ID, string>,
  instanceEntityBlock: ServiceEntityBlock
): CorrespondingId | undefined => {
  return Array.from(neighborRelations, ([id, attributeName]) => ({
    id,
    attributeName,
  })).find(({ id }) => id === instanceEntityBlock.id);
};
