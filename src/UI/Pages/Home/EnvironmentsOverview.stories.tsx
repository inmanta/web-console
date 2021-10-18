import { CommandResolverImpl } from "@/Data";
import {
  DynamicCommandManagerResolver,
  MockCommandManager,
  MockFeatureManger,
  Project,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Story } from "@storybook/react/types-6-0";
import React, { ComponentProps } from "react";
import { MemoryRouter } from "react-router";
import { EnvironmentsOverview } from "./EnvironmentsOverview";

export default {
  title: "EnvironmentOverview",
  component: EnvironmentsOverview,
};

const Template: Story<ComponentProps<typeof EnvironmentsOverview>> = (args) => {
  return (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          featureManager: new MockFeatureManger(),
          commandResolver: new CommandResolverImpl(
            new DynamicCommandManagerResolver([new MockCommandManager()])
          ),
        }}
      >
        <EnvironmentsOverview {...args} />
      </DependencyProvider>
    </MemoryRouter>
  );
};

export const Multiple = Template.bind({});
Multiple.args = {
  projects: Project.filterable,
};
