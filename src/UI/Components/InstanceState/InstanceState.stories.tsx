import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { InstanceState } from "./InstanceState";

export default {
  title: "InstanceState",
  component: InstanceState,
};

const Template: Story<ComponentProps<typeof InstanceState>> = (args) => (
  <InstanceState {...args} />
);

export const Success = Template.bind({});
Success.args = { name: "up", label: "success" };

export const Info = Template.bind({});
Info.args = { name: "info", label: "info" };

export const Warning = Template.bind({});
Warning.args = { name: "warning", label: "warning" };

export const Danger = Template.bind({});
Danger.args = { name: "danger", label: "danger" };
