import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { InventoryTable } from "./InventoryTable";
import {
  DummySubscriptionHelper,
  InstantApiHelper,
  rows,
  tablePresenter,
} from "@/Test";
import { getStoreInstance } from "@/UI/Store";
import { DataManagerImpl } from "../Data/DataManagerImpl";
import { StateHelperImpl } from "../Data/StateHelperImpl";
import { ServicesContext } from "../ServicesContext";
import { StoreProvider } from "easy-peasy";

export default {
  title: "InventoryTable",
  component: InventoryTable,
};

const Template: Story<ComponentProps<typeof InventoryTable>> = (args) => {
  const store = getStoreInstance();
  const dataManager = new DataManagerImpl(
    new StateHelperImpl(store),
    new DummySubscriptionHelper(
      new InstantApiHelper({ kind: "Success", resources: [] })
    )
  );

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
