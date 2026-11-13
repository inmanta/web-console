import { EntityLike } from "@inmanta/web-console-core";
import { CatalogAttributes } from "./Helpers/AttributeNode";

export interface CatalogAttributeTree {
  source: EntityLike;
  target: CatalogAttributes;
}
