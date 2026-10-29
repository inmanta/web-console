import { AttributeAnnotations } from "@inmanta/web-console-core";
import { AttributeTree } from "@inmanta/web-console-feature-lsm/Components/TreeTable/types";
import { MultiAttributeNodeDict } from "./AttributeNode";

export interface AttributeHelper<Kind extends AttributeTree> {
  getPaths(attributes: Kind["source"]): string[];

  getAttributeAnnotations(key: string): AttributeAnnotations;

  getMultiAttributeNodes(attributes: Kind["source"]): MultiAttributeNodeDict<Kind["target"]>;
}
