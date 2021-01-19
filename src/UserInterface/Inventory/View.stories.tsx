import React from "react";
import { Story } from "@storybook/react/types-6-0";
import { instances } from "Fixtures";
import { View, Props } from "./View";

export default {
  title: "Inventory",
  component: View,
};

const Template: Story<Props> = (args) => <View {...args} />;

export const Empty = Template.bind({});
Empty.args = { instances: [] };

export const Multiple = Template.bind({});
Multiple.args = { instances };
