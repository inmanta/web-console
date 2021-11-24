import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { ServiceInstance } from "@/Test";
import { DateWithTooltip } from "./DateWithTooltip";

export default {
  title: "DateWithTooltip",
  component: DateWithTooltip,
};

const Template: Story<ComponentProps<typeof DateWithTooltip>> = (args) => (
  <DateWithTooltip {...args} />
);

export const Default = Template.bind({});
Default.args = {
  timestamp: ServiceInstance.a.created_at,
};
