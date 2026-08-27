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
 * A single normalized suggestion: `label` is shown/searched, `value` is submitted. Both are
 * always strings (a plain-string suggestion normalizes to `label === value`).
 *
 * @example
 * { label: "10 Gbps", value: "10000" }
 */
export interface SuggestionValue {
  label: string;
  value: string;
}

/**
 * A suggestion entry as it arrives in `web_suggested_values` (or parameter metadata), before
 * normalization: a bare scalar or a `{ label, value }` pair, either as string or number.
 *
 * @example
 * "dot1q" // or { label: "10 Gbps", value: 10000 }
 */
export type RawFormSuggestion =
  string | number | { label: string | number; value: string | number };

/**
 * The `web_suggested_values` annotation. The active field depends on `type`: `values` for
 * `literal`, `parameter_name` for `parameters`, `query` for `graphql`.
 *
 * @example
 * { type: "parameters", parameter_name: "showcase_regions" }
 */
export interface FormSuggestion {
  type: FormSuggestionType;
  values?: RawFormSuggestion[];
  parameter_name?: string;
  query?: GraphQLSuggestionQuery;
}

/**
 * Which suggestion flavor a field uses.
 *
 * @example
 * "graphql" // one of "literal" | "parameters" | "graphql"
 */
type FormSuggestionType = "literal" | "parameters" | "graphql";

/**
 * A value usable in a `graphql` suggestion filter: a scalar or `${...}` reference, a list, or
 * a nested input object (so a filter can mirror any GraphQL filter input the author writes).
 *
 * @example
 * { contains: ["%vm%"] } // or "${form.site}", 10, true, null
 */
export type GraphQLFilterValue =
  string | number | boolean | null | GraphQLFilterValue[] | { [key: string]: GraphQLFilterValue };

/**
 * The live GraphQL query behind a `graphql` suggestion: `root` is the connection, `filter`
 * narrows it (camelCase GraphQL fields), `label`/`value` are jsonpath projections into each
 * node (value-only yields values, label + value yields labels mapped to values).
 *
 * @example
 * { root: "environments", label: "$.name", value: "$.id" }
 */
export interface GraphQLSuggestionQuery {
  root: string;
  filter?: Record<string, GraphQLFilterValue>;
  label?: string;
  value: string;
}
