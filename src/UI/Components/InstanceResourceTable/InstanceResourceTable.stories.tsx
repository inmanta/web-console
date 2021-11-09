import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { PrimaryFeatureManager } from "@/Data";
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
      urlManager: new UrlManagerImpl(new PrimaryFeatureManager(), "", "env"),
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
