import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { Toggle } from "./Toggle";

export default {
  title: "Toggle",
  component: Toggle,
  argTypes: { onClick: { action: "clicked" } },
};

const Template: Story<ComponentProps<typeof Toggle>> = (args) => (
  <Toggle {...args} />
);

export const Default = Template.bind({});
Default.args = { expanded: false };

export const Expanded = Template.bind({});
Expanded.args = { expanded: true };
