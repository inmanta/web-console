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
  DataManagerImpl,
  ResourcesEntityManager,
  ResourcesStateHelper,
} from "@/UI/Data";

export default {
  title: "TableProvider",
  component: TableProvider,
};

const Template: Story<Props> = (args) => {
  const store = getStoreInstance();
  const dataManager = new DataManagerImpl(
    new ResourcesEntityManager(
      new InstantApiHelper({ kind: "Success", resources: [] }),
      new ResourcesStateHelper(store)
    ),
    new StaticSubscriptionController()
  );

  return (
    <ServicesContext.Provider value={{ dataManager }}>
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
