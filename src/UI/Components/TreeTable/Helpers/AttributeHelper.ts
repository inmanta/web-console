import { AttributeTree } from "@/UI/Components/TreeTable/types";
import { AttributeAnnotations } from "@inmanta/web-console-core";
import { MultiAttributeNodeDict } from "./AttributeNode";

export interface AttributeHelper<Kind extends AttributeTree> {
  getPaths(attributes: Kind["source"]): string[];

  getAttributeAnnotations(key: string): AttributeAnnotations;

  getMultiAttributeNodes(attributes: Kind["source"]): MultiAttributeNodeDict<Kind["target"]>;
}
