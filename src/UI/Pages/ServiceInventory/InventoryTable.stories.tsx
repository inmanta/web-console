import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { InventoryTable } from "./InventoryTable";
import {
  DynamicQueryManagerResolver,
  InstantFetcher,
  rows,
  StaticScheduler,
  tablePresenter,
} from "@/Test";
import { getStoreInstance } from "@/UI/Store";
import {
  QueryResolverImpl,
  ResourcesQueryManager,
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
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new ResourcesQueryManager(
        new InstantFetcher<"Resources">({
          kind: "Success",
          data: { data: [] },
        }),
        new ResourcesStateHelper(store),
        new StaticScheduler(),
        "env"
      ),
    ])
  );

  return (
    <DependencyProvider dependencies={{ queryResolver }}>
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
