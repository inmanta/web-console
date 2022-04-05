import React from "react";
import { Attributes } from "@/Core";
import { TreeTable } from "@/UI/Components";
import {
  PathHelper,
  TreeExpansionManager,
} from "@/UI/Components/TreeTable/Helpers";
import {
  InventoryAttributeHelper,
  InventoryTreeTableHelper,
} from "@/UI/Components/TreeTable/Inventory";

interface Props {
  attributes: Attributes;
  id?: string;
}

export const AttributesTab: React.FC<Props> = ({ attributes, id }) => (
  <TreeTable
    treeTableHelper={
      new InventoryTreeTableHelper(
        new PathHelper("$"),
        new TreeExpansionManager("$"),
        new InventoryAttributeHelper("$"),
        attributes
      )
    }
    id={id}
  />
);
