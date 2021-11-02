import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { PrimaryStatusManager } from "@/Data";
import { InstanceResource } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { UrlManagerImpl } from "@/UI/Utils";
import { ResourceTable } from "./InstanceResourceTable";

export default {
  title: "ResourceTable",
  component: ResourceTable,
};

const Template: Story<ComponentProps<typeof ResourceTable>> = (args) => (
  <DependencyProvider
    dependencies={{
      urlManager: new UrlManagerImpl(new PrimaryStatusManager(), "", "env"),
    }}
  >
    <ResourceTable {...args} />
  </DependencyProvider>
);

export const Empty = Template.bind({});
Empty.args = {
  resources: [],
};

export const RealData = Template.bind({});
RealData.args = {
  resources: InstanceResource.listA,
};
