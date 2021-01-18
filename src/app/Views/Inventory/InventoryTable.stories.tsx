import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { InventoryTable } from "./InventoryTable";
import { rows } from "@app/fixtures/row";
import { DummyDatePresenter } from "./DummyDatePresenter";
import { AttributePresenter } from "./AttributePresenter";
import { TablePresenter } from "./TablePresenter";

export default {
  title: "InventoryTable",
  component: InventoryTable,
};

const tablePresenter = new TablePresenter(
  new DummyDatePresenter(),
  new AttributePresenter()
);

const Template: Story<ComponentProps<typeof InventoryTable>> = (args) => (
  <InventoryTable {...args} tablePresenter={tablePresenter} />
);

export const Empty = Template.bind({});
Empty.args = { rows: [] };

export const Many = Template.bind({});
Many.args = { rows };
