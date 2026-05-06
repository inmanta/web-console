import { v4 as uuidv4 } from "uuid";
import {
  ServiceModel,
  EmbeddedEntity,
  InterServiceRelation,
  InstanceAttributeModel,
  ServiceInstanceModel,
} from "@/Core";
import { InstanceWithRelations } from "@/Data/Queries";
import { convertLowerLimitToNumber } from "./shapeUtils";

/**
 * Builds the candidate_attributes for a placeholder, populating required inter-service
 * relations and embedded entities. Mutates `attrs` and `interServiceRelations` in place.
 */
export const applyRequiredConnections = (
  relations: InterServiceRelation[],
  embeddedEntities: EmbeddedEntity[],
  attrs: Record<string, unknown>,
  interServiceRelations: ServiceInstanceModel[],
  serviceCatalog: ServiceModel[]
): void => {
  relations.forEach((relation) => {
    const lowerLimit = convertLowerLimitToNumber(relation.lower_limit);

    if (lowerLimit <= 0) {
      return;
    }

    const upperLimit =
      relation.upper_limit != null ? convertLowerLimitToNumber(relation.upper_limit) : null;

    const relatedModel = serviceCatalog.find((s) => s.name === relation.entity_type);

    const placeholders = Array.from({ length: lowerLimit }, () => {
      const placeholderAttrs: InstanceAttributeModel = {};

      if (relatedModel) {
        applyRequiredConnections(
          relatedModel.inter_service_relations,
          relatedModel.embedded_entities,
          placeholderAttrs,
          interServiceRelations,
          serviceCatalog
        );
      }

      return {
        id: uuidv4(),
        service_entity: relation.entity_type,
        version: 0,
        environment: "",
        active_attributes: null,
        candidate_attributes: placeholderAttrs,
        rollback_attributes: null,
        callback: [],
        deleted: false,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
        state: "creating",
        referenced_by: null,
      } as ServiceInstanceModel;
    });

    interServiceRelations.push(...placeholders);

    const placeholderIds = placeholders.map((p) => p.id);

    attrs[relation.name] =
      upperLimit === 1 && placeholderIds.length === 1 ? placeholderIds[0] : placeholderIds;
  });

  embeddedEntities.forEach((embeddedEntity) => {
    if (embeddedEntity.modifier === "r") {
      return;
    }

    const lowerLimit = convertLowerLimitToNumber(embeddedEntity.lower_limit);

    if (lowerLimit <= 0) {
      return;
    }

    const upperLimit =
      embeddedEntity.upper_limit != null
        ? convertLowerLimitToNumber(embeddedEntity.upper_limit)
        : null;

    const placeholders = Array.from({ length: lowerLimit }, () => {
      const embeddedAttrs: Record<string, unknown> = {};

      applyRequiredConnections(
        embeddedEntity.inter_service_relations,
        embeddedEntity.embedded_entities,
        embeddedAttrs,
        interServiceRelations,
        serviceCatalog
      );

      return embeddedAttrs;
    });

    attrs[embeddedEntity.name] =
      upperLimit === 1 && placeholders.length === 1 ? placeholders[0] : placeholders;
  });
};

/**
 * Creates a placeholder instance from a service model for new instance creation.
 * Recursively populates required inter-service relations and embedded entities at every
 * nesting level so the canvas can render and validate the new instance immediately.
 *
 * @param serviceModel - The service model to create a placeholder from
 * @param serviceCatalog - Full catalog used to resolve nested relation models
 * @param instanceId - Optional custom instanceId, otherwise generates a new UUID
 * @returns A placeholder InstanceWithRelations object
 */
export const createPlaceholderInstance = (
  serviceModel: ServiceModel,
  serviceCatalog: ServiceModel[],
  instanceId?: string
): InstanceWithRelations => {
  const id = instanceId || uuidv4();
  const instanceAttributes: InstanceAttributeModel = {};
  const interServiceRelations: ServiceInstanceModel[] = [];

  applyRequiredConnections(
    serviceModel.inter_service_relations,
    serviceModel.embedded_entities,
    instanceAttributes,
    interServiceRelations,
    serviceCatalog
  );

  return {
    instance: {
      id,
      service_entity: serviceModel.name,
      version: 0,
      environment: "",
      active_attributes: null,
      candidate_attributes: instanceAttributes,
      rollback_attributes: null,
      callback: [],
      deleted: false,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
      state: "creating",
      referenced_by: null,
    },
    interServiceRelations,
  };
};
