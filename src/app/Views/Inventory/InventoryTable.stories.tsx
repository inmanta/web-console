import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { InventoryTable } from "./InventoryTable";
import { rows } from "@app/fixtures/row";

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
Many.args = { rows };
