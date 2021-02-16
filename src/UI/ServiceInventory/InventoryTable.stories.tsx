import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { InventoryTable } from "./InventoryTable";
import {
  InstantApiHelper,
  rows,
  StaticSubscriptionController,
  tablePresenter,
} from "@/Test";
import { getStoreInstance } from "@/UI/Store";
import {
  DataProviderImpl,
  ResourcesEntityManager,
  ResourcesHookHelper,
  ResourcesStateHelper,
} from "@/UI/Data";
import { ServicesContext } from "../ServicesContext";
import { StoreProvider } from "easy-peasy";

export default {
  title: "InventoryTable",
  component: InventoryTable,
};

const Template: Story<ComponentProps<typeof InventoryTable>> = (args) => {
  const store = getStoreInstance();
  const dataManager = new DataProviderImpl([
    new ResourcesHookHelper(
      new ResourcesEntityManager(
        new InstantApiHelper({ kind: "Success", resources: [] }),
        new ResourcesStateHelper(store)
      ),
      new StaticSubscriptionController()
    ),
  ]);

  return (
    <ServicesContext.Provider value={{ dataManager }}>
      <StoreProvider store={store}>
        <InventoryTable {...args} tablePresenter={tablePresenter} />
      </StoreProvider>
    </ServicesContext.Provider>
  );
};

export const Empty = Template.bind({});
Empty.args = { rows: [] };

export const Multiple = Template.bind({});
Multiple.args = { rows };
