import React, { ComponentProps } from "react";
import { MemoryRouter } from "react-router";
import { Story } from "@storybook/react/types-6-0";
import { Environment } from "@/Test";
import { EnvironmentSettings } from "./EnvironmentSettings";

export default {
  title: "EnvironmentSettings",
  component: EnvironmentSettings,
};

const Template: Story<ComponentProps<typeof EnvironmentSettings>> = (args) => {
  return (
    <MemoryRouter>
      <EnvironmentSettings {...args} />
    </MemoryRouter>
  );
};

export const Multiple = Template.bind({});
Multiple.args = {
  environment: Environment.filterable[0],
};
