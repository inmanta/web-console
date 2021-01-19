import React from "react";
import { Story } from "@storybook/react/types-6-0";
import { instances } from "Fixtures";
import { TableProvider, Props } from "./TableProvider";

export default {
  title: "TableProvider",
  component: TableProvider,
};

const Template: Story<Props> = (args) => <TableProvider {...args} />;

export const Empty = Template.bind({});
Empty.args = { instances: [] };

export const Multiple = Template.bind({});
Multiple.args = { instances };
