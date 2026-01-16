import { EmbeddedEntity, InterServiceRelation, RelationAttribute } from "@/Core";
import { ServiceEntityShape } from "../../UI/JointJsShapes/ServiceEntityShape";
import { getEmbeddedEntityKey, getInterServiceRelationKey, convertLowerLimitToNumber } from "./shapeUtils";

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
 * Checks if a connection requirement is satisfied
 */
const checkConnectionRequirement = (
    shape: ServiceEntityShape,
    configuration: ConnectionCheckConfig
): boolean => {
    // Skip read-only for existing entities
    if (configuration.skipReadOnly) {
        return false;
    }

    // If lower_limit is 0 or undefined, no connection is required
    if (configuration.lowerLimit === 0) {
        return false;
    }

    const connectionsForType = shape.connections.get(configuration.connectionKey) || [];
    const connectedCount = connectionsForType.length;

    return connectedCount < configuration.lowerLimit;
};

/**
 * Gets missing connection details for a requirement
 */
const getMissingConnectionDetails = (
    shape: ServiceEntityShape,
    configuration: ConnectionCheckConfig
): { name: string; missing: number; required: number } | null => {
    // Skip read-only for existing entities
    if (configuration.skipReadOnly) {
        return null;
    }

    // If lower_limit is 0 or undefined, no connection is required
    if (configuration.lowerLimit === 0) {
        return null;
    }

    const connectionsForType = shape.connections.get(configuration.connectionKey) || [];
    const connectedCount = connectionsForType.length;

    if (connectedCount < configuration.lowerLimit) {
        return {
            name: configuration.displayName,
            missing: configuration.lowerLimit - connectedCount,
            required: configuration.lowerLimit,
        };
    }

    return null;
};

/**
 * Helper to check if an embedded entity is missing connections
 */
export const checkEmbeddedEntityConnections = (
    shape: ServiceEntityShape,
    embeddedEntity: EmbeddedEntity
): boolean => {
    const configuration = buildConnectionCheckConfig(
        shape,
        embeddedEntity,
        getEmbeddedEntityKey(embeddedEntity),
        getEmbeddedEntityKey(embeddedEntity)
    );
    return checkConnectionRequirement(shape, configuration);
};

/**
 * Helper to check if an inter-service relation is missing connections
 */
export const checkInterServiceRelationConnections = (
    shape: ServiceEntityShape,
    relation: InterServiceRelation
): boolean => {
    const configuration = buildConnectionCheckConfig(
        shape,
        relation,
        getInterServiceRelationKey(relation),
        relation.name
    );
    return checkConnectionRequirement(shape, configuration);
};

/**
 * Helper to get missing connection details for an embedded entity
 */
export const getEmbeddedEntityMissingConnections = (
    shape: ServiceEntityShape,
    embeddedEntity: EmbeddedEntity
): { name: string; missing: number; required: number } | null => {
    const configuration = buildConnectionCheckConfig(
        shape,
        embeddedEntity,
        getEmbeddedEntityKey(embeddedEntity),
        getEmbeddedEntityKey(embeddedEntity)
    );
    return getMissingConnectionDetails(shape, configuration);
};

/**
 * Helper to get missing connection details for an inter-service relation
 */
export const getInterServiceRelationMissingConnections = (
    shape: ServiceEntityShape,
    relation: InterServiceRelation
): { name: string; missing: number; required: number } | null => {
    const configuration = buildConnectionCheckConfig(
        shape,
        relation,
        getInterServiceRelationKey(relation),
        relation.name
    );
    return getMissingConnectionDetails(shape, configuration);
};
