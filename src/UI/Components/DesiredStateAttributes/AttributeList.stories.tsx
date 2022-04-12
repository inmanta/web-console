import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { InstantFileFetcher } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { AttributeList } from "./AttributeList";
import { longNames } from "./Data";

export default {
  title: "AttributeList",
  component: AttributeList,
};

const Template: Story<ComponentProps<typeof AttributeList>> = (args) => (
  <DependencyProvider dependencies={{ fileFetcher: new InstantFileFetcher() }}>
    <AttributeList {...args} />
  </DependencyProvider>
);

export const Default = Template.bind({});
Default.args = {
  attributes: longNames,
};
