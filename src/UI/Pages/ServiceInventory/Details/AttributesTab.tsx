import React from "react";
import { Attributes } from "@/Core";
import { TabProps } from "./Details";
import { TreeTable } from "@/UI/Components";
import {
  AttributeHelper,
  PathHelper,
  TreeExpansionManager,
  TreeTableHelper,
} from "@/UI/Components/TreeTable/Helpers";

interface Props extends TabProps {
  attributes: Attributes;
}

export const AttributesTab: React.FC<Props> = ({ attributes }) => (
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
