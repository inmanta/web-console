import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { StackedProgressBar } from "./StackedProgressBar";

export default {
  title: "StackedProgressBar",
  component: StackedProgressBar,
};

const Template: Story<ComponentProps<typeof StackedProgressBar>> = (args) => (
  <StackedProgressBar {...args} />
);

export const Empty = Template.bind({});
Empty.args = {
  total: 0,
  success: 0,
  failed: 0,
  waiting: 0,
};

export const InProgress = Template.bind({});
InProgress.args = {
  total: 5,
  success: 2,
  failed: 1,
  waiting: 2,
};
export const NoFailure = Template.bind({});
NoFailure.args = {
  total: 5,
  success: 3,
  failed: 0,
  waiting: 2,
};
