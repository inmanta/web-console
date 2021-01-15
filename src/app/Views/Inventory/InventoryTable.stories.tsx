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
    { id: "1234" },
    { id: "2345" },
    { id: "3456" },
    { id: "4567" },
    { id: "5678" },
    { id: "6789" },
  ],
};
