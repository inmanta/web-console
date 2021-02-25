import { ResourceModel } from "@/Core";

export const A: ResourceModel[] = [
  {
    resource_id: "resource_id_a_1",
    resource_state: "resource_state_a_1",
  },
  {
    resource_id: "resource_id_a_2",
    resource_state: "resource_state_a_2",
  },
];

export const B: ResourceModel[] = [
  {
    resource_id: "resource_id_b_1",
    resource_state: "resource_state_b_1",
  },
  {
    resource_id: "resource_id_b_2",
    resource_state: "resource_state_b_2",
  },
];

export const response = { data: A };
