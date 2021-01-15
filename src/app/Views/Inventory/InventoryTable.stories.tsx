import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { InventoryTable } from "./InventoryTable";

export default {
  title: "InventoryTable",
  component: InventoryTable,
};

const Template: Story<ComponentProps<typeof InventoryTable>> = (args) => (
  <InventoryTable {...args} />
);

export const Empty = Template.bind({});
Empty.args = {
  rows: [],
};

export const Many = Template.bind({});
Many.args = {
  rows: [
    { id: "1234", state: "rejected" },
    { id: "2345", state: "rejected" },
    { id: "3456", state: "rejected" },
    { id: "4567", state: "rejected" },
    { id: "5678", state: "rejected" },
    { id: "6789", state: "rejected" },
  ],
};
