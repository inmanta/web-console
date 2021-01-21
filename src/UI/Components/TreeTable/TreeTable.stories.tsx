import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { TreeTable } from "./TreeTable";

export default {
  title: "TreeTable",
  component: TreeTable,
};

const Template: Story<ComponentProps<typeof TreeTable>> = (args) => (
  <TreeTable {...args} />
);

export const One = Template.bind({});
One.args = {};
