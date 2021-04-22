import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { InventoryTable } from "./InventoryTable";
import { InstantFetcher, rows, StaticScheduler, tablePresenter } from "@/Test";
import { getStoreInstance } from "@/UI/Store";
import {
  DataProviderImpl,
  ResourcesDataManager,
  ResourcesStateHelper,
} from "@/UI/Data";
import { DependencyProvider } from "@/UI/Dependency";
import { StoreProvider } from "easy-peasy";

export default {
  title: "InventoryTable",
  component: InventoryTable,
};

const Template: Story<ComponentProps<typeof InventoryTable>> = (args) => {
  const store = getStoreInstance();
  const dataProvider = new DataProviderImpl([
    new ResourcesDataManager(
      new InstantFetcher<"Resources">({
        kind: "Success",
        data: { data: [] },
      }),
      new ResourcesStateHelper(store),
      new StaticScheduler()
    ),
  ]);

  return (
    <DependencyProvider dependencies={{ dataProvider }}>
      <StoreProvider store={store}>
        <InventoryTable {...args} tablePresenter={tablePresenter} />
      </StoreProvider>
    </DependencyProvider>
  );
};

export const Empty = Template.bind({});
Empty.args = { rows: [] };

export const Multiple = Template.bind({});
Multiple.args = { rows };
