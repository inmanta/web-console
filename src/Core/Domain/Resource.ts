import { Metadata } from "./Pagination";

export interface Resource {
  resource_id: string;
  requires: string[];
  status: ResourceStatus;
  id_details: ResourceIdDetails;
}

export interface ResourceIdDetails {
  resource_type: string;
  agent: string;
  attribute: string;
  resource_id_value: string;
}

export enum ResourceStatus {
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

export interface RawResource {
  resource_id: string;
  requires: string[];
  status: string;
  id_details: ResourceIdDetails;
}

export interface ResourceRow {
  type: string;
  agent: string;
  value: string;
  numberOfDependencies: number;
  deployState: ResourceStatus;
  id: string;
}

export interface ResourceDetails {
  resource_id: string;
  resource_type: string;
  agent: string;
  id_attribute: string;
  id_attribute_value: string;
  status: ResourceStatus;
  last_deploy?: string;
  first_generated_time: string;
  first_generated_version: number;
  attributes: Record<string, unknown>;
  requires_status: Record<string, ResourceStatus>;
}

export interface RawResourceDetails {
  resource_id: string;
  resource_type: string;
  agent: string;
  id_attribute: string;
  id_attribute_value: string;
  status: string;
  last_deploy?: string;
  first_generated_time: string;
  first_generated_version: number;
  attributes: Record<string, unknown>;
  requires_status: Record<string, string>;
}

export interface ResourceDeploySummary {
  total: number;
  by_state: Record<string, number>;
}

export interface ResourceMetadata extends Metadata {
  deploy_summary: ResourceDeploySummary;
}

export const TRANSIENT_STATES = ["available", "deploying", "processing_events"];
