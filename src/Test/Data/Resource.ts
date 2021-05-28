import { ResourceModel } from "@/Core";

export const a: ResourceModel = {
  resource_id: "resource_id_a",
  resource_state: "deployed",
};

export const b: ResourceModel = {
  resource_id: "resource_id_b",
  resource_state: "failed",
};

export const c: ResourceModel = {
  resource_id: "resource_id_c",
  resource_state: "skipped",
};

export const d: ResourceModel = {
  resource_id: "resource_id_d",
  resource_state: "deploying",
};

export const listA: ResourceModel[] = [a, b];

export const listB: ResourceModel[] = [c, d];
