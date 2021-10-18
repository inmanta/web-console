import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";

import { SetStateAction } from "./SetStateAction";
import { DependencyProvider } from "@/UI/Dependency";
import { CommandResolverImpl } from "@/Data";
import {
  DynamicCommandManagerResolver,
  MockCommandManager,
  MockEnvironmentModifier,
} from "@/Test";

export default {
  title: "SetStateAction",
  component: SetStateAction,
};

const Template: Story<ComponentProps<typeof SetStateAction>> = (args) => (
  <DependencyProvider
    dependencies={{
      commandResolver: new CommandResolverImpl(
        new DynamicCommandManagerResolver([new MockCommandManager()])
      ),
      environmentModifier: new MockEnvironmentModifier(),
    }}
  >
    <SetStateAction {...args} />
  </DependencyProvider>
);

export const Empty = Template.bind({});
Empty.args = { id: "id1", targets: [] };

export const Multiple = Template.bind({});
Multiple.args = {
  id: "id2",
  targets: ["designed", "acknowledged"],
};
