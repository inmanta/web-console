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

interface BaseDetails {
  resource_id: string;
  resource_type: string;
  agent: string;
  id_attribute: string;
  id_attribute_value: string;
  attributes: Record<string, unknown>;
}

interface ReleasedDetails extends BaseDetails {
  last_deploy?: string;
  first_generated_time: string;
  first_generated_version: ParsedNumber;
}

export interface Details extends ReleasedDetails {
  status: Status;
  requires_status: Record<string, Status>;
}

export interface RawDetails extends ReleasedDetails {
  status: string;
  requires_status: Record<string, string>;
}

export interface VersionedDetails extends BaseDetails {
  version: ParsedNumber;
  resource_version_id: string;
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
  status?: string[];
}

export interface FilterWithDefaultHandling extends Filter {
  disregardDefault?: boolean;
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
