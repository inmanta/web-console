import { ServiceModel, EmbeddedEntity, InterServiceRelation } from "@/Core/Domain/ServiceModel";
import { ParsedNumber } from "@/Core/Language";

export type Rules = {
    lower_limit: number;
    upper_limit: number | null;
};

type NumericInput = ParsedNumber | number | string | null | undefined;

const toNumber = (value: NumericInput, fallback = 0): number => {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }
    if (typeof value === "bigint") {
        return Number(value);
    }
    return Number(value);
};

const toNumberOrNull = (value: NumericInput): number | null => {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    if (typeof value === "bigint") {
        return Number(value);
    }
    return Number(value);
};

export type RelationsDictionary = Record<string, Record<string, Rules>>;

/**
 * Ensure we write a bidirectional relation with limits into the dictionary
 * Allows providing different rules for the reverse direction when required
 */
const connect = (
    dict: RelationsDictionary,
    a: string,
    b: string,
    rules: Rules,
    reverseRules?: Rules
) => {
    if (!dict[a]) dict[a] = {};
    dict[a][b] = rules;
    if (!dict[b]) dict[b] = {};
    dict[b][a] = reverseRules ?? rules;
};

/**
 * Recursively add relations derived from embedded entities to the dictionary.
 * Links the root service to:
 * - each embedded entity by that entity's limits
 * - each inter-service relation declared on any embedded entity by that relation's limits
 * And recurses into nested embedded entities.
 */
const addEmbeddedRelations = (
    dict: RelationsDictionary,
    parentName: string,
    embeddedEntities: EmbeddedEntity[]
) => {
    embeddedEntities.forEach((entity) => {
        if (entity.modifier === "r") {
            return;
        }
        const entityKey = entity.type || entity.name;
        // Parent service/entity <-> embedded entity
        const parentToChildRules = {
            lower_limit: toNumber(entity.lower_limit),
            upper_limit: toNumberOrNull(entity.upper_limit),
        };
        const childToParentRules: Rules = {
            // Embedded entities should always connect back to exactly one parent instance
            // Unless the parent-to-child relation has null upper_limit (unlimited), preserve null
            lower_limit: parentToChildRules.lower_limit > 0 ? 1 : 0,
            upper_limit: parentToChildRules.upper_limit === null ? null : 1,
        };
        connect(dict, parentName, entityKey, parentToChildRules, childToParentRules);

        // Parent service/entity <-> inter-service relations from this embedded entity
        entity.inter_service_relations.forEach((relation: InterServiceRelation) => {
            if (relation.modifier === "r") {
                return;
            }
            const relationKey = relation.entity_type || relation.name;
            connect(dict, entityKey, relationKey, {
                lower_limit: toNumber(relation.lower_limit),
                upper_limit: toNumberOrNull(relation.upper_limit),
            });
        });

        // Recurse into nested
        if (entity.embedded_entities && entity.embedded_entities.length > 0) {
            addEmbeddedRelations(dict, entityKey, entity.embedded_entities);
        }
    });
};

/**
 * Create a bidirectional dictionary of relations between services
 * @param catalog - The catalog of services
 * @returns A bidirectional dictionary of relations between services
 */
export const createRelationsDictionary = (catalog: ServiceModel[]): RelationsDictionary => {
    const relationDictionary: RelationsDictionary = {};

    catalog.forEach((service) => {
        // Direct inter-service relations
        service.inter_service_relations.forEach((relation) => {
            if (relation.modifier === "r") {
                return;
            }
            const relationKey = relation.entity_type || relation.name;
            connect(relationDictionary, service.name, relationKey, {
                lower_limit: toNumber(relation.lower_limit),
                upper_limit: toNumberOrNull(relation.upper_limit),
            });
        });

        // Relations from embedded entities (recursively)
        addEmbeddedRelations(relationDictionary, service.name, service.embedded_entities);
    });

    return relationDictionary;
}
