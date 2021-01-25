import { Attributes } from "@/Core";
import { AttributeHelper, MultiAttributeNode } from "./AttributeHelper";
import { ExpansionState, TreeExpansionManager } from "./TreeExpansionManager";
import { TreeRow } from "./TreeRow";
import { words } from "@/UI/words";

export class TreeTableHelper {
  private readonly columns = [
    words("attribute.name"),
    words("attributesTab.candidate"),
    words("attributesTab.active"),
    words("attributesTab.rollback"),
  ];

  constructor(
    private readonly separator: string,
    private readonly attributes: Attributes,
    private readonly expansionManager: TreeExpansionManager,
    private readonly attributeHelper: AttributeHelper
  ) {}

  public getColumns(): string[] {
    return this.columns;
  }

  public getExpansionState(): ExpansionState {
    return this.expansionManager.create(
      this.attributeHelper.getPaths(this.attributes)
    );
  }

  public createRows(
    expansionState: ExpansionState,
    setState: (state: ExpansionState) => void
  ): TreeRow[] {
    const createOnToggle = (key: string) => () =>
      setState(this.expansionManager.toggle(expansionState, key));

    const nodes = this.attributeHelper.getMultiAttributeNodes(this.attributes);
    return getRows(
      this.separator,
      createOnToggle,
      this.expansionManager,
      expansionState,
      nodes
    );
  }
}

export function getRows(
  separator: string,
  onToggle: (key: string) => () => void,
  expansionManager: TreeExpansionManager,
  expansionState: ExpansionState,
  descriptors: Record<string, MultiAttributeNode>
): TreeRow[] {
  return Object.entries(descriptors).map(([key, descriptor]) => {
    if (descriptor.kind === "Leaf") {
      if (key.includes(separator)) {
        return {
          kind: "Leaf",
          id: key,
          isExpandedByParent: expansionManager.get(
            expansionState,
            dropLast(separator, key)
          ),
          cell: { label: "name", value: getLast(separator, key) },
          cells: [
            { label: "candidate", value: toString(descriptor.value.candidate) },
            { label: "active", value: toString(descriptor.value.active) },
            { label: "rollback", value: toString(descriptor.value.rollback) },
          ],
          level: key.split(separator).length - 1,
        };
      } else {
        return {
          kind: "Flat",
          id: key,
          cell: { label: "name", value: key },
          cells: [
            { label: "candidate", value: toString(descriptor.value.candidate) },
            { label: "active", value: toString(descriptor.value.active) },
            { label: "rollback", value: toString(descriptor.value.rollback) },
          ],
        };
      }
    } else {
      if (key.includes(separator)) {
        return {
          kind: "Branch",
          id: key,
          isExpandedByParent: expansionManager.get(
            expansionState,
            dropLast(separator, key)
          ),
          isChildExpanded: expansionManager.get(expansionState, key),
          onToggle: onToggle(key),
          level: key.split(separator).length - 1,
          cell: { label: "name", value: getLast(separator, key) },
        };
      } else {
        return {
          kind: "Root",
          id: key,
          isChildExpanded: expansionManager.get(expansionState, key),
          onToggle: onToggle(key),
          cell: { label: "name", value: key },
        };
      }
    }
  });
}

function dropLast(separator: string, value: string): string {
  const parts = value.split(separator);
  parts.pop();
  return parts.join(separator);
}

function getLast(separator: string, value: string): string {
  const parts = value.split(separator);
  return parts.pop() as string;
}

function toString(value: unknown): string {
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
