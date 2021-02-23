import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { EventTable } from "./EventTable";
import { ignoredErrorNormalEvents, instanceEvents } from "@/Test";
import { EventTablePresenter } from "./EventTablePresenter";
import { MomentDatePresenter } from "../ServiceInventory/Presenters";

export default {
  title: "EventTable",
  component: EventTable,
};

const Template: Story<ComponentProps<typeof EventTable>> = (args) => (
  <EventTable {...args} />
);

export const Empty = Template.bind({});
Empty.args = {
  events: [],
  tablePresenter: new EventTablePresenter(new MomentDatePresenter()),
};

export const MultipleSuccessful = Template.bind({});
MultipleSuccessful.args = {
  events: instanceEvents,
  tablePresenter: new EventTablePresenter(new MomentDatePresenter()),
  environmentId: "env1",
};

export const MultipleTypes = Template.bind({});
MultipleTypes.args = {
  events: ignoredErrorNormalEvents,
  tablePresenter: new EventTablePresenter(new MomentDatePresenter()),
  environmentId: "env2",
};
