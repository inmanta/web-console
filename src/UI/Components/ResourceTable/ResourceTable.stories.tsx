import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { Resource } from "@/Test";
import { ResourceTable } from "./ResourceTable";

export default {
  title: "ResourceTable",
  component: ResourceTable,
};

const Template: Story<ComponentProps<typeof ResourceTable>> = (args) => (
  <ResourceTable {...args} />
);

export const Empty = Template.bind({});
Empty.args = { resources: [], environmentId: "env-abcd", instanceId: "abcd" };

export const RealData = Template.bind({});
RealData.args = {
  resources: Resource.resources,
  environmentId: "env-abcd",
  instanceId: "abcd",
};
