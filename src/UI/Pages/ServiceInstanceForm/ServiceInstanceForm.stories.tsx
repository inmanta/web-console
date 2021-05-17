import { TextInputTypes } from "@patternfly/react-core";
import { Story } from "@storybook/react/types-6-0";
import React from "react";
import { ComponentProps } from "react";
import { FormHelpProviderImpl } from "./FormHelpProvider";
import { ServiceInstanceForm } from "./ServiceInstanceForm";

export default {
  title: "ServiceInstanceForm",
  component: ServiceInstanceForm,
};

const Template: Story<ComponentProps<typeof ServiceInstanceForm>> = (args) => (
  <ServiceInstanceForm {...args} />
);

export const OneOfEach = Template.bind({});
OneOfEach.args = {
  formInputAttributes: [
    {
      name: "BoolParam",
      defaultValue: false,
      inputType: "bool",
      type: "bool",
      isOptional: true,
    },
    {
      name: "TextParam",
      defaultValue: "",
      inputType: TextInputTypes.text,
      description: "Description of text",
      type: "string",
      isOptional: false,
    },
    {
      name: "Int list param",
      defaultValue: "",
      inputType: TextInputTypes.text,
      description: "Description of param",
      type: "int[]",
      isOptional: true,
    },
    {
      name: "Float list param",
      defaultValue: "",
      inputType: TextInputTypes.text,
      description: "Description of param",
      type: "float[]",
      isOptional: true,
    },
    {
      name: "NumberParam",
      defaultValue: "",
      inputType: TextInputTypes.number,
      description: "Description of number",
      type: "float",
      isOptional: true,
    },
  ],
  formHelpProvider: new FormHelpProviderImpl(),
  onSubmit: (attributes) => console.log(attributes),
};
