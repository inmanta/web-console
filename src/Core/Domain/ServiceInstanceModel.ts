import { WithId } from "@/Core/Language";

export interface InstanceAttributeModel {
  [Key: string]: string | string[] | boolean | number | null;
}

export interface DeploymentProgress {
  total: number;
  failed: number;
  deployed: number;
  waiting: number;
}

export interface ServiceInstanceModel extends WithId {
  active_attributes: InstanceAttributeModel | null;
  callback: string[];
  candidate_attributes: InstanceAttributeModel | null;
  deleted: boolean;
  environment: string;
  last_updated: string;
  created_at: string;
  rollback_attributes: InstanceAttributeModel | null;
  service_entity: string;
  state: string;
  version: number;
  deployment_progress?: DeploymentProgress;
}

export interface ServiceInstanceModelWithTargetStates
  extends ServiceInstanceModel {
  instanceSetStateTargets: string[];
}
