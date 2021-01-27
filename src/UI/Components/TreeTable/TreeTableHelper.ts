import { Attributes } from "@/Core";
import { AttributeHelper, MultiAttributeNode } from "./AttributeHelper";
import { PathHelper } from "./PathHelper";
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
    private readonly pathHelper: PathHelper,
    private readonly expansionManager: TreeExpansionManager,
    private readonly attributeHelper: AttributeHelper,
    private readonly attributes: Attributes
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
      this.pathHelper,
      createOnToggle,
      this.expansionManager,
      expansionState,
      nodes
    );
  }
}

export function getRows(
  pathHelper: PathHelper,
  onToggle: (key: string) => () => void,
  expansionManager: TreeExpansionManager,
  expansionState: ExpansionState,
  descriptors: Record<string, MultiAttributeNode>
): TreeRow[] {
  return Object.entries(descriptors).map(([key, descriptor]) => {
    if (descriptor.kind === "Leaf") {
      if (pathHelper.isNested(key)) {
        return {
          kind: "Leaf",
          id: key,
          isExpandedByParent: expansionManager.get(
            expansionState,
            pathHelper.getParent(key)
          ),
          cell: { label: "name", value: pathHelper.getSelf(key) },
          cells: [
            { label: "candidate", value: format(descriptor.value.candidate) },
            { label: "active", value: format(descriptor.value.active) },
            { label: "rollback", value: format(descriptor.value.rollback) },
          ],
          level: pathHelper.getLevel(key),
        };
      } else {
        return {
          kind: "Flat",
          id: key,
          cell: { label: "name", value: key },
          cells: [
            { label: "candidate", value: format(descriptor.value.candidate) },
            { label: "active", value: format(descriptor.value.active) },
            { label: "rollback", value: format(descriptor.value.rollback) },
          ],
        };
      }
    } else {
      if (pathHelper.isNested(key)) {
        return {
          kind: "Branch",
          id: key,
          isExpandedByParent: expansionManager.get(
            expansionState,
            pathHelper.getParent(key)
          ),
          isChildExpanded: expansionManager.get(expansionState, key),
          onToggle: onToggle(key),
          cell: { label: "name", value: pathHelper.getSelf(key) },
          level: pathHelper.getLevel(key),
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
