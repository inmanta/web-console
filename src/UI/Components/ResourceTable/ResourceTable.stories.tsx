import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { Resources } from "@/Test";
import { ResourceTable } from "./ResourceTable";
import { ResourceHrefCreatorImpl } from "../HrefCreators";

export default {
  title: "ResourceTable",
  component: ResourceTable,
};

const Template: Story<ComponentProps<typeof ResourceTable>> = (args) => (
  <ResourceTable {...args} />
);

export const Empty = Template.bind({});
Empty.args = {
  hrefCreator: new ResourceHrefCreatorImpl("env-abcd"),
  resources: [],
};

export const RealData = Template.bind({});
RealData.args = {
  hrefCreator: new ResourceHrefCreatorImpl("env-abcd"),
  resources: Resources.A,
};
