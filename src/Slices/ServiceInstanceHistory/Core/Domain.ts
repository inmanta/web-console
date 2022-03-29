import { InstanceEvent } from "@/Core/Domain/EventModel";
import { InstanceAttributeModel } from "@/Core/Domain/ServiceInstanceModel";
import { ParsedNumber } from "@/Core/Language";

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
