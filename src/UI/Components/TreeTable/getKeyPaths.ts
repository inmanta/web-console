import { ExpansionState } from "@/UI/Inventory/ExpansionManager";
import { TreeExpansionManager } from "./TreeExpansionManager";
import { TreeRow } from "./TreeRow";

export function getKeyPaths(prefix: string, subject: unknown): string[] {
  if (!isNested(subject)) return [];
  const keys: string[] = [];
  const primaryKeys = Object.keys(subject);
  primaryKeys.forEach((key) => {
    keys.push(`${prefix}${key}`);
    keys.push(...getKeyPaths(`${prefix}${key}.`, subject[key]));
  });
  return keys;
}

export function isNested(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type Descriptor = { done: false } | { done: true; value: unknown };

export function getKeyPathsWithValue(
  separator: string,
  prefix: string,
  subject: unknown
): Record<string, Descriptor> {
  if (!isNested(subject)) return {};
  let keys = {};
  const primaryKeys = Object.keys(subject);
  primaryKeys.forEach((key) => {
    if (!isNested(subject[key])) {
      keys[`${prefix}${key}`] = { done: true, value: subject[key] };
    } else {
      keys[`${prefix}${key}`] = { done: false };
      keys = {
        ...keys,
        ...getKeyPathsWithValue(
          separator,
          `${prefix}${key}${separator}`,
          subject[key]
        ),
      };
    }
  });
  return keys;
}

export function getRows(
  separator: string,
  onToggle: (key: string) => () => void,
  expansionManager: TreeExpansionManager,
  expansionState: ExpansionState,
  descriptors: Record<string, Descriptor>
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
            { label: "candidate", value: toString(descriptor.value) },
            { label: "active", value: toString(false) },
            { label: "rollback", value: "blabla" },
          ],
          level: key.split(separator).length - 1,
        };
      } else {
        return {
          kind: "Flat",
          id: key,
          cell: { label: "name", value: key },
          cells: [
            { label: "candidate", value: toString(descriptor.value) },
            { label: "active", value: toString(1234) },
            { label: "rollback", value: "blabla" },
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

export function dropLast(value: string, separator: string): string {
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
    if (Array.isArray(value)) return value.join(", ");
  }
  return "";
}
