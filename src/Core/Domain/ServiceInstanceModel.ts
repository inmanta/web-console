import { ParsedNumber } from "@/Core/Language";

/**
 * Type representing an instance attribute model.
 */
export type InstanceAttributeModel = Record<string, unknown>;

/**
 * Interface representing a patch field. This is meant to be used with V2 of the PATCH API.
 */
export interface PatchField {
  edit_id: string;
  operation: string;
  target: string;
  value: InstanceAttributeModel | null;
}

/**
 * Interface representing the progress of a deployment.
 */
export interface DeploymentProgress {
  total: ParsedNumber;
  failed: ParsedNumber;
  deployed: ParsedNumber;
  waiting: ParsedNumber;
}

/**
 * Interface representing the identifier of a service instance.
 */
export interface ServiceInstanceIdentifier {
  id: string;
  service_entity: string;
}

/**
 * Interface representing the identifier of a versioned service instance.
 * Extends the ServiceInstanceIdentifier interface.
 */
export interface VersionedServiceInstanceIdentifier
  extends ServiceInstanceIdentifier {
  version: ParsedNumber;
}

/**
 * Interface representing the model of a service instance.
 * Extends the VersionedServiceInstanceIdentifier interface.
 */
export interface ServiceInstanceModel
  extends VersionedServiceInstanceIdentifier {
  config?: { [key: string]: string } | null;
  environment: string;
  active_attributes: InstanceAttributeModel | null;
  callback: string[];
  candidate_attributes: InstanceAttributeModel | null;
  deleted: boolean;
  last_updated: string;
  created_at: string;
  rollback_attributes: InstanceAttributeModel | null;
  state: string;
  deployment_progress?: DeploymentProgress | null;
  service_identity_attribute_value?: string;
  referenced_by: string[];
}

/**
 * Interface representing the model of a service instance with target states.
 * Extends the ServiceInstanceModel interface.
 */
export interface ServiceInstanceModelWithTargetStates
  extends ServiceInstanceModel {
  instanceSetStateTargets: string[];
}

/**
 * Interface representing the result of a form attribute.
 */
export interface FormAttributeResult {
  name: string;
  value: unknown;
  type: string;
}

/**
 * Interface representing the body of a set state request.
 */
export interface SetStateBody {
  current_version: ParsedNumber;
  target_state: string;
  message: string;
}

/**
 * Interface representing a suggestions that are stored in the web_suggested_values.
 */
export interface FormSuggestion {
  type: FormSuggestionType;
  values?: string[];
  parameter_name?: string;
}

/**
 * Type representing a form suggestion type.
 * Can be either "literal" or "parameters".
 */
export type FormSuggestionType = "literal" | "parameters";
