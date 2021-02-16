import React from "react";
import { Story } from "@storybook/react/types-6-0";
import {
  instances,
  InstantApiHelper,
  StaticSubscriptionController,
} from "@/Test";
import { TableProvider, Props } from "./TableProvider";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance } from "@/UI/Store";
import { ServiceModel } from "@/Core";
import { ServicesContext } from "@/UI/ServicesContext";
import {
  DataProviderImpl,
  ResourcesDataManager,
  ResourcesHookHelper,
  ResourcesStateHelper,
} from "@/UI/Data";

export default {
  title: "TableProvider",
  component: TableProvider,
};

const Template: Story<Props> = (args) => {
  const store = getStoreInstance();
  const dataProvider = new DataProviderImpl([
    new ResourcesHookHelper(
      new ResourcesDataManager(
        new InstantApiHelper({ kind: "Success", resources: [] }),
        new ResourcesStateHelper(store)
      ),
      new StaticSubscriptionController()
    ),
  ]);

  return (
    <ServicesContext.Provider value={{ dataProvider }}>
      <StoreProvider store={store}>
        <TableProvider {...args} />
      </StoreProvider>
    </ServicesContext.Provider>
  );
};

export const Empty = Template.bind({});
Empty.args = { instances: [] };

export const Multiple = Template.bind({});
Multiple.args = {
  instances,
  serviceEntity: {
    name: "cloudconnectv2",
    lifecycle: {
      states: [{ name: "creating", label: "info" }],
      transfers: [{ source: "creating", on_update: true }],
    },
  } as ServiceModel,
};
