import { InstanceLog } from "@/Core";
import * as ServiceInstance from "./ServiceInstance";

const base: InstanceLog = {
  ...ServiceInstance.A,
  service_instance_id: ServiceInstance.A.id,
  events: [],
  timestamp: "2021-01-11T12:55:25.961567",
};

export const A = base;
