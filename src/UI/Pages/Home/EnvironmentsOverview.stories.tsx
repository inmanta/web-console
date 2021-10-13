import { Project } from "@/Test";
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
      <EnvironmentsOverview {...args} />
    </MemoryRouter>
  );
};

export const Multiple = Template.bind({});
Multiple.args = {
  projects: Project.filterable,
};
