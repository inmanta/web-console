import React, { ComponentProps } from "react";
import { BrowserRouter } from "react-router-dom";
import { Story } from "@storybook/react/types-6-0";
import { CommandResolverImpl } from "@/Data";
import {
  dependencies,
  DynamicCommandManagerResolver,
  Environment,
  MockCommandManager,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { EnvironmentSettings } from "./EnvironmentSettings";

export default {
  title: "EnvironmentSettings",
  component: EnvironmentSettings,
};

const Template: Story<ComponentProps<typeof EnvironmentSettings>> = (args) => {
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([new MockCommandManager()])
  );
  return (
    <BrowserRouter>
      <DependencyProvider dependencies={{ ...dependencies, commandResolver }}>
        <EnvironmentSettings {...args} />
      </DependencyProvider>
    </BrowserRouter>
  );
};

export const Multiple = Template.bind({});
Multiple.args = {
  environment: Environment.filterable[0],
};
