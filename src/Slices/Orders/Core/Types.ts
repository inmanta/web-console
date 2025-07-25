export interface ServiceOrder {
  description?: string;
  id: string;
  environment: string;
  service_order_items: ServiceOrderItem[];
  created_at: string;
  completed_at: string;
  status: ServiceOrderStatus;
}

export interface ServiceOrderItem {
  status: ServiceOrderItemStatus;
  action: ServiceOrderItemAction;
  instance_id: string;
  service_entity: string;
  config: ServiceOrderItemConfig | null;
  attributes?: Record<string, unknown>;
  edits?: Record<string, unknown>;
}

export interface ServiceOrderItemStatus {
  state: ServiceOrderItemState;
  failure_type: FailureType | null;
  reason: string | null;
  direct_dependencies: ServiceOrderItemDependencies;
  validation_compile_id: string | null;
  instance_state_label: string | null;
}

interface ServiceOrderStatus {
  state: ServiceOrderState;
}

export interface ServiceOrderItemDependencies {
  [x: string]: ServiceOrderItemState;
}

export interface ServiceOrderItemConfig {
  [x: string]: boolean;
}

export type ServiceOrderState = "success" | "failed" | "in_progress" | "partial";
export type ServiceOrderItemState = "completed" | "failed" | "in_progress" | "acknowledged";

type FailureType =
  | "INVALID_ORDER_ITEM"
  | "VALIDATION_COMPILE_FAILED"
  | "EXECUTION_FAILED"
  | "EXECUTION_SKIPPED";
export type ServiceOrderItemAction = "delete" | "create" | "update";

export type SortKey = "created_at";
