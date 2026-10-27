import { InstanceAttributeModel } from "./ServiceInstanceModel";

export type ServiceOrderItemAction = "delete" | "create" | "update";

/**
 * An item of a service order that is sent to the orchestrator with `POST /lsm/v2/order`.
 */
export interface ServiceOrderItemRequest {
  instance_id: string;
  service_entity: string;
  config: Record<string, boolean> | null;

  /**
   * What to do with the instance. Null when there is nothing to do, e.g. for an instance the
   * composer only shows. Such items are not part of the order that is sent.
   */
  action: ServiceOrderItemAction | null;
  attributes?: InstanceAttributeModel | null;
  edits?: [Record<string, unknown>] | null;
  metadata?: Record<string, string> | null;
}
