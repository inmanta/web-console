import React from "react";
import { Story } from "@storybook/react/types-6-0";
import {
  instances,
  InstantFetcher,
  StaticSubscriptionController,
} from "@/Test";
import { TableProvider, Props } from "./TableProvider";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance } from "@/UI/Store";
import { ServiceModel } from "@/Core";
import { ServicesContext } from "@/UI/ServicesContext";
import {
  DataProviderImpl,
  DataManagerImpl,
  ResourcesHookHelper,
  ResourcesStateHelper,
} from "@/UI/Data";
import { ServiceWithIdentity } from "@/Test/Data/Service";

export default {
  title: "TableProvider",
  component: TableProvider,
};

const Template: Story<Props> = (args) => {
  const store = getStoreInstance();
  const dataProvider = new DataProviderImpl([
    new ResourcesHookHelper(
      new DataManagerImpl<"Resources">(
        new InstantFetcher<"Resources">({ kind: "Success", data: [] }),
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
Empty.args = { instances: [], serviceEntity: {} as ServiceModel };

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
export const WithIdentity = Template.bind({});
WithIdentity.args = {
  instances,
  serviceEntity: ServiceWithIdentity,
};
