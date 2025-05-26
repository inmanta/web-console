import React from "react";
import { Attributes } from "@/Core";
import { TreeTable } from "@/UI/Components/TreeTable/";
import { PathHelper, TreeExpansionManager } from "@/UI/Components/TreeTable/Helpers";
import { InventoryAttributeHelper } from "../TreeTable/Inventory";
import { InventoryTreeTableHelper } from "../TreeTable/Inventory/TreeTableHelper";

interface Props {
  attributes: Attributes;
  id: string;
}

export const AttributesTable: React.FC<Props> = ({ attributes, id }) => (
  <TreeTable
    treeTableHelper={
      new InventoryTreeTableHelper(
        new PathHelper("$"),
        new TreeExpansionManager("$"),
        new InventoryAttributeHelper("$"),
        attributes
      )
    }
    version={+id}
  />
);
