import { InstanceResourceModel } from "@/Core";

export const a: InstanceResourceModel = {
  resource_id: "resource_id_a",
  resource_state: "deployed",
};

export const b: InstanceResourceModel = {
  resource_id: "resource_id_b",
  resource_state: "failed",
};

export const c: InstanceResourceModel = {
  resource_id: "resource_id_c",
  resource_state: "skipped",
};

export const d: InstanceResourceModel = {
  resource_id: "resource_id_d",
  resource_state: "deploying",
};

export const listA: InstanceResourceModel[] = [a, b];

export const listB: InstanceResourceModel[] = [c, d];
