import { dia } from "@inmanta/rappid";
import { PageSize, Pagination, Sort } from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";

export interface Query {
  kind: "GetOrders";
  sort?: Sort.Sort<SortKey>;
  pageSize: PageSize.PageSize;
  currentPage: CurrentPage;
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: ServiceOrder[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: ServiceOrder[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: ServiceOrder[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: Query;
}

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

//There is some nuances between composer and ServiceOrderItem which causing that we cannot just extend the above interface, I will attempt to make it as close as possible with incoming redesign
export interface ComposerServiceOrderItem {
  config: ServiceOrderItemConfig | null;
  attributes?: Record<string, unknown> | null;
  edits?: [Record<string, unknown>] | null;
  instance_id: string | dia.Cell.ID;
  service_entity: string;
  action: null | ServiceOrderItemAction;
  embeddedTo?: string | null;
  relatedTo?: Map<string, string> | null;
  metadata?: Record<string, string> | null;
}

export interface ServiceOrderItemStatus {
  state: ServiceOrderItemState;
  failure_type: FailureType | null;
  reason: string | null;
  direct_dependencies: ServiceOrderItemDependencies;
  validation_compile_id: string | null;
  instance_state_label: string | null;
}

export interface ServiceOrderStatus {
  state: ServiceOrderState;
}

export interface ServiceOrderItemDependencies {
  [x: string]: ServiceOrderItemState;
}

export interface ServiceOrderItemConfig {
  [x: string]: boolean;
}

export type ServiceOrderState =
  | "success"
  | "failed"
  | "in_progress"
  | "partial";
export type ServiceOrderItemState =
  | "completed"
  | "failed"
  | "in_progress"
  | "acknowledged";
export type FailureType =
  | "INVALID_ORDER_ITEM"
  | "VALIDATION_COMPILE_FAILED"
  | "EXECUTION_FAILED"
  | "EXECUTION_SKIPPED";
export type ServiceOrderItemAction = "delete" | "create" | "update";

export type SortKey = "created_at";
