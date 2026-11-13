import { AttributeNode } from "@inmanta/web-console-feature-lsm/Components/TreeTable/Helpers/AttributeNode";
import { PathHelper } from "@inmanta/web-console-feature-lsm/Components/TreeTable/Helpers/PathHelper";
import { Cell, TreeRow } from "./TreeRow";

export class TreeRowCreator {
  constructor(
    private readonly pathHelper: PathHelper,
    private readonly isExpandedByParent: (path: string) => boolean,
    private readonly isChildExpanded: (path: string) => boolean,
    private readonly createOnToggle: (path: string) => () => void,
    private readonly extractValues: (node: Extract<AttributeNode, { kind: "Leaf" }>) => Cell[]
  ) {}

  /**
   * Creates the table row for the attribute node at the given path.
   * A leaf becomes a Flat row at the top level and a Leaf row when nested; a branch becomes a Root or a Branch row the same way.
   */
  create(path: string, node: AttributeNode): TreeRow {
    if (node.kind === "Leaf") {
      if (this.pathHelper.isNested(path)) {
        return {
          kind: "Leaf",
          id: path,
          isExpandedByParent: this.isExpandedByParent(path),
          level: this.pathHelper.getLevel(path),
          primaryCell: {
            label: "name",
            value: this.pathHelper.getSelf(path),
          },
          valueCells: this.extractValues(node),
        };
      } else {
        return {
          kind: "Flat",
          id: path,
          primaryCell: {
            label: "name",
            value: path,
          },
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
          primaryCell: {
            label: "name",
            value: this.pathHelper.getSelf(path),
          },
        };
      } else {
        return {
          kind: "Root",
          id: path,
          isChildExpanded: this.isChildExpanded(path),
          onToggle: this.createOnToggle(path),
          primaryCell: {
            label: "name",
            value: path,
          },
        };
      }
    }
  }
}

function format(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return value.toString();
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "undefined") {
    return "";
  }

  if (typeof value === "object") {
    if (value === null) {
      return "null";
    }

    if (Object.keys(value).length === 0) {
      return "{}";
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }
  }

  return "";
}

export function extractCatalogValues(node: Extract<AttributeNode, { kind: "Leaf" }>): Cell[] {
  return [
    {
      label: "type",
      value: format(node.value.type),
      hasRelation: node.hasRelation,
    },
    {
      label: "modifier",
      value: format(node.value.modifier),
    },
    {
      label: "description",
      value: format(node.value.description),
    },
  ];
}
