import { AttributeModel } from "@/Core";
import { Story } from "@storybook/react/types-6-0";
import React from "react";
import { ComponentProps } from "react";
import { CreateInstanceForm } from "./CreateInstanceForm";

export default {
  title: "CreateInstanceForm",
  component: CreateInstanceForm,
};

const Template: Story<ComponentProps<typeof CreateInstanceForm>> = (args) => (
  <CreateInstanceForm {...args} />
);
const attributes: AttributeModel[] = [
  {
    name: "name",
    type: "string?",
    description: "Your name",
    modifier: "rw+",
    default_value_set: true,
    default_value: "React",
  },
  {
    name: "age",
    type: "int",
    description: "Your age",
    modifier: "rw",
    default_value_set: false,
    default_value: null,
  },
  {
    name: "open_source",
    type: "bool",
    description: "Are you open source?",
    modifier: "rw",
    default_value_set: false,
    default_value: null,
  },
];
const serviceEntity = {
  name: "frontend-framework",
  attributes: attributes,
  environment: "env",
  lifecycle: { initial_state: "start", states: [], transfers: [] },
  config: {},
};
export const Success = Template.bind({});
Success.args = {
  serviceEntity: serviceEntity,
  handleRedirect: () => {
    return;
  },
};
