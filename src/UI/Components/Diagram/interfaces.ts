import { ParsedNumber } from "@/Core";

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
  lowerLimit: ParsedNumber | null;
  upperLimit: ParsedNumber | null;
}
interface ConnectionRules {
  [serviceName: string]: Rule[];
}

interface InstanceForApi {
  instance_id: string;
  service_entity: string;
  config: unknown;
  action: null | "update" | "create" | "delete";
  attributes?: { [key: string]: unknown } | null;
  edits?: { [key: string]: unknown }[] | null;
  embeddedTo?: string | null;
  relatedTo?: Map<string, string> | null;
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
  holderType?: string;
  embeddedTo?: string;
}
type relationId = string | null | undefined;

export {
  ActionEnum,
  ColumnData,
  RouterOptions,
  DictDialogData,
  Rule,
  ConnectionRules,
  serializedCell,
  InstanceForApi,
  relationId,
};
