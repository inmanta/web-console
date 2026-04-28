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

const sumRules = (existing: Rules, incoming: Rules): Rules => ({
  lower_limit: existing.lower_limit + incoming.lower_limit,
  upper_limit:
    existing.upper_limit === null || incoming.upper_limit === null
      ? null
      : existing.upper_limit + incoming.upper_limit,
});

export type RelationsDictionary = Record<string, Record<string, Rules>>;

const DEFAULT_REVERSE_INTER_SERVICE_RULES: Rules = {
  lower_limit: 0,
  upper_limit: null,
};

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

const getDeclaredInterServiceRules = (
  service: ServiceModel | undefined,
  targetEntityType: string
): Rules | undefined => {
  if (!service) {
    return undefined;
  }

  const normalizedTargetEntityType = targetEntityType.toLowerCase();
  const relation = service.inter_service_relations.find(
    (candidate) =>
      (candidate.entity_type || candidate.name).toLowerCase() === normalizedTargetEntityType
  );

  if (!relation || relation.modifier === "r") {
    return undefined;
  }

  return {
    lower_limit: toNumber(relation.lower_limit),
    upper_limit: toNumberOrNull(relation.upper_limit),
  };
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
  embeddedEntities: EmbeddedEntity[],
  servicesByName: Record<string, ServiceModel>
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

    if (!dict[parentName]) {
      dict[parentName] = {};
    }
    const existingParentToChildRules = dict[parentName][entityKey];
    dict[parentName][entityKey] = existingParentToChildRules
      ? sumRules(existingParentToChildRules, parentToChildRules)
      : parentToChildRules;

    if (!dict[entityKey]) {
      dict[entityKey] = {};
    }
    // Keep embedded->parent relation constrained to a single parent relation.
    // When multiple embedded definitions share the same type key, do not widen this side.
    if (!dict[entityKey][parentName]) {
      dict[entityKey][parentName] = childToParentRules;
    }

    // Parent service/entity <-> inter-service relations from this embedded entity
    entity.inter_service_relations.forEach((relation: InterServiceRelation) => {
      if (relation.modifier === "r") {
        return;
      }
      const relationKey = relation.entity_type || relation.name;
      const forwardRules = {
        lower_limit: toNumber(relation.lower_limit),
        upper_limit: toNumberOrNull(relation.upper_limit),
      };
      const reverseRules =
        getDeclaredInterServiceRules(servicesByName[relationKey], entityKey) ??
        DEFAULT_REVERSE_INTER_SERVICE_RULES;

      connect(dict, entityKey, relationKey, forwardRules, reverseRules);
    });

    // Recurse into nested
    if (entity.embedded_entities && entity.embedded_entities.length > 0) {
      addEmbeddedRelations(dict, entityKey, entity.embedded_entities, servicesByName);
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
  const servicesByName = Object.fromEntries(catalog.map((service) => [service.name, service]));

  catalog.forEach((service) => {
    // Direct inter-service relations
    service.inter_service_relations.forEach((relation) => {
      if (relation.modifier === "r") {
        return;
      }
      const relationKey = relation.entity_type || relation.name;
      const forwardRules = {
        lower_limit: toNumber(relation.lower_limit),
        upper_limit: toNumberOrNull(relation.upper_limit),
      };
      const reverseRules =
        getDeclaredInterServiceRules(servicesByName[relationKey], service.name) ??
        DEFAULT_REVERSE_INTER_SERVICE_RULES;

      connect(relationDictionary, service.name, relationKey, forwardRules, reverseRules);
    });

    // Relations from embedded entities (recursively)
    addEmbeddedRelations(
      relationDictionary,
      service.name,
      service.embedded_entities,
      servicesByName
    );
  });

  return relationDictionary;
};
