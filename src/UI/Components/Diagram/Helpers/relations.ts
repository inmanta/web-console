import { dia } from "@inmanta/rappid";
import { EmbeddedEntity, InterServiceRelation, ServiceModel } from "@/Core";
import { ServiceEntityBlock } from "../Shapes";

/**
 * Finds the inter-service relations entity types for the given service model or embedded entity.
 *
 * TODO: This recursive function should be adjusted to work with levels, and also cover x-level of nested inter-service relations.
 * https://github.com/inmanta/web-console/issues/6546
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
