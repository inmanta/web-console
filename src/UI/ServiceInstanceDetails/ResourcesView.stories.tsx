import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { ResourcesView } from "./ResourcesView";
import { createStore, StoreProvider } from "easy-peasy";
import { Injections, StoreModel, storeModel } from "@/UI/Store";
import { DummyResourceFetcher } from "@/Test";

export default {
  title: "ResourcesView",
  component: ResourcesView,
};

interface TemplateProps extends ComponentProps<typeof ResourcesView> {
  injections: Injections;
}

const Template: Story<TemplateProps> = (args) => (
  <StoreProvider
    store={createStore<StoreModel, undefined, Injections>(storeModel, {
      injections: args.injections,
    })}
  >
    <ResourcesView {...args} />
  </StoreProvider>
);

const baseProps = {
  id: "4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
  entity: "vlan-assignment",
  version: "4",
  environment: "34a961ba-db3c-486e-8d85-1438d8e88909",
};

export const Loading = Template.bind({});
Loading.args = {
  ...baseProps,
  injections: { resourceFetcher: new DummyResourceFetcher("Loading") },
};

export const Failed = Template.bind({});
Failed.args = {
  ...baseProps,
  injections: { resourceFetcher: new DummyResourceFetcher("Failed") },
};

export const Success = Template.bind({});
Success.args = {
  ...baseProps,
  injections: { resourceFetcher: new DummyResourceFetcher("Success") },
};
