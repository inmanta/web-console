import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { ResourcesView } from "./ResourcesView";
import { createStore, StoreProvider } from "easy-peasy";
import { StoreModel, storeModel } from "@/UI/Store";

export default {
  title: "ResourcesView",
  component: ResourcesView,
};

const storeInstance = createStore<StoreModel>(storeModel);

const Template: Story<ComponentProps<typeof ResourcesView>> = (args) => (
  <StoreProvider store={storeInstance}>
    <ResourcesView {...args} />
  </StoreProvider>
);

export const Default = Template.bind({});
Default.args = {
  id: "4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
  entity: "vlan-assignment",
  version: "4",
  environment: "34a961ba-db3c-486e-8d85-1438d8e88909",
};
