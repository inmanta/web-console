import { InstanceLog } from "@/Core";
import * as ServiceInstance from "./ServiceInstance";

const base: InstanceLog = {
  ...ServiceInstance.A,
  version: 1,
  service_instance_id: ServiceInstance.A.id,
  events: [],
  timestamp: "2021-01-11T12:55:25.961567",
};

export const A = base;
export const B = { ...base, version: 2 };
export const C = { ...base, version: 3 };
export const list = [A, B, C];
