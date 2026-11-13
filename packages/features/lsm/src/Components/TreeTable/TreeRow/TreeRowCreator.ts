import { AttributeNode } from "@inmanta/web-console-feature-lsm/Components/TreeTable/Helpers/AttributeNode";
import { PathHelper } from "@inmanta/web-console-feature-lsm/Components/TreeTable/Helpers/PathHelper";
import { Cell, TreeRow } from "./TreeRow";

export class TreeRowCreator {
  /** The 1-based position of each path among the paths that share its parent. */
  private readonly positionInSetByPath: Map<string, number>;

  /** The number of child paths of each path. Top-level paths count as children of "". */
  private readonly childCountByPath: Map<string, number>;

  constructor(
    private readonly pathHelper: PathHelper,
    private readonly isExpandedByParent: (path: string) => boolean,
    private readonly isChildExpanded: (path: string) => boolean,
    private readonly createOnToggle: (path: string) => () => void,
    private readonly extractValues: (node: Extract<AttributeNode, { kind: "Leaf" }>) => Cell[],
    paths: string[]
  ) {
    this.positionInSetByPath = new Map();
    this.childCountByPath = new Map();

    paths.forEach((path) => {
      const parentPath = this.getParentPath(path);
      const positionInSet = (this.childCountByPath.get(parentPath) || 0) + 1;

      this.childCountByPath.set(parentPath, positionInSet);
      this.positionInSetByPath.set(path, positionInSet);
    });
  }

  /**
   * Returns the parent path of the given path, or "" for a top-level path.
   */
  private getParentPath(path: string): string {
    return this.pathHelper.isNested(path) ? this.pathHelper.getParent(path) : "";
  }

  /**
   * Returns the 1-based position of the path among the paths that share its parent.
   */
  private getPositionInSet(path: string): number {
    return this.positionInSetByPath.get(path) || 0;
  }

  /**
   * Returns the number of child paths of the given path.
   */
  private getChildCount(path: string): number {
    return this.childCountByPath.get(path) || 0;
  }

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
          positionInSet: this.getPositionInSet(path),
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
          positionInSet: this.getPositionInSet(path),
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
          positionInSet: this.getPositionInSet(path),
          childCount: this.getChildCount(path),
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
          positionInSet: this.getPositionInSet(path),
          childCount: this.getChildCount(path),
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
