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
export interface VersionedServiceInstanceIdentifier extends ServiceInstanceIdentifier {
  version: ParsedNumber;
}

/**
 * Interface representing the model of a service instance.
 * Extends the VersionedServiceInstanceIdentifier interface.
 */
export interface ServiceInstanceModel extends VersionedServiceInstanceIdentifier {
  config?: { [key: string]: boolean } | null;
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
  referenced_by: string[] | null;
  service_entity_version?: ParsedNumber;
  desired_state_version?: ParsedNumber;
  transfer_context?: string;
  metadata?: Record<string, string>;
}

/**
 * Interface representing the model of a service instance with target states.
 * Extends the ServiceInstanceModel interface.
 */
export interface ServiceInstanceModelWithTargetStates extends ServiceInstanceModel {
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
 * Interface representing a single, normalized suggestion.
 *
 * This is the shape the form actually consumes: the `label` is shown to the user
 * and searched on, while the `value` is what gets submitted to the API. Both are
 * always strings — `normalizeSuggestions` coerces every raw entry (see
 * {@link RawFormSuggestion}) into this shape. A plain string suggestion
 * normalizes to a pair where `label === value`.
 */
export interface SuggestionValue {
  label: string;
  value: string;
}

/**
 * A suggestion entry exactly as it arrives in `web_suggested_values` (or a
 * parameter's metadata), before normalization.
 *
 * It can be a bare scalar or an explicit `{ label, value }` pair, and either
 * form may be a string or a number (numeric attributes). Every variant is
 * coerced to a string-only {@link SuggestionValue} by `normalizeSuggestions`
 * before the form uses it.
 */
export type RawFormSuggestion =
  | string
  | number
  | { label: string | number; value: string | number };

/**
 * Interface representing the suggestions that are stored in the web_suggested_values.
 *
 * `values` holds the raw entries (see {@link RawFormSuggestion}): each is a plain
 * scalar (label and value are identical) or a `{ label, value }` pair where the
 * displayed/searched label differs from the submitted value.
 */
export interface FormSuggestion {
  type: FormSuggestionType;
  values?: RawFormSuggestion[];
  parameter_name?: string;
}

/**
 * Type representing a form suggestion type.
 * Can be either "literal" or "parameters".
 */
type FormSuggestionType = "literal" | "parameters";
