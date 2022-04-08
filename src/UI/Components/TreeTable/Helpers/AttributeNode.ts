import { TreeNode } from "@/Core";

type AttributeNode = TreeNode<unknown>;

export type InventoryAttributes = {
  candidate: unknown;
  active: unknown;
  rollback: unknown;
};

export type CatalogAttributes = {
  description: unknown;
  type: unknown;
};

export type MultiAttributeNode<
  A extends InventoryAttributes | CatalogAttributes
> = TreeNode<A>;

export type AttributeNodeDict = Record<string, AttributeNode>;

export type MultiAttributeNodeDict<
  A extends InventoryAttributes | CatalogAttributes
> = Record<string, MultiAttributeNode<A>>;
