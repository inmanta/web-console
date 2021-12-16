import { ResourceIdDetails } from "./Resource";

export interface VersionResource {
  resource_id: string;
  resource_version_id: "string";
  id_details: ResourceIdDetails;
  requires: string[];
}

export interface VersionResourceFilter {
  agent?: string;
  resource_type?: string;
  resource_id_value?: string;
}

export type VersionResourcesSortName =
  | "resource_type"
  | "agent"
  | "resource_id_value";
