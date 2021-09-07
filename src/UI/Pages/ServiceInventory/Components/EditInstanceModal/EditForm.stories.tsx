import { Service, ServiceInstance } from "@/Test";
import { Story } from "@storybook/react/types-6-0";
import React from "react";
import { ComponentProps } from "react";
import { EditForm } from "./EditForm";

export default {
  title: "Edit Instance",
  component: EditForm,
};

const Template: Story<ComponentProps<typeof EditForm>> = (args) => (
  <EditForm {...args} />
);

export const Nested = Template.bind({});
Nested.args = {
  serviceEntity: Service.nestedEditable,
  currentAttributes: ServiceInstance.nestedEditable.candidate_attributes,
  onSubmit: (fields, attributes) => console.log(fields, attributes),
  onCancel: () => {
    return;
  },
};
