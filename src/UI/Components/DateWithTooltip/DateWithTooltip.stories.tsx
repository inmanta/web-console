import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { ServiceInstance } from "@/Test";
import { MomentDatePresenter } from "@/UI/Utils";
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
  date: new MomentDatePresenter().get(ServiceInstance.a.created_at),
};
