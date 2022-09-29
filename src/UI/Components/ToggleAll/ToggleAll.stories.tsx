import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { ToggleAll } from "./ToggleAll";

export default {
  title: "ToggleAll",
  component: ToggleAll,
  argTypes: { onClick: { action: "clicked" } },
};

const Template: Story<ComponentProps<typeof ToggleAll>> = (args) => (
  <ToggleAll {...args} />
);

export const Default = Template.bind({});
Default.args = { isExpanded: false };

export const Expanded = Template.bind({});
Expanded.args = { isExpanded: true };
