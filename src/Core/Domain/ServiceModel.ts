import { ParsedNumber } from "@/Core/Language";
import { AttributeValidation } from "./AttributeValidation";
import { Config } from "./Config";
import { FormSuggestion } from "./ServiceInstanceModel";

/**
 * Represents an attribute in the service model.
 */
export type AttributeModel = AttributeValidation & {
  name: string;
  type: string;
  description?: string;
  modifier: string;
  default_value:
    | string
    | null
    | boolean
    | string[]
    | { [x: string]: string | null | boolean | string[] };
  default_value_set: boolean;
  attribute_annotations?: AttributeAnnotations;
};

/**
 * Annotations for an attribute.
 */
export interface AttributeAnnotations {
  web_suggested_values?: FormSuggestion;
}

/**
 * Represents the state of a service model.
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
}

/**
 * Represents a transfer in the service model.
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
}

/**
 * Represents the lifecycle of a service model.
 */
export interface LifecycleModel {
  initial_state: string;
  name?: string;
  states: StateModel[];
  transfers: TransferModel[];
}

/**
 * Represents a service identifier.
 */
export interface ServiceIdentifier {
  name: string;
}

/**
 * Represents the number of instances by label.
 */
export interface InstancesByLabel {
  danger: ParsedNumber;
  warning: ParsedNumber;
  success: ParsedNumber;
  info: ParsedNumber;
  no_label: ParsedNumber;
}

/**
 * Represents a summary of instances.
 */
export interface InstanceSummary {
  by_state: Record<string, ParsedNumber>;
  by_label: InstancesByLabel;
  total: ParsedNumber;
}

/**
 * Represents a service model.
 */
export interface ServiceModel extends ServiceIdentifier {
  environment: string;
  description?: string;
  lifecycle: LifecycleModel;
  attributes: AttributeModel[];
  service_identity?: string;
  service_identity_display_name?: string;
  config: Config;
  instance_summary?: InstanceSummary | null;
  embedded_entities: EmbeddedEntity[];
  inter_service_relations?: InterServiceRelation[];
  strict_modifier_enforcement?: boolean;
  key_attributes?: string[] | null;
}

/**
 * Represents an attribute in a relation.
 */
export interface RelationAttribute {
  lower_limit: ParsedNumber;
  upper_limit?: ParsedNumber;
  modifier: string;
}

/**
 * Represents an inter-service relation.
 */
export interface InterServiceRelation extends RelationAttribute {
  name: string;
  description?: string;
  entity_type: string;
}

/**
 * Represents an embedded entity.
 */
export interface EmbeddedEntity extends RelationAttribute {
  name: string;
  description?: string;
  attributes: AttributeModel[];
  embedded_entities: EmbeddedEntity[];
  inter_service_relations?: InterServiceRelation[];
  key_attributes?: string[] | null;
}

/**
 * Represents a minimal embedded entity.
 */
interface MinimalEmbeddedEntity {
  name: string;
  description?: string;
  attributes: Pick<AttributeModel, "name" | "type" | "description">[];
  inter_service_relations?: Pick<
    InterServiceRelation,
    "name" | "entity_type" | "description"
  >[];
  embedded_entities: MinimalEmbeddedEntity[];
}

/**
 * Represents an entity-like object.
 */
export type EntityLike = {
  attributes: (Pick<AttributeModel, "name" | "type" | "description"> & {
    modifier?: AttributeModel["modifier"];
  })[];
  embedded_entities: MinimalEmbeddedEntity[];
  inter_service_relations?: Pick<
    InterServiceRelation,
    "name" | "entity_type" | "description"
  >[];
};
