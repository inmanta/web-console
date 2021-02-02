import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";

import { SetStateAction } from "./SetStateAction";

export default {
  title: "SetStateAction",
  component: SetStateAction,
};

const Template: Story<ComponentProps<typeof SetStateAction>> = (args) => (
  <SetStateAction {...args} />
);

export const Empty = Template.bind({});
Empty.args = { id: "id1", targets: [] };

export const Multiple = Template.bind({});
Multiple.args = {
  id: "id2",
  targets: ["designed", "acknowledged"],
};
