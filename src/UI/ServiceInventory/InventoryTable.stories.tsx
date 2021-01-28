import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { InventoryTable } from "./InventoryTable";
import { InstanceRow } from "./InstanceRow";
import { rows, tablePresenter } from "@/Test";

export default {
  title: "InventoryTable",
  component: InventoryTable,
};

const Template: Story<ComponentProps<typeof InventoryTable>> = (args) => (
  <InventoryTable
    {...args}
    tablePresenter={tablePresenter}
    RowComponent={(props) => (
      <InstanceRow {...props} expandedContent={<>expand</>} />
    )}
  />
);

export const Empty = Template.bind({});
Empty.args = { rows: [] };

export const Multiple = Template.bind({});
Multiple.args = { rows };
