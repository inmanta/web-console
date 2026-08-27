import { ParsedNumber } from "@/Core/Language";
import { AttributeValidation } from "./AttributeValidation";
import { Config } from "./Config";
import { FormSuggestion } from "./ServiceInstanceModel";

/**
 * Type that represents an attribute in the service model.
 * Extends the AttributeValidation interface.
 */
export type AttributeModel = AttributeValidation & {
  name: string;
  type: string;
  description?: string | null;
  modifier: string;
  default_value:
    string | null | boolean | string[] | { [x: string]: string | null | boolean | string[] };
  default_value_set: boolean;
  attribute_annotations?: AttributeAnnotations;
};

/**
 * Interface that represents annotations for an attribute.
 */
export interface AttributeAnnotations {
  web_suggested_values?: FormSuggestion;
  web_presentation?: string;
  web_icon?: string;
  web_title?: string;
  web_content_type?: string;
  web_order?: number;
  web_default_open?: boolean;
  web_tab?: string;

  /** Canonical unit code of the raw API value. Required (with `web_presentation: "unit"`) to opt an int/float attribute into the UnitInputField (issue #7022). */
  web_unit?: string;

  /** "metric" | "iec" | "both" — which unit families the UnitInputField offers. See issue #7022 for the defaulting rules. */
  web_unit_scales?: string;

  /** Preferred unit pre-selected in an empty create form. See issue #7022. */
  web_unit_display?: string;
}

/**
 * A single tab in the `web_tabs` catalog on a service entity's annotations.
 * `key` is what a `web_tab` attribute/relation annotation refers to, `label` is the
 * visible tab title. Ordering is explicit through `order` (ties or missing values
 * fall back to `key`) so it never depends on list position. Exactly one tab must be
 * marked as `default`; it catches fields without a `web_tab` assignment.
 */
export interface FormTabDefinition {
  key: string;
  label: string;
  order?: number;
  default?: boolean;
  icon?: string;
}

/**
 * Interface that represents the annotations on a service entity (`__annotations`).
 * The values originate from the model author, so `web_tabs` is validated at runtime
 * (see resolveFormTabs) before being used.
 */
export interface EntityAnnotations {
  web_tabs?: FormTabDefinition[];
  [key: string]: unknown;
}

/**
 * Interface that represents the annotations on an inter-service relation
 * (lsm::RelationAnnotations).
 */
export interface RelationAnnotations {
  web_tab?: string;
  [key: string]: unknown;
}

/**
 * Interface that represents the state of a service model.
 */
export interface StateModel {
  deleted: boolean;
  label?: "info" | "success" | "warning" | "danger" | null;
  validate_self?: "candidate" | "active" | null;
  validate_others?: "candidate" | "active" | null;
  export_resources: boolean;
  name: string;
  purge_resources: boolean;
  values?: Record<string, unknown>;
  annotations?: StateAnnotations;
}

/**
 * Interface that represents annotations for a state.
 */
export interface StateAnnotations {
  /** Display label used as the fallback for a transfer button leading to this
   * state when the transfer itself has no `web_button_label` (issue #7093). */
  web_label?: string;
}

/**
 * Interface that represents a transfer in the service model.
 */
export interface TransferModel {
  api_set_state: boolean;
  auto: boolean;
  config_name: string | null;
  description: string;
  error: string | null;
  error_operation: string | null;
  on_delete: boolean;
  on_update: boolean;
  resource_based: boolean;
  source: string;
  target: string;
  target_operation: string | null;
  validate: boolean;
  annotations?: TransferAnnotations;
}

/**
 * Interface that represents annotations for a transfer.
 */
export interface TransferAnnotations {
  /** Custom confirmation prompt shown before the transfer is invoked (set-state /
   * delete). Falls back to the default confirmation text when absent. */
  web_confirm?: string;

  /** Overrides the Actions-dropdown button label for an api_set_state transfer.
   * Fallback chain: web_button_label -> target state's web_label -> target state name. */
  web_button_label?: string;

  /** Font Awesome icon name for the Actions-dropdown button (issue #7093). No fallback. */
  web_icon?: string;

  /** Button emphasis for the Actions-dropdown item. No PatternFly DropdownItem equivalent
   * exists, so this is approximated with text/icon color (issue #7093). */
  web_button_type?: "primary" | "secondary" | "tertiary" | "link";

  /** Status styling for the Actions-dropdown item: danger maps to the existing
   * DropdownItem `isDanger` styling, warning tints the icon only (issue #7093). */
  web_button_variant?: "danger" | "warning";
}

/**
 * Interface that represents the lifecycle of a service model.
 */
export interface LifecycleModel {
  initial_state: string;
  alternative_initial_states?: string[]; // Those are only meant for creation of new instances.
  name?: string;
  states: StateModel[];
  transfers: TransferModel[];
}

/**
 * Interface that represents a service identifier.
 */
interface ServiceIdentifier {
  name: string;
}

/**
 * Interface that represents the number of instances by label.
 */
export interface InstancesByLabel {
  danger: ParsedNumber;
  warning: ParsedNumber;
  success: ParsedNumber;
  info: ParsedNumber;
  no_label: ParsedNumber;
}

/**
 * Interface that represents a summary of instances.
 */
export interface InstanceSummary {
  by_state: Record<string, ParsedNumber>;
  by_label: InstancesByLabel;
  total: ParsedNumber;
}

/**
 * Interface that represents a service model.
 */
export interface ServiceModel extends ServiceIdentifier {
  environment: string;
  description?: string | null;
  lifecycle: LifecycleModel;
  attributes: AttributeModel[];
  service_identity?: string;
  service_identity_display_name?: string | null;
  entity_annotations?: EntityAnnotations;
  config: Config;
  instance_summary?: InstanceSummary | null;
  embedded_entities: EmbeddedEntity[];
  inter_service_relations: InterServiceRelation[];
  strict_modifier_enforcement?: boolean;
  key_attributes?: string[] | null;
  owner: null | string;
  owned_entities: string[];
  version?: ParsedNumber;
  relation_to_owner?: string | null;
}

/**
 * Interface that represents an attribute in a relation.
 */
export interface RelationAttribute {
  lower_limit: ParsedNumber;
  upper_limit?: ParsedNumber | null;
  modifier: string;
}

/**
 * Interface that represents an inter-service relation.
 */
export interface InterServiceRelation extends RelationAttribute {
  name: string;
  attribute_annotations?: RelationAnnotations;
  description?: string | null;
  entity_type: string;
}

/**
 * Interface that represents an embedded entity.
 */
export interface EmbeddedEntity extends RelationAttribute {
  name: string;
  type: string | null;
  description?: string | null;
  attributes: AttributeModel[];
  embedded_entities: EmbeddedEntity[];
  inter_service_relations: InterServiceRelation[];
  key_attributes?: string[] | null;
  attribute_annotations?: AttributeAnnotations;
  entity_annotations?: Record<string, unknown>;
}

/**
 * Interface that represents a minimal embedded entity.
 */
interface MinimalEmbeddedEntity {
  name: string;
  description?: string | null;
  attributes: Pick<AttributeModel, "name" | "type" | "description">[];
  inter_service_relations?: Pick<InterServiceRelation, "name" | "entity_type" | "description">[];
  embedded_entities: MinimalEmbeddedEntity[];
}

/**
 * Interface that represents an entity-like object.
 */
export type EntityLike = {
  attributes: (Pick<AttributeModel, "name" | "type" | "description"> & {
    modifier?: AttributeModel["modifier"];
  })[];
  embedded_entities: MinimalEmbeddedEntity[];
  inter_service_relations?: Pick<InterServiceRelation, "name" | "entity_type" | "description">[];
};
