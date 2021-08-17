import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { AttributeList } from "./AttributeList";
import { classified } from "./Data";

export default {
  title: "AttributeList",
  component: AttributeList,
};

const Template: Story<ComponentProps<typeof AttributeList>> = (args) => (
  <AttributeList {...args} />
);

export const Default = Template.bind({});
Default.args = {
  attributes: classified,
};
