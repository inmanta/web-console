import { NonEmptyArray, ParsedNumber } from "@/Core/Language";
import { ResourceActionScope } from "@/UI/Components/ResourceActions";
import { words } from "@/UI/words";

/**
 * Builds the deploy, repair and dry-run scopes offered for a service instance: always the instance itself, and an
 * "owned services" scope only when the service type declares owned_entities.
 *
 * The owned label is an upper bound: owned_entities is a property of the service type, not a count
 * for this instance, and it is read from the latest catalog version, which may differ from the
 * instance's own service_entity_version. So the owned scope carries no count and only names the
 * entity types it may touch.
 *
 * Both filters also name the instance's own service entity. That doesn't narrow the scope, since
 * the entity only selects the instances themselves and owned instances are added after, but it
 * lets a dry run report look the instance up by its entity.
 *
 * @example buildInstanceResourceActionScopes({ serviceEntity: "lab", instanceId: "abc", total: 3, ownedEntities: ["l2Connect"] })
 *   => [{ id: "instance", ... }, { id: "owned", ... }]
 */
export function buildInstanceResourceActionScopes({
  serviceEntity,
  instanceId,
  total,
  ownedEntities,
}: {
  serviceEntity: string;
  instanceId: string;
  total: ParsedNumber | null | undefined;
  ownedEntities: string[];
}): NonEmptyArray<ResourceActionScope> {
  const instanceFilter = {
    isOrphan: false,
    serviceEntity: [serviceEntity],
    serviceInstance: [instanceId],
  };
  const instanceScope: ResourceActionScope = {
    id: "instance",
    title: words("resources.resourceActions.confirm.instance.title"),
    filter: instanceFilter,
    count: total == null ? undefined : Number(total),
  };

  if (ownedEntities.length === 0) {
    return [instanceScope];
  }

  return [
    instanceScope,
    {
      id: "owned",
      title: words("resources.resourceActions.confirm.owned.title"),
      filter: { ...instanceFilter, includeOwned: true },
      detail: words("resources.resourceActions.confirm.owned.description")(
        ownedEntities.join(", ")
      ),
    },
  ];
}
