import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { Timeline } from "./Timeline";
import { Provider } from "./Provider";

export default {
  title: "Timeline",
  component: Timeline,
};

const Template: Story<ComponentProps<typeof Timeline>> = (args) => (
  <Timeline {...args} />
);

export const Requested = Template.bind({});
Requested.args = {
  requested: { day: "01/01/2021", time: "15:44:44.461" },
  requestedDiff: "12 seconds",
};

export const Started = Template.bind({});
Started.args = {
  requested: { day: "01/01/2021", time: "15:41:44.461" },
  requestedDiff: "12 seconds",
  started: { day: "01/01/2021", time: "15:42:44.461" },
  startedDiff: "12 seconds",
};

export const Completed = Template.bind({});
Completed.args = {
  requested: { day: "01/01/2021", time: "15:41:44.461" },
  requestedDiff: "12 seconds",
  started: { day: "01/01/2021", time: "15:42:44.461" },
  startedDiff: "12 seconds",
  completed: { day: "01/01/2021", time: "15:43:44.461" },
};

const now = new Date(Date.now()).toISOString();
const nowMin5 = new Date(Date.now() - 5000).toISOString();
const nowMin10 = new Date(Date.now() - 10000).toISOString();

const ProviderTemplate: Story<ComponentProps<typeof Provider>> = (args) => (
  <Provider {...args} />
);

export const RequestedWithProvider = ProviderTemplate.bind({});
RequestedWithProvider.args = {
  requested: nowMin10,
};

export const StartedWitProvider = ProviderTemplate.bind({});
StartedWitProvider.args = {
  requested: nowMin10,
  started: nowMin5,
};

export const CompletedWithProvider = ProviderTemplate.bind({});
CompletedWithProvider.args = {
  requested: nowMin10,
  started: nowMin5,
  completed: now,
};
