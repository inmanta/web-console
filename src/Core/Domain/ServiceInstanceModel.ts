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

export interface ServiceInstanceIdentifier extends WithId {
  service_entity: string;
  environment: string;
}

export interface VersionedServiceInstanceIdentifier
  extends ServiceInstanceIdentifier {
  version: number;
}

export interface ServiceInstanceModel
  extends VersionedServiceInstanceIdentifier {
  active_attributes: InstanceAttributeModel | null;
  callback: string[];
  candidate_attributes: InstanceAttributeModel | null;
  deleted: boolean;
  last_updated: string;
  created_at: string;
  rollback_attributes: InstanceAttributeModel | null;
  state: string;
  deployment_progress?: DeploymentProgress;
}

export interface ServiceInstanceModelWithTargetStates
  extends ServiceInstanceModel {
  instanceSetStateTargets: string[];
}
