import { ParsedNumber } from "@/Core/Language";
import { InstanceEvent } from "./EventModel";
import { InstanceAttributeModel } from "./ServiceInstanceModel";

export interface InstanceLog {
  service_instance_id: string;
  environment: string;
  service_entity: string;
  version: ParsedNumber;
  timestamp: string;
  state: string;
  candidate_attributes: InstanceAttributeModel | null;
  active_attributes: InstanceAttributeModel | null;
  rollback_attributes: InstanceAttributeModel | null;
  created_at: string;
  last_updated: string;
  deleted: boolean;
  events: InstanceEvent[];
}
