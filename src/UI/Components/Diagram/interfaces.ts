import { dia, g } from "@inmanta/rappid";
import {
  EmbeddedEntity,
  InstanceAttributeModel,
  ParsedNumber,
  ServiceModel,
} from "@/Core";
import {
  ServiceOrderItemAction,
  ServiceOrderItemConfig,
} from "@/Slices/Orders/Core/Query";

/**
 * Enum representing types of actions possible to perform on entities.
 */
enum ActionEnum {
  UPDATE = "update",
  CREATE = "create",
  DELETE = "delete",
}

/**
 * Interface representing data for a column for displayable attributes in the entity.
 */
interface ColumnData {
  name: string;
  [key: string]: unknown;
}

/**
 * Interface representing options for a router.
 */
interface RouterOptions {
  padding?: number;
  sourcePadding?: number;
  targetPadding?: number;
}

/**
 * Interface representing data for a dictionary dialog.
 */
interface DictDialogData {
  title: string;
  value: unknown;
}

/**
 * Interface representing a rule.
 */
interface Rule {
  name: string;
  lowerLimit: ParsedNumber | null | undefined;
  upperLimit: ParsedNumber | null | undefined;
  modifier: string;
}

/**
 * Interface representing an embedded rule, extending the base Rule interface.
 */
interface EmbeddedRule extends Rule {
  kind: TypeEnum.EMBEDDED;
}

/**
 * Interface representing an inter-service rule, extending the base Rule interface.
 */
interface InterServiceRule extends Rule {
  kind: TypeEnum.INTERSERVICE;
  attributeName: string;
}

/**
 * Enum representing the types of embedded events.
 */
enum EmbeddedEventEnum {
  REMOVE = "remove",
  ADD = "add",
}

/**
 * Enum representing the types of entities.
 */
enum TypeEnum {
  EMBEDDED = "Embedded",
  INTERSERVICE = "Inter-Service",
}

/**
 * Interface representing the rules for a connection.
 */
interface ConnectionRules {
  [serviceName: string]: (InterServiceRule | EmbeddedRule)[];
}

type relationId = string | null | undefined;

//dia.LinkView & dia.Link doesn't have properties below in the model yet they are available to access and required to update labels
interface LabelLinkView extends dia.LinkView {
  sourceView: dia.CellView;
  targetView: dia.CellView;
  sourcePoint: g.Rect;
  targetPoint: g.Rect;
}

/**
 * Interface representing saved coordinates.
 */
interface SavedCoordinates {
  id: string | dia.Cell.ID;
  name: string;
  attributes: { [key: string]: unknown };
  coordinates: { x: number; y: number };
}

//There is some nuances between composer and ServiceOrderItem which causing that we cannot just extend the above interface, I will attempt to make it as close as possible with incoming redesign
interface ComposerServiceOrderItem {
  config: ServiceOrderItemConfig | null;
  attributes?: Record<string, unknown> | null;
  edits?: [Record<string, unknown>] | null;
  instance_id: string | dia.Cell.ID;
  service_entity: string;
  action: null | ServiceOrderItemAction;
  embeddedTo?: string | null;
  relatedTo?: Map<dia.Cell.ID, string> | null;
  metadata?: Record<string, string> | null;
}

/**
 * Interface representing the state of a stencil.
 */
interface StencilState {
  [key: string]: {
    min: ParsedNumber | undefined | null;
    max: ParsedNumber | undefined | null;
    current: number;
  };
}

interface ComposerEntityOptions {
  serviceModel: ServiceModel | EmbeddedEntity;
  isCore: boolean;
  isInEditMode: boolean;
  attributes?: InstanceAttributeModel;
  isEmbedded?: boolean;
  holderName?: string;
  embeddedTo?: "string" | dia.Cell.ID;
  isBlockedFromEditing?: boolean;
  cantBeRemoved?: boolean;
  stencilName?: string;
  id?: string;
}

export {
  ActionEnum,
  ColumnData,
  RouterOptions,
  DictDialogData,
  InterServiceRule,
  EmbeddedRule,
  ConnectionRules,
  relationId,
  LabelLinkView,
  SavedCoordinates,
  ComposerServiceOrderItem,
  StencilState,
  TypeEnum,
  EmbeddedEventEnum,
  ComposerEntityOptions,
};
