import { MultiAttributeNode } from "@/UI/Components/TreeTable/Helpers/AttributeNode";
import { PathHelper } from "@/UI/Components/TreeTable/Helpers/PathHelper";

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
          level: this.pathHelper.getLevel(path),
          primaryCell: { label: "name", value: this.pathHelper.getSelf(path) },
          valueCells: [
            { label: "candidate", value: this.format(node.value.candidate) },
            { label: "active", value: this.format(node.value.active) },
            { label: "rollback", value: this.format(node.value.rollback) },
          ],
        };
      } else {
        return {
          kind: "Flat",
          id: path,
          primaryCell: { label: "name", value: path },
          valueCells: [
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
