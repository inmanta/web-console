import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { Resources } from "@/Test";
import { ResourceTable } from "./ResourceTable";
import { DependencyProvider } from "@/UI/Dependency";
import { UrlManagerImpl } from "@/UI/Routing";

export default {
  title: "ResourceTable",
  component: ResourceTable,
};

const Template: Story<ComponentProps<typeof ResourceTable>> = (args) => (
  <DependencyProvider
    dependencies={{ urlManager: new UrlManagerImpl("", "env") }}
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
  resources: Resources.A,
};
