import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { ServiceInstance } from "@/Test";
import { DateWithTooltip } from "./DateWithTooltip";
import { MomentDatePresenter } from "@/UI/Utils";

export default {
  title: "DateWithTooltip",
  component: DateWithTooltip,
};

const Template: Story<ComponentProps<typeof DateWithTooltip>> = (args) => (
  <DateWithTooltip {...args} />
);

export const Default = Template.bind({});
Default.args = {
  date: new MomentDatePresenter().get(ServiceInstance.a.created_at),
};
