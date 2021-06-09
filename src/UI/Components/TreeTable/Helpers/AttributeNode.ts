import { TreeNode } from "@/Core";

type AttributeNode = TreeNode<unknown>;

export type MultiAttributeNode = TreeNode<{
  candidate: unknown;
  active: unknown;
  rollback: unknown;
}>;

export type AttributeNodeDict = Record<string, AttributeNode>;

export type MultiAttributeNodeDict = Record<string, MultiAttributeNode>;
