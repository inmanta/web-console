import { CatalogAttributeTree } from "@inmanta/web-console-feature-lsm/Components/TreeTable/types";
import { AttributeNodeDict } from "./AttributeNode";

export interface AttributeHelper {
  getPaths(attributes: CatalogAttributeTree["source"]): string[];

  getAttributeNodes(attributes: CatalogAttributeTree["source"]): AttributeNodeDict;
}
