import { AttributeTree } from "@/UI/Components/TreeTable/types";
import { MultiAttributeNodeDict } from "./AttributeNode";

export interface AttributeHelper<Kind extends AttributeTree> {
  getPaths(attributes: Kind["source"]): string[];

  getMultiAttributeNodes(
    attributes: Kind["source"],
  ): MultiAttributeNodeDict<Kind["target"]>;
}
