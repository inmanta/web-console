import React from "react";
import { Attributes } from "@/Core";
import { TreeTable } from "@/UI/Components";
import {
  AttributeHelper,
  PathHelper,
  TreeExpansionManager,
  TreeTableHelper,
} from "@/UI/Components/TreeTable/Helpers";

interface Props {
  attributes: Attributes;
  id?: string;
}

export const AttributesTab: React.FC<Props> = ({ attributes, id }) => (
  <TreeTable
    treeTableHelper={
      new TreeTableHelper(
        new PathHelper("$"),
        new TreeExpansionManager("$"),
        new AttributeHelper("$"),
        attributes
      )
    }
    id={id}
  />
);
