import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { ExpandableTable } from "./ExpandableTable";

export default {
  title: "ExpandableTable",
  component: ExpandableTable,
};

const Template: Story<ComponentProps<typeof ExpandableTable>> = (args) => (
  <ExpandableTable {...args} />
);
export const Default = Template.bind({});
Default.args = {
  columnHeads: ["Version", "Timestamp", "State", "Attributes"],
  ids: ["1", "2", "3", "4"],
};
