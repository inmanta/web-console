import { EmbeddedEntity, InterServiceRelation, RelationAttribute } from "@inmanta/web-console-core";
import { ServiceEntityShape } from "../ServiceEntityShape";
import {
  getEmbeddedEntityKey,
  getInterServiceRelationKey,
  convertLowerLimitToNumber,
} from "./shapeUtils";

/**
 * Configuration for checking connections
 */
interface ConnectionCheckConfig {
  connectionKey: string;
  displayName: string;
  lowerLimit: number;
  skipReadOnly: boolean;
}

/**
 * Builds configuration for connection checking from a relation attribute
 */
const buildConnectionCheckConfig = (
  shape: ServiceEntityShape,
  requirement: RelationAttribute,
  connectionKey: string,
  displayName: string
): ConnectionCheckConfig => {
  return {
    connectionKey,
    displayName,
    lowerLimit: convertLowerLimitToNumber(requirement.lower_limit),
    skipReadOnly: requirement.modifier === "r" && !shape.isNew,
  };
};

/**
 * Gets missing connection details for a requirement
 */
const getMissingConnectionDetails = (
  configuration: ConnectionCheckConfig,
  connectedCount: number
): { entityType: string; name: string; missing: number; required: number } | null => {
  // Skip read-only for existing entities
  if (configuration.skipReadOnly) {
    return null;
  }

  // If lower_limit is 0 or undefined, no connection is required
  if (configuration.lowerLimit === 0) {
    return null;
  }

  if (connectedCount < configuration.lowerLimit) {
    return {
      entityType: configuration.connectionKey,
      name: configuration.displayName,
      missing: configuration.lowerLimit - connectedCount,
      required: configuration.lowerLimit,
    };
  }

  return null;
};

/**
 * Helper to get missing connection details for an embedded entity. It counts the entities that
 * fill this attribute (getEmbeddedIdsByAttribute), and names the attribute when another
 * attribute of the shape embeds the same type, so `port_a` and `port_b` each tell what they miss.
 */
export const getEmbeddedEntityMissingConnections = (
  shape: ServiceEntityShape,
  embeddedEntity: EmbeddedEntity,
  canvasState: Map<string, ServiceEntityShape>
): { entityType: string; name: string; missing: number; required: number } | null => {
  const entityKey = getEmbeddedEntityKey(embeddedEntity);
  const sharesType = (shape.serviceModel.embedded_entities ?? []).some(
    (other) => other.name !== embeddedEntity.name && getEmbeddedEntityKey(other) === entityKey
  );
  const configuration = buildConnectionCheckConfig(
    shape,
    embeddedEntity,
    entityKey,
    sharesType ? embeddedEntity.name : entityKey
  );

  return getMissingConnectionDetails(
    configuration,
    shape.getEmbeddedIdsByAttribute(canvasState).get(embeddedEntity.name)?.length ?? 0
  );
};

/**
 * Helper to get missing connection details for an inter-service relation
 */
export const getInterServiceRelationMissingConnections = (
  shape: ServiceEntityShape,
  relation: InterServiceRelation,
  canvasState: Map<string, ServiceEntityShape>
): { entityType: string; name: string; missing: number; required: number } | null => {
  const configuration = buildConnectionCheckConfig(
    shape,
    relation,
    getInterServiceRelationKey(relation),
    relation.name
  );

  return getMissingConnectionDetails(
    configuration,
    shape.getCountedConnections(configuration.connectionKey, canvasState).length
  );
};
