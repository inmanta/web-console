import { ExpansionState } from "@/UI/Inventory/ExpansionManager";
import { TreeExpansionManager } from "./TreeExpansionManager";
import { TreeRow } from "./TreeRow";

export function getKeyPaths(
  separator: string,
  prefix: string,
  subject: unknown
): string[] {
  if (!isNested(subject)) return [];
  const keys: string[] = [];
  const primaryKeys = Object.keys(subject);
  primaryKeys.forEach((key) => {
    keys.push(`${prefix}${key}`);
    keys.push(
      ...getKeyPaths(separator, `${prefix}${key}${separator}`, subject[key])
    );
  });
  return keys;
}

export function isNested(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.keys(value).length > 0 &&
    (!Array.isArray(value) || value.some(isNested))
  );
}

type Descriptor<Value = unknown> =
  | { done: false }
  | { done: true; value: Value };

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
    if (Object.keys(value).length === 0) return "{}";
    if (Array.isArray(value)) return value.join(", ");
  }
  return "";
}

export function mergeDescriptors(
  cds: Record<string, Descriptor>,
  ads: Record<string, Descriptor>,
  rds: Record<string, Descriptor>
): Descriptors {
  const allKeys = Object.keys({
    ...cds,
    ...ads,
    ...rds,
  });

  return allKeys.reduce((acc, cur) => {
    const done = getDone(cds[cur], ads[cur], rds[cur]);
    if (done) {
      acc[cur] = {
        done,
        value: {
          candidate: getValue(cds[cur]),
          active: getValue(ads[cur]),
          rollback: getValue(rds[cur]),
        },
      };
    } else {
      acc[cur] = { done };
    }

    return acc;
  }, {});
}

function getDone(
  cd: Descriptor | undefined,
  ad: Descriptor | undefined,
  rd: Descriptor | undefined
): boolean {
  return isDone(cd) && isDone(ad) && isDone(rd);
}

function getValue(descriptor: Descriptor | undefined): unknown {
  if (typeof descriptor === "undefined") return undefined;
  if (!descriptor.done) return undefined;
  return descriptor.value;
}

function isDone(descriptor: Descriptor | undefined): boolean {
  if (typeof descriptor === "undefined") return true;
  return descriptor.done;
}
