import { Attributes, EntityLike } from "@/Core";
import {
  CatalogAttributes,
  InventoryAttributes,
} from "./Helpers/AttributeNode";

export type AttributeTree = InventoryAttributeTree | CatalogAttributeTree;

export interface InventoryAttributeTree {
  source: Attributes;
  target: InventoryAttributes;
}

export interface CatalogAttributeTree {
  source: EntityLike;
  target: CatalogAttributes;
}
