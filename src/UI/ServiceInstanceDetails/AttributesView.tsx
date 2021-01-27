import React from "react";
import { Attributes } from "@/Core";
import { TabProps } from "./InstanceDetails";
import { TreeTable } from "../Components";
import { TreeTableHelper } from "../Components/TreeTable/TreeTableHelper";
import { TreeExpansionManager } from "../Components/TreeTable/TreeExpansionManager";
import { AttributeHelper } from "../Components/TreeTable/AttributeHelper";
import { PathHelper } from "../Components/TreeTable/PathHelper";

interface Props extends TabProps {
  attributes: Attributes;
}

export const AttributesView: React.FC<Props> = ({ attributes }) => (
  <TreeTable
    treeTableHelper={
      new TreeTableHelper(
        new PathHelper("$"),
        new TreeExpansionManager("$"),
        new AttributeHelper("$"),
        attributes
      )
    }
  />
);
