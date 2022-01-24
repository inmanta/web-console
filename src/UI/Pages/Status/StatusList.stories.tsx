import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { ServerStatus } from "@/Test";
import { StatusList } from "./StatusList";

export default {
  title: "StatusList",
  component: StatusList,
};

const Template: Story<ComponentProps<typeof StatusList>> = (args) => {
  return <StatusList {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  status: ServerStatus.withLsm,
  apiUrl: "www.example.com",
};
