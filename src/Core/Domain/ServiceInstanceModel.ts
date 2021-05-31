import { WithId } from "@/Core/Language";

export type InstanceAttributeModel = Record<string, unknown>;

export interface DeploymentProgress {
  total: number;
  failed: number;
  deployed: number;
  waiting: number;
}

export interface ServiceInstanceIdentifier extends WithId {
  service_entity: string;
}

export interface VersionedServiceInstanceIdentifier
  extends ServiceInstanceIdentifier {
  version: number;
}

export interface ServiceInstanceModel
  extends VersionedServiceInstanceIdentifier {
  environment: string;
  active_attributes: InstanceAttributeModel | null;
  callback: string[];
  candidate_attributes: InstanceAttributeModel | null;
  deleted: boolean;
  last_updated: string;
  created_at: string;
  rollback_attributes: InstanceAttributeModel | null;
  state: string;
  deployment_progress?: DeploymentProgress;
  service_identity_attribute_value?: string;
}

export interface ServiceInstanceModelWithTargetStates
  extends ServiceInstanceModel {
  instanceSetStateTargets: string[];
}

export interface FormAttributeResult {
  name: string;
  value: unknown;
  type: string;
}
