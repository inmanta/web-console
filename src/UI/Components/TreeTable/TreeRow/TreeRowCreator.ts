import {
  CatalogAttributes,
  InventoryAttributes,
  MultiAttributeNode,
} from "@/UI/Components/TreeTable/Helpers/AttributeNode";
import { PathHelper } from "@/UI/Components/TreeTable/Helpers/PathHelper";
import { AttributeTree } from "@/UI/Components/TreeTable/types";
import { Cell, TreeRow } from "./TreeRow";

export class TreeRowCreator<T extends AttributeTree["target"]> {
  constructor(
    private readonly pathHelper: PathHelper,
    private readonly isExpandedByParent: (path: string) => boolean,
    private readonly isChildExpanded: (path: string) => boolean,
    private readonly createOnToggle: (path: string) => () => void,
    private readonly extractValues: (
      node: Extract<MultiAttributeNode<T>, { kind: "Leaf" }>
    ) => Cell[]
  ) {}

  create(path: string, node: MultiAttributeNode<T>): TreeRow {
    if (node.kind === "Leaf") {
      if (this.pathHelper.isNested(path)) {
        return {
          kind: "Leaf",
          id: path,
          isExpandedByParent: this.isExpandedByParent(path),
          level: this.pathHelper.getLevel(path),
          primaryCell: { label: "name", value: this.pathHelper.getSelf(path) },
          valueCells: this.extractValues(node),
        };
      } else {
        return {
          kind: "Flat",
          id: path,
          primaryCell: { label: "name", value: path },
          valueCells: this.extractValues(node),
        };
      }
    } else {
      if (this.pathHelper.isNested(path)) {
        return {
          kind: "Branch",
          id: path,
          isExpandedByParent: this.isExpandedByParent(path),
          isChildExpanded: this.isChildExpanded(path),
          onToggle: this.createOnToggle(path),
          level: this.pathHelper.getLevel(path),
          primaryCell: { label: "name", value: this.pathHelper.getSelf(path) },
        };
      } else {
        return {
          kind: "Root",
          id: path,
          isChildExpanded: this.isChildExpanded(path),
          onToggle: this.createOnToggle(path),
          primaryCell: { label: "name", value: path },
        };
      }
    }
  }
}

function format(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "undefined") return "";
  if (typeof value === "object") {
    if (value === null) return "null";
    if (Object.keys(value).length === 0) return "{}";
    if (Array.isArray(value)) return value.join(", ");
  }
  return "";
}

export function extractCatalogValues(
  node: Extract<MultiAttributeNode<CatalogAttributes>, { kind: "Leaf" }>
): Cell[] {
  return [
    {
      label: "type",
      value: format(node.value.type),
      hasOnClick: node.hasOnClick,
    },
    {
      label: "description",
      value: format(node.value.description),
    },
  ];
}

export function extractInventoryValues(
  node: Extract<MultiAttributeNode<InventoryAttributes>, { kind: "Leaf" }>
): Cell[] {
  return [
    {
      label: "candidate",
      value: format(node.value.candidate),
      hasOnClick: node.hasOnClick,
      serviceName: node.entity,
    },
    {
      label: "active",
      value: format(node.value.active),
      hasOnClick: node.hasOnClick,
      serviceName: node.entity,
    },
    {
      label: "rollback",
      value: format(node.value.rollback),
      hasOnClick: node.hasOnClick,
      serviceName: node.entity,
    },
  ];
}
