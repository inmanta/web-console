import React from "react";
import { Attributes } from "@/Core";
import { TreeTable } from "@/UI/Components/TreeTable/";
import {
  PathHelper,
  TreeExpansionManager,
} from "@/UI/Components/TreeTable/Helpers";
import {
  InventoryAttributeHelper,
  InventoryTreeTableHelper,
} from "../TreeTable/Inventory";

interface Props {
  attributes: Attributes;
}

export const AttributesTable: React.FC<Props> = ({ attributes }) => (
  <TreeTable
    treeTableHelper={
      new InventoryTreeTableHelper(
        new PathHelper("$"),
        new TreeExpansionManager("$"),
        new InventoryAttributeHelper("$"),
        attributes
      )
    }
  />
);
