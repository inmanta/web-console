import { MultiAttributeNode } from "../AttributeHelper";
import { PathHelper } from "../PathHelper";
import { TreeRow } from "./TreeRow";

export class TreeRowCreator {
  constructor(
    private readonly pathHelper: PathHelper,
    private readonly isExpandedByParent: (path: string) => boolean,
    private readonly isChildExpanded: (path: string) => boolean,
    private readonly createOnToggle: (path: string) => () => void
  ) {}

  format(value: unknown): string {
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

  create(path: string, node: MultiAttributeNode): TreeRow {
    if (node.kind === "Leaf") {
      if (this.pathHelper.isNested(path)) {
        return {
          kind: "Leaf",
          id: path,
          isExpandedByParent: this.isExpandedByParent(path),
          cell: { label: "name", value: this.pathHelper.getSelf(path) },
          cells: [
            { label: "candidate", value: this.format(node.value.candidate) },
            { label: "active", value: this.format(node.value.active) },
            { label: "rollback", value: this.format(node.value.rollback) },
          ],
          level: this.pathHelper.getLevel(path),
        };
      } else {
        return {
          kind: "Flat",
          id: path,
          cell: { label: "name", value: path },
          cells: [
            { label: "candidate", value: this.format(node.value.candidate) },
            { label: "active", value: this.format(node.value.active) },
            { label: "rollback", value: this.format(node.value.rollback) },
          ],
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
          cell: { label: "name", value: this.pathHelper.getSelf(path) },
          level: this.pathHelper.getLevel(path),
        };
      } else {
        return {
          kind: "Root",
          id: path,
          isChildExpanded: this.isChildExpanded(path),
          onToggle: this.createOnToggle(path),
          cell: { label: "name", value: path },
        };
      }
    }
  }
}
