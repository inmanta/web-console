import { InstanceResourceModel, Resource } from "@/Core";

export const a: InstanceResourceModel = {
  resource_id: "[resource_id_a],v=1",
  resource_state: Resource.Status.deployed,
};

export const b: InstanceResourceModel = {
  resource_id: "[resource_id_b],v=2",
  resource_state: Resource.Status.failed,
};

export const c: InstanceResourceModel = {
  resource_id: "[resource_id_c],v=2",
  resource_state: Resource.Status.skipped,
};

export const d: InstanceResourceModel = {
  resource_id: "[resource_id_d],v=3",
  resource_state: Resource.Status.deploying,
};

export const listA: InstanceResourceModel[] = [a, b];

export const listB: InstanceResourceModel[] = [c, d];
