import { Sort } from "./Params";

export interface LatestReleasedResource {
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

export interface RawLatestReleasedResource {
  resource_id: string;
  requires: string[];
  status: string;
  id_details: ResourceIdDetails;
}

export interface LatestReleasedResourceRow {
  type: string;
  agent: string;
  value: string;
  numberOfDependencies: number;
  deployState: ResourceStatus;
  id: string;
}

export interface LatestReleasedResourceParams {
  sort?: Sort;
  pageSize: number;
}
