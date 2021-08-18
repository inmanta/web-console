import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { AttributeList } from "./AttributeList";
import { classified } from "./Data";
import { DependencyProvider } from "@/UI/Dependency";
import { InstantFileFetcher } from "@/Test";

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
  attributes: classified,
};
