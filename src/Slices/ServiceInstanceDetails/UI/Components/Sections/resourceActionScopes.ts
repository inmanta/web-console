import { NonEmptyArray, ParsedNumber } from "@/Core/Language";
import { ResourceActionScope } from "@/UI/Components";
import { words } from "@/UI/words";

/**
 * Builds the deploy/repair scopes offered for a service instance: always the instance itself, and an
 * "owned services" scope only when the service type declares owned_entities. The owned label is an
 * upper bound, since owned_entities is a property of the service type, not a count for this instance.
 *
 * @example buildInstanceResourceActionScopes({ instanceId: "abc", total: 3, ownedEntities: ["l2Connect"] })
 *   => [{ id: "instance", ... }, { id: "owned", ... }]
 */
export function buildInstanceResourceActionScopes({
  instanceId,
  total,
  ownedEntities,
}: {
  instanceId: string;
  total: ParsedNumber | null | undefined;
  ownedEntities: string[];
}): NonEmptyArray<ResourceActionScope> {
  const instanceScope: ResourceActionScope = {
    id: "instance",
    title: words("resources.resourceActions.confirm.instance.title"),
    filter: { isOrphan: false, serviceInstance: [instanceId] },
    detail:
      total == null
        ? undefined
        : words("resources.resourceActions.confirm.instance.count")(Number(total)),
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
      filter: { isOrphan: false, serviceInstance: [instanceId], includeOwned: true },
      detail: words("resources.resourceActions.confirm.owned.description")(
        ownedEntities.join(", ")
      ),
    },
  ];
}
