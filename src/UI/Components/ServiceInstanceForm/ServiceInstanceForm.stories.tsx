import { TextInputTypes } from "@patternfly/react-core";
import { Story } from "@storybook/react/types-6-0";
import React from "react";
import { ComponentProps } from "react";
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
  fields: [
    {
      kind: "Flat",
      name: "BoolParam",
      defaultValue: false,
      inputType: "bool",
      type: "bool",
      isOptional: true,
    },
    {
      kind: "Flat",
      name: "TextParam",
      defaultValue: "",
      inputType: TextInputTypes.text,
      description: "Description of text",
      type: "string",
      isOptional: false,
    },
    {
      kind: "Flat",
      name: "Int list param",
      defaultValue: "",
      inputType: TextInputTypes.text,
      description: "Description of param",
      type: "int[]",
      isOptional: true,
    },
    {
      kind: "Flat",
      name: "Float list param",
      defaultValue: "",
      inputType: TextInputTypes.text,
      description: "Description of param",
      type: "float[]",
      isOptional: true,
    },
    {
      kind: "Flat",
      name: "NumberParam",
      defaultValue: "",
      inputType: TextInputTypes.number,
      description: "Description of number",
      type: "float",
      isOptional: true,
    },
    {
      kind: "Nested",
      name: "Config",
      description: "Description of number",
      isOptional: true,
      fields: [
        {
          kind: "Flat",
          name: "Float list param",
          defaultValue: "",
          inputType: TextInputTypes.text,
          description: "Description of param",
          type: "float[]",
          isOptional: true,
        },
        {
          kind: "Flat",
          name: "NumberParam",
          defaultValue: "",
          inputType: TextInputTypes.number,
          description: "Description of number",
          type: "float",
          isOptional: true,
        },
        {
          kind: "Nested",
          name: "Config",
          description: "Description of number",
          isOptional: true,
          fields: [
            {
              kind: "Flat",
              name: "Float list param",
              defaultValue: "",
              inputType: TextInputTypes.text,
              description: "Description of param",
              type: "float[]",
              isOptional: true,
            },
            {
              kind: "Flat",
              name: "NumberParam",
              defaultValue: "",
              inputType: TextInputTypes.number,
              description: "Description of number",
              type: "float",
              isOptional: true,
            },
            {
              kind: "DictList",
              name: "List",
              description: "Description of number",
              isOptional: true,
              fields: [],
              min: 1,
              max: 4,
            },
          ],
        },
      ],
    },
    {
      kind: "DictList",
      name: "List",
      description: "Description of number",
      isOptional: true,
      fields: [],
      min: 1,
      max: 4,
    },
  ],
  onSubmit: (attributes) => console.log(attributes),
};
