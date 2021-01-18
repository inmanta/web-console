import React from "react";
import { Story } from "@storybook/react/types-6-0";
import { View, Props } from "./View";
import { instances } from "Fixtures";

export default {
  title: "Inventory",
  component: View,
};

const Template: Story<Props> = (args) => <View {...args} />;

export const Empty = Template.bind({});
Empty.args = { instances: [] };

export const One = Template.bind({});
One.args = { instances };
