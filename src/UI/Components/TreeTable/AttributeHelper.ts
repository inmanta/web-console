import { Attributes, TreeNode } from "@/Core";

type AttributeNode = TreeNode<unknown>;

export type MultiAttributeNode = TreeNode<{
  candidate: unknown;
  active: unknown;
  rollback: unknown;
}>;

type AttributeNodeDict = Record<string, AttributeNode>;

export type MultiAttributeNodeDict = Record<string, MultiAttributeNode>;

export class AttributeHelper {
  constructor(private readonly separator: string) {}

  getPaths(attributes: Attributes): string[] {
    return Object.keys(
      this.getSingleAttributeNodes("", {
        ...attributes.candidate,
        ...attributes.active,
        ...attributes.rollback,
      })
    );
  }

  getMultiAttributeNodes(attributes: Attributes): MultiAttributeNodeDict {
    const candidateDescriptors = this.getSingleAttributeNodes(
      "",
      attributes.candidate
    );
    const activeDescriptors = this.getSingleAttributeNodes(
      "",
      attributes.active
    );
    const rollbackDescriptors = this.getSingleAttributeNodes(
      "",
      attributes.rollback
    );

    return mergeNodes(
      candidateDescriptors,
      activeDescriptors,
      rollbackDescriptors
    );
  }

  private getSingleAttributeNodes(
    prefix: string,
    subject: unknown
  ): AttributeNodeDict {
    if (!this.isNested(subject)) return {};
    let keys: AttributeNodeDict = {};
    const primaryKeys = Object.keys(subject);
    primaryKeys.forEach((key) => {
      if (!this.isNested(subject[key])) {
        keys[`${prefix}${key}`] = { kind: "Leaf", value: subject[key] };
      } else {
        keys[`${prefix}${key}`] = { kind: "Branch" };
        keys = {
          ...keys,
          ...this.getSingleAttributeNodes(
            `${prefix}${key}${this.separator}`,
            subject[key]
          ),
        };
      }
    });
    return keys;
  }

  /**
   * isNested checks whether a value is "nested" or not.
   *
   * An object is considered nested when:
   * - not null
   * - has keys, so not an empty object {}
   *
   * An array is considered nested when:
   * - array contains nested values
   *
   * Example:
   * Nested:
   * - [{a:"hello"}]
   * - {a: "hello"}
   *
   * Not Nested:
   * - []
   * - {}
   * - ["hello"]
   * - null
   */
  private isNested(value: unknown): value is Record<string, unknown> {
    return (
      typeof value === "object" &&
      value !== null &&
      Object.keys(value).length > 0 &&
      (!Array.isArray(value) || value.some((v) => this.isNested(v)))
    );
  }
}

export function mergeNodes(
  candidateNodes: Record<string, TreeNode>,
  activeNodes: Record<string, TreeNode>,
  rollbackNodes: Record<string, TreeNode>
): MultiAttributeNodeDict {
  const allKeys = Object.keys({
    ...candidateNodes,
    ...activeNodes,
    ...rollbackNodes,
  });

  return allKeys.reduce<MultiAttributeNodeDict>((acc, cur) => {
    const isLeaf = isMultiLeaf(
      candidateNodes[cur],
      activeNodes[cur],
      rollbackNodes[cur]
    );
    if (isLeaf) {
      acc[cur] = {
        kind: "Leaf",
        value: {
          candidate: getValue(candidateNodes[cur]),
          active: getValue(activeNodes[cur]),
          rollback: getValue(rollbackNodes[cur]),
        },
      };
    } else {
      acc[cur] = { kind: "Branch" };
    }

    return acc;
  }, {});
}

export function isMultiLeaf(
  candidateNode: TreeNode | undefined,
  activeNode: TreeNode | undefined,
  rollbackNode: TreeNode | undefined
): boolean {
  return isLeaf(candidateNode) && isLeaf(activeNode) && isLeaf(rollbackNode);
}

export function getValue(node: TreeNode | undefined): unknown {
  if (typeof node === "undefined") return undefined;
  if (node.kind !== "Leaf") return undefined;
  return node.value;
}

export function isLeaf(node: TreeNode | undefined): boolean {
  if (typeof node === "undefined") return true;
  return node.kind === "Leaf";
}
