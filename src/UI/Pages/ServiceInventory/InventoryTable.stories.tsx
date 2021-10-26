import React, { ComponentProps } from "react";
import { Story } from "@storybook/react/types-6-0";
import { InventoryTable } from "./InventoryTable";
import {
  DynamicQueryManagerResolver,
  InstantFetcher,
  Row,
  StaticScheduler,
  tablePresenter,
} from "@/Test";
import {
  QueryResolverImpl,
  InstanceResourcesQueryManager,
  InstanceResourcesStateHelper,
  getStoreInstance,
} from "@/Data";
import { DependencyProvider } from "@/UI/Dependency";
import { StoreProvider } from "easy-peasy";
import { MemoryRouter } from "react-router-dom";

export default {
  title: "InventoryTable",
  component: InventoryTable,
};

const Template: Story<ComponentProps<typeof InventoryTable>> = (args) => {
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new InstanceResourcesQueryManager(
        new InstantFetcher<"GetInstanceResources">({
          kind: "Success",
          data: { data: [] },
        }),
        new InstanceResourcesStateHelper(store),
        new StaticScheduler(),
        "env"
      ),
    ])
  );

  return (
    <MemoryRouter>
      <DependencyProvider dependencies={{ queryResolver }}>
        <StoreProvider store={store}>
          <InventoryTable
            {...args}
            sort={{ name: "created_at", order: "desc" }}
            setSort={() => undefined}
            tablePresenter={tablePresenter}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );
};

export const Empty = Template.bind({});
Empty.args = { rows: [] };

export const Multiple = Template.bind({});
Multiple.args = { rows: [Row.a, Row.b] };
