import { Pagination } from "@/Core/Domain/Pagination";
import { ParsedNumber } from "@/Core/Language";
import { PageSize } from "../PageSize";
import { Sort } from "../Sort";

export interface Resource {
  resource_id: string;
  requires: string[];
  status: Status;
  id_details: IdDetails;
}

export interface FromVersion extends Omit<Resource, "status"> {
  resource_version_id: string;
}

export interface IdDetails {
  resource_type: string;
  agent: string;
  attribute: string;
  resource_id_value: string;
}

export enum Status {
  unavailable = "unavailable",
  skipped = "skipped",
  dry = "dry",
  deployed = "deployed",
  failed = "failed",
  deploying = "deploying",
  available = "available",
  cancelled = "cancelled",
  undefined = "undefined",
  skipped_for_undefined = "skipped_for_undefined",
  orphaned = "orphaned",
  processing_events = "processing_events",
}

export interface Raw {
  resource_id: string;
  requires: string[];
  status: string;
  id_details: IdDetails;
}

export interface Row {
  type: string;
  agent: string;
  value: string;
  numberOfDependencies: ParsedNumber;
  deployState: Status;
  id: string;
}

export type RowFromVersion = Omit<Row, "deployState">;

export interface Details {
  resource_id: string;
  resource_type: string;
  agent: string;
  id_attribute: string;
  id_attribute_value: string;
  status: Status;
  last_deploy?: string;
  first_generated_time: string;
  first_generated_version: ParsedNumber;
  attributes: Record<string, unknown>;
  requires_status: Record<string, Status>;
}

export interface RawDetails {
  resource_id: string;
  resource_type: string;
  agent: string;
  id_attribute: string;
  id_attribute_value: string;
  status: string;
  last_deploy?: string;
  first_generated_time: string;
  first_generated_version: ParsedNumber;
  attributes: Record<string, unknown>;
  requires_status: Record<string, string>;
}

export interface DeploySummary {
  total: ParsedNumber;
  by_state: Record<string, ParsedNumber>;
}

export interface Metadata extends Pagination.Metadata {
  deploy_summary: DeploySummary;
}

export const TRANSIENT_STATES = ["available", "deploying", "processing_events"];

export interface ResourceParams {
  sort?: Sort<SortKey>;
  filter?: Filter;
  pageSize: PageSize;
}

export interface Filter {
  type?: string[];
  agent?: string[];
  value?: string[];
  status?: Status[];
}

export enum FilterKind {
  Type = "Type",
  Agent = "Agent",
  Value = "Value",
  Status = "Status",
}

export type SortKey =
  | "agent"
  | "status"
  | "resource_type"
  | "resource_id_value";

export type FilterFromVersion = Omit<Filter, "status">;
export type SortKeyFromVersion = Exclude<SortKey, "status">;

export interface ResponseFromVersion {
  data: FromVersion[];
  links: Pagination.Links;
  metadata: Pagination.Metadata;
}
