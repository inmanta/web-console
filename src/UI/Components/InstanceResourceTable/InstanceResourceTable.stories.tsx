import React, { ComponentProps } from "react";
import { BrowserRouter } from "react-router-dom";
import { Story } from "@storybook/react/types-6-0";
import { dependencies, InstanceResource } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { ResourceTable } from "./InstanceResourceTable";

export default {
  title: "InstanceResourceTable",
  component: ResourceTable,
};

const Template: Story<ComponentProps<typeof ResourceTable>> = (args) => (
  <BrowserRouter>
    <DependencyProvider dependencies={dependencies}>
      <ResourceTable {...args} />
    </DependencyProvider>
  </BrowserRouter>
);

export const Empty = Template.bind({});
Empty.args = {
  resources: [],
};

export const RealData = Template.bind({});
RealData.args = {
  resources: InstanceResource.listA,
};
