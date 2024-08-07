import { dia, g } from "@inmanta/rappid";
import { ParsedNumber } from "@/Core";
import {
  ServiceOrderItemAction,
  ServiceOrderItemConfig,
} from "@/Slices/Orders/Core/Query";

enum ActionEnum {
  UPDATE = "update",
  CREATE = "create",
  DELETE = "delete",
}

interface ColumnData {
  name: string;
  [key: string]: string;
}

interface RouterOptions {
  padding?: number;
  sourcePadding?: number;
  targetPadding?: number;
}

interface DictDialogData {
  title: string;
  value: unknown;
}

interface Rule {
  name: string;
  lowerLimit: ParsedNumber | null | undefined;
  upperLimit: ParsedNumber | null | undefined;
  modifier: string;
}

interface EmbeddedRule extends Rule {
  kind: TypeEnum.EMBEDDED;
}

interface InterServiceRule extends Rule {
  kind: TypeEnum.INTERSERVICE;
  attributeName: string;
}
export enum TypeEnum {
  EMBEDDED = "Embedded",
  INTERSERVICE = "Inter-Service",
}

interface ConnectionRules {
  [serviceName: string]: (InterServiceRule | EmbeddedRule)[];
}

interface serializedCell {
  type: string;
  source?: {
    id: string;
  };
  target?: {
    id: string;
  };
  z: number;
  id: string;
  attrs: {
    headerLabel?: {
      text: string;
    };
    info?: {
      preserveAspectRatio: string;
      cursor: string;
      x: string;
      "xlink:href": string;
      "data-tooltip": string;
      y: number;
      width: number;
      height: number;
    };
    header?: {
      fill: string;
      stroke: string;
    };
  };
  columns?: unknown;
  padding?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  size?: {
    width: number;
    height: number;
  };
  itemMinLabelWidth?: number;
  itemHeight?: number;
  itemOffset?: number;
  itemOverflow?: boolean;
  isCollapsed?: boolean;
  itemAboveViewSelector?: string;
  itemBelowViewSelector?: string;
  scrollTop: unknown;
  itemButtonSize?: number;
  itemIcon?: {
    width: number;
    height: number;
    padding: number;
  };
  position?: {
    x: number;
    y: number;
  };
  angle?: number;
  entityName?: string;
  relatedTo?: Map<string, string>;
  isEmbedded?: boolean;
  instanceAttributes?: Record<string, unknown>;
  holderName?: string;
  embeddedTo?: string;
}

type relationId = string | null | undefined;

//dia.LinkView & dia.Link doesn't have properties below in the model yet they are available to access and required to update labels
interface LabelLinkView extends dia.LinkView {
  sourceView: dia.CellView;
  targetView: dia.CellView;
  sourcePoint: g.Rect;
  targetPoint: g.Rect;
}

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
  relatedTo?: Map<string, string> | null;
  metadata?: Record<string, string> | null;
}

export {
  ActionEnum,
  ColumnData,
  RouterOptions,
  DictDialogData,
  InterServiceRule,
  EmbeddedRule,
  ConnectionRules,
  serializedCell,
  relationId,
  LabelLinkView,
  SavedCoordinates,
  ComposerServiceOrderItem,
};
