import { ExpansionState } from "@/UI/Inventory/ExpansionManager";
import { TreeExpansionManager } from "./TreeExpansionManager";
import { TreeRow } from "./TreeRow";

type Descriptor<Value = unknown> =
  | { done: false }
  | { done: true; value: Value };

interface AttributesValue {
  candidate: unknown;
  active: unknown;
  rollback: unknown;
}

type Descriptors = Record<string, Descriptor<AttributesValue>>;

export function getRows(
  separator: string,
  onToggle: (key: string) => () => void,
  expansionManager: TreeExpansionManager,
  expansionState: ExpansionState,
  descriptors: Descriptors
): TreeRow[] {
  return Object.entries(descriptors).map(([key, descriptor]) => {
    if (descriptor.done) {
      if (key.includes(separator)) {
        return {
          kind: "Leaf",
          id: key,
          isExpandedByParent: expansionManager.get(
            expansionState,
            dropLast(key, separator)
          ),
          cell: { label: "active", value: getLast(key, separator) },
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
            dropLast(key, separator)
          ),
          isChildExpanded: expansionManager.get(expansionState, key),
          onToggle: onToggle(key),
          level: key.split(separator).length - 1,
          cell: { label: "name", value: getLast(key, separator) },
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

function dropLast(value: string, separator: string): string {
  const parts = value.split(separator);
  parts.pop();
  return parts.join(separator);
}

function getLast(value: string, separator: string): string {
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
