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

export const resourceIdFromDetails = ({
  resource_type,
  agent,
  attribute,
  resource_id_value,
}: ResourceIdDetails): string =>
  `${resource_type}[${agent},${attribute}=${resource_id_value}]`;

export const resourceIdToDetails = (resourceId: string): ResourceIdDetails => {
  const splits1 = resourceId.split("[");
  const resource_type = splits1[0];
  const splits2 = splits1[1].replace("]", "").split(",");
  const agent = splits2[0];
  const splits3 = splits2[1].split("=");
  const attribute = splits3[0];
  const resource_id_value = splits3[1];

  return {
    resource_type,
    agent,
    attribute,
    resource_id_value,
  };
};
