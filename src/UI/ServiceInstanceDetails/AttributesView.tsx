import React from "react";
import { Attributes } from "@/Core";
import { TreeTable } from "../Components";
import { TreeTableHelper } from "../Components/TreeTable/TreeTableHelper";
import { TreeExpansionManager } from "../Components/TreeTable/TreeExpansionManager";
import { AttributeHelper } from "../Components/TreeTable/AttributeHelper";

interface Props {
  attributes: Attributes;
}

export const AttributesView: React.FC<Props> = ({ attributes }) => (
  <TreeTable
    treeTableHelper={
      new TreeTableHelper(
        "$",
        attributes,
        new TreeExpansionManager("$"),
        new AttributeHelper("$")
      )
    }
  />
);
