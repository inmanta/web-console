import { describe, it, expect } from "vitest";
import { words } from "@/UI/words";
import { buildInstanceResourceActionScopes } from "./resourceActionScopes";

describe("buildInstanceResourceActionScopes", () => {
  it("offers only the instance scope when the service type owns nothing", () => {
    const scopes = buildInstanceResourceActionScopes({
      instanceId: "abc",
      total: 3,
      ownedEntities: [],
    });

    expect(scopes).toEqual([
      {
        id: "instance",
        title: words("resources.resourceActions.confirm.instance.title"),
        filter: { isOrphan: false, serviceInstance: ["abc"] },
        detail: words("resources.resourceActions.confirm.instance.count")(3),
        count: 3,
      },
    ]);
  });

  it("adds the owned scope with includeOwned when the service type declares owned_entities", () => {
    const scopes = buildInstanceResourceActionScopes({
      instanceId: "abc",
      total: 3,
      ownedEntities: ["l2Connect", "vlan"],
    });

    expect(scopes).toHaveLength(2);
    expect(scopes[1]).toEqual({
      id: "owned",
      title: words("resources.resourceActions.confirm.owned.title"),
      filter: { isOrphan: false, serviceInstance: ["abc"], includeOwned: true },
      detail: words("resources.resourceActions.confirm.owned.description")("l2Connect, vlan"),
    });
  });

  it("leaves the instance count off when the deployment progress is unknown", () => {
    const scopes = buildInstanceResourceActionScopes({
      instanceId: "abc",
      total: null,
      ownedEntities: [],
    });

    expect(scopes[0].detail).toBeUndefined();
    expect(scopes[0].count).toBeUndefined();
  });
});
