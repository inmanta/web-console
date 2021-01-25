import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { TreeTable } from "./TreeTable";
import { instance } from "@/Test/Data";
import { TreeTableHelper } from "./TreeTableHelper";
import { TreeExpansionManager } from "./TreeExpansionManager";
import { AttributeHelper } from "./AttributeHelper";

export default {
  title: "TreeTable",
  component: TreeTable,
};

const Template: Story<ComponentProps<typeof TreeTable>> = (args) => (
  <TreeTable {...args} />
);

export const Simple = Template.bind({});
Simple.args = {
  treeTableHelper: new TreeTableHelper(
    "$",
    {
      candidate: {
        a: { b: { c: "c" } },
        b: 1234,
        c: false,
        d: "blabla",
        e: { f: true, g: [], h: { i: { j: 1234 } } },
        f: { g: "123" },
      },
      active: null,
      rollback: null,
    },
    new TreeExpansionManager("$"),
    new AttributeHelper("$")
  ),
};

export const RealData = Template.bind({});
RealData.args = {
  treeTableHelper: new TreeTableHelper(
    "$",
    {
      candidate: instance.candidate_attributes,
      active: instance.active_attributes,
      rollback: instance.rollback_attributes,
    },
    new TreeExpansionManager("$"),
    new AttributeHelper("$")
  ),
};
