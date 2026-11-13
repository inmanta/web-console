import { TreeNode } from "@inmanta/web-console-core";

export type CatalogAttributes = {
  description: unknown;
  modifier: unknown;
  type: unknown;
};

export type AttributeNode = TreeNode<CatalogAttributes>;

export type AttributeNodeDict = Record<string, AttributeNode>;
