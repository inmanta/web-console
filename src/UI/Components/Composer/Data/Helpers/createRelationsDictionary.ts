import { ServiceModel, EmbeddedEntity, InterServiceRelation } from "@/Core/Domain/ServiceModel";


export type Rules = {
    lower_limit: number;
    upper_limit: number;
};

export type RelationsDictionary = Record<string, Record<string, Rules>>;

/**
 * Ensure we write a bidirectional relation with limits into the dictionary
 */
const connect = (
    dict: RelationsDictionary,
    a: string,
    b: string,
    rules: Rules
) => {
    if (!dict[a]) dict[a] = {};
    dict[a][b] = rules;
    if (!dict[b]) dict[b] = {};
    dict[b][a] = rules;
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
    rootServiceName: string,
    embeddedEntities: EmbeddedEntity[]
) => {
    embeddedEntities.forEach((entity) => {
        // Root service <-> embedded entity
        connect(dict, rootServiceName, entity.name, {
            lower_limit: Number(entity.lower_limit),
            upper_limit: Number(entity.upper_limit),
        });

        // Root service <-> inter-service relations from this embedded entity
        entity.inter_service_relations.forEach((relation: InterServiceRelation) => {
            connect(dict, rootServiceName, relation.name, {
                lower_limit: Number(relation.lower_limit),
                upper_limit: Number(relation.upper_limit),
            });
        });

        // Recurse into nested
        if (entity.embedded_entities && entity.embedded_entities.length > 0) {
            addEmbeddedRelations(dict, rootServiceName, entity.embedded_entities);
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
            connect(relationDictionary, service.name, relation.name, {
                lower_limit: Number(relation.lower_limit),
                upper_limit: Number(relation.upper_limit),
            });
        });

        // Relations from embedded entities (recursively)
        addEmbeddedRelations(relationDictionary, service.name, service.embedded_entities);
    });

    return relationDictionary;
}
