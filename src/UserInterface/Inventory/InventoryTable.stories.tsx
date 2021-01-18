import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { InventoryTable } from "./InventoryTable";
import { rows } from "Fixtures/row";
import { tablePresenter } from "./Presenters/TablePresenter.injected";

export default {
  title: "InventoryTable",
  component: InventoryTable,
};

const Template: Story<ComponentProps<typeof InventoryTable>> = (args) => (
  <InventoryTable {...args} tablePresenter={tablePresenter} />
);

export const Empty = Template.bind({});
Empty.args = { rows: [] };

export const Multiple = Template.bind({});
Multiple.args = { rows };
