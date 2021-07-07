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
